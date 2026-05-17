// frontend/src/pages/EditProfilePage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import profileService from "../services/profileService";
import useAuth from "../hooks/useAuth";

// ── Field definitions per role ────────────────────────────────────────────────
const ROLE_FIELDS = {
  agency: [
    { name: "bio",        label: "Bio",          type: "textarea" },
    { name: "phone",      label: "Téléphone",    type: "text"     },
    { name: "website",    label: "Site web",     type: "url"      },
    { name: "specialties",label: "Spécialités",  type: "tags"     },
  ],
  freelancer: [
    { name: "bio",           label: "Bio",              type: "textarea" },
    { name: "skills",        label: "Compétences",      type: "tags"     },
    { name: "categories",    label: "Catégories",       type: "tags"     },
    { name: "followersCount",label: "Abonnés",          type: "number"   },
  ],
  client: [
    { name: "bio",          label: "Bio",                       type: "textarea" },
    { name: "industry",     label: "Secteur d'activité",        type: "text"     },
    { name: "fieldOfWork",  label: "Domaine / Description",     type: "text"     },
    { name: "achievements", label: "Réalisations / Références", type: "tags"     },
  ],
  team: [
    { name: "bio",         label: "Bio",          type: "textarea" },
    { name: "website",     label: "Site web",     type: "url"      },
    { name: "specialties", label: "Spécialités",  type: "tags"     },
  ],
  agency_member: [
    { name: "bio",   label: "Bio",        type: "textarea" },
    { name: "phone", label: "Téléphone",  type: "text"     },
    { name: "skills",label: "Compétences",type: "tags"     },
  ],
};

