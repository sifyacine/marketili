import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import adminService from "../../services/adminService";
import adService from "../../services/adService";
import uploadService from "../../services/uploadService";
import notificationService from "../../services/notificationService";
import subscriptionService from "../../services/subscriptionService";
import {
  IconGrid, IconUsers, IconFlag, IconTrendingUp,
  IconBriefcase, IconSend, IconClipboard, IconSettings,
  IconBell, IconLogOut, IconChevronLeft, IconChevronRight,
  IconShield, IconSearch, IconPlus, IconX, IconAward,
} from "../../components/ui/Icons";
import "../../styles/Dashboard.css";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  sidebar:     "#0d0b14",
  sidebarBdr:  "rgba(255,255,255,0.06)",
  accent:      "#c0152a",
  accentBg:    "rgba(192,21,42,0.12)",
  accentHover: "rgba(192,21,42,0.06)",
  mainBg:      "#f5f3f8",
  card:        "#ffffff",
  border:      "#eceaf2",
  ink:         "#0f0a14",
  inkMuted:    "#6b617e",
  green:       "#059669",
  yellow:      "#f59e0b",
  blue:        "#0891b2",
  purple:      "#7c3aed",
  orange:      "#f97316",
  red:         "#ef4444",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtFull = (d) =>
  d ? new Date(d).toLocaleString("fr-DZ", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const relTime = (d) => {
  if (!d) return "";
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "à l'instant";
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
};

const ROLE_LABELS = {
  client: "Client", agency: "Agence", agency_member: "Membre agence",
  team: "Équipe", team_member: "Membre équipe", freelancer: "Freelancer",
};
const ROLE_COLORS = {
  client: C.blue, agency: C.purple, agency_member: "#6d28d9",
  team: C.green, team_member: "#047857", freelancer: C.orange,
};

const ACTION_META = {
  user_registered:   { icon: "👤", color: C.blue },
  user_disabled:     { icon: "🚫", color: C.red },
  user_enabled:      { icon: "✅", color: C.green },
  post_created:      { icon: "📝", color: C.purple },
  post_closed:       { icon: "🔒", color: C.inkMuted },
  post_removed:      { icon: "🗑️", color: C.red },
  post_reactivated:  { icon: "🔓", color: C.green },
  pitch_sent:        { icon: "📨", color: C.yellow },
  pitch_accepted:    { icon: "🤝", color: C.green },
  project_created:   { icon: "📁", color: C.blue },
  project_completed: { icon: "🏁", color: C.green },
  contract_signed:   { icon: "📃", color: C.orange },
  ad_created:        { icon: "📢", color: C.accent },
  member_created:    { icon: "👥", color: C.purple },
  account_restored:  { icon: "🔓", color: C.green },
};

// ── Reusable micro-components ─────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
    <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`,
      borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
  </div>
);

const Badge = ({ children, color = C.inkMuted, bg }) => (
  <span style={{
    padding: "2px 10px", borderRadius: 20, fontSize: "0.67rem", fontWeight: 700,
    background: bg || color + "18", color,
    display: "inline-block", whiteSpace: "nowrap",
  }}>{children}</span>
);

const SectionTitle = ({ title, sub, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 22, gap: 12 }}>
    <div>
      <h2 style={{ fontSize: "1.18rem", fontWeight: 800, color: C.ink, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: "0.8rem", color: C.inkMuted, marginTop: 4 }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const Card = ({ children, style, pad = "20px 22px" }) => (
  <div style={{
    background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: pad, ...style,
  }}>{children}</div>
);

const StatCard = ({ icon, label, value, sub, color = C.accent, trend }) => (
  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
    style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "20px 22px", flex: 1, minWidth: 140,
      borderTop: `3px solid ${color}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: C.inkMuted,
        textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "14",
        display: "flex", alignItems: "center", justifyContent: "center", color }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: "1.9rem", fontWeight: 800, color: C.ink, lineHeight: 1 }}>{value ?? "—"}</div>
    {sub && <div style={{ fontSize: "0.71rem", color: C.inkMuted, marginTop: 6 }}>{sub}</div>}
    {trend !== undefined && (
      <div style={{ fontSize: "0.7rem", marginTop: 6, fontWeight: 600,
        color: trend >= 0 ? C.green : C.red }}>
        {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)} ce mois
      </div>
    )}
  </motion.div>
);

const Paginator = ({ page, total, limit, onChange }) => {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
      gap: 8, padding: "14px 20px", borderTop: `1px solid ${C.border}` }}>
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}
        style={{ padding: "5px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
          background: "none", cursor: page <= 1 ? "default" : "pointer",
          opacity: page <= 1 ? 0.4 : 1, fontSize: "0.78rem", fontFamily: "inherit" }}>
        ← Précédent
      </button>
      <span style={{ fontSize: "0.78rem", color: C.inkMuted, padding: "0 8px" }}>
        {page} / {pages}
      </span>
      <button disabled={page >= pages} onClick={() => onChange(page + 1)}
        style={{ padding: "5px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
          background: "none", cursor: page >= pages ? "default" : "pointer",
          opacity: page >= pages ? 0.4 : 1, fontSize: "0.78rem", fontFamily: "inherit" }}>
        Suivant →
      </button>
    </div>
  );
};

const EmptyState = ({ icon, text }) => (
  <div style={{ padding: "52px 24px", textAlign: "center", color: C.inkMuted }}>
    <div style={{ fontSize: "1.8rem", marginBottom: 10, opacity: 0.4 }}>{icon}</div>
    <div style={{ fontSize: "0.85rem" }}>{text}</div>
  </div>
);

// ── Input / Select shared style ───────────────────────────────────────────────
const inputStyle = {
  padding: "9px 13px", borderRadius: 9, border: `1.5px solid ${C.border}`,
  background: "#faf9fc", fontSize: "0.84rem", color: C.ink, fontFamily: "inherit",
  outline: "none", width: "100%", boxSizing: "border-box",
};

const btnPrimary = {
  padding: "9px 18px", borderRadius: 9, border: "none",
  background: C.accent, color: "#fff", fontWeight: 700, cursor: "pointer",
  fontFamily: "inherit", fontSize: "0.84rem", whiteSpace: "nowrap",
  transition: "opacity 0.15s",
};

