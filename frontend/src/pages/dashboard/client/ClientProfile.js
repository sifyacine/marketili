import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import profileService from "../../../services/profileService";
import uploadService  from "../../../services/uploadService";
import useAuth        from "../../../hooks/useAuth";
import {
  AvatarCircle, AvatarEditBtn, InfoGrid, StatBar, TagList, TagInput,
  ErrorBanner, SuccessBanner, EditActions, PostFeed, fmt,
} from "../../../components/profile/ProfileKit";
import { IconMapPin, IconMail, IconPhone, IconCalendar, IconBuilding, IconUsers, IconAward, IconBriefcase } from "../../../components/ui/Icons";

const ACCENT    = "#c0152a";
const ACCENT_BG = "var(--d-accent-soft)";

const ClientProfile = () => {
  const { user } = useAuth();

  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [saved,    setSaved]    = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const photoRef = useRef();

  const [form, setForm] = useState({
    bio: "", phone: "", industry: "", fieldOfWork: "",
    achievements: [],
    location: { region: "" },
    avatar: "",
  });

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    profileService.getProfile("client", user._id)
      .then(d => {
        const p = d.profile;
        setProfile(p);
        setForm({
          bio:          p.bio          || "",
          phone:        p.phone        || "",
          industry:     p.industry     || "",
          fieldOfWork:  p.fieldOfWork  || "",
          achievements: p.achievements || [],
          location: {
            region: p.location?.region || "",
          },
          avatar: p.avatar || "",
        });
      })
      .catch(() => setError("Impossible de charger le profil"))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const set    = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const setLoc = (field, val) =>
    setForm(prev => ({ ...prev, location: { ...prev.location, [field]: val } }));

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      const result = await profileService.updateProfile(form);
      setProfile(result.profile);
      setEditing(false); setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    const p = profile;
    setForm({
      bio:          p.bio          || "",
      phone:        p.phone        || "",
      industry:     p.industry     || "",
      fieldOfWork:  p.fieldOfWork  || "",
      achievements: p.achievements || [],
      location: { region: p.location?.region || "" },
      avatar: p.avatar || "",
    });
    setEditing(false); setError("");
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await uploadService.upload(file);
      set("avatar", res.url);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible d'uploader la photo.");
    } finally { setAvatarUploading(false); }
  };

  if (!user) return null;
  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
      <div className="spinner" />
    </div>
  );
  if (!profile) return (
    <div className="empty-state" style={{ padding: "60px 0" }}>
      <div className="empty-state-title">Profil introuvable</div>
    </div>
  );

  const isCompany   = profile.accountType === "company";
  const displayName = isCompany
    ? profile.companyName
    : `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const locationStr = profile.location?.region || "";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Page header */}
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-head-title">Mon profil</div>
          <div className="section-head-sub">Vos informations visibles par les prestataires</div>
        </div>
        <EditActions
          editing={editing} saving={saving} accentColor={ACCENT}
          onEdit={() => setEditing(true)} onSave={handleSave} onCancel={handleCancel}
        />
      </div>

      <AnimatePresence>
        <ErrorBanner message={error} />
        <SuccessBanner show={saved} />
      </AnimatePresence>

      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: 5, background: ACCENT }} />

        <div style={{ padding: "22px 24px 0" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>

            {/* Avatar */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              <AvatarCircle
                src={editing ? (form.avatar || profile.avatar) : profile.avatar}
                name={displayName} size={88} accentColor={ACCENT}
              />
              {editing && <AvatarEditBtn onClick={() => photoRef.current?.click()} loading={avatarUploading} accentColor={ACCENT} />}
            </div>

            {/* Identity */}
            <div style={{ flex: 1, minWidth: 190 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--d-ink)", letterSpacing: "-0.03em" }}>
                  {displayName || "—"}
                </h2>
                <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 700,
                  background: ACCENT_BG, color: ACCENT }}>
                  Client
                </span>
                <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 600,
                  background: "var(--d-bg)", color: "var(--d-muted)", border: "1px solid var(--d-border-soft)" }}>
                  {isCompany ? "Entreprise" : "Particulier"}
                </span>
                {profile.isVerified && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "2px 8px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 700,
                    background: "#dbeafe", color: "#1d4ed8" }}>
                    <IconAward size={10} /> Vérifié
                  </span>
                )}
              </div>

              {!editing && (profile.industry || profile.fieldOfWork) && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6, marginTop: 4 }}>
                  {profile.industry && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 20, fontSize: "0.73rem", fontWeight: 700,
                      background: ACCENT_BG, color: ACCENT }}>
                      <IconBriefcase size={11} /> {profile.industry}
                    </span>
                  )}
                  {profile.fieldOfWork && (
                    <span style={{ fontSize: "0.82rem", color: "var(--d-muted)" }}>
                      {profile.fieldOfWork}
                    </span>
                  )}
                </div>
              )}

              {!editing && profile.bio && (
                <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: "#555", lineHeight: 1.65, maxWidth: 520 }}>
                  {profile.bio}
                </p>
              )}

              {!editing && locationStr && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10,
                  fontSize: "0.78rem", color: "var(--d-muted)" }}>
                  <IconMapPin size={12} /> {locationStr}
                </div>
              )}
            </div>
          </div>

          {/* Edit form */}
          {editing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="dash-form-row" style={{ alignItems: "flex-start" }}>
                <div className="dash-form-group" style={{ flex: 1 }}>
                  <label className="dash-form-label">Secteur d'activité</label>
                  <input className="dash-form-input" value={form.industry}
                    onChange={e => set("industry", e.target.value)}
                    placeholder="Technologie, Agroalimentaire, Santé..." />
                </div>
                <div className="dash-form-group" style={{ flex: 1 }}>
                  <label className="dash-form-label">Domaine / Description courte</label>
                  <input className="dash-form-input" value={form.fieldOfWork}
                    onChange={e => set("fieldOfWork", e.target.value)}
                    placeholder="Startup tech B2B, distribution alimentaire..." />
                </div>
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Bio</label>
                <textarea className="dash-form-input" rows={3} value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  placeholder="Votre activité, besoins, objectifs marketing..."
                  style={{ resize: "vertical" }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Stat bar */}
        {!editing && (
          <div style={{ marginTop: 22 }}>
            <StatBar
              stats={[
                { value: profile.completedProjects ?? 0,       label: "Projets terminés", color: ACCENT },
                { value: profile.achievements?.length ?? 0,    label: "Réalisations",     color: "#7c3aed" },
              ]}
              isActive={profile.isActive} isVerified={profile.isVerified}
            />
          </div>
        )}
      </div>

      {/* ── Info section ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20, marginBottom: 20 }}>

        {/* Left: contact + location + company */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <div className="card">
            <div className="card-header">
              <div className="section-head-title" style={{ fontSize: "0.88rem" }}>Contact</div>
            </div>
            <div className="card-body" style={{ paddingTop: 10 }}>
              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="dash-form-group" style={{ margin: 0 }}>
                    <label className="dash-form-label">Téléphone</label>
                    <input className="dash-form-input" value={form.phone}
                      onChange={e => set("phone", e.target.value)} placeholder="+213 5xx xxx xxx" />
                  </div>
                  <div className="dash-form-group" style={{ margin: 0 }}>
                    <label className="dash-form-label" style={{ color: "var(--d-muted)" }}>
                      Email <span style={{ fontWeight: 400, fontStyle: "italic" }}>(non modifiable)</span>
                    </label>
                    <input className="dash-form-input" value={profile.email} disabled
                      style={{ background: "var(--d-bg)", color: "var(--d-muted)", cursor: "not-allowed" }} />
                  </div>
                </div>
              ) : (
                <InfoGrid items={[
                  { icon: <IconMail size={14} />,     label: "Email",         value: profile.email },
                  { icon: <IconPhone size={14} />,    label: "Téléphone",     value: profile.phone },
                  { icon: <IconCalendar size={14} />, label: "Membre depuis", value: fmt(profile.createdAt) },
                  { icon: <IconMapPin size={14} />,   label: "Localisation",  value: locationStr || null },
                ]} />
              )}
            </div>
          </div>

          {editing && (
            <div className="card">
              <div className="card-header">
                <div className="section-head-title" style={{ fontSize: "0.88rem" }}>Localisation</div>
              </div>
              <div className="card-body" style={{ paddingTop: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { f: "region", l: "Wilaya", p: "Alger, Oran, Annaba..." },
                  ].map(({ f, l, p }) => (
                    <div key={f} className="dash-form-group" style={{ margin: 0 }}>
                      <label className="dash-form-label">{l}</label>
                      <input className="dash-form-input" value={form.location[f]}
                        onChange={e => setLoc(f, e.target.value)} placeholder={p} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isCompany && !editing && (
            <div className="card">
              <div className="card-header">
                <div className="section-head-title" style={{ fontSize: "0.88rem" }}>Entreprise</div>
              </div>
              <div className="card-body" style={{ paddingTop: 10 }}>
                <InfoGrid items={[
                  { icon: <IconBuilding size={14} />, label: "Raison sociale", value: profile.companyName },
                  { icon: <IconUsers size={14} />,    label: "Taille",
                    value: profile.companySize ? `${profile.companySize} employés` : null },
                ]} />
              </div>
            </div>
          )}
        </div>

        {/* Right: achievements */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="section-head-title" style={{ fontSize: "0.88rem" }}>Réalisations & Références</div>
              {!editing && <div className="section-head-sub">Tags visibles sur votre profil public</div>}
            </div>
            <div className="card-body">
              {editing ? (
                <TagInput
                  value={form.achievements}
                  onChange={v => set("achievements", v)}
                  placeholder="Lancement produit, 10K followers..."
                  accentColor={ACCENT}
                />
              ) : profile.achievements?.length > 0 ? (
                <TagList tags={profile.achievements} color={ACCENT} bg={ACCENT_BG} />
              ) : (
                <div style={{ color: "var(--d-muted)", fontSize: "0.82rem", fontStyle: "italic" }}>
                  Aucune réalisation renseignée.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PostFeed role="client" userId={user._id} accentColor={ACCENT} />
    </motion.div>
  );
};

export default ClientProfile;
