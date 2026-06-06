import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDeadlineColor, getDeadlineLabel } from "../../../utils/deadlineColor";
import { IconFlag, IconSend, IconSearch, IconUsers } from "../../../components/ui/Icons";
import uploadService from "../../../services/uploadService";

const COLLAB_FR = {
  service:     "Service",
  partnership: "Partenariat",
  sponsorship: "Sponsoring",
  exposure:    "Exposition",
};


const StrategistSelector = ({ members, onSelect, onCancel }) => {
  const strategists = (members || []).filter(
    m => m.jobTitle === "strategist" || m.jobTitle === "art_director" ||
         m.jobTitle === "digital_manager" || m.jobTitle === "project_manager" ||
         m.jobTitle === "social_media_manager"
  );

  const JOB_FR = {
    strategist:          "Stratège",
    art_director:        "Directeur Artistique",
    digital_manager:     "Digital Manager",
    project_manager:     "Chef de Projet",
    social_media_manager:"Social Media Manager",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      style={{
        position: "absolute", bottom: "calc(100% + 6px)", right: 0, zIndex: 50,
        background: "#fff", border: "1.5px solid #f0dede", borderRadius: 10,
        boxShadow: "0 4px 18px rgba(0,0,0,0.12)", minWidth: 220, overflow: "hidden",
      }}
    >
      <div style={{ padding: "10px 14px", fontSize: "0.72rem", fontWeight: 700,
        color: "#9a6060", borderBottom: "1px solid #faeaea",
        textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Sélectionner un stratège
      </div>

      {strategists.length === 0 ? (
        <div style={{ padding: "14px", fontSize: "0.8rem", color: "#9a6060", textAlign: "center" }}>
          Aucun stratège disponible
        </div>
      ) : (
        strategists.map(m => (
          <button key={m._id}
            onClick={() => onSelect(m)}
            style={{
              width: "100%", padding: "10px 14px", background: "white",
              border: "none", textAlign: "left", cursor: "pointer",
              borderBottom: "1px solid #faeaea", fontFamily: "inherit",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff8f8"}
            onMouseLeave={e => e.currentTarget.style.background = "white"}
          >
            <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#1a0a0a" }}>
              {m.firstName} {m.lastName}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#9a6060" }}>
              {JOB_FR[m.jobTitle] || m.jobTitle}
            </div>
          </button>
        ))
      )}

      <div style={{ padding: "8px 14px", borderTop: "1px solid #faeaea" }}>
        <button onClick={onCancel}
          style={{
            width: "100%", padding: "6px 0", borderRadius: 7,
            border: "1.5px solid #f0dede", background: "white",
            color: "#9a6060", fontFamily: "inherit", fontSize: "0.75rem",
            fontWeight: 600, cursor: "pointer",
          }}>
          Annuler
        </button>
      </div>
    </motion.div>
  );
};


const FlaggedCard = ({ flagEntry, index, onPitch, onSendToStrategist, members }) => {
  const post      = flagEntry.post;
  const isPitched = flagEntry.pitched;
  const dlColor   = getDeadlineColor(post.deadline);
  const dlLabel   = getDeadlineLabel(post.deadline);
  const [showSelector, setShowSelector] = useState(false);
  const [sending,      setSending]      = useState(false);

  const handleSelectStrategist = async (member) => {
    setShowSelector(false);
    setSending(true);
    try {
      await onSendToStrategist(flagEntry, member);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ delay: index * 0.05 }}
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid var(--d-border-soft)",
        borderLeft: `4px solid ${isPitched ? "#10b981" : dlColor}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        overflow: "hidden",
        opacity: isPitched ? 0.72 : 1,
        display: "flex",
        flexDirection: "column",
      }}>

      {}
      <div style={{ padding: "18px 20px 14px", flex: 1 }}>

        {}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 700,
            background: "#d1fae5", color: "#065f46" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%",
              background: "#10b981", display: "inline-block" }} />
            Ouvert
          </span>
          <span style={{ fontSize: "0.73rem", fontWeight: 700, color: dlColor }}>
            {dlLabel}
          </span>
        </div>

        {}
        <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--d-ink)",
          lineHeight: 1.3, marginBottom: 6 }}>
          {post.title}
        </div>

        {}
        {post.description && (
          <div style={{ fontSize: "0.8rem", color: "var(--d-muted)", lineHeight: 1.55,
            marginBottom: 10, display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {post.description}
          </div>
        )}

        {}
        {post.media?.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {post.media.slice(0, 3).map((m, i) => (
              (m.mimeType?.startsWith("image/") || /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(m.filename || "")) ? (
                <a key={i} href={uploadService.resolveUrl(m.url)} target="_blank" rel="noreferrer"
                  style={{ display: "block", flexShrink: 0 }}>
                  <img src={uploadService.resolveUrl(m.url)} alt={m.filename}
                    style={{ width: 64, height: 48, objectFit: "cover",
                      borderRadius: 6, border: "1px solid #f0dede" }} />
                </a>
              ) : (
                <a key={i} href={uploadService.resolveUrl(m.url)} target="_blank" rel="noreferrer"
                  style={{ display: "flex", alignItems: "center", gap: 4,
                    padding: "4px 8px", borderRadius: 6, background: "#f5f3f8",
                    border: "1px solid #eceaf2", fontSize: "0.68rem",
                    color: "#6b617e", textDecoration: "none", flexShrink: 0 }}>
                  🎬 {m.filename?.split("-").slice(1).join("-") || m.filename}
                </a>
              )
            ))}
            {post.media.length > 3 && (
              <div style={{ display: "flex", alignItems: "center",
                fontSize: "0.68rem", color: "var(--d-muted)" }}>
                +{post.media.length - 3}
              </div>
            )}
          </div>
        )}

        {}
        {post.objectives && (
          <div style={{ fontSize: "0.74rem", color: "#7c3aed", lineHeight: 1.5,
            marginBottom: 10, padding: "6px 10px", borderRadius: 6,
            background: "#f3f0ff", fontStyle: "italic" }}>
            Objectifs : {post.objectives}
          </div>
        )}

        {}
        {(post.marketingType || post.collaborationType || post.categories?.length > 0) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {post.marketingType && (
              <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.67rem",
                fontWeight: 600, background: "#f3f4f6", color: "#374151" }}>
                {post.marketingType}
              </span>
            )}
            {post.collaborationType && (
              <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.67rem",
                fontWeight: 600, background: "#ede9fe", color: "#5b21b6" }}>
                {COLLAB_FR[post.collaborationType] || post.collaborationType}
              </span>
            )}
            {(post.categories || []).slice(0, 2).map(c => (
              <span key={c} style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.67rem",
                fontWeight: 600, background: "#fff0f0", color: "#c0152a" }}>
                {c}
              </span>
            ))}
          </div>
        )}

        {}
        {flagEntry.assignedStrategistName && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700,
            background: "#ede9fe", color: "#5b21b6", marginBottom: 4 }}>
            <IconUsers size={11} />
            Envoyé à {flagEntry.assignedStrategistName}
          </div>
        )}
      </div>

      {}
      <div style={{ borderTop: "1px solid var(--d-border-soft)",
        padding: "12px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 8, background: "#fafafa",
        position: "relative" }}>

        <div style={{ flex: 1, minWidth: 0 }}>
          {}
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--d-ink-soft)" }}>
            {post.compensationType === "benefits"
              ? "Avantages uniquement"
              : post.budget?.min || post.budget?.max
                ? `${(post.budget.min || 0).toLocaleString()} – ${(post.budget.max || 0).toLocaleString()} DZD`
                : "Budget ouvert"}
          </div>
          {}
          <div style={{ display: "flex", alignItems: "center", gap: 5,
            marginTop: 4, fontSize: "0.7rem", color: "var(--d-muted)" }}>
            <IconFlag size={11} />
            <span>
              Signalé par <strong style={{ color: "var(--d-ink-soft)" }}>
                {flagEntry.flaggedByName || "Commercial"}
              </strong>
              {flagEntry.note && (
                <span style={{ fontStyle: "italic", marginLeft: 4 }}>
                  · {flagEntry.note}
                </span>
              )}
            </span>
          </div>
        </div>

        {}
        <div style={{ display: "flex", gap: 6, flexShrink: 0, position: "relative" }}>

          {}
          {!isPitched && onSendToStrategist && (
            <div style={{ position: "relative" }}>
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                disabled={sending}
                onClick={() => setShowSelector(s => !s)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "8px 12px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700,
                  background: "#ede9fe", color: "#5b21b6",
                  border: "1.5px solid #c4b5fd", cursor: sending ? "not-allowed" : "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap",
                  opacity: sending ? 0.6 : 1,
                }}>
                <IconUsers size={12} />
                {sending ? "…" : flagEntry.assignedStrategistName ? "Réassigner" : "Stratège"}
              </motion.button>

              <AnimatePresence>
                {showSelector && (
                  <StrategistSelector
                    members={members}
                    onSelect={handleSelectStrategist}
                    onCancel={() => setShowSelector(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          {}
          {isPitched ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700,
              background: "#d1fae5", color: "#065f46", whiteSpace: "nowrap" }}>
              ✓ Pitché
            </span>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => onPitch({ post, flagEntry })}
              style={{ display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 8, fontSize: "0.78rem", fontWeight: 700,
                background: "var(--d-accent)", color: "#fff", border: "none",
                cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              <IconSend size={13} />
              Pitcher
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};


const DirectorFlaggedPosts = ({
  user, onPitch, flaggedPosts = [], loading, onRefresh,
  onSendToStrategist, members = [],
}) => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const validPosts = flaggedPosts.filter(f => f.post);

  const totalCount   = validPosts.length;
  const pendingCount = validPosts.filter(f => !f.pitched).length;
  const pitchedCount = validPosts.filter(f =>  f.pitched).length;

  const filtered = validPosts.filter(f => {
    if (filter === "pending" && f.pitched)  return false;
    if (filter === "pitched" && !f.pitched) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return f.post?.title?.toLowerCase().includes(q) ||
             f.flaggedByName?.toLowerCase().includes(q);
    }
    return true;
  });

  const FILTERS = [
    { key: "all",     label: "Tous",           count: totalCount   },
    { key: "pending", label: "En attente",      count: pendingCount },
    { key: "pitched", label: "Déjà pitchés",    count: pitchedCount },
  ];

  return (
    <div>
      {}
      <div className="section-header" style={{ marginBottom: 8 }}>
        <div className="section-header-left">
          <h2>Posts flaggés</h2>
          <p style={{ color: "var(--d-muted)" }}>
            Signalés par votre équipe commerciale — pitchez ou envoyez à un stratège
          </p>
        </div>
      </div>

      {}
      {!loading && totalCount > 0 && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: "0.75rem",
            fontWeight: 700, background: "#f3f4f6", color: "#374151" }}>
            {totalCount} post{totalCount !== 1 ? "s" : ""} signalé{totalCount !== 1 ? "s" : ""}
          </span>
          {pendingCount > 0 && (
            <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: "0.75rem",
              fontWeight: 700, background: "#fff0f0", color: "#c0152a" }}>
              {pendingCount} en attente
            </span>
          )}
          {pitchedCount > 0 && (
            <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: "0.75rem",
              fontWeight: 700, background: "#d1fae5", color: "#065f46" }}>
              {pitchedCount} pitché{pitchedCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {}
      {!loading && totalCount > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 10,
          marginBottom: 20, flexWrap: "wrap" }}>
          <div className="filters-bar" style={{ margin: 0 }}>
            {FILTERS.map(f => (
              <button key={f.key}
                className={`filter-btn${filter === f.key ? " active" : ""}`}
                onClick={() => setFilter(f.key)}>
                {f.label}
                {f.count > 0 && (
                  <span style={{ marginLeft: 5, padding: "1px 6px", borderRadius: 10,
                    fontSize: "0.65rem", fontWeight: 800,
                    background: filter === f.key ? "rgba(255,255,255,0.25)" : "#f0e0e0",
                    color: filter === f.key ? "#fff" : "#9a6060" }}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ position: "relative", flex: 1, minWidth: 180, maxWidth: 320 }}>
            <IconSearch size={14} style={{ position: "absolute", left: 11, top: "50%",
              transform: "translateY(-50%)", color: "var(--d-muted)" }} />
            <input
              className="dash-form-input"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32, margin: 0 }}
            />
          </div>
        </div>
      )}

      {}
      {loading ? (
        <div className="spinner-wrap" style={{ padding: 80 }}>
          <div className="spinner" />
        </div>
      ) : totalCount === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "72px 24px" }}>
            <div className="empty-state-icon"><IconFlag size={22} /></div>
            <div className="empty-state-title">Aucun post signalé</div>
            <div className="empty-state-desc">
              Vos commerciaux n'ont pas encore signalé de posts depuis "Parcourir posts".
            </div>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon"><IconSearch size={20} /></div>
            <div className="empty-state-title">Aucun résultat</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          <AnimatePresence>
            {filtered.map((f, i) => (
              <FlaggedCard
                key={f._id || i}
                flagEntry={f}
                index={i}
                onPitch={onPitch}
                onSendToStrategist={onSendToStrategist}
                members={members}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default DirectorFlaggedPosts;