// ── TagInput ──────────────────────────────────────────────────────────────────
const TagInput = ({ label, value = [], onChange }) => {
  const [input, setInput] = useState("");
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
  };
  const remove = (tag) => onChange(value.filter(t => t !== tag));

  return (
    <div className="dash-form-group">
      <label className="dash-form-label">{label}</label>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
        {value.map((tag, i) => (
          <span key={i} style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem",
            fontWeight: 600, background: "#f3f0ff", color: "#7c3aed",
            display: "flex", alignItems: "center", gap: 5 }}>
            {tag}
            <button type="button" onClick={() => remove(tag)}
              style={{ background: "none", border: "none", cursor: "pointer",
                color: "#7c3aed", fontSize: "0.7rem", padding: 0, lineHeight: 1 }}>
              ✕
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input className="dash-form-input" style={{ flex: 1 }}
          value={input} placeholder="Ajouter..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add}
          style={{ padding: "0 14px", borderRadius: 8, border: "1.5px solid #7c3aed",
            background: "transparent", color: "#7c3aed", fontFamily: "inherit",
            fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>
          +
        </button>
      </div>
    </div>
  );
};

// ── PortfolioEditor ───────────────────────────────────────────────────────────
const PortfolioEditor = ({ items = [], onChange }) => {
  const add = () => onChange([...items, { title: "", description: "", imageUrl: "", link: "" }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };

  return (
    <div className="dash-form-group">
      <label className="dash-form-label">Portfolio</label>
      {items.map((item, i) => (
        <div key={i} style={{ border: "1px solid var(--d-border-soft)", borderRadius: 10,
          padding: "12px", marginBottom: 10, background: "var(--d-surface-alt, #fafafa)" }}>
          <div className="dash-form-row">
            <div className="dash-form-group">
              <label className="dash-form-label">Titre</label>
              <input className="dash-form-input" value={item.title}
                onChange={e => update(i, "title", e.target.value)} />
            </div>
            <div className="dash-form-group">
              <label className="dash-form-label">Lien</label>
              <input className="dash-form-input" value={item.link}
                onChange={e => update(i, "link", e.target.value)} />
            </div>
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">URL Image</label>
            <input className="dash-form-input" value={item.imageUrl}
              onChange={e => update(i, "imageUrl", e.target.value)} />
          </div>
          <div className="dash-form-group">
            <label className="dash-form-label">Description</label>
            <input className="dash-form-input" value={item.description}
              onChange={e => update(i, "description", e.target.value)} />
          </div>
          <button type="button" onClick={() => remove(i)}
            style={{ padding: "4px 10px", borderRadius: 6, border: "none",
              background: "#fee2e2", color: "#991b1b", fontFamily: "inherit",
              fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
            Supprimer
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        style={{ padding: "6px 14px", borderRadius: 8, border: "1.5px dashed #ccc",
          background: "transparent", color: "#888", fontFamily: "inherit",
          fontSize: "0.8rem", cursor: "pointer", width: "100%" }}>
        + Ajouter un élément portfolio
      </button>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
const EditProfilePage = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [form,     setForm]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  useEffect(() => {
    if (!user) return;
    profileService.getProfile(user.role, user._id)
      .then(d => {
        const p = d.profile;
        setForm({
          bio:          p.bio          || "",
          phone:        p.phone        || "",
          website:      p.website      || "",
          industry:     p.industry     || "",
          fieldOfWork:  p.fieldOfWork  || "",
          specialties:  p.specialties  || [],
          skills:       p.skills       || [],
          categories:   p.categories   || [],
          achievements: p.achievements || [],
          followersCount: p.followersCount || "",
          portfolioItems: p.portfolioItems || [],
          socialLinks:  p.socialLinks  || {},
        });
      })
      .catch(() => setError("Impossible de charger le profil"))
      .finally(() => setLoading(false));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await profileService.updateProfile(form);
      setSuccess(true);
      setTimeout(() => navigate(`/profile/${user.role}/${user._id}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  if (!user) return null;
  const fields  = ROLE_FIELDS[user.role] || [];
  const hasPortfolio = ["agency", "team"].includes(user.role);

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div className="spinner" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>

      <button onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
          fontSize: "0.8rem", color: "#888", marginBottom: 20, padding: 0 }}>
        ← Retour
      </button>

      <div style={{ borderRadius: 16, border: "1px solid #eee", background: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)", padding: "28px" }}>
        <h2 style={{ margin: "0 0 24px", fontWeight: 800, fontSize: "1.2rem" }}>
          Modifier mon profil
        </h2>

        {form && (
          <form onSubmit={handleSave} className="dash-form">
            {fields.map(f => {
              if (f.type === "textarea") return (
                <div key={f.name} className="dash-form-group">
                  <label className="dash-form-label">{f.label}</label>
                  <textarea className="dash-form-input" rows={4}
                    value={form[f.name]} onChange={e => set(f.name, e.target.value)}
                    style={{ resize: "vertical" }} />
                </div>
              );
              if (f.type === "tags") return (
                <TagInput key={f.name} label={f.label}
                  value={form[f.name]} onChange={v => set(f.name, v)} />
              );
              return (
                <div key={f.name} className="dash-form-group">
                  <label className="dash-form-label">{f.label}</label>
                  <input className="dash-form-input" type={f.type}
                    value={form[f.name]} onChange={e => set(f.name, e.target.value)} />
                </div>
              );
            })}

            {/* Social links (freelancer) */}
            {user.role === "freelancer" && (
              <div className="dash-form-group">
                <label className="dash-form-label">Liens sociaux</label>
                {["instagram", "tiktok", "youtube", "linkedin", "twitter"].map(platform => (
                  <div key={platform} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 90, fontSize: "0.78rem", color: "#888", textTransform: "capitalize",
                      flexShrink: 0 }}>{platform}</span>
                    <input className="dash-form-input"
                      value={form.socialLinks?.[platform] || ""}
                      placeholder={`URL ${platform}`}
                      onChange={e => set("socialLinks", { ...form.socialLinks, [platform]: e.target.value })} />
                  </div>
                ))}
              </div>
            )}

            {/* Portfolio editor for agency/team */}
            {hasPortfolio && (
              <PortfolioEditor
                items={form.portfolioItems}
                onChange={v => set("portfolioItems", v)}
              />
            )}

            {error    && <div className="dash-form-error">{error}</div>}
            {success  && (
              <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4",
                border: "1px solid #6ee7b7", color: "#065f46", fontSize: "0.82rem" }}>
                Profil mis à jour !
              </div>
            )}

            <button type="submit" className="dash-form-submit" disabled={saving}>
              {saving ? "Sauvegarde..." : "Sauvegarder les modifications →"}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default EditProfilePage;
