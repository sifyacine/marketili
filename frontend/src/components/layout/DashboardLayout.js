import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/Dashboard.css";

/**
 * DashboardLayout — the shared shell for ALL role dashboards.
 *
 * Props:
 *   role        — "client" | "agency" | "team" | "freelancer"
 *   user        — the logged-in user object
 *   navItems    — array of { label, icon, path, badge? }
 *   children    — the page content
 *   topbarTitle — text shown in the topbar
 *   topbarAction — optional { label, onClick } primary button
 */
const DashboardLayout = ({ role, user, navItems = [], children, topbarTitle, topbarAction }) => {
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const ROLE_META = {
    client:     { icon: "🎯", label: "Client",               color: "#c0152a" },
    agency:     { icon: "🏢", label: "Agence",               color: "#7c3aed" },
    team:       { icon: "👥", label: "Équipe",               color: "#0891b2" },
    freelancer: { icon: "⚡", label: "Freelancer",           color: "#d97706" },
    agency_member: { icon: "👤", label: "Membre d'agence",  color: "#7c3aed" },
    team_member:   { icon: "👤", label: "Membre d'équipe",  color: "#0891b2" },
  };

  const meta = ROLE_META[role] || ROLE_META.client;

  // Display name regardless of user type
  const displayName =
    user?.companyName ||
    (user?.firstName ? `${user.firstName} ${user.lastName}` : null) ||
    user?.agencyName || user?.teamName ||
    "Mon compte";

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join("");

  return (
    <div className={`dash-layout ${sidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>

      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        {/* Logo */}
        <div className="dash-sidebar-logo">
          <span className="dash-logo-text">
            Market<span>ili</span>
          </span>
          <button
            className="dash-sidebar-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? "Réduire" : "Agrandir"}
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        {/* Role badge */}
        <div className="dash-role-tag" style={{ "--role-color": meta.color }}>
          <span>{meta.icon}</span>
          {sidebarOpen && <span>{meta.label}</span>}
        </div>

        {/* Nav items */}
        <nav className="dash-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `dash-nav-item${isActive ? " active" : ""}`
              }
              title={!sidebarOpen ? item.label : ""}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="dash-nav-label">{item.label}</span>}
              {sidebarOpen && item.badge > 0 && (
                <span className="dash-nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="dash-sidebar-footer">
          <div
            className="dash-user-chip"
            style={{ "--role-color": meta.color }}
          >
            <div className="dash-user-avatar">{initials}</div>
            {sidebarOpen && (
              <div className="dash-user-info">
                <div className="dash-user-name">{displayName}</div>
                <div className="dash-user-role">{meta.label}</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="dash-main">

        {/* Topbar */}
        <header className="dash-topbar">
          <div className="dash-topbar-left">
            <h1 className="dash-topbar-title">{topbarTitle}</h1>
          </div>
          <div className="dash-topbar-right">
            <button className="dash-topbar-icon-btn" title="Notifications">
              🔔
              <span className="dash-notif-dot" />
            </button>
            {topbarAction && (
              <button
                className="dash-topbar-cta"
                onClick={topbarAction.onClick}
              >
                + {topbarAction.label}
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="dash-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={topbarTitle}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;