import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import pitchService from "../../../services/pitchService";
import projectService from "../../../services/projectService";
import teamMemberService from "../../../services/teamMemberService";
import { getDeadlineColor, getDeadlineLabel } from "../../../utils/deadlineColor";
import { IconBriefcase, IconSend, IconUsers } from "../../../components/ui/Icons";

const STATUS_META = {
  pending:    { label: "En attente",  color: "#f59e0b", bg: "#fffbeb" },
  active:     { label: "Actif",       color: "#7c3aed", bg: "#f3f0ff" },
  in_review:  { label: "En révision", color: "#0891b2", bg: "#e0f2fe" },
  completed:  { label: "Terminé",     color: "#10b981", bg: "#f0fdf4" },
  cancelled:  { label: "Annulé",      color: "#6b7280", bg: "#f9fafb" },
};

const PITCH_META = {
  pending:   { label: "En attente", color: "#f59e0b" },
  accepted:  { label: "Acceptée",   color: "#10b981" },
  rejected:  { label: "Rejetée",    color: "#ef4444" },
  withdrawn: { label: "Retirée",    color: "#6b7280" },
};

const fmt = (d) => d
  ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const StatCard = ({ icon, label, value, color, onClick }) => (
  <motion.div
    whileHover={onClick ? { y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" } : {}}
    onClick={onClick}
    style={{ padding: "18px 20px", borderRadius: 14, background: "#fff",
      border: "1px solid #eee", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      flex: 1, minWidth: 120, cursor: onClick ? "pointer" : "default" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "15",
        color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
    </div>
    <div style={{ fontWeight: 800, fontSize: "1.75rem", color, lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 4 }}>{label}</div>
  </motion.div>
);

const TeamLeadOverview = ({ user }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [pitches,  setPitches]  = useState([]);
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    Promise.all([
      projectService.getTeamProjects(user._id),
      pitchService.getMy(user._id, "Team", { limit: 5 }),
      teamMemberService.getMembers(),
    ])
      .then(([pd, pch, md]) => {
        setProjects((pd.projects || []).slice(0, 4));
        setPitches(pch.pitches || []);
        setMembers(md.members || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?._id]);

  const activeProjects  = projects.filter(p => p.projectStatus === "active").length;
  const pendingPitches  = pitches.filter(p => p.status === "pending").length;

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Vue d'ensemble</h2>
          <p style={{ color: "var(--d-muted)" }}>Activité de votre équipe</p>
        </div>
        <button className="section-cta-btn" onClick={() => navigate("/dashboard/team/browse")}>
          Explorer les posts
        </button>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard icon={<IconBriefcase size={16} />} label="Projets actifs"
          value={activeProjects} color="#0891b2"
          onClick={() => navigate("/dashboard/team/projects")} />
        <StatCard icon={<IconSend size={16} />} label="Offres en attente"
          value={pendingPitches} color="#7c3aed"
          onClick={() => navigate("/dashboard/team/pitches")} />
        <StatCard icon={<IconUsers size={16} />} label="Membres"
          value={members.length} color="#c0152a"
          onClick={() => navigate("/dashboard/team/members")} />
        <StatCard icon={<IconBriefcase size={16} />} label="Total projets"
          value={projects.length} color="#059669" />
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--d-border-soft)",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Projets récents</span>
              <button onClick={() => navigate("/dashboard/team/projects")}
                style={{ background: "none", border: "none", cursor: "pointer",
                  fontSize: "0.75rem", color: "var(--d-muted)", fontFamily: "inherit" }}>
                Voir tout
              </button>
            </div>
            {projects.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center",
                color: "var(--d-muted)", fontSize: "0.82rem" }}>
                Aucun projet
              </div>
            ) : projects.map((p, i) => {
              const dl = getDeadlineColor(p.deadline);
              const st = STATUS_META[p.projectStatus] || STATUS_META.active;
              return (
                <motion.div key={p._id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ padding: "12px 20px", borderBottom: "1px solid var(--d-border-soft)",
                    borderLeft: `3px solid ${dl}`, display: "flex",
                    justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  onClick={() => navigate("/dashboard/team/projects")}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{p.title}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 2 }}>
                      {getDeadlineLabel(p.deadline)}
                    </div>
                  </div>
                  <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.68rem",
                    fontWeight: 700, background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--d-border-soft)",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Offres récentes</span>
              <button onClick={() => navigate("/dashboard/team/pitches")}
                style={{ background: "none", border: "none", cursor: "pointer",
                  fontSize: "0.75rem", color: "var(--d-muted)", fontFamily: "inherit" }}>
                Voir tout
              </button>
            </div>
            {pitches.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center",
                color: "var(--d-muted)", fontSize: "0.82rem" }}>
                Aucune offre envoyée
              </div>
            ) : pitches.map((p, i) => {
              const meta = PITCH_META[p.status] || PITCH_META.pending;
              return (
                <motion.div key={p._id}
                  initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{ padding: "12px 20px", borderBottom: "1px solid var(--d-border-soft)",
                    borderLeft: `3px solid ${meta.color}` }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
                    {p.post?.title || "Post supprimé"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginTop: 4 }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--d-muted)" }}>
                      {fmt(p.createdAt)}
                    </span>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: meta.color }}>
                      {meta.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamLeadOverview;
