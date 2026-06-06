import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconUsers, IconBriefcase, IconCheckSquare, IconSend } from "../../../components/ui/Icons";
import collaborationRequestService from "../../../services/collaborationRequestService";
import uploadService from "../../../services/uploadService";

const ROLE_LABEL = {
  strategist:       "Stratège",
  designer:         "Designer",
  editor:           "Éditeur",
  smm:              "SMM",
  community_manager:"Community Manager",
  commercial:       "Commercial",
  chef_de_projet:   "Chef de projet",
  director:         "Directeur",
};

const IndependentCard = ({ active, onClick }) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
    onClick={onClick}
    style={{
      padding: "22px 24px",
      borderRadius: 16,
      background: active ? "#1a0a2e" : "#fff",
      border: `2px solid ${active ? "#7c3aed" : "#eee"}`,
      boxShadow: active ? "0 4px 20px rgba(124,58,237,0.18)" : "0 2px 8px rgba(0,0,0,0.04)",
      cursor: "pointer",
      minWidth: 220,
      flex: "0 0 auto",
      transition: "background 0.2s, border-color 0.2s",
    }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: active ? "rgba(255,255,255,0.12)" : "#f3f0ff",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: active ? "#fff" : "#7c3aed",
      }}>
        <IconCheckSquare size={20} />
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: active ? "#fff" : "#1a0a2e" }}>
          Espace indépendant
        </div>
        <div style={{ fontSize: "0.7rem", color: active ? "rgba(255,255,255,0.6)" : "#888", marginTop: 2 }}>
          Activité personnelle
        </div>
      </div>
    </div>
    <div style={{ fontSize: "0.72rem", color: active ? "rgba(255,255,255,0.5)" : "#bbb" }}>
      Gérez vos propres projets et offres
    </div>
  </motion.div>
);

