// src/pages/dashboard/agency/DirectorMembers.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import agencyMemberService from "../../../services/agencyMemberService";

const JOB_OPTIONS = [
  { value: "commercial",        label: "Commercial"        },
  { value: "strategist",        label: "Stratégiste"       },
  { value: "designer",          label: "Designer"          },
  { value: "editor",            label: "Monteur"           },
  { value: "smm",               label: "SMM"               },
  { value: "community_manager", label: "Community Manager" },
];

const JOB_LABEL = {
  director:          "Directeur",
  commercial:        "Commercial",
  strategist:        "Stratégiste",
  designer:          "Designer",
  editor:            "Monteur",
  smm:               "SMM",
  community_manager: "Community Manager",
};

const DirectorMembers = ({ user }) => {
  const [members,   setMembers]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({
    firstName: "", lastName: "", email: "",
    password: "", jobTitle: "commercial", phone: "",
  });
  const [formError, setFormError] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [toggling,  setToggling]  = useState(null);

  const load = () => {
    setLoading(true);
    agencyMemberService.getMembers()
      .then(d => setMembers(d.members || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.password.length < 8)
      return setFormError("Le mot de passe temporaire doit contenir au moins 8 caractères");
    setSaving(true);
    try {
      await agencyMemberService.createMember(form);
      setShowModal(false);
      setForm({ firstName: "", lastName: "", email: "",
        password: "", jobTitle: "commercial", phone: "" });
      load();
    } catch (err) {
      setFormError(err.response?.data?.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const d = await agencyMemberService.toggleMember(id);
      setMembers(prev => prev.map(m =>
        m._id === id ? { ...m, isActive: d.isActive } : m
      ));
    } catch {}
    finally { setToggling(null); }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Membres</h2>
          <p>{members.length} membre{members.length !== 1 ? "s" : ""} dans l'agence</p>
        </div>
        <button className="section-cta-btn" onClick={() => setShowModal(true)}>
          + Créer un membre
        </button>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div>
      : members.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">Aucun membre</div>
            <div className="empty-state-desc">Créez des comptes pour votre équipe.</div>
            <button className="empty-state-btn" onClick={() => setShowModal(true)}>
              + Créer le premier membre
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="data-grid">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Rôle</th>
                <th>Email</th>
                <th>Mot de passe</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%",
                        background: "linear-gradient(135deg,#7c3aed,#5b21b6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.72rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {m.firstName?.[0]?.toUpperCase()}{m.lastName?.[0]?.toUpperCase()}
                      </div>
                      <div className="td-title">{m.firstName} {m.lastName}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem",
                      fontWeight: 600, background: "#f3f0ff", color: "#7c3aed" }}>
                      {JOB_LABEL[m.jobTitle] || m.jobTitle}
                    </span>
                  </td>
                  <td className="td-muted">{m.email}</td>
                  <td>
                    <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem",
                      fontWeight: 600,
                      background: m.mustChangePassword ? "#fef3c7" : "#f3f4f6",
                      color:      m.mustChangePassword ? "#92400e" : "#6b7280" }}>
                      {m.mustChangePassword ? "⚠ Temporaire" : "✓ Changé"}
                    </span>
                  </td>
                  <td>
                    <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem",
                      fontWeight: 600,
                      background: m.isActive ? "#d1fae5" : "#f3f4f6",
                      color:      m.isActive ? "#065f46" : "#374151" }}>
                      {m.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleToggle(m._id)}
                      disabled={toggling === m._id}
                      style={{ padding: "4px 12px", borderRadius: 7, fontSize: "0.75rem",
                        fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                        border: "1.5px solid #f0dede", background: "transparent",
                        color: m.isActive ? "#ef4444" : "#10b981",
                        opacity: toggling === m._id ? 0.5 : 1 }}>
                      {toggling === m._id ? "..." : m.isActive ? "Désactiver" : "Activer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create member modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div className="modal-box"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}>
              <div className="modal-header">
                <div className="modal-title">Créer un membre</div>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: "0.82rem", color: "#9a6060", marginBottom: 20,
                  lineHeight: 1.5, padding: "10px 14px", background: "#fffbfb",
                  border: "1px solid #faeaea", borderRadius: 8 }}>
                  Le membre devra changer son mot de passe lors de sa première connexion.
                </p>
                <form onSubmit={handleCreate} className="dash-form">
                  <div className="dash-form-row">
                    <div className="dash-form-group">
                      <label className="dash-form-label">Prénom *</label>
                      <input className="dash-form-input" name="firstName" required
                        value={form.firstName} onChange={handleChange} />
                    </div>
                    <div className="dash-form-group">
                      <label className="dash-form-label">Nom *</label>
                      <input className="dash-form-input" name="lastName" required
                        value={form.lastName} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-form-label">Adresse email *</label>
                    <input className="dash-form-input" name="email" type="email" required
                      value={form.email} onChange={handleChange} />
                  </div>
                  <div className="dash-form-row">
                    <div className="dash-form-group">
                      <label className="dash-form-label">Rôle *</label>
                      <select className="dash-form-select" name="jobTitle"
                        value={form.jobTitle} onChange={handleChange}>
                        {JOB_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="dash-form-group">
                      <label className="dash-form-label">Téléphone</label>
                      <input className="dash-form-input" name="phone" type="tel"
                        value={form.phone} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="dash-form-group">
                    <label className="dash-form-label">Mot de passe temporaire *</label>
                    <input className="dash-form-input" name="password" type="text" required
                      placeholder="Min. 8 caractères — à communiquer au membre"
                      value={form.password} onChange={handleChange} />
                    <span className="dash-form-hint">
                      Le membre sera forcé de le changer à la première connexion.
                    </span>
                  </div>
                  {formError && <div className="dash-form-error">{formError}</div>}
                  <button type="submit" className="dash-form-submit" disabled={saving}>
                    {saving ? "Création..." : "Créer le compte →"}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DirectorMembers;