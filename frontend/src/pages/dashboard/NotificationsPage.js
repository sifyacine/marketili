// frontend/src/pages/dashboard/NotificationsPage.js
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import notificationService from "../../services/notificationService";
import { IconBell } from "../../components/ui/Icons";

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORY_TABS = [
  { v: "all",       l: "Tous"      },
  { v: "pitches",   l: "Offres"    },
  { v: "projects",  l: "Projets"   },
  { v: "contracts", l: "Contrats"  },
  { v: "tasks",     l: "Tâches"    },
  { v: "deadlines", l: "Délais"    },
  { v: "messages",  l: "Messages"  },
  { v: "admin",     l: "Admin"     },
];

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
  pitch_received:        "↓",
  pitch_accepted:        "✓",
  pitch_rejected:        "✗",
  project_created:       "▶",
  project_milestone:     "★",
  project_completed:     "◉",
  contract_sent:         "◤",
  contract_acknowledged: "◈",
  contract_signed:       "✦",
  task_overdue:          "!",
  system:                "◎",
};

const relativeTime = (date) => {
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "à l'instant";
  if (mins < 60)  return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours}h`;
  if (days < 7)   return `il y a ${days}j`;
  return new Date(date).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });
};

// ── NotifCard ─────────────────────────────────────────────────────────────────
const NotifCard = ({ n, onRead, onDelete }) => {
  const navigate   = useNavigate();
  const catColor   = CATEGORY_COLORS[n.category] || "#6b7280";
  const icon       = TYPE_ICON[n.type] || "◎";

  const handleClick = async () => {
    if (!n.isRead) await onRead(n._id);
    if (n.link) navigate(n.link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      style={{
        display: "flex", gap: 14, padding: "14px 16px",
        background: n.isRead ? "var(--d-surface)" : catColor + "08",
        borderLeft: `3px solid ${n.isRead ? "transparent" : catColor}`,
        borderBottom: "1px solid var(--d-border-soft)",
        cursor: n.link ? "pointer" : "default",
        alignItems: "flex-start",
        transition: "background 0.2s",
      }}
      onClick={handleClick}>
      {/* Icon */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: catColor + "18", color: catColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.9rem", fontWeight: 700,
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: "0.88rem",
            color: "var(--d-ink)", lineHeight: 1.3 }}>
            {n.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: "0.7rem", color: "var(--d-muted)", whiteSpace: "nowrap" }}>
              {relativeTime(n.createdAt)}
            </span>
            <button onClick={e => { e.stopPropagation(); onDelete(n._id); }}
              title="Supprimer"
              style={{ background: "none", border: "none", cursor: "pointer",
                color: "var(--d-muted)", fontSize: "0.75rem", padding: "2px 4px",
                borderRadius: 4, lineHeight: 1, fontFamily: "inherit" }}>
              ✕
            </button>
          </div>
        </div>
        {n.body && (
          <div style={{ fontSize: "0.78rem", color: "var(--d-muted)", marginTop: 3, lineHeight: 1.4 }}>
            {n.body}
          </div>
        )}
        <div style={{ marginTop: 6, display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ padding: "1px 7px", borderRadius: 10, fontSize: "0.68rem",
            fontWeight: 600, background: catColor + "15", color: catColor }}>
            {n.category || "general"}
          </span>
          {!n.isRead && (
            <button onClick={e => { e.stopPropagation(); onRead(n._id); }}
              style={{ background: "none", border: "none", cursor: "pointer",
                fontSize: "0.7rem", color: catColor, fontWeight: 600,
                fontFamily: "inherit", padding: 0 }}>
              Marquer lu
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
const NotificationsPage = () => {
  const [notifs,      setNotifs]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [pages,       setPages]       = useState(1);
  const [total,       setTotal]       = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [category,    setCategory]    = useState("all");
  const [markingAll,  setMarkingAll]  = useState(false);

  const load = useCallback(async (pg = 1, cat = category) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: 20 };
      if (cat && cat !== "all") params.category = cat;
      const data = await notificationService.getAll(params);
      setNotifs(data.notifications || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
      setUnreadCount(data.unreadCount || 0);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  }, [category]);

  useEffect(() => { load(1, category); }, [category]); // eslint-disable-line

  const handleRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifs(prev => prev.filter(n => n._id !== id));
      setTotal(t => t - 1);
    } catch {}
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
    finally { setMarkingAll(false); }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Notifications</h2>
          <p>
            {total} notification{total !== 1 ? "s" : ""}
            {unreadCount > 0 && ` — ${unreadCount} non lue${unreadCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="section-cta-btn" onClick={handleMarkAll} disabled={markingAll}
            style={{ fontSize: "0.8rem", padding: "8px 14px" }}>
            {markingAll ? "..." : "Tout marquer comme lu"}
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="filters-bar" style={{ marginBottom: 16 }}>
        {CATEGORY_TABS.map(t => (
          <button key={t.v}
            className={`filter-btn${category === t.v ? " active" : ""}`}
            onClick={() => setCategory(t.v)}
            style={{ padding: "7px 14px", fontSize: "0.78rem" }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card" style={{ overflow: "hidden", padding: 0 }}>
        {loading ? (
          <div className="spinner-wrap" style={{ padding: 48 }}><div className="spinner" /></div>
        ) : notifs.length === 0 ? (
          <div className="empty-state" style={{ padding: "56px 24px" }}>
            <div className="empty-state-icon"><IconBell size={20} /></div>
            <div className="empty-state-title">Aucune notification</div>
            <div className="empty-state-desc">
              {category !== "all"
                ? "Aucune notification dans cette catégorie."
                : "Vous n'avez pas encore de notifications."}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifs.map((n, i) => (
              <NotifCard
                key={n._id}
                n={n}
                onRead={handleRead}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p}
              onClick={() => load(p, category)}
              style={{
                padding: "6px 12px", borderRadius: 8, border: "1.5px solid var(--d-border-soft)",
                background: p === page ? "var(--d-ink)" : "var(--d-surface)",
                color: p === page ? "var(--d-surface)" : "var(--d-ink)",
                fontFamily: "inherit", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
              }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
