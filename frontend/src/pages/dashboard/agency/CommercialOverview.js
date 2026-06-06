
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "./shared";
import projectService from "../../../services/projectService";
import { IconFlag, IconBriefcase, IconSearch } from "../../../components/ui/Icons";

const CommercialOverview = ({ user }) => {
  const navigate = useNavigate();
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [projects,     setProjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    if (!user?.agency && !user?._id) { setLoading(false); return; }
    const agencyId = user.agency;

    const promises = [
      projectService.getMemberProjects(user._id)
        .then(d => setProjects(d.projects || []))
        .catch(() => {}),
    ];

    if (agencyId) {
      promises.push(
        projectService.getFlaggedPosts(agencyId)
          .then(d => {
            const mine = (d.flaggedPosts || []).filter(
              f => f.flaggedBy?._id === user._id || f.flaggedBy === user._id
                || String(f.flaggedBy?._id) === String(user._id)
                || String(f.flaggedBy) === String(user._id)
            );
            setFlaggedPosts(mine);
          })
          .catch(() => {})
      );
    }

    Promise.all(promises).finally(() => setLoading(false));
  }, [user?._id, user?.agency]);

  const thisWeek = flaggedPosts.filter(f => {
    const diff = (new Date() - new Date(f.flaggedAt)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const activeProjects = projects.filter(p =>
    ["active", "in_review"].includes(p.projectStatus)
  ).length;

  return (
    <div>
      <div className="stats-row" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <StatCard
          icon={<IconBriefcase size={16} />}
          label="Projets actifs"
          value={activeProjects}
          sub={`sur ${projects.length} total`}
          color="#7c3aed"
          onClick={() => navigate("/dashboard/agency/projects")}
        />
        <StatCard
          icon={<IconFlag size={16} />}
          label="Signalés cette semaine"
          value={thisWeek}
          sub="7 derniers jours"
          color="#f59e0b"
          onClick={() => navigate("/dashboard/agency/browse")}
        />
        <StatCard
          icon={<IconFlag size={16} />}
          label="Total signalés"
          value={flaggedPosts.length}
          sub="au total"
          color="#c0152a"
          onClick={() => navigate("/dashboard/agency/browse")}
        />
      </div>

      {}
      <div className="card" style={{ marginTop: 8 }}>
        <div className="card-header">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <div>
              <div className="section-head-title">Posts que j'ai signalés</div>
              <div className="section-head-sub">Statut de traitement par le directeur</div>
            </div>
            <button
              onClick={() => navigate("/dashboard/agency/browse")}
              style={{ background: "none", border: "none", cursor: "pointer",
                fontSize: "0.75rem", color: "var(--d-muted)", fontFamily: "inherit",
                fontWeight: 600 }}>
              Parcourir
            </button>
          </div>
        </div>
        <div className="card-body" style={{ padding: "12px 0 0" }}>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : flaggedPosts.length === 0 ? (
            <div className="empty-state" style={{ padding: "32px 24px" }}>
              <div className="empty-state-icon"><IconSearch size={20} /></div>
              <div className="empty-state-title">Aucun post signalé</div>
              <div className="empty-state-desc">
                Parcourez les posts et signalez les opportunités au directeur.
              </div>
            </div>
          ) : (
            flaggedPosts.slice(0, 6).map((f, i) => (
              <div key={f._id || i}
                style={{ display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 22px", borderBottom: "1px solid #faeaea" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.87rem", color: "#1a0a0a",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.post?.title || "Post supprimé"}
                  </div>
                  <div style={{ fontSize: "0.73rem", color: "#9a6060", marginTop: 2 }}>
                    {f.flaggedAt ? new Date(f.flaggedAt).toLocaleDateString("fr-DZ") : ""}
                    {f.assignedStrategistName && (
                      <span style={{ marginLeft: 8, color: "#7c3aed" }}>
                        → {f.assignedStrategistName}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
                  fontWeight: 700, whiteSpace: "nowrap",
                  background: f.pitched ? "#d1fae5" : "#fef3c7",
                  color: f.pitched ? "#065f46" : "#92400e" }}>
                  {f.pitched ? "✓ Pitché" : "En attente"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommercialOverview;
