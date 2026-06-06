import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import teamMemberService from "../../../services/teamMemberService";
import { IconUsers } from "../../../components/ui/Icons";

const initials = (m) =>
  `${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase();

const Avatar = ({ member }) => (
  <div style={{
    width: 34, height: 34, borderRadius: "50%",
    background: "linear-gradient(135deg,#059669,#065f46)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.72rem", fontWeight: 700, color: "#fff", flexShrink: 0,
  }}>
    {initials(member)}
  </div>
);

const CreateMemberForm = ({ onCreated, onCancel }) => {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", jobTitle: "", phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Prénom, nom, email et mot de passe sont requis");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const d = await teamMemberService.createMember(form);
      onCreated(d.member);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      style={{ padding: "24px 28px", marginBottom: 24,
        border: "2px solid #d1fae5", borderRadius: 14 }}>
      <h3 style={{ margin: "0 0 18px", fontSize: "1rem", fontWeight: 700 }}>
        Nouveau membre
      </h3>
      {error && (
        <div style={{ marginBottom: 14, padding: "10px 14px", borderRadius: 8,
          background: "#fee2e2", color: "#991b1b", fontSize: "0.82rem" }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label className="dash-form-label">Prénom *</label>
            <input className="dash-form-input" value={form.firstName}
              onChange={e => set("firstName", e.target.value)} placeholder="Prénom" />
          </div>
          <div>
            <label className="dash-form-label">Nom *</label>
            <input className="dash-form-input" value={form.lastName}
              onChange={e => set("lastName", e.target.value)} placeholder="Nom" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label className="dash-form-label">Email *</label>
            <input className="dash-form-input" type="email" value={form.email}
              onChange={e => set("email", e.target.value)} placeholder="email@exemple.com" />
          </div>
          <div>
            <label className="dash-form-label">Mot de passe temporaire *</label>
            <input className="dash-form-input" type="password" value={form.password}
              onChange={e => set("password", e.target.value)} placeholder="Min. 8 caractères" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div>
            <label className="dash-form-label">Poste</label>
            <input className="dash-form-input" value={form.jobTitle}
              onChange={e => set("jobTitle", e.target.value)} placeholder="Ex: Designer, Développeur..." />
          </div>
          <div>
            <label className="dash-form-label">Téléphone</label>
            <input className="dash-form-input" value={form.phone}
              onChange={e => set("phone", e.target.value)} placeholder="+213..." />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="section-cta-btn" disabled={saving}>
            {saving ? "Création..." : "Créer le membre"}
          </button>
          <button type="button" onClick={onCancel}
            style={{ padding: "9px 18px", borderRadius: 9, border: "1.5px solid var(--d-border-soft)",
              background: "none", cursor: "pointer", fontSize: "0.85rem", fontFamily: "inherit" }}>
            Annuler
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const MemberRow = ({ member, onToggle, toggling }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: "14px 22px", borderBottom: "1px solid var(--d-border-soft)",
        display: "flex", alignItems: "center", gap: 14,
        opacity: member.isActive ? 1 : 0.55 }}>
      <Avatar member={member} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>
          {member.firstName} {member.lastName}
        </div>
        <div style={{ fontSize: "0.74rem", color: "var(--d-muted)", marginTop: 1 }}>
          {member.jobTitle || "Poste non défini"} · {member.email}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          padding: "2px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 600,
          background: member.isActive ? "#d1fae5" : "#f3f4f6",
          color: member.isActive ? "#065f46" : "#374151",
          border: `1px solid ${member.isActive ? "#6ee7b7" : "#d1d5db"}`,
        }}>
          {member.isActive ? "Actif" : "Inactif"}
        </span>
        <button
          onClick={() => onToggle(member)}
          disabled={toggling === member._id}
          style={{ padding: "5px 12px", borderRadius: 8, fontSize: "0.75rem",
            fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            border: "1.5px solid var(--d-border-soft)", background: "none",
            color: "var(--d-ink)", opacity: toggling === member._id ? 0.5 : 1 }}>
          {toggling === member._id ? "..." : member.isActive ? "Désactiver" : "Activer"}
        </button>
      </div>
    </motion.div>
  );
};

const TeamLeadMembers = () => {
  const [members,  setMembers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    teamMemberService.getMembers()
      .then(d => setMembers(d.members || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreated = (member) => {
    setMembers(prev => [member, ...prev]);
    setShowForm(false);
  };

  const handleToggle = async (member) => {
    setToggling(member._id);
    try {
      const d = await teamMemberService.toggleMember(member._id);
      setMembers(prev => prev.map(m =>
        m._id === member._id ? { ...m, isActive: d.isActive } : m
      ));
    } catch {}
    setToggling(null);
  };

  const active   = members.filter(m => m.isActive);
  const inactive = members.filter(m => !m.isActive);

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Membres de l'équipe</h2>
          <p style={{ color: "var(--d-muted)" }}>
            {active.length} actif{active.length !== 1 ? "s" : ""} · {inactive.length} inactif{inactive.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!showForm && (
          <button className="section-cta-btn" onClick={() => setShowForm(true)}>
            + Ajouter un membre
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <CreateMemberForm
            onCreated={handleCreated}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : members.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ color: "#ccc", marginBottom: 12 }}><IconUsers size={24} /></div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Aucun membre</div>
          <div style={{ fontSize: "0.8rem", color: "var(--d-muted)" }}>
            Ajoutez votre premier membre pour commencer
          </div>
        </div>
      ) : (
        <>
          {}
          {active.length > 0 && (
            <div className="card" style={{ padding: 0, marginBottom: 20 }}>
              <div style={{ padding: "12px 22px 10px",
                borderBottom: "1px solid var(--d-border-soft)",
                fontSize: "0.75rem", fontWeight: 700, color: "#059669",
                letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Actifs ({active.length})
              </div>
              {active.map((m, i) => (
                <MemberRow key={m._id} member={m} onToggle={handleToggle}
                  toggling={toggling} />
              ))}
            </div>
          )}

          {}
          {inactive.length > 0 && (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: "12px 22px 10px",
                borderBottom: "1px solid var(--d-border-soft)",
                fontSize: "0.75rem", fontWeight: 700, color: "var(--d-muted)",
                letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Inactifs ({inactive.length})
              </div>
              {inactive.map((m, i) => (
                <MemberRow key={m._id} member={m} onToggle={handleToggle}
                  toggling={toggling} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeamLeadMembers;
