import React from "react";
import { motion } from "framer-motion";
import { IconUsers, IconBriefcase, IconCheckSquare } from "../../../components/ui/Icons";

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
          ? <img src={agency.logo} alt={agency.agencyName}
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

const FreelancerCollaborations = ({ collaborations, activeContext, onSwitchContext }) => {
  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes collaborations</h2>
          <p style={{ color: "var(--d-muted)" }}>
            Basculez entre votre espace indépendant et vos agences partenaires
          </p>
        </div>
      </div>

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
            Vous apparaissez ici lorsqu'une agence vous intègre comme membre
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
    </div>
  );
};

export default FreelancerCollaborations;
