// src/pages/dashboard/agency/DirectorClients.jsx
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ProgressBar } from "./shared";
import projectService from "../../../services/projectService";

const clientName = (c) =>
  c.accountType === "company" ? c.companyName : `${c.firstName} ${c.lastName}`;

const ClientProjects = ({ client }) => {
  const STATUS_LABEL = {
    pending: "En attente", active: "Actif",
    in_review: "En révision", completed: "Terminé", cancelled: "Annulé",
  };
  const STATUS_COLOR = {
    pending: "#f59e0b", active: "#7c3aed",
    in_review: "#0891b2", completed: "#10b981", cancelled: "#6b7280",
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
      {client.projects.map((p, i) => (
        <motion.div key={p._id} className="card"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}>
          <div style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a", flex: 1 }}>
                {p.title}
              </div>
              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
                fontWeight: 700, background: STATUS_COLOR[p.projectStatus] + "22",
                color: STATUS_COLOR[p.projectStatus], whiteSpace: "nowrap", marginLeft: 8 }}>
                {STATUS_LABEL[p.projectStatus] || p.projectStatus}
              </span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <ProgressBar value={p.progress || 0} />
              <div style={{ fontSize: "0.72rem", color: "#9a6060", marginTop: 4 }}>
                {p.progress || 0}% · {p.tasks?.length || 0} tâche{p.tasks?.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9a6060",
              display: "flex", justifyContent: "space-between" }}>
              <span>Échéance : {p.deadline ? new Date(p.deadline).toLocaleDateString("fr-DZ") : "—"}</span>
              <span>{p.assignedMembers?.length || 0} membre{p.assignedMembers?.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const DirectorClients = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    projectService.getAgencyProjects(user._id)
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  const clients = useMemo(() => {
    const map = {};
    projects.forEach(p => {
      if (!p.client) return;
      const id = p.client._id;
      if (!map[id]) map[id] = { ...p.client, projects: [] };
      map[id].projects.push(p);
    });
    return Object.values(map);
  }, [projects]);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Clients</h2>
          <p>{selected ? "Projets avec ce client" : `${clients.length} client${clients.length !== 1 ? "s" : ""}`}</p>
        </div>
        {selected && (
          <button className="section-cta-btn"
            style={{ background: "transparent", color: "#9a6060",
              border: "1.5px solid #f0dede", boxShadow: "none" }}
            onClick={() => setSelected(null)}>
            ← Retour aux clients
          </button>
        )}
      </div>

      {!selected ? (
        clients.length === 0 ? (
          <div className="card">
            <div className="empty-state" style={{ padding: "64px 24px" }}>
              <div className="empty-state-icon">🎯</div>
              <div className="empty-state-title">Aucun client pour l'instant</div>
              <div className="empty-state-desc">Les clients apparaissent ici lorsqu'un projet démarre.</div>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
            {clients.map((c, i) => (
              <motion.div key={c._id} className="card"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ cursor: "pointer" }}
                onClick={() => setSelected(c)}>
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%",
                      background: "linear-gradient(135deg,#c0152a,#9b1c2e)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", color: "#fff", fontWeight: 700, flexShrink: 0 }}>
                      {clientName(c)[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1a0a0a" }}>
                        {clientName(c)}
                      </div>
                      <div style={{ fontSize: "0.73rem", color: "#9a6060" }}>
                        {c.accountType === "company" ? "Entreprise" : "Particulier"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    padding: "10px 0 0", borderTop: "1px solid #faeaea" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "#1a0a0a" }}>{c.projects.length}</div>
                      <div style={{ fontSize: "0.7rem", color: "#9a6060" }}>projets</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "#10b981" }}>
                        {c.projects.filter(p => p.projectStatus === "active").length}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#9a6060" }}>actifs</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "#7c3aed" }}>
                        {c.projects.filter(p => p.projectStatus === "completed").length}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#9a6060" }}>terminés</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <ClientProjects client={selected} />
      )}
    </div>
  );
};

export default DirectorClients;