const btnGhost = {
  padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`,
  background: "none", cursor: "pointer", fontFamily: "inherit",
  fontSize: "0.78rem", color: C.inkMuted, fontWeight: 600,
};

// ── OVERVIEW PANEL ────────────────────────────────────────────────────────────
const OverviewPanel = ({ onNav }) => {
  const [stats,    setStats]    = useState(null);
  const [activity, setActivity] = useState(null);
  const [logs,     setLogs]     = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getStats().catch(() => null),
      adminService.getActivity().catch(() => null),
      adService.getActivityLog({ page: 1, limit: 6 }).catch(() => null),
    ]).then(([s, a, l]) => {
      setStats(s);
      setActivity(a);
      setLogs(l?.logs || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const s = stats || {};
  const a = activity || {};

  return (
    <div>
      <SectionTitle title="Tableau de bord" sub="Vue d'ensemble de la plateforme Marketili" />

      {/* KPI Row */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard icon={<IconUsers size={15} />}    label="Utilisateurs" value={s.users?.total}
          color={C.purple} trend={s.activity?.newClientsThisMonth} />
        <StatCard icon={<IconFlag size={15} />}     label="Posts ouverts" value={s.posts?.open}
          color={C.green} sub={`${s.posts?.total || 0} au total`} />
        <StatCard icon={<IconBriefcase size={15} />} label="Projets actifs" value={s.projects?.active}
          color={C.blue} sub={`${s.projects?.completed || 0} terminés`} />
      </div>

      {/* Secondary row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 24 }}>

        {/* Recent Registrations */}
        <Card pad="0">
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: "0.92rem", color: C.ink }}>Inscriptions récentes</span>
            <button onClick={() => onNav("users")} style={{ ...btnGhost, padding: "4px 10px", fontSize: "0.72rem" }}>
              Voir tout →
            </button>
          </div>
          {!(a.registrations?.length) ? (
            <EmptyState icon="👤" text="Aucune inscription récente" />
          ) : a.registrations.slice(0, 7).map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: (ROLE_COLORS[r.type] || "#888") + "20",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: ROLE_COLORS[r.type] || "#888", fontWeight: 800, fontSize: "0.7rem" }}>
                {r.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "0.83rem", color: C.ink,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.name}
                </div>
                <div style={{ fontSize: "0.7rem", color: C.inkMuted, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                <Badge color={ROLE_COLORS[r.type] || "#888"}>{ROLE_LABELS[r.type] || r.type}</Badge>
                <span style={{ fontSize: "0.65rem", color: C.inkMuted }}>{relTime(r.createdAt)}</span>
              </div>
            </motion.div>
          ))}
        </Card>

        {/* Activity Log Feed */}
        <Card pad="0">
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${C.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: "0.92rem", color: C.ink }}>Journal d'activité</span>
            <button onClick={() => onNav("log")} style={{ ...btnGhost, padding: "4px 10px", fontSize: "0.72rem" }}>
              Voir tout →
            </button>
          </div>
          {!logs.length ? (
            <EmptyState icon="📋" text="Aucune activité enregistrée" />
          ) : logs.map((log, i) => (
            <motion.div key={log._id || i} initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: 1 }}>
                {ACTION_META[log.actionType]?.icon || "📌"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.81rem", fontWeight: 600, color: C.ink,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.description}
                </div>
                <div style={{ fontSize: "0.69rem", color: C.inkMuted, marginTop: 2 }}>
                  {log.actorName && <span>{log.actorName} · </span>}
                  <span>{relTime(log.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </Card>
      </div>

      {/* Posts breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {[
          { label: "Posts Ouverts",   val: s.posts?.open,        color: C.green },
          { label: "Posts En cours",  val: s.posts?.inProgress,  color: C.yellow },
          { label: "Posts Fermés",    val: s.posts?.closed,      color: C.inkMuted },
          { label: "Projets terminés",val: s.projects?.completed,color: C.blue },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background: C.card, borderRadius: 10,
            border: `1px solid ${C.border}`, padding: "14px 18px",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: C.inkMuted, fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: "1.15rem", fontWeight: 800, color }}>{val ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── USERS PANEL ───────────────────────────────────────────────────────────────
const UsersPanel = () => {
  const [users,   setUsers]   = useState([]);
  const [role,    setRole]    = useState("");
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminService.getUsers({ role, search });
      const list = res.data?.users || res.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally { setLoading(false); }
  }, [role, search]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(); }, [role]);

  const handleToggle = async (u) => {
    setTogglingId(u._id);
    try {
      await adminService.toggleUser(u._roleLabel || u.role, u._id);
      fetchUsers();
    } catch {}
    setTogglingId(null);
  };

  return (
    <div>
      <SectionTitle title="Gestion des utilisateurs"
        sub={`${users.length} compte${users.length !== 1 ? "s" : ""} trouvé${users.length !== 1 ? "s" : ""}`} />

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={role} onChange={e => setRole(e.target.value)}
          style={{ ...inputStyle, flex: "0 0 180px" }}>
          <option value="">Tous les rôles</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div style={{ display: "flex", gap: 10, flex: 1 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <IconSearch size={14} style={{ position: "absolute", left: 11, top: "50%",
              transform: "translateY(-50%)", color: C.inkMuted, pointerEvents: "none" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchUsers()}
              placeholder="Rechercher par nom ou email..."
              style={{ ...inputStyle, paddingLeft: 34 }} />
          </div>
          <button onClick={fetchUsers} style={btnPrimary}>Rechercher</button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: `1px solid #fecaca`, borderRadius: 9,
          padding: "12px 16px", marginBottom: 16, color: "#b91c1c", fontSize: "0.84rem" }}>
          {error}
        </div>
      )}

      <Card pad="0">
        {loading ? <Spinner /> : users.length === 0 ? (
          <EmptyState icon="👥" text="Aucun utilisateur trouvé" />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {["Compte","Email","Rôle","Statut","Action"].map(h => (
                  <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: "0.72rem",
                    fontWeight: 700, color: C.inkMuted, textTransform: "uppercase",
                    letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                const name = u.firstName
                  ? `${u.firstName} ${u.lastName || ""}`.trim()
                  : u.agencyName || u.teamName || "—";
                const isActive = u.isActive !== false;
                return (
                  <motion.tr key={u._id || i}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.025 }}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={e => e.currentTarget.style.background = "#faf9fc"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                          background: (ROLE_COLORS[u._roleLabel] || "#888") + "18",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: ROLE_COLORS[u._roleLabel] || "#888",
                          fontWeight: 800, fontSize: "0.72rem" }}>
                          {name[0]?.toUpperCase() || "?"}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: C.ink }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 18px", fontSize: "0.82rem", color: C.inkMuted }}>{u.email}</td>
                    <td style={{ padding: "12px 18px" }}>
                      <Badge color={ROLE_COLORS[u._roleLabel] || "#888"}>
                        {ROLE_LABELS[u._roleLabel] || u._roleLabel}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: "0.78rem", fontWeight: 600, color: isActive ? C.green : C.red }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%",
                          background: isActive ? C.green : C.red }} />
                        {isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 18px" }}>
                      <button onClick={() => handleToggle(u)}
                        disabled={togglingId === u._id}
                        style={{ padding: "5px 13px", borderRadius: 7, fontSize: "0.75rem",
                          fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "inherit",
                          background: isActive ? "#fee2e2" : "#d1fae5",
                          color: isActive ? "#b91c1c" : "#065f46",
                          opacity: togglingId === u._id ? 0.5 : 1 }}>
                        {togglingId === u._id ? "..." : (isActive ? "Désactiver" : "Activer")}
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

// ── STATS PANEL ───────────────────────────────────────────────────────────────
const StatsPanel = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then(d => setStats(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!stats)  return <div style={{ color: C.inkMuted }}>Erreur de chargement</div>;

  const Section = ({ title, items }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 800, color: C.inkMuted,
        letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {items.map(({ label, value, color, sub }) => (
          <StatCard key={label} label={label} value={value} color={color} sub={sub} />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <SectionTitle title="Statistiques plateforme" sub="Métriques globales en temps réel" />

      {/* KPI highlight row */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon={<IconUsers size={15} />}    label="Utilisateurs total" value={stats.users?.total}
          color={C.purple} sub={`+${stats.activity?.newClientsThisMonth || 0} ce mois`} />
        <StatCard icon={<IconFlag size={15} />}     label="Posts total"        value={stats.posts?.total}
          color={C.green}  sub={`+${stats.activity?.postsThisMonth || 0} ce mois`} />
        <StatCard icon={<IconBriefcase size={15} />} label="Projets total"     value={stats.projects?.total}
          color={C.blue}   sub={`${stats.projects?.active || 0} actifs`} />
      </div>

      <Section title="Répartition des utilisateurs" items={[
        { label: "Clients",          value: stats.users.client,       color: C.blue },
        { label: "Agences",          value: stats.users.agency,       color: C.purple },
        { label: "Membres agence",   value: stats.users.agencyMember, color: "#6d28d9" },
        { label: "Équipes",          value: stats.users.team,         color: C.green },
        { label: "Membres équipe",   value: stats.users.teamMember,   color: "#047857" },
        { label: "Freelancers",      value: stats.users.freelancer,   color: C.orange },
      ]} />
      <Section title="Posts par statut" items={[
        { label: "Total",    value: stats.posts.total,      color: C.ink,     sub: `+${stats.activity?.postsThisMonth || 0} ce mois` },
        { label: "Ouverts",  value: stats.posts.open,       color: C.green },
        { label: "En cours", value: stats.posts.inProgress, color: C.yellow },
        { label: "Fermés",   value: stats.posts.closed,     color: C.inkMuted },
      ]} />
      <Section title="Projets" items={[
        { label: "Total",    value: stats.projects.total,     color: C.ink },
        { label: "Actifs",   value: stats.projects.active,    color: C.blue },
        { label: "Terminés", value: stats.projects.completed, color: C.green },
        { label: "Annulés",  value: stats.projects.cancelled, color: C.inkMuted },
      ]} />
    </div>
  );
};

// ── POSTS PANEL ───────────────────────────────────────────────────────────────
const PostStatusBadge = ({ status }) => {
  const MAP = {
    open:        { label: "Ouvert",    color: C.green },
    in_progress: { label: "En cours", color: C.yellow },
    closed:      { label: "Fermé",    color: C.inkMuted },
    reactivated: { label: "Réactivé", color: C.blue },
  };
  const s = MAP[status] || { label: status, color: C.inkMuted };
  return <Badge color={s.color}>{s.label}</Badge>;
};

const PostsPanel = () => {
  const [posts,           setPosts]           = useState([]);
  const [total,           setTotal]           = useState(0);
  const [, setPages] = useState(1);
  const [page,            setPage]            = useState(1);
  const [status,          setStatus]          = useState("all");
  const [search,          setSearch]          = useState("");
  const [loading,         setLoading]         = useState(true);
  const [removing,        setRemoving]        = useState(null);
  const [modal,           setModal]           = useState(null);
  const [reason,          setReason]          = useState("");
  const [reactivateModal, setReactivateModal] = useState(null);
  const [reactivating,    setReactivating]    = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminService.getPosts({ status: status !== "all" ? status : undefined, search: search || undefined, page, limit: 15 })
      .then(d => { setPosts(d.posts || []); setTotal(d.total || 0); setPages(d.pages || 1); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [status, search, page]);

  useEffect(() => { load(); }, [load]);

  const handleRemove = async () => {
    if (!modal) return;
    setRemoving(modal._id);
    try {
      await adminService.removePost(modal._id, reason);
      setPosts(prev => prev.map(p => p._id === modal._id ? { ...p, status: "closed" } : p));
      setModal(null); setReason("");
    } catch {}
    setRemoving(null);
  };

  const handleReactivate = async () => {
    if (!reactivateModal) return;
    setReactivating(reactivateModal._id);
    try {
      await adminService.reactivatePost(reactivateModal._id);
      setPosts(prev => prev.map(p =>
        p._id === reactivateModal._id ? { ...p, status: "open", adminNote: "" } : p
      ));
      setReactivateModal(null);
    } catch {}
    setReactivating(null);
  };

  return (
    <div>
      <SectionTitle title="Modération des posts" sub={`${total} post${total !== 1 ? "s" : ""} au total`} />

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          style={{ ...inputStyle, flex: "0 0 170px" }}>
          <option value="all">Tous les statuts</option>
          <option value="open">Ouverts</option>
          <option value="in_progress">En cours</option>
          <option value="closed">Fermés</option>
        </select>
        <div style={{ flex: 1, position: "relative" }}>
          <IconSearch size={14} style={{ position: "absolute", left: 11, top: "50%",
            transform: "translateY(-50%)", color: C.inkMuted, pointerEvents: "none" }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load()}
            placeholder="Rechercher un titre ou client..."
            style={{ ...inputStyle, paddingLeft: 34 }} />
        </div>
        <button onClick={load} style={btnPrimary}>Rechercher</button>
      </div>

      <Card pad="0">
        {loading ? <Spinner /> : posts.length === 0 ? (
          <EmptyState icon="📝" text="Aucun post trouvé" />
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {["Titre","Client","Statut","Offres","Date","Action"].map(h => (
                    <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: "0.72rem",
                      fontWeight: 700, color: C.inkMuted, textTransform: "uppercase",
                      letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts.map((p, i) => {
                  const clientName = p.client
                    ? (p.client.accountType === "company"
                        ? p.client.companyName
                        : `${p.client.firstName || ""} ${p.client.lastName || ""}`.trim())
                    : "Inconnu";
                  return (
                    <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = "#faf9fc"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "12px 18px", maxWidth: 240 }}>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: C.ink,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.title}
                        </div>
                        {p.adminNote && (
                          <div style={{ fontSize: "0.68rem", color: C.red, marginTop: 2 }}>
                            Note : {p.adminNote}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: "0.82rem", color: C.inkMuted }}>{clientName}</td>
                      <td style={{ padding: "12px 18px" }}><PostStatusBadge status={p.status} /></td>
                      <td style={{ padding: "12px 18px", fontSize: "0.82rem", textAlign: "center",
                        fontWeight: 700, color: C.ink }}>{p.pitchCount || 0}</td>
                      <td style={{ padding: "12px 18px", fontSize: "0.78rem", color: C.inkMuted }}>{fmt(p.createdAt)}</td>
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          {p.status !== "closed" && (
                            <button onClick={() => { setModal(p); setReason(""); }}
                              style={{ padding: "5px 12px", borderRadius: 7, fontSize: "0.72rem",
                                fontWeight: 700, cursor: "pointer", border: "none",
                                background: "#fee2e2", color: "#b91c1c", fontFamily: "inherit" }}>
                              Retirer
                            </button>
                          )}
                          {p.status === "closed" && (
                            <button onClick={() => setReactivateModal(p)}
                              style={{ padding: "5px 12px", borderRadius: 7, fontSize: "0.72rem",
                                fontWeight: 700, cursor: "pointer", border: "none",
                                background: "#d1fae5", color: "#065f46", fontFamily: "inherit" }}>
                              Réactiver
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            <Paginator page={page} total={total} limit={15} onChange={setPage} />
          </>
        )}
      </Card>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
            onClick={e => e.target === e.currentTarget && setModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              style={{ background: C.card, borderRadius: 16, padding: "28px 32px",
                width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: C.ink, marginBottom: 6 }}>
                Retirer ce post
              </div>
              <div style={{ fontSize: "0.85rem", color: C.inkMuted, marginBottom: 18 }}>
                "{modal.title}"
              </div>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: C.inkMuted, display: "block", marginBottom: 6 }}>
                Raison (optionnel)
              </label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Raison du retrait..." rows={3}
                style={{ ...inputStyle, resize: "vertical" }} />
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                <button onClick={handleRemove} disabled={removing === modal._id}
                  style={{ ...btnPrimary, flex: 1, opacity: removing === modal._id ? 0.6 : 1 }}>
                  {removing === modal._id ? "Retrait..." : "Confirmer le retrait"}
                </button>
                <button onClick={() => setModal(null)} style={btnGhost}>Annuler</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reactivateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
            onClick={e => e.target === e.currentTarget && setReactivateModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              style={{ background: C.card, borderRadius: 16, padding: "28px 32px",
                width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
              <div style={{ fontWeight: 800, fontSize: "1.05rem", color: C.ink, marginBottom: 6 }}>
                Réactiver ce post
              </div>
              <div style={{ fontSize: "0.85rem", color: C.inkMuted, marginBottom: 6 }}>
                "{reactivateModal.title}"
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
                background: "#d1fae5", borderRadius: 8, padding: "10px 14px" }}>
                <span style={{ fontSize: "0.82rem", color: "#065f46", fontWeight: 600 }}>
                  Statut actuel :
                </span>
                <PostStatusBadge status={reactivateModal.status} />
                <span style={{ fontSize: "0.82rem", color: "#065f46" }}>→</span>
                <PostStatusBadge status="open" />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={handleReactivate} disabled={reactivating === reactivateModal._id}
                  style={{ padding: "9px 18px", borderRadius: 9, border: "none",
                    background: C.green, color: "#fff", fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit", fontSize: "0.84rem", flex: 1,
                    opacity: reactivating === reactivateModal._id ? 0.6 : 1 }}>
                  {reactivating === reactivateModal._id ? "Réactivation..." : "Confirmer la réactivation"}
                </button>
                <button onClick={() => setReactivateModal(null)} style={btnGhost}>Annuler</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── ACTIVITY PANEL ────────────────────────────────────────────────────────────
const ActivityPanel = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getActivity().then(d => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data)   return <div style={{ color: C.inkMuted }}>Erreur de chargement</div>;

  const PITCH_LABEL = {
    agency_to_client: "Agence → Client", team_to_client: "Équipe → Client",
    freelancer_to_client: "Freelancer → Client", agency_to_freelancer: "Agence → Freelancer",
  };
  const STATUS_COLOR = { open: C.green, in_progress: C.yellow, closed: C.inkMuted,
    pending: C.yellow, accepted: C.green, rejected: C.red };

  return (
    <div>
      <SectionTitle title="Activité récente" sub="Inscriptions, posts et offres des dernières 24h" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Card pad="0">
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
            fontWeight: 700, fontSize: "0.9rem", color: C.ink }}>Inscriptions récentes</div>
          {!(data.registrations?.length) ? <EmptyState icon="👤" text="Aucune inscription" /> :
            data.registrations.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%",
                  background: (ROLE_COLORS[r.type] || "#888") + "20",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: ROLE_COLORS[r.type] || "#888", fontWeight: 800, fontSize: "0.68rem" }}>
                  {r.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                  <div style={{ fontSize: "0.69rem", color: C.inkMuted }}>{r.email}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <Badge color={ROLE_COLORS[r.type] || "#888"}>{ROLE_LABELS[r.type] || r.type}</Badge>
                  <span style={{ fontSize: "0.65rem", color: C.inkMuted }}>{relTime(r.createdAt)}</span>
                </div>
              </motion.div>
            ))}
        </Card>

        <Card pad="0">
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
            fontWeight: 700, fontSize: "0.9rem", color: C.ink }}>Posts récents</div>
          {!(data.posts?.length) ? <EmptyState icon="📝" text="Aucun post récent" /> :
            data.posts.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, paddingRight: 8 }}>{p.title}</div>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700,
                    color: STATUS_COLOR[p.status] || C.inkMuted }}>{p.status}</span>
                </div>
                <div style={{ fontSize: "0.7rem", color: C.inkMuted, marginTop: 2 }}>{relTime(p.createdAt)}</div>
              </motion.div>
            ))}
        </Card>

        <Card pad="0">
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
            fontWeight: 700, fontSize: "0.9rem", color: C.ink }}>Offres récentes</div>
          {!(data.pitches?.length) ? <EmptyState icon="📨" text="Aucune offre récente" /> :
            data.pitches.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ fontWeight: 600, fontSize: "0.82rem", marginBottom: 2 }}>
                  {p.post?.title || "Post supprimé"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between",
                  fontSize: "0.7rem", color: C.inkMuted }}>
                  <span>{PITCH_LABEL[p.pitchType] || p.pitchType}</span>
                  <span style={{ color: STATUS_COLOR[p.status] || C.inkMuted, fontWeight: 600 }}>{p.status}</span>
                </div>
              </motion.div>
            ))}
        </Card>
      </div>
    </div>
  );
};