const AgencyCard = ({ collab, active, onClick }) => {
  const agency = collab.agency || {};
  const initials = (agency.agencyName || "?").slice(0, 2).toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
      onClick={onClick}
      style={{
        padding: "22px 24px",
        borderRadius: 16,
        background: active ? "#0c1a2e" : "#fff",
        border: `2px solid ${active ? "#0891b2" : "#eee"}`,
        boxShadow: active ? "0 4px 20px rgba(8,145,178,0.18)" : "0 2px 8px rgba(0,0,0,0.04)",
        cursor: "pointer",
        minWidth: 220,
        flex: "0 0 auto",
        transition: "background 0.2s, border-color 0.2s",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        {agency.logo
          ? <img src={uploadService.resolveUrl(agency.logo)} alt={agency.agencyName}
              style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover" }} />
          : <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: active ? "rgba(255,255,255,0.12)" : "#e0f2fe",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "0.85rem", color: active ? "#fff" : "#0891b2",
            }}>{initials}</div>
        }
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.88rem", color: active ? "#fff" : "#1a0a2e", lineHeight: 1.3 }}>
            {agency.agencyName || "Agence"}
          </div>
          {collab.role && (
            <div style={{ fontSize: "0.7rem", color: active ? "rgba(255,255,255,0.6)" : "#888", marginTop: 2 }}>
              {ROLE_LABEL[collab.role] || collab.role}
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {agency.specialties?.length > 0 && (
          <div style={{ fontSize: "0.7rem", color: active ? "rgba(255,255,255,0.5)" : "#bbb" }}>
            {agency.specialties.slice(0, 2).join(" · ")}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const STATUS_META = {
  pending:   { label: "En attente", color: "#f59e0b" },
  accepted:  { label: "Acceptée",   color: "#10b981" },
  declined:  { label: "Refusée",    color: "#ef4444" },
  withdrawn: { label: "Retirée",    color: "#6b7280" },
};


const MyRequests = () => {
  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [withdrawing, setWithdrawing] = useState(null);
  const [msg,         setMsg]         = useState("");

  useEffect(() => {
    collaborationRequestService.getMine({ limit: 50 })
      .then(d => setRequests(d.requests || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (id) => {
    setWithdrawing(id);
    try {
      await collaborationRequestService.withdraw(id);
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: "withdrawn" } : r));
      setMsg("Demande retirée");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg(err.response?.data?.message || "Erreur");
    } finally {
      setWithdrawing(null);
    }
  };

  const displayed = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <div>
      {msg && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4",
          border: "1px solid #6ee7b7", color: "#065f46", fontSize: "0.82rem", marginBottom: 14 }}>
          {msg}
        </div>
      )}

      {}
      <div className="filters-bar" style={{ marginBottom: 16 }}>
        {[
          { v: "all",       l: "Toutes"     },
          { v: "pending",   l: "En attente" },
          { v: "accepted",  l: "Acceptées"  },
          { v: "declined",  l: "Refusées"   },
          { v: "withdrawn", l: "Retirées"   },
        ].map(o => (
          <button key={o.v}
            className={`filter-btn${filter === o.v ? " active" : ""}`}
            onClick={() => setFilter(o.v)}>
            {o.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : displayed.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "48px 24px" }}>
            <div style={{ marginBottom: 10, color: "#bbb" }}><IconSend size={24} /></div>
            <div className="empty-state-title">Aucune demande envoyée</div>
            <div className="empty-state-desc">
              Parcourez les prestataires pour proposer une collaboration.
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <AnimatePresence>
            {displayed.map((r, i) => {
              const meta = STATUS_META[r.status] || STATUS_META.pending;
              return (
                <motion.div key={r._id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ display: "flex", gap: 14, padding: "14px 18px",
                    borderBottom: i < displayed.length - 1 ? "1px solid var(--d-border-soft)" : "none",
                    alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--d-ink)" }}>
                        {r.toName}
                      </span>
                      <span style={{ padding: "1px 8px", borderRadius: 10, fontSize: "0.68rem",
                        fontWeight: 700, background: meta.color + "18", color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                    {r.proposedRole && (
                      <div style={{ fontSize: "0.75rem", color: "var(--d-muted)" }}>
                        Rôle : {r.proposedRole}
                      </div>
                    )}
                    {r.message && (
                      <div style={{ fontSize: "0.75rem", color: "var(--d-muted)", marginTop: 3,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
                        {r.message}
                      </div>
                    )}
                    {r.declineReason && (
                      <div style={{ fontSize: "0.73rem", color: "#ef4444", marginTop: 4 }}>
                        Motif : {r.declineReason}
                      </div>
                    )}
                    <div style={{ fontSize: "0.68rem", color: "#bbb", marginTop: 6 }}>
                      {new Date(r.createdAt).toLocaleDateString("fr-DZ",
                        { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  {r.status === "pending" && (
                    <button
                      onClick={() => handleWithdraw(r._id)}
                      disabled={withdrawing === r._id}
                      style={{ padding: "5px 12px", borderRadius: 7, fontSize: "0.72rem",
                        fontWeight: 700, border: "1.5px solid #fecaca", background: "#fef2f2",
                        color: "#dc2626", cursor: "pointer", fontFamily: "inherit",
                        flexShrink: 0, alignSelf: "center",
                        opacity: withdrawing === r._id ? 0.5 : 1 }}>
                      {withdrawing === r._id ? "..." : "Retirer"}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};


const FreelancerCollaborations = ({ collaborations, activeContext, onSwitchContext }) => {
  const [tab, setTab] = useState("collabs");

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes collaborations</h2>
          <p style={{ color: "var(--d-muted)" }}>
            Gérez vos partenariats et suivez vos demandes
          </p>
        </div>
      </div>

      {}
      <div style={{ display: "flex", gap: 4, marginBottom: 22 }}>
        {[
          { id: "collabs", label: "Collaborations actives" },
          { id: "requests", label: "Mes demandes" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "8px 18px", borderRadius: 8, fontFamily: "inherit",
              fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
              border: tab === t.id ? "2px solid #7c3aed" : "1.5px solid var(--d-border-soft)",
              background: tab === t.id ? "#7c3aed" : "transparent",
              color: tab === t.id ? "#fff" : "var(--d-muted)",
              transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "collabs" && <>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 36 }}>
          <IndependentCard
            active={activeContext === null}
            onClick={() => onSwitchContext(null)}
          />
          {collaborations.map((c) => (
            <AgencyCard
              key={c.agency?._id || c._id}
              collab={c}
              active={activeContext === c.agency?._id}
              onClick={() => onSwitchContext(c.agency?._id)}
            />
          ))}
        </div>

        {collaborations.length === 0 && (
          <div className="card" style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ marginBottom: 12, color: "#bbb" }}>
              <IconUsers size={28} />
            </div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Aucune collaboration active</div>
            <div style={{ fontSize: "0.8rem", color: "var(--d-muted)" }}>
              Vous apparaissez ici lorsqu'une agence accepte votre demande
            </div>
          </div>
        )}

        {collaborations.length > 0 && (
          <div className="card" style={{ padding: "20px 24px" }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 16 }}>
              <IconBriefcase size={14} style={{ marginRight: 6 }} />
              Détails des collaborations
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 12 }}>
              {collaborations.map((c, i) => (
                <motion.div
                  key={c.agency?._id || i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{ padding: "14px 16px", borderRadius: 10,
                    border: "1px solid var(--d-border-soft)", background: "var(--d-surface)" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 4 }}>
                    {c.agency?.agencyName || "Agence"}
                  </div>
                  {c.role && (
                    <div style={{ fontSize: "0.72rem", color: "var(--d-muted)" }}>
                      Rôle : {ROLE_LABEL[c.role] || c.role}
                    </div>
                  )}
                  {c.startDate && (
                    <div style={{ fontSize: "0.7rem", color: "#bbb", marginTop: 4 }}>
                      Depuis le {new Date(c.startDate).toLocaleDateString("fr-DZ", {
                        day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  )}
                  {c.agency?.bio && (
                    <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 8,
                      lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {c.agency.bio}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </>}

      {tab === "requests" && <MyRequests />}
    </div>
  );
};

export default FreelancerCollaborations;
