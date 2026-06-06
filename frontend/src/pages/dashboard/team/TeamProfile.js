import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import profileService from "../../../services/profileService";
import uploadService  from "../../../services/uploadService";
import useAuth        from "../../../hooks/useAuth";
import {
  AvatarCircle, AvatarEditBtn, InfoGrid, StatBar, TagList, TagInput,
  ErrorBanner, SuccessBanner, EditActions, PostFeed, fmt,
} from "../../../components/profile/ProfileKit";
import { IconMapPin, IconMail, IconPhone, IconCalendar, IconGlobe, IconUsers, IconAward } from "../../../components/ui/Icons";

const ACCENT    = "#0891b2";
const ACCENT_BG = "#ecfeff";

const TeamProfile = () => {
  const { user } = useAuth();

  const [profile, setProfile]  = useState(null);
  const [loading, setLoading]  = useState(true);
  const [editing, setEditing]  = useState(false);
  const [saving,  setSaving]   = useState(false);
  const [error,   setError]    = useState("");
  const [saved,   setSaved]    = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const photoRef = useRef();

  const isLead = user?.role === "team";

  const [form, setForm] = useState({
    bio: "", phone: "", website: "", specialties: [], skills: [],
    location: { region: "" },
    avatar: "",
  });

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    profileService.getProfile(user.role, user._id)
      .then(d => {
        const p = d.profile;
        setProfile(p);
        setForm({
          bio:         p.bio         || "",
          phone:       p.phone       || "",
          website:     p.website     || "",
          specialties: p.specialties || [],
          skills:      p.skills      || [],
          location: {
            region: p.location?.region  || "",
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
      bio: p.bio || "", phone: p.phone || "", website: p.website || "",
      specialties: p.specialties || [], skills: p.skills || [],
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

  const displayName  = isLead
    ? (profile.teamName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim())
    : `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  const locationStr  = isLead
    ? profile.location?.region || ""
    : null;
  const tags = isLead ? (profile.specialties || []) : (profile.skills || []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {}
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div>
          <div className="section-head-title">Mon profil</div>
          <div className="section-head-sub">
            {isLead ? "Profil public de votre équipe" : "Vos informations de membre"}
          </div>
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

      {}
      <div className="card" style={{ marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: 5, background: ACCENT }} />

        <div style={{ padding: "22px 24px 0" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>

            {}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              <AvatarCircle
                src={editing ? (form.avatar || profile.logo || profile.avatar) : (profile.logo || profile.avatar)}
                name={displayName} size={88} accentColor={ACCENT}
              />
              {editing && <AvatarEditBtn onClick={() => photoRef.current?.click()} loading={avatarUploading} accentColor={ACCENT} />}
            </div>

            {}
            <div style={{ flex: 1, minWidth: 190 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--d-ink)", letterSpacing: "-0.03em" }}>
                  {displayName || "—"}
                </h2>
                <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 700,
                  background: ACCENT_BG, color: ACCENT }}>
                  {isLead ? "Équipe" : (profile.jobTitle || "Membre")}
                </span>
                {profile.isVerified && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "2px 8px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 700,
                    background: "#dbeafe", color: "#1d4ed8" }}>
                    <IconAward size={10} /> Vérifié
                  </span>
                )}
              </div>

              {!editing && profile.bio && (
                <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: "#555", lineHeight: 1.65, maxWidth: 520 }}>
                  {profile.bio}
                </p>
              )}

              {!editing && (locationStr || profile.website) && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10, alignItems: "center" }}>
                  {locationStr && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "var(--d-muted)" }}>
                      <IconMapPin size={12} /> {locationStr}
                    </span>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.78rem",
                        color: ACCENT, textDecoration: "none" }}>
                      <IconGlobe size={12} /> {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              )}

              {!editing && tags.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <TagList tags={tags.slice(0, 8)} color={ACCENT} bg={ACCENT_BG} />
                </div>
              )}
            </div>
          </div>

          {}
          {editing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="dash-form-group">
                <label className="dash-form-label">Bio</label>
                <textarea className="dash-form-input" rows={3} value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  placeholder={isLead ? "Décrivez votre équipe..." : "Décrivez votre rôle..."}
                  style={{ resize: "vertical" }} />
              </div>
              <div className="dash-form-row">
                <div className="dash-form-group">
                  <label className="dash-form-label">Téléphone</label>
                  <input className="dash-form-input" value={form.phone}
                    onChange={e => set("phone", e.target.value)} placeholder="+213..." />
                </div>
                {isLead && (
                  <div className="dash-form-group">
                    <label className="dash-form-label">Site web</label>
                    <input className="dash-form-input" value={form.website}
                      onChange={e => set("website", e.target.value)} placeholder="https://..." />
                  </div>
                )}
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">{isLead ? "Spécialités" : "Compétences"}</label>
                <TagInput
                  value={isLead ? form.specialties : form.skills}
                  onChange={v => set(isLead ? "specialties" : "skills", v)}
                  accentColor={ACCENT}
                />
              </div>
              {isLead && (
                <div className="dash-form-group">
                  <label className="dash-form-label">Localisation</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[{ f: "region", p: "Wilaya" }].map(({ f, p }) => (
                      <input key={f} className="dash-form-input" style={{ flex: 1, minWidth: 100 }}
                        value={form.location[f]} placeholder={p}
                        onChange={e => setLoc(f, e.target.value)} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {}
        {!editing && (
          <div style={{ marginTop: 22 }}>
            <StatBar
              stats={isLead
                ? [
                    { value: profile.completedProjects ?? 0, label: "Projets terminés", color: ACCENT },
                    { value: profile.membersCount ?? 0,       label: "Membres",         color: "#7c3aed" },
                  ]
                : [{ value: profile.assignedProjects?.length ?? 0, label: "Projets assignés", color: ACCENT }]
              }
              isActive={profile.isActive} isVerified={profile.isVerified}
            />
          </div>
        )}
      </div>

      {}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20, marginBottom: 20 }}>

        {}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <div className="section-head-title" style={{ fontSize: "0.88rem" }}>Contact</div>
            </div>
            <div className="card-body" style={{ paddingTop: 10 }}>
              {editing ? (
                <div className="dash-form-group" style={{ margin: 0 }}>
                  <label className="dash-form-label">
                    Email <span style={{ fontWeight: 400, fontStyle: "italic", color: "var(--d-muted)" }}>(non modifiable)</span>
                  </label>
                  <input className="dash-form-input" value={profile.email} disabled
                    style={{ background: "var(--d-bg)", color: "var(--d-muted)", cursor: "not-allowed" }} />
                </div>
              ) : (
                <InfoGrid items={[
                  { icon: <IconMail size={14} />,     label: "Email",         value: profile.email },
                  { icon: <IconPhone size={14} />,    label: "Téléphone",     value: profile.phone },
                  ...(isLead && profile.website ? [{ icon: <IconGlobe size={14} />, label: "Site web", value: profile.website }] : []),
                  { icon: <IconCalendar size={14} />, label: "Membre depuis", value: fmt(profile.createdAt) },
                  ...(locationStr ? [{ icon: <IconMapPin size={14} />, label: "Localisation", value: locationStr }] : []),
                ]} />
              )}
            </div>
          </div>
        </div>

        {}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {tags.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="section-head-title" style={{ fontSize: "0.88rem" }}>
                  {isLead ? "Spécialités" : "Compétences"}
                </div>
              </div>
              <div className="card-body">
                <TagList tags={tags} color={ACCENT} bg={ACCENT_BG} />
              </div>
            </div>
          )}

          {isLead && (
            <div className="card">
              <div className="card-header">
                <div className="section-head-title" style={{ fontSize: "0.88rem" }}>Équipe</div>
              </div>
              <div className="card-body" style={{ paddingTop: 10 }}>
                <InfoGrid items={[
                  { icon: <IconUsers size={14} />, label: "Membres", value: profile.membersCount ? `${profile.membersCount} membres` : null },
                ]} />
              </div>
            </div>
          )}
        </div>
      </div>

      <PostFeed role={user.role} userId={user._id} accentColor={ACCENT} />
    </motion.div>
  );
};

export default TeamProfile;