// ── ADS PANEL ─────────────────────────────────────────────────────────────────
const TARGET_ROLES = ["all","client","agency","agency_member","team","team_member","freelancer"];
const PLACEMENTS   = ["banner","sidebar","card"];

const AdsPanel = () => {
  const [ads,      setAds]      = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({
    title: "", imageUrl: "", linkUrl: "", placement: "banner", targetRoles: ["all"], isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState("");
  const fileRef = useRef();

  const load = useCallback(() => {
    adService.getAdminAds().then(d => setAds(d.ads || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Upload an image file to GridFS and store its URL on the ad. Admins can still
  // paste an external URL in the field instead.
  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgError("");
    if (!file.type.startsWith("image/")) {
      setImgError("Veuillez choisir un fichier image.");
      return;
    }
    setImgUploading(true);
    try {
      const res = await uploadService.upload(file);
      setForm(p => ({ ...p, imageUrl: res.url }));
    } catch {
      setImgError("Échec du téléversement. Réessayez.");
    } finally {
      setImgUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await adService.createAd(form);
      setShowForm(false);
      setImgError("");
      setForm({ title: "", imageUrl: "", linkUrl: "", placement: "banner", targetRoles: ["all"], isActive: true });
      load();
    } catch {}
    setSaving(false);
  };

  const toggleRole = (r) => setForm(prev => ({
    ...prev,
    targetRoles: prev.targetRoles.includes(r)
      ? prev.targetRoles.filter(x => x !== r)
      : [...prev.targetRoles, r],
  }));

  if (loading) return <Spinner />;

  return (
    <div>
      <SectionTitle title="Gestion des publicités"
        sub={`${ads.length} publicité${ads.length !== 1 ? "s" : ""}`}
        action={
          <button onClick={() => setShowForm(s => !s)}
            style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
            {showForm ? <><IconX size={13} /> Annuler</> : <><IconPlus size={13} /> Nouvelle publicité</>}
          </button>
        } />

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 20 }}>
            <Card>
              <div style={{ fontWeight: 700, fontSize: "0.92rem", color: C.ink, marginBottom: 16 }}>
                Créer une nouvelle publicité
              </div>
              <form onSubmit={handleCreate}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: C.inkMuted,
                      display: "block", marginBottom: 5 }}>Titre *</label>
                    <input required value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: C.inkMuted,
                      display: "block", marginBottom: 5 }}>Image</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input value={form.imageUrl} placeholder="https://... ou téléverser →"
                        onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                        style={{ ...inputStyle, flex: 1 }} />
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                        onChange={handleImageFile} />
                      <button type="button" onClick={() => fileRef.current?.click()} disabled={imgUploading}
                        style={{ ...btnGhost, fontSize: "0.75rem", whiteSpace: "nowrap",
                          opacity: imgUploading ? 0.6 : 1, cursor: imgUploading ? "wait" : "pointer" }}>
                        {imgUploading ? "Téléversement…" : "Téléverser"}
                      </button>
                    </div>
                    {imgError && (
                      <div style={{ fontSize: "0.7rem", color: C.red, marginTop: 5 }}>{imgError}</div>
                    )}
                    {form.imageUrl && (
                      <img src={uploadService.resolveUrl(form.imageUrl)} alt="Aperçu"
                        style={{ marginTop: 8, height: 44, maxWidth: 160, objectFit: "cover",
                          borderRadius: 6, border: `1px solid ${C.border}` }} />
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: C.inkMuted,
                      display: "block", marginBottom: 5 }}>URL de destination (clic)</label>
                    <input value={form.linkUrl} placeholder="https://..."
                      onChange={e => setForm(p => ({ ...p, linkUrl: e.target.value }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: C.inkMuted,
                      display: "block", marginBottom: 5 }}>Emplacement</label>
                    <select value={form.placement}
                      onChange={e => setForm(p => ({ ...p, placement: e.target.value }))} style={inputStyle}>
                      {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: C.inkMuted,
                    display: "block", marginBottom: 8 }}>Rôles ciblés</label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {TARGET_ROLES.map(r => (
                      <label key={r} style={{ display: "flex", alignItems: "center", gap: 5,
                        fontSize: "0.79rem", cursor: "pointer", fontWeight: 500 }}>
                        <input type="checkbox" checked={form.targetRoles.includes(r)}
                          onChange={() => toggleRole(r)} />
                        {ROLE_LABELS[r] || r}
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" style={btnPrimary} disabled={saving}>
                  {saving ? "Création en cours..." : "Créer la publicité"}
                </button>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {ads.length === 0 ? (
        <Card><EmptyState icon="📢" text="Aucune publicité créée" /></Card>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {ads.map((ad, i) => (
            <motion.div key={ad._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`,
                padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
                opacity: ad.isActive ? 1 : 0.6, boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
              {ad.imageUrl ? (
                <img src={uploadService.resolveUrl(ad.imageUrl)} alt={ad.title}
                  style={{ height: 48, width: 88, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
              ) : (
                <div style={{ height: 48, width: 88, borderRadius: 8, background: C.mainBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.inkMuted, fontSize: "1.1rem", flexShrink: 0 }}>📢</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: C.ink }}>{ad.title}</div>
                <div style={{ fontSize: "0.72rem", color: C.inkMuted, marginTop: 3 }}>
                  <span style={{ background: C.mainBg, padding: "1px 7px", borderRadius: 5,
                    fontWeight: 600, marginRight: 6 }}>{ad.placement}</span>
                  {(ad.targetRoles || []).map(r => (
                    <Badge key={r} color={ROLE_COLORS[r] || C.inkMuted}>{ROLE_LABELS[r] || r}</Badge>
                  )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, " ", el], [])}
                </div>
                {ad.linkUrl && (
                  <div style={{ fontSize: "0.68rem", color: C.inkMuted, marginTop: 2,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ad.linkUrl}
                  </div>
                )}
              </div>
              <Badge color={ad.isActive ? C.green : C.inkMuted}
                bg={ad.isActive ? "#d1fae5" : "#f3f4f6"}>
                {ad.isActive ? "Actif" : "Inactif"}
              </Badge>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={async () => { await adService.toggleAd(ad._id); load(); }}
                  style={{ ...btnGhost, fontSize: "0.73rem" }}>
                  {ad.isActive ? "Désactiver" : "Activer"}
                </button>
                <button onClick={async () => { if (window.confirm("Supprimer cette publicité ?")) { await adService.deleteAd(ad._id); load(); } }}
                  style={{ ...btnGhost, fontSize: "0.73rem", color: C.red, borderColor: "#fca5a5" }}>
                  Supprimer
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── ACTIVITY LOG PANEL ────────────────────────────────────────────────────────
const ADMIN_LOG_TYPES = ["post_removed", "post_reactivated"];

const ActivityLogPanel = () => {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [filter,  setFilter]  = useState("");
  const LIMIT = 25;

  const load = useCallback((p = 1, f = filter) => {
    setLoading(true);
    const params = { page: p, limit: LIMIT, adminOnly: "true" };
    if (f) params.actionType = f;
    adService.getActivityLog(params)
      .then(d => { setLogs(d.logs || []); setTotal(d.total || 0); setPage(p); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [filter]); // eslint-disable-line

  useEffect(() => { load(1, filter); }, [filter]); // eslint-disable-line

  return (
    <div>
      <SectionTitle title="Journal d'administration"
        sub={`${total} action${total !== 1 ? "s" : ""} admin enregistrée${total !== 1 ? "s" : ""}`}
        action={
          <select value={filter} onChange={e => setFilter(e.target.value)}
            style={{ ...inputStyle, width: "auto", fontSize: "0.8rem" }}>
            <option value="">Toutes les actions admin</option>
            {ADMIN_LOG_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        } />

      <Card pad="0">
        {loading ? <Spinner /> : logs.length === 0 ? (
          <EmptyState icon="📋" text="Aucune activité enregistrée" />
        ) : (
          <>
            {logs.map((log, i) => {
              const meta = ACTION_META[log.actionType] || { icon: "📌", color: C.inkMuted };
              return (
                <motion.div key={log._id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.015 }}
                  style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`,
                    display: "flex", alignItems: "flex-start", gap: 14 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#faf9fc"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: meta.color + "14", display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: "0.95rem" }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.84rem", fontWeight: 600, color: C.ink }}>
                      {log.description}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: C.inkMuted, marginTop: 3,
                      display: "flex", alignItems: "center", gap: 8 }}>
                      {log.actorName && <span style={{ fontWeight: 600 }}>{log.actorName}</span>}
                      <Badge color={meta.color}>{log.actionType}</Badge>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.69rem", color: C.inkMuted, whiteSpace: "nowrap",
                    flexShrink: 0, paddingTop: 2 }}>
                    {fmtFull(log.createdAt)}
                  </div>
                </motion.div>
              );
            })}
            <Paginator page={page} total={total} limit={LIMIT}
              onChange={p => load(p, filter)} />
          </>
        )}
      </Card>
    </div>
  );
};

