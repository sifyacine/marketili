import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../hooks/useAuth";
import notificationService from "../../services/notificationService";
import AdBanner from "../ads/AdBanner";
import chatService from "../../services/chatService";
import { getSocket } from "../../services/socketService";
import {
  IconBell, IconLogOut, IconChevronLeft, IconChevronRight,
  IconTarget, IconBuilding, IconUsers, IconZap, IconUser,
} from "../ui/Icons";
import "../../styles/Dashboard.css";

const ROLE_META = {
  client:        { Icon: IconTarget,   label: "Client",          color: "#c0152a" },
  agency:        { Icon: IconBuilding, label: "Agence",          color: "#7c3aed" },
  team:          { Icon: IconUsers,    label: "Équipe",          color: "#0891b2" },
  freelancer:    { Icon: IconZap,      label: "Freelancer",      color: "#d97706" },
  agency_member: { Icon: IconUser,     label: "Membre d'agence", color: "#7c3aed" },
  team_member:   { Icon: IconUser,     label: "Membre d'équipe", color: "#0891b2" },
  admin:         { Icon: IconUser,     label: "Administrateur",  color: "#c0152a" },
};

const CATEGORY_COLORS = {
  pitches:   "#7c3aed",
  projects:  "#0891b2",
  contracts: "#d97706",
  tasks:     "#059669",
  deadlines: "#ef4444",
  messages:  "#6b7280",
  admin:     "#c0152a",
};

const TYPE_ICON = {
  pitch_received:      "↓",
  pitch_accepted:      "✓",
  pitch_rejected:      "✗",
  project_created:     "▶",
  project_milestone:   "★",
  project_completed:   "◉",
  contract_sent:       "◤",
  contract_acknowledged: "◈",
  contract_signed:     "✦",
  task_overdue:        "!",
  system:              "◎",
};

const relativeTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)  return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${days}j`;
};

const DashboardLayout = ({ role, user, navItems = [], children, topbarTitle }) => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { logout } = useAuth();
  const [collapsed,        setCollapsed]        = useState(false);
  const [mobileOpen,       setMobileOpen]       = useState(false);
  const [showNotifs,       setShowNotifs]       = useState(false);
  const [notifs,           setNotifs]           = useState([]);
  const [unreadCount,      setUnreadCount]      = useState(0);
  const [chatUnreadCount,  setChatUnreadCount]  = useState(0);
  const notifRef = useRef();

  const meta = ROLE_META[role] || ROLE_META.client;
  const RoleIcon = meta.Icon;

  const displayName =
    user?.companyName ||
    (user?.firstName ? `${user.firstName} ${user.lastName}` : null) ||
    user?.agencyName || user?.teamName || "Mon compte";

  const initials = displayName.split(" ").slice(0, 2)
    .map(w => w[0]?.toUpperCase()).join("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await notificationService.getAll({ limit: 10 });
        setNotifs(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };
    const loadChat = async () => {
      try {
        const data = await chatService.getUnreadCount();
        setChatUnreadCount(data.count || 0);
      } catch {}
    };
    load();
    loadChat();
    const onFocus = () => { load(); loadChat(); };
    window.addEventListener("focus", onFocus);
    const interval = setInterval(() => { load(); loadChat(); }, 30000);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, []);

  // Real-time: join user room and listen for pushed notifications and chat messages
  useEffect(() => {
    if (!user?._id) return;
    const socket = getSocket();
    socket.emit("join_user_room", user._id);

    const handleNewNotif = ({ notification }) => {
      setNotifs(prev => [notification, ...prev.slice(0, 9)]);
      setUnreadCount(c => c + 1);
    };
    const handleChatUnread = () => {
      setChatUnreadCount(c => c + 1);
    };

    socket.on("new_notification", handleNewNotif);
    socket.on("new_message",      handleChatUnread);
    return () => {
      socket.off("new_notification", handleNewNotif);
      socket.off("new_message",      handleChatUnread);
    };
  }, [user?._id]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpenNotifs = () => setShowNotifs(o => !o);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setUnreadCount(0);
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleClickNotif = async (n) => {
    setShowNotifs(false);
    if (!n.isRead) {
      try {
        await notificationService.markRead(n._id);
        setNotifs(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch {}
    }
    if (n.link) navigate(n.link);
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  // On mobile, always show labels regardless of collapsed state
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const showLabels = !collapsed || isMobile;

  const activeTitle = (() => {
    const sorted = [...navItems].sort((a, b) => b.path.length - a.path.length);
    const match  = sorted.find(item => location.pathname === item.path || location.pathname.startsWith(item.path + "/"));
    return match?.label || topbarTitle;
  })();

  useEffect(() => {
    document.title = `${activeTitle} — Marketili`;
  }, [activeTitle]);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className={`dash-layout ${collapsed ? "sidebar-collapsed" : "sidebar-open"}`}>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div className="dash-sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`dash-sidebar${mobileOpen ? " mobile-open" : ""}`}>

        {/* Logo */}
        <div className="dash-sidebar-logo">
          <img
            src="/marketelli_logo_1.png"
            alt="Marketili"
            style={{
              height: showLabels ? 34 : 28,
              maxWidth: showLabels ? 130 : 28,
              objectFit: "contain",
              objectPosition: "left center",
              transition: "all 0.2s",
            }}
          />
          <button className="dash-sidebar-toggle" onClick={() => setCollapsed(o => !o)}
            title={collapsed ? "Agrandir" : "Réduire"}>
            {collapsed
              ? <IconChevronRight size={13} />
              : <IconChevronLeft  size={13} />
            }
          </button>
        </div>

        {/* Role tag */}
        <div className="dash-role-tag" style={{ "--role-color": meta.color }}>
          <span className="dash-role-tag-icon" style={{ color: meta.color }}>
            <RoleIcon size={13} />
          </span>
          {showLabels && <span>{meta.label}</span>}
        </div>

        {/* Nav */}
        <nav className="dash-nav">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path}
              end={item.path.split("/").length === 3}
              className={({ isActive }) => `dash-nav-item${isActive ? " active" : ""}`}
              title={!showLabels ? item.label : ""}>
              <span className="dash-nav-icon">
                {item.icon}
              </span>
              {showLabels && <span className="dash-nav-label">{item.label}</span>}
              {showLabels && item.badge > 0 && (
                <span className="dash-nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer: user + logout */}
        <div className="dash-sidebar-footer">
          <div className="dash-user-chip">
            <div className="dash-user-avatar">{initials}</div>
            {showLabels && (
              <div className="dash-user-info">
                <div className="dash-user-name">{displayName}</div>
                <div className="dash-user-role">{meta.label}</div>
              </div>
            )}
          </div>
          <button className="dash-logout-btn" onClick={handleLogout} title="Se déconnecter">
            <span className="dash-logout-icon"><IconLogOut size={15} /></span>
            {showLabels && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="dash-main">
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <button className="dash-hamburger" onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu" aria-expanded={mobileOpen}>
              <span /><span /><span />
            </button>
            <h1 className="dash-topbar-title">{activeTitle}</h1>
          </div>
          <div className="dash-topbar-right">

            {/* Notification bell */}
              {/* Chat unread badge */}
            {chatUnreadCount > 0 && (
              <div style={{ position: "relative" }}>
                <button className="dash-topbar-icon-btn" title="Messagerie"
                  style={{ fontSize: "1rem" }}
                  onClick={() => {
                    const msgItem = navItems.find(n => n.path.includes("/messages"));
                    if (msgItem) navigate(msgItem.path);
                  }}>
                  ✉
                  <span style={{
                    position: "absolute", top: 4, right: 4,
                    minWidth: 8, height: 8, borderRadius: "50%",
                    background: "#0891b2",
                    border: "1.5px solid var(--d-topbar-bg, #fff)",
                  }} />
                </button>
              </div>
            )}

            {/* Notification bell */}
            <div style={{ position: "relative" }} ref={notifRef}>
              <button className="dash-topbar-icon-btn" title="Notifications"
                onClick={handleOpenNotifs}>
                <IconBell size={16} />
                {unreadCount > 0 && (
                  <span className="dash-notif-dot" style={{
                    position: "absolute", top: 4, right: 4, width: 8, height: 8,
                    borderRadius: "50%", background: "#ef4444",
                    border: "1.5px solid var(--d-topbar-bg, #fff)",
                  }}>
                    {unreadCount > 9 ? "" : ""}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="dash-notif-dropdown">
                    <div className="dash-notif-header">
                      <span>
                        Notifications
                        {unreadCount > 0 && (
                          <span style={{ marginLeft: 6, fontSize: "0.7rem", fontWeight: 700,
                            background: "#ef4444", color: "#fff",
                            borderRadius: 10, padding: "1px 6px" }}>
                            {unreadCount}
                          </span>
                        )}
                      </span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: "0.7rem", color: "var(--d-muted)", fontFamily: "inherit",
                            fontWeight: 600, padding: 0,
                          }}>
                            Tout marquer lu
                          </button>
                        )}
                      </div>
                    </div>

                    {notifs.length === 0 ? (
                      <div className="dash-notif-empty">
                        <div className="dash-notif-empty-icon"><IconBell size={16} /></div>
                        <p>Aucune notification</p>
                      </div>
                    ) : (
                      <>
                        {notifs.map(n => {
                          const catColor = CATEGORY_COLORS[n.category] || "#6b7280";
                          const icon = TYPE_ICON[n.type] || "◎";
                          return (
                            <div key={n._id}
                              className={`dash-notif-item${n.isRead ? "" : " unread"}`}
                              onClick={() => handleClickNotif(n)}
                              style={{ cursor: "pointer" }}>
                              <div className="dash-notif-item-icon"
                                style={{ background: catColor + "15", color: catColor }}>
                                <span style={{ fontSize: "0.72rem", fontWeight: 700 }}>{icon}</span>
                              </div>
                              <div className="dash-notif-item-body">
                                <div className="dash-notif-item-title">{n.title}</div>
                                {n.body && (
                                  <div className="dash-notif-item-desc"
                                    style={{ WebkitLineClamp: 2, overflow: "hidden",
                                      display: "-webkit-box", WebkitBoxOrient: "vertical" }}>
                                    {n.body}
                                  </div>
                                )}
                                <div className="dash-notif-item-time">{relativeTime(n.createdAt)}</div>
                              </div>
                              {!n.isRead && (
                                <div style={{ width: 6, height: 6, borderRadius: "50%",
                                  background: catColor, flexShrink: 0, marginTop: 6 }} />
                              )}
                            </div>
                          );
                        })}
                        <div style={{ padding: "8px 12px", textAlign: "center",
                          borderTop: "1px solid var(--d-border-soft)" }}>
                          <button onClick={() => { navigate("notifications"); setShowNotifs(false); }}
                            style={{ background: "none", border: "none", cursor: "pointer",
                              fontFamily: "inherit", fontSize: "0.75rem", fontWeight: 600,
                              color: "var(--d-muted)" }}>
                            Voir toutes les notifications →
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="dash-content">
          {role !== "admin" && <AdBanner />}
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
