import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../App.css";

/* ─── Role config ─── */
const ROLE_CONFIG = {
  client: {
    label: "Client",
    icon: "🎯",
    topbarTitle: "Brand Dashboard",
    topbarSub: "Manage your campaigns and partnerships",
    newBtnLabel: "New Brief",
    stats: [
      { label: "Active Briefs", value: "4", change: "+2", trend: "up", icon: "📋" },
      { label: "Pitches Received", value: "28", change: "+12", trend: "up", icon: "💡" },
      { label: "Active Projects", value: "3", change: "0", trend: "up", icon: "🚀" },
      { label: "Total Spent", value: "$12k", change: "+$3.2k", trend: "up", icon: "💰" },
    ],
    tableTitle: "Recent Briefs",
    tableSub: "Your active and completed campaigns",
    tableItems: [
      { icon: "📱", name: "Q4 Social Campaign", meta: "Posted 2 days ago", value: "6 pitches", status: "active", time: "Deadline Oct 30" },
      { icon: "🎥", name: "Brand Video Rebrand", meta: "Posted 5 days ago", value: "11 pitches", status: "review", time: "Deadline Nov 5" },
      { icon: "📣", name: "Launch Email Series", meta: "Posted 1 week ago", value: "5 pitches", status: "pending", time: "Deadline Nov 12" },
    ],
    activities: [
      { text: "<strong>Creative Studio Inc.</strong> submitted a pitch for your Q4 Social Campaign", time: "2 hours ago" },
      { text: "Your brief <strong>Brand Video Rebrand</strong> received 3 new proposals", time: "5 hours ago" },
      { text: "<strong>Jordan Lee</strong> accepted your collaboration offer", time: "Yesterday" },
    ],
    navSections: [
      { label: "Main", items: [
        { icon: "🏠", label: "Overview", active: true },
        { icon: "📋", label: "My Briefs", badge: "4" },
        { icon: "💡", label: "Pitches", badge: "28" },
        { icon: "🤝", label: "Active Projects" },
      ]},
      { label: "Account", items: [
        { icon: "💳", label: "Billing" },
        { icon: "⚙️", label: "Settings" },
      ]},
    ],
  },
  agency: {
    label: "Agency",
    icon: "🏢",
    topbarTitle: "Agency Dashboard",
    topbarSub: "Track your pitches and client wins",
    newBtnLabel: "New Pitch",
    stats: [
      { label: "Open Briefs", value: "17", change: "+5", trend: "up", icon: "📋" },
      { label: "Pitches Sent", value: "9", change: "+3", trend: "up", icon: "📤" },
      { label: "Won Contracts", value: "6", change: "+1", trend: "up", icon: "🏆" },
      { label: "Revenue", value: "$84k", change: "+$14k", trend: "up", icon: "📈" },
    ],
    tableTitle: "My Pitches",
    tableSub: "Status of submitted proposals",
    tableItems: [
      { icon: "🎯", name: "Acme Corp — Social Strategy", meta: "Submitted 1 day ago", value: "$8,500", status: "review", time: "Decision Nov 2" },
      { icon: "🛍️", name: "Bloom Retail — Content Plan", meta: "Submitted 4 days ago", value: "$5,200", status: "active", time: "Won ✓" },
      { icon: "🚗", name: "Drivo — Launch Campaign", meta: "Submitted 1 week ago", value: "$12,000", status: "pending", time: "Awaiting review" },
    ],
    activities: [
      { text: "Your pitch for <strong>Acme Corp</strong> has been shortlisted", time: "1 hour ago" },
      { text: "New brief posted: <strong>SaaS Product Launch — $20k budget</strong>", time: "3 hours ago" },
      { text: "<strong>Bloom Retail</strong> left a 5-star review on your work", time: "Yesterday" },
    ],
    navSections: [
      { label: "Main", items: [
        { icon: "🏠", label: "Overview", active: true },
        { icon: "📋", label: "Open Briefs", badge: "17" },
        { icon: "📤", label: "My Pitches", badge: "9" },
        { icon: "🏆", label: "Won Contracts" },
      ]},
      { label: "Business", items: [
        { icon: "👥", label: "Team Members" },
        { icon: "📊", label: "Analytics" },
        { icon: "⚙️", label: "Settings" },
      ]},
    ],
  },
  team: {
    label: "Team",
    icon: "👥",
    topbarTitle: "Team Dashboard",
    topbarSub: "Coordinate projects and tasks",
    newBtnLabel: "New Task",
    stats: [
      { label: "Active Projects", value: "5", change: "+1", trend: "up", icon: "🚀" },
      { label: "Pending Tasks", value: "14", change: "-3", trend: "up", icon: "✅" },
      { label: "Team Members", value: "8", change: "+2", trend: "up", icon: "👤" },
      { label: "Earned", value: "$31k", change: "+$6k", trend: "up", icon: "💵" },
    ],
    tableTitle: "Client Projects",
    tableSub: "Current active work across clients",
    tableItems: [
      { icon: "🎨", name: "Rebranding — NovaTech", meta: "Due Nov 15", value: "$4,200", status: "active", time: "On track" },
      { icon: "📢", name: "Social Ads — Bloom Co.", meta: "Due Nov 8", value: "$2,800", status: "review", time: "Needs review" },
      { icon: "✍️", name: "Content Strategy — Drivo", meta: "Due Dec 1", value: "$6,000", status: "pending", time: "Starting soon" },
    ],
    activities: [
      { text: "<strong>Alex</strong> completed the brand guidelines task", time: "45 min ago" },
      { text: "New project assigned: <strong>Content Strategy for Drivo</strong>", time: "3 hours ago" },
      { text: "Team meeting scheduled for <strong>tomorrow at 10am</strong>", time: "Yesterday" },
    ],
    navSections: [
      { label: "Main", items: [
        { icon: "🏠", label: "Overview", active: true },
        { icon: "🚀", label: "Projects" },
        { icon: "✅", label: "Tasks", badge: "14" },
        { icon: "👤", label: "Members" },
      ]},
      { label: "Tools", items: [
        { icon: "📂", label: "Files" },
        { icon: "💬", label: "Messages" },
        { icon: "⚙️", label: "Settings" },
      ]},
    ],
  },
  freelancer: {
    label: "Freelancer",
    icon: "⚡",
    topbarTitle: "Creator Dashboard",
    topbarSub: "Your pitches, offers, and portfolio",
    newBtnLabel: "Submit Offer",
    stats: [
      { label: "Open Collabs", value: "23", change: "+8", trend: "up", icon: "🔗" },
      { label: "Offers Sent", value: "7", change: "+2", trend: "up", icon: "📨" },
      { label: "Accepted", value: "3", change: "+1", trend: "up", icon: "✅" },
      { label: "Earned", value: "$9.4k", change: "+$2.1k", trend: "up", icon: "💸" },
    ],
    tableTitle: "My Offers",
    tableSub: "Submitted collaboration proposals",
    tableItems: [
      { icon: "📸", name: "Lifestyle UGC — Glow Skin", meta: "Submitted 2 days ago", value: "$1,500", status: "review", time: "Under review" },
      { icon: "🎬", name: "Product Video — AirTrack", meta: "Submitted 5 days ago", value: "$2,200", status: "active", time: "Accepted ✓" },
      { icon: "📝", name: "Blog Series — TechBlog", meta: "Submitted 1 week ago", value: "$900", status: "pending", time: "Awaiting reply" },
    ],
    activities: [
      { text: "<strong>Glow Skin</strong> is reviewing your UGC proposal", time: "1 hour ago" },
      { text: "New collab posted that matches your profile: <strong>Beauty Brand UGC</strong>", time: "4 hours ago" },
      { text: "<strong>AirTrack</strong> approved your video offer — get started!", time: "Yesterday" },
    ],
    navSections: [
      { label: "Main", items: [
        { icon: "🏠", label: "Overview", active: true },
        { icon: "🔗", label: "Open Collabs", badge: "23" },
        { icon: "📨", label: "My Offers" },
        { icon: "🖼️", label: "Portfolio" },
      ]},
      { label: "Profile", items: [
        { icon: "⭐", label: "Reviews" },
        { icon: "💳", label: "Earnings" },
        { icon: "⚙️", label: "Settings" },
      ]},
    ],
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  }),
};