// ── OPTIONS PANEL ─────────────────────────────────────────────────────────────
const OPTIONS_KEYS = [
  { key: "specialties", label: "Spécialités" },
  { key: "regions",     label: "Régions" },
  { key: "categories",  label: "Catégories" },
];

const OptionGroup = ({ keyName, label }) => {
  const [values,   setValues]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [input,    setInput]    = useState("");
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    adminService.getOptions(keyName)
      .then(d => setValues(d.values || [])).catch(() => {}).finally(() => setLoading(false));
  }, [keyName]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSaving(true);
    try {
      const d = await adminService.addOptionValue(keyName, input.trim());
      setValues(d.values || []); setInput("");
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (val) => {
    setDeleting(val);
    try {
      const d = await adminService.deleteOptionValue(keyName, val);
      setValues(d.values || []);
    } catch {}
    setDeleting(null);
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: "0.95rem", color: C.ink, marginBottom: 16 }}>{label}</div>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          placeholder={`Ajouter...`} style={{ ...inputStyle, flex: 1 }} />
        <button type="submit" style={btnPrimary} disabled={saving || !input.trim()}>
          {saving ? "..." : "Ajouter"}
        </button>
      </form>
      {loading ? (
        <div style={{ fontSize: "0.82rem", color: C.inkMuted }}>Chargement...</div>
      ) : values.length === 0 ? (
        <div style={{ fontSize: "0.82rem", color: C.inkMuted }}>Aucune valeur</div>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {values.map(v => (
            <motion.div key={v} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px 5px 12px",
                borderRadius: 20, background: "#f5f3f8", border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 500, color: C.ink }}>{v}</span>
              <button onClick={() => handleDelete(v)} disabled={deleting === v}
                style={{ width: 16, height: 16, borderRadius: "50%", border: "none",
                  background: "none", cursor: "pointer", color: C.red, fontSize: "1rem",
                  lineHeight: 1, padding: 0, display: "flex", alignItems: "center",
                  justifyContent: "center", opacity: deleting === v ? 0.4 : 0.7 }}>
                ×
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

const OptionsPanel = () => (
  <div>
    <SectionTitle title="Options dynamiques" sub="Gérez les listes déroulantes utilisées dans les formulaires" />
    {OPTIONS_KEYS.map(o => <OptionGroup key={o.key} keyName={o.key} label={o.label} />)}
  </div>
);

// ── SUBSCRIPTIONS PANEL ───────────────────────────────────────────────────────
const fmtDZD = (n) => `${Number(n || 0).toLocaleString("fr-DZ")} DZD`;

const SUB_STATUS = {
  active:   { label: "Payé · Actif", color: C.green,    bg: "#d1fae5" },
  trialing: { label: "Essai",        color: C.blue,     bg: "#e0f2fe" },
  expired:  { label: "Expiré",       color: C.red,      bg: "#fee2e2" },
  past_due: { label: "Impayé",       color: C.red,      bg: "#fee2e2" },
  canceled: { label: "Annulé",       color: C.orange,   bg: "#ffedd5" },
  none:     { label: "Aucun",        color: C.inkMuted, bg: "#f3f4f6" },
};

const INTERVAL_LABEL = { month: "Mensuel", year: "Annuel" };

const SubscriptionsPanel = () => {
  const [data,    setData]    = useState(null);
  const [conn,    setConn]    = useState(null);
  const [role,    setRole]    = useState("");
  const [status,  setStatus]  = useState("");
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);
  const [backfilling, setBackfilling] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    subscriptionService.adminOverview({
      role:   role   || undefined,
      status: status || undefined,
      search: search || undefined,
    })
      .then(setData)
      .catch(() => setData({ users: [], summary: {} }))
      .finally(() => setLoading(false));
  }, [role, status, search]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [role, status]);

  useEffect(() => {
    subscriptionService.connection().then(setConn).catch(() => setConn(null));
  }, []);

  const handleBackfill = () => {
    setBackfilling(true);
    subscriptionService.backfill()
      .then(() => load())
      .catch(() => {})
      .finally(() => setBackfilling(false));
  };

  const summary = data?.summary || {};
  const users   = data?.users || [];

  const ConnBadge = () => {
    if (!conn) return null;
    const ok = conn.configured && conn.success !== false;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
        background: ok ? "#d1fae5" : "#fef3c7", color: ok ? "#065f46" : "#92400e" }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%",
          background: ok ? C.green : C.yellow }} />
        Chargily · {conn.mode || "test"} · {conn.configured ? (ok ? "connecté" : "clé invalide") : "non configuré"}
      </span>
    );
  };

  return (
    <div>
      <SectionTitle title="Abonnements"
        sub="Suivi des paiements et de l'état d'abonnement de chaque utilisateur"
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <ConnBadge />
            <button onClick={handleBackfill} disabled={backfilling}
              style={{ ...btnGhost, fontSize: "0.75rem", opacity: backfilling ? 0.6 : 1 }}
              title="Crée un enregistrement d'abonnement pour les comptes facturables qui n'en ont pas encore">
              {backfilling ? "Initialisation..." : "Initialiser les abonnements"}
            </button>
          </div>
        } />

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
        <StatCard icon={<IconUsers size={15} />}      label="Comptes facturables" value={summary.total}    color={C.purple} />
        <StatCard icon={<IconAward size={15} />}      label="Abonnés payants"     value={summary.active}   color={C.green} />
        <StatCard icon={<IconClipboard size={15} />}  label="Sans abonnement"     value={summary.none}     color={C.blue} />
        <StatCard icon={<IconFlag size={15} />}       label="Expirés"             value={summary.expired}  color={C.red} />
        <StatCard icon={<IconTrendingUp size={15} />} label="Total encaissé"      value={fmtDZD(summary.collected)} color={C.accent} />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={role} onChange={e => setRole(e.target.value)}
          style={{ ...inputStyle, flex: "0 0 160px" }}>
          <option value="">Tous les rôles</option>
          <option value="client">Client</option>
          <option value="agency">Agence</option>
          <option value="team">Équipe</option>
          <option value="freelancer">Freelancer</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ ...inputStyle, flex: "0 0 170px" }}>
          <option value="">Tous les statuts</option>
          <option value="active">Payé · Actif</option>
          <option value="expired">Expiré / Annulé</option>
          <option value="none">Aucun abonnement</option>
        </select>
        <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 240 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <IconSearch size={14} style={{ position: "absolute", left: 11, top: "50%",
              transform: "translateY(-50%)", color: C.inkMuted, pointerEvents: "none" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && load()}
              placeholder="Rechercher par nom ou email..."
              style={{ ...inputStyle, paddingLeft: 34 }} />
          </div>
          <button onClick={load} style={btnPrimary}>Rechercher</button>
        </div>
      </div>

      <Card pad="0">
        {loading ? <Spinner /> : users.length === 0 ? (
          <EmptyState icon="💳" text="Aucun utilisateur trouvé" />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {["Compte","Rôle","Statut","Formule","Échéance","Dernier paiement"].map(h => (
                    <th key={h} style={{ padding: "11px 18px", textAlign: "left", fontSize: "0.72rem",
                      fontWeight: 700, color: C.inkMuted, textTransform: "uppercase",
                      letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const st = SUB_STATUS[u.status] || SUB_STATUS.none;
                  const roleColor = ROLE_COLORS[u.role] || "#888";
                  const echeance = u.status === "active" ? u.currentPeriodEnd
                    : u.status === "trialing" ? u.trialEndsAt : null;
                  return (
                    <motion.tr key={u.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = "#faf9fc"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {/* Account */}
                      <td style={{ padding: "12px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                            background: roleColor + "18", display: "flex", alignItems: "center",
                            justifyContent: "center", color: roleColor, fontWeight: 800, fontSize: "0.72rem" }}>
                            {u.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem", color: C.ink,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {u.name}{!u.accountActive && (
                                <span style={{ marginLeft: 6, fontSize: "0.66rem", color: C.red,
                                  fontWeight: 700 }}>(désactivé)</span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: C.inkMuted,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td style={{ padding: "12px 18px" }}>
                        <Badge color={roleColor}>{ROLE_LABELS[u.role] || u.role}</Badge>
                      </td>
                      {/* Status */}
                      <td style={{ padding: "12px 18px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "3px 11px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
                          background: st.bg, color: st.color, whiteSpace: "nowrap" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.color }} />
                          {st.label}
                          {u.status === "trialing" && u.daysLeft > 0 && (
                            <span style={{ fontWeight: 600, opacity: 0.85 }}>· {u.daysLeft}j</span>
                          )}
                          {u.status === "active" && u.cancelAtPeriodEnd && (
                            <span style={{ fontWeight: 600, opacity: 0.85 }}>· annulé</span>
                          )}
                        </span>
                      </td>
                      {/* Plan / formule */}
                      <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: C.ink, whiteSpace: "nowrap" }}>
                        {u.status === "active"
                          ? `${INTERVAL_LABEL[u.interval] || "—"} · ${fmtDZD(u.amount)}`
                          : <span style={{ color: C.inkMuted }}>—</span>}
                      </td>
                      {/* Échéance */}
                      <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: C.inkMuted, whiteSpace: "nowrap" }}>
                        {echeance ? fmt(echeance) : "—"}
                      </td>
                      {/* Last payment */}
                      <td style={{ padding: "12px 18px", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {u.lastPaidAt ? (
                          <span style={{ color: C.ink }}>
                            {fmt(u.lastPaidAt)}
                            <span style={{ color: C.inkMuted }}> · {fmtDZD(u.lastPaidAmount)}</span>
                          </span>
                        ) : <span style={{ color: C.inkMuted }}>Jamais</span>}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "overview",  label: "Tableau de bord", icon: <IconGrid size={16} />,       group: "general" },
  { id: "users",     label: "Utilisateurs",    icon: <IconUsers size={16} />,       group: "gestion" },
  { id: "posts",     label: "Posts",           icon: <IconFlag size={16} />,        group: "gestion" },
  { id: "activity",  label: "Activité",        icon: <IconBriefcase size={16} />,   group: "gestion" },
  { id: "subscriptions", label: "Abonnements",  icon: <IconAward size={16} />,       group: "monetisation" },
  { id: "ads",       label: "Publicités",      icon: <IconSend size={16} />,        group: "monetisation" },
  { id: "stats",     label: "Statistiques",    icon: <IconTrendingUp size={16} />,  group: "systeme" },
  { id: "log",       label: "Journal",         icon: <IconClipboard size={16} />,   group: "systeme" },
  { id: "options",   label: "Options",         icon: <IconSettings size={16} />,    group: "systeme" },
];

const GROUPS = [
  { id: "general",      label: "Général" },
  { id: "gestion",      label: "Gestion" },
  { id: "monetisation", label: "Monétisation" },
  { id: "systeme",      label: "Système" },
];

const AdminSidebar = ({ active, onNav, collapsed, onToggle, user }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.email || "Admin";
  const initials = displayName.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <aside style={{
      width: collapsed ? 64 : 248, minWidth: collapsed ? 64 : 248,
      background: C.sidebar, display: "flex", flexDirection: "column",
      height: "100vh", position: "sticky", top: 0,
      borderRight: `1px solid ${C.sidebarBdr}`,
      transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
      overflowX: "hidden", flexShrink: 0,
    }}>
      {/* Logo + toggle */}
      <div style={{ padding: collapsed ? "18px 0" : "18px 20px",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: `1px solid ${C.sidebarBdr}`, minHeight: 62 }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/marketili_logo.svg" alt="Marketili"
              style={{ height: 28, width: 28, objectFit: "contain", flexShrink: 0 }} />
            <span style={{ fontWeight: 900, fontSize: "1.08rem", color: "#fff", letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>
              Market<span style={{ color: C.accent }}>ili</span>
            </span>
          </div>
        )}
        <button onClick={onToggle} style={{ width: 28, height: 28, borderRadius: 7, border: "none",
          background: "rgba(255,255,255,0.07)", cursor: "pointer", color: "#9e9ab8",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}>
          {collapsed ? <IconChevronRight size={13} /> : <IconChevronLeft size={13} />}
        </button>
      </div>

      {/* Admin badge */}
      <div style={{ padding: collapsed ? "12px 0" : "12px 16px",
        borderBottom: `1px solid ${C.sidebarBdr}`,
        display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
        gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: C.accent + "22",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: C.accent, flexShrink: 0 }}>
          <IconShield size={13} />
        </div>
        {!collapsed && (
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: C.accent,
            textTransform: "uppercase", letterSpacing: "0.06em" }}>Administrateur</span>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden",
        padding: collapsed ? "10px 0" : "10px 0", scrollbarWidth: "none" }}>
        {GROUPS.map(group => {
          const items = NAV_ITEMS.filter(i => i.group === group.id);
          return (
            <div key={group.id}>
              {!collapsed && (
                <div style={{ padding: "10px 18px 4px", fontSize: "0.63rem", fontWeight: 800,
                  color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {group.label}
                </div>
              )}
              {items.map(item => {
                const isActive = active === item.id;
                return (
                  <button key={item.id} onClick={() => onNav(item.id)}
                    title={collapsed ? item.label : ""}
                    style={{
                      width: "100%", display: "flex", alignItems: "center",
                      gap: collapsed ? 0 : 10,
                      padding: collapsed ? "10px 0" : "9px 16px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      border: "none", cursor: "pointer", fontFamily: "inherit",
                      background: isActive ? C.accentBg : "transparent",
                      color: isActive ? C.accent : "rgba(255,255,255,0.6)",
                      borderLeft: isActive ? `3px solid ${C.accent}` : "3px solid transparent",
                      fontSize: "0.84rem", fontWeight: isActive ? 700 : 500,
                      transition: "background 0.12s, color 0.12s",
                      borderRadius: "0 8px 8px 0",
                      marginBottom: 1,
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = C.accentHover; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; } }}>
                    <span style={{ flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer: user + logout */}
      <div style={{ borderTop: `1px solid ${C.sidebarBdr}`, padding: collapsed ? "14px 0" : "14px 16px" }}>
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: "0.75rem", flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "0.83rem", color: "#fff",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </div>
              <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)" }}>Admin</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          style={{ width: "100%", display: "flex", alignItems: "center",
            gap: collapsed ? 0 : 8, justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "8px 0" : "8px 10px",
            borderRadius: 8, border: "none", cursor: "pointer",
            background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)",
            fontFamily: "inherit", fontSize: "0.8rem", fontWeight: 600,
            transition: "background 0.12s, color 0.12s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}>
          <IconLogOut size={14} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

// ── TOPBAR ────────────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  overview: "Tableau de bord",
  users:    "Utilisateurs",
  stats:    "Statistiques",
  posts:    "Posts",
  activity: "Activité",
  subscriptions: "Abonnements",
  ads:      "Publicités",
  log:      "Journal",
  options:  "Options",
};

const AdminTopbar = ({ active }) => {
  const [notifs,      setNotifs]      = useState([]);
  const [unread,      setUnread]      = useState(0);
  const [showNotifs,  setShowNotifs]  = useState(false);
  const notifRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const d = await notificationService.getAll({ limit: 8 });
        setNotifs(d.notifications || []); setUnread(d.unreadCount || 0);
      } catch {}
    };
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setUnread(0); setNotifs(p => p.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  return (
    <header style={{ height: 58, background: "#ffffff", borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", padding: "0 24px",
      justifyContent: "space-between", flexShrink: 0,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 4, height: 20, borderRadius: 2, background: C.accent }} />
        <h1 style={{ fontSize: "1.05rem", fontWeight: 800, color: C.ink, margin: 0 }}>
          {PAGE_TITLES[active] || "Administration"}
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ position: "relative" }} ref={notifRef}>
          <button onClick={() => setShowNotifs(o => !o)}
            style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${C.border}`,
              background: showNotifs ? "#faf9fc" : "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.inkMuted, position: "relative" }}>
            <IconBell size={15} />
            {unread > 0 && (
              <span style={{ position: "absolute", top: 5, right: 5, width: 7, height: 7,
                borderRadius: "50%", background: C.accent,
                border: `1.5px solid #fff` }} />
            )}
          </button>
          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.14 }}
                style={{ position: "absolute", right: 0, top: 44, width: 320, zIndex: 100,
                  background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
                  boxShadow: "0 12px 40px rgba(0,0,0,0.12)", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.88rem", color: C.ink }}>
                    Notifications {unread > 0 && (
                      <span style={{ marginLeft: 6, fontSize: "0.68rem", fontWeight: 700,
                        background: C.accent, color: "#fff", borderRadius: 10, padding: "1px 6px" }}>
                        {unread}
                      </span>
                    )}
                  </span>
                  {unread > 0 && (
                    <button onClick={markAllRead}
                      style={{ background: "none", border: "none", cursor: "pointer",
                        fontSize: "0.7rem", color: C.inkMuted, fontFamily: "inherit", fontWeight: 600 }}>
                      Tout marquer lu
                    </button>
                  )}
                </div>
                {notifs.length === 0 ? (
                  <div style={{ padding: "28px 16px", textAlign: "center",
                    color: C.inkMuted, fontSize: "0.82rem" }}>Aucune notification</div>
                ) : notifs.map(n => (
                  <div key={n._id}
                    style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
                      background: n.isRead ? "transparent" : C.mainBg, cursor: "pointer" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: C.ink }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: "0.72rem", color: C.inkMuted, marginTop: 2 }}>{n.body}</div>}
                    <div style={{ fontSize: "0.68rem", color: C.inkMuted, marginTop: 4 }}>{relTime(n.createdAt)}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
const PANEL_MAP = {
  overview: (props) => <OverviewPanel {...props} />,
  users:    () => <UsersPanel />,
  stats:    () => <StatsPanel />,
  posts:    () => <PostsPanel />,
  activity: () => <ActivityPanel />,
  subscriptions: () => <SubscriptionsPanel />,
  ads:      () => <AdsPanel />,
  log:      () => <ActivityLogPanel />,
  options:  () => <OptionsPanel />,
};

const AdminDashboard = () => {
  const { user, role, loading, isAuthenticated } = useAuth();
  const [active,    setActive]    = useState("overview");
  const [collapsed, setCollapsed] = useState(false);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: C.sidebar, flexDirection: "column", gap: 14 }}>
        <div style={{ width: 38, height: 38, border: `3px solid rgba(192,21,42,0.2)`,
          borderTopColor: C.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.84rem" }}>Chargement...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated || role !== "admin") {
    window.location.href = "/login";
    return null;
  }

  const Panel = PANEL_MAP[active];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.mainBg, fontFamily: "inherit" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}</style>

      <AdminSidebar
        active={active}
        onNav={setActive}
        collapsed={collapsed}
        onToggle={() => setCollapsed(o => !o)}
        user={user}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <AdminTopbar active={active} />

        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          <AnimatePresence mode="wait">
            <motion.div key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}>
              <Panel onNav={setActive} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
