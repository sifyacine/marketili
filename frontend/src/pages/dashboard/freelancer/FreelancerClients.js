import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import freelancerService from "../../../services/freelancerService";
import chatService       from "../../../services/chatService";
import api               from "../../../services/api";
import { ProgressBar }   from "../agency/shared";
import { IconTarget, IconSearch } from "../../../components/ui/Icons";

const clientName = (c) =>
  c.accountType === "company" ? c.companyName : `${c.firstName} ${c.lastName}`;

const ClientProfileModal = ({ clientId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/profile/client/${clientId}`)
      .then(r => setProfile(r.data.profile || r.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [clientId]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        style={{
          background: "#fff", borderRadius: 16, padding: "28px 32px",
          width: "100%", maxWidth: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: "1rem", color: "#1a0a0a" }}>Profil client</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
            fontSize: "1.1rem", color: "#9a6060", lineHeight: 1 }}>✕</button>
        </div>

        {loading ? (
          <div className="spinner-wrap" style={{ padding: 40 }}><div className="spinner" /></div>
        ) : !profile ? (
          <div style={{ textAlign: "center", color: "#9a6060", padding: "24px 0" }}>
            Profil introuvable
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "linear-gradient(135deg,#c0152a,#9b1c2e)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem", color: "#fff", fontWeight: 700, flexShrink: 0,
              }}>
                {clientName(profile)[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1a0a0a" }}>
                  {clientName(profile)}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#9a6060", marginTop: 2 }}>
                  {profile.accountType === "company" ? "Entreprise" : "Particulier"}
                </div>
              </div>
            </div>

            {[
              { label: "Email",     value: profile.email },
              { label: "Téléphone", value: profile.phone },
              { label: "Ville",     value: profile.city || profile.address?.city },
              { label: "Bio",       value: profile.bio },
            ].filter(f => f.value).map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: "0.72rem", color: "#9a6060", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                  {f.label}
                </div>
                <div style={{ fontSize: "0.87rem", color: "#1a0a0a" }}>{f.value}</div>
              </div>
            ))}

            <button onClick={onClose} style={{
              marginTop: 8, width: "100%", padding: "10px 0", borderRadius: 9,
              border: "1.5px solid #f0dede", background: "white", color: "#9a6060",
              fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            }}>
              Fermer
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

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
                fontWeight: 700, background: (STATUS_COLOR[p.projectStatus] || "#888") + "22",
                color: STATUS_COLOR[p.projectStatus] || "#888", whiteSpace: "nowrap", marginLeft: 8 }}>
                {STATUS_LABEL[p.projectStatus] || p.projectStatus}
              </span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <ProgressBar value={p.progress || 0} />
              <div style={{ fontSize: "0.72rem", color: "#9a6060", marginTop: 4 }}>
                {p.progress || 0}% · {p.tasks?.length || 0} tâche{p.tasks?.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9a6060" }}>
              Échéance : {p.deadline ? new Date(p.deadline).toLocaleDateString("fr-DZ") : "—"}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const FreelancerClients = ({ user }) => {
  const navigate = useNavigate();
  const [projects,     setProjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selected,     setSelected]     = useState(null);
  const [msgLoading,   setMsgLoading]   = useState(null);
  const [search,       setSearch]       = useState("");
  const [profileModal, setProfileModal] = useState(null);

  const handleMessage = async (e, clientId) => {
    e.stopPropagation();
    setMsgLoading(clientId);
    try {
      const data = await chatService.startDirectConversation(clientId, "client");
      navigate("/dashboard/freelancer/messages", { state: { openConvId: data.conversation._id } });
    } catch {}
    finally { setMsgLoading(null); }
  };

  useEffect(() => {
    if (!user?._id) return;
    freelancerService.getProjects(user._id)
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?._id]);

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

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(c =>
      clientName(c).toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  }, [clients, search]);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Clients</h2>
          <p>
            {selected
              ? `Projets avec ${clientName(selected)}`
              : `${filtered.length} client${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {selected && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setProfileModal(selected._id)}
              style={{
                padding: "7px 16px", borderRadius: 8, border: "1.5px solid #7c3aed",
                background: "transparent", color: "#7c3aed",
                fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
              }}>
              Voir profil
            </button>
            <button
              disabled={msgLoading === selected._id}
              onClick={(e) => handleMessage(e, selected._id)}
              style={{
                padding: "7px 16px", borderRadius: 8, border: "1.5px solid #c0152a",
                background: "transparent", color: "#c0152a",
                fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 700,
                cursor: msgLoading === selected._id ? "not-allowed" : "pointer",
              }}>
              {msgLoading === selected._id ? "…" : "✉ Message"}
            </button>
            <button className="section-cta-btn"
              style={{ background: "transparent", color: "#9a6060",
                border: "1.5px solid #f0dede", boxShadow: "none" }}
              onClick={() => setSelected(null)}>
              ← Retour
            </button>
          </div>
        )}
      </div>

      {!selected ? (
        clients.length === 0 ? (
          <div className="card">
            <div className="empty-state" style={{ padding: "64px 24px" }}>
              <div className="empty-state-icon"><IconTarget size={20} /></div>
              <div className="empty-state-title">Aucun client pour l'instant</div>
              <div className="empty-state-desc">Les clients apparaissent ici lorsqu'un projet démarre.</div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ position: "relative", marginBottom: 16, maxWidth: 380 }}>
              <IconSearch size={14} style={{ position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)", color: "#9a6060" }} />
              <input
                className="dash-form-input"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36, margin: 0 }}
              />
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 160px 180px",
                padding: "10px 20px",
                borderBottom: "1px solid #faeaea",
                fontSize: "0.72rem", fontWeight: 700, color: "#9a6060",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                <span>Client</span>
                <span>Type</span>
                <span>Projets</span>
                <span>Actions</span>
              </div>

              {filtered.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px 24px" }}>
                  <div className="empty-state-icon"><IconSearch size={18} /></div>
                  <div className="empty-state-title">Aucun résultat</div>
                </div>
              ) : (
                filtered.map((c, i) => (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 120px 160px 180px",
                      padding: "14px 20px",
                      borderBottom: i < filtered.length - 1 ? "1px solid #faeaea" : "none",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "background 0.12s",
                    }}
                    onClick={() => setSelected(c)}
                    onMouseEnter={e => e.currentTarget.style.background = "#fff8f8"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "linear-gradient(135deg,#c0152a,#9b1c2e)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.85rem", color: "#fff", fontWeight: 700, flexShrink: 0,
                      }}>
                        {clientName(c)[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1a0a0a" }}>
                          {clientName(c)}
                        </div>
                        {c.email && (
                          <div style={{ fontSize: "0.72rem", color: "#9a6060" }}>{c.email}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <span style={{
                        padding: "2px 9px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700,
                        background: c.accountType === "company" ? "#ede9fe" : "#f0f9ff",
                        color: c.accountType === "company" ? "#5b21b6" : "#0891b2",
                      }}>
                        {c.accountType === "company" ? "Entreprise" : "Particulier"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.73rem", fontWeight: 700, color: "#1a0a0a" }}>
                        {c.projects.length} total
                      </span>
                      {c.projects.filter(p => p.projectStatus === "active").length > 0 && (
                        <span style={{ fontSize: "0.73rem", fontWeight: 700, color: "#10b981" }}>
                          · {c.projects.filter(p => p.projectStatus === "active").length} actif{c.projects.filter(p => p.projectStatus === "active").length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setProfileModal(c._id)}
                        style={{
                          padding: "5px 10px", borderRadius: 7,
                          border: "1.5px solid #7c3aed", background: "transparent",
                          color: "#7c3aed", fontFamily: "inherit", fontSize: "0.73rem",
                          fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                        }}>
                        Voir profil
                      </button>
                      <button
                        onClick={(e) => handleMessage(e, c._id)}
                        disabled={msgLoading === c._id}
                        style={{
                          padding: "5px 10px", borderRadius: 7,
                          border: "1.5px solid #c0152a", background: "transparent",
                          color: "#c0152a", fontFamily: "inherit", fontSize: "0.73rem",
                          fontWeight: 700, cursor: msgLoading === c._id ? "not-allowed" : "pointer",
                          opacity: msgLoading === c._id ? 0.6 : 1, whiteSpace: "nowrap",
                        }}>
                        {msgLoading === c._id ? "…" : "✉ Message"}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )
      ) : (
        <ClientProjects client={selected} />
      )}

      <AnimatePresence>
        {profileModal && (
          <ClientProfileModal
            clientId={profileModal}
            onClose={() => setProfileModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FreelancerClients;