const Dashboard = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.client;
  const [activeNav, setActiveNav] = useState(0);

  const PROGRESSES = [72, 48, 91, 35];

  return (
    <div className="dashboard-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">Marketi<span>LI</span></div>
        <div className="sidebar-role-tag">{config.icon} {config.label}</div>

        <nav className="sidebar-nav">
          {config.navSections.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item, i) => (
                <button
                  key={item.label}
                  className={`sidebar-nav-item${item.active ? " active" : ""}`}
                  onClick={() => setActiveNav(i)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                  {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {config.label.slice(0, 2).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">My Account</div>
              <div className="sidebar-user-role">{config.label}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="dashboard-main">
        {/* Topbar */}
        <div className="dashboard-topbar">
          <div>
            <div className="dashboard-topbar-title">{config.topbarTitle}</div>
            <div className="dashboard-topbar-sub">{config.topbarSub}</div>
          </div>
          <div className="topbar-actions">
            <button className="topbar-icon-btn" title="Search">🔍</button>
            <button className="topbar-icon-btn" title="Notifications">
              🔔
              <span className="topbar-notif-dot" />
            </button>
            <button className="topbar-new-btn">
              + {config.newBtnLabel}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {/* Stats */}
          <div className="stats-row">
            {config.stats.map((stat, i) => (
              <motion.div
                className="stat-card"
                key={stat.label}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                <div className="stat-card-header">
                  <span className="stat-card-label">{stat.label}</span>
                  <div className="stat-card-icon">{stat.icon}</div>
                </div>
                <div className="stat-card-value">{stat.value}</div>
                <span className={`stat-card-change ${stat.trend}`}>
                  {stat.trend === "up" ? "↑" : "↓"} {stat.change} this month
                </span>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-track">
                    <motion.div
                      className="progress-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${PROGRESSES[i]}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Content grid */}
          <div className="content-grid">
            {/* Table card */}
            <motion.div
              className="content-card"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
            >
              <div className="content-card-header">
                <div>
                  <div className="content-card-title">{config.tableTitle}</div>
                  <div className="content-card-sub">{config.tableSub}</div>
                </div>
                <button className="content-card-action">View all</button>
              </div>
              <div className="data-table">
                {config.tableItems.map((row, i) => (
                  <div className="table-row" key={i}>
                    <div className="table-row-icon">{row.icon}</div>
                    <div className="table-row-info">
                      <div className="table-row-name">{row.name}</div>
                      <div className="table-row-meta">{row.meta}</div>
                    </div>
                    <div>
                      <div className="table-row-value">{row.value}</div>
                      <div className="table-row-meta-right">{row.time}</div>
                    </div>
                    <span className={`status-badge ${row.status}`}>
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity feed */}
            <motion.div
              className="content-card"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={5}
            >
              <div className="content-card-header">
                <div>
                  <div className="content-card-title">Recent Activity</div>
                  <div className="content-card-sub">Latest updates</div>
                </div>
              </div>
              <div className="activity-list">
                {config.activities.map((a, i) => (
                  <div className="activity-item" key={i}>
                    <div className="activity-dot-col">
                      <div className="activity-dot" />
                      <div className="activity-line" />
                    </div>
                    <div className="activity-content">
                      <div
                        className="activity-text"
                        dangerouslySetInnerHTML={{ __html: a.text }}
                      />
                      <div className="activity-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Switch role prompt */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid #f5f4fb" }}>
                <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 10 }}>
                  Explore other dashboards:
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["client", "agency", "team", "freelancer"]
                    .filter((r) => r !== role)
                    .map((r) => (
                      <button
                        key={r}
                        onClick={() => navigate(`/dashboard/${r}`)}
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: 20,
                          border: "1px solid var(--border)",
                          background: "white",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          transition: "all 0.15s",
                        }}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
