// src/pages/dashboard/agency/DirectorOverview.jsx
import React from "react";
import { StatCard, ProgressBar } from "./shared";
import { useMyPitches } from "../../../hooks/usePitches";

const DirectorOverview = ({ user, flaggedPosts = [], projects = [] }) => {
  const { pitches } = useMyPitches(user?._id, "Agency");
  const activeProjects  = projects.filter(p => p.projectStatus === "active").length;
  const pendingPitches  = pitches.filter(p => p.status === "pending").length;
  const acceptedPitches = pitches.filter(p => p.status === "accepted").length;

  return (
    <div>
      <div className="stats-row">
        <StatCard icon="🚀" label="Projets actifs"    value={activeProjects}      sub="en cours"             color="#7c3aed" />
        <StatCard icon="⏳" label="Offres en attente" value={pendingPitches}      sub="sans réponse"         color="#f59e0b" />
        <StatCard icon="✅" label="Offres acceptées"  value={acceptedPitches}     sub="succès"               color="#10b981" />
        <StatCard icon="🚩" label="Posts flaggés"     value={flaggedPosts.length} sub="par les commerciaux"  color="#ef4444" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        {/* Recent flagged posts */}
        <div className="card">
          <div className="card-header">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <div>
                <div className="section-head-title">Posts flaggés récents</div>
                <div className="section-head-sub">Signalés par votre équipe commerciale</div>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ padding: "12px 0 0" }}>
            {flaggedPosts.length === 0 ? (
              <div className="empty-state" style={{ padding: "32px 24px" }}>
                <div className="empty-state-icon">🚩</div>
                <div className="empty-state-title">Aucun post signalé</div>
              </div>
            ) : flaggedPosts.slice(0, 4).map((f, i) => (
              <div key={f._id || i} style={{ display: "flex", alignItems: "center",
                gap: 14, padding: "12px 22px", borderBottom: "1px solid #faeaea" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.87rem", color: "#1a0a0a",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.post?.title || "Post supprimé"}
                  </div>
                  <div style={{ fontSize: "0.73rem", color: "#9a6060", marginTop: 2 }}>
                    Signalé par {f.flaggedByName || "commercial"}
                  </div>
                </div>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
                  fontWeight: 700, background: f.pitched ? "#d1fae5" : "#fff0f0",
                  color: f.pitched ? "#065f46" : "#c0152a" }}>
                  {f.pitched ? "Pitché" : "En attente"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active projects */}
        <div className="card">
          <div className="card-header">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <div>
                <div className="section-head-title">Projets actifs</div>
                <div className="section-head-sub">Progression</div>
              </div>
            </div>
          </div>
          <div className="card-body" style={{ padding: "12px 0 0" }}>
            {projects.filter(p => p.projectStatus === "active").slice(0, 4).map((p) => (
              <div key={p._id} style={{ padding: "10px 22px", borderBottom: "1px solid #faeaea" }}>
                <div style={{ fontWeight: 600, fontSize: "0.84rem",
                  color: "#1a0a0a", marginBottom: 6 }}>{p.title}</div>
                <ProgressBar value={p.progress || 0} />
                <div style={{ fontSize: "0.72rem", color: "#9a6060", marginTop: 4 }}>
                  {p.progress || 0}% complété
                </div>
              </div>
            ))}
            {projects.filter(p => p.projectStatus === "active").length === 0 && (
              <div className="empty-state" style={{ padding: "32px 24px" }}>
                <div className="empty-state-icon">🚀</div>
                <div className="empty-state-title">Aucun projet actif</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorOverview;
