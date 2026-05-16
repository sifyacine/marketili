import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePosts } from "../../hooks/usePosts";
import { getDeadlineColor, getDeadlineLabel } from "../../utils/deadlineColor";

const WILAYAT = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra",
  "Béchar","Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret",
  "Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda","Skikda",
  "Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem",
  "M'Sila","Mascara","Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arréridj",
  "Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela",
  "Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent",
  "Ghardaïa","Relizane",
];

const MARKETING_TYPES = [
  { value: "", label: "Tous les types" },
  { value: "Events",         label: "Événementiel" },
  { value: "360 Marketing",  label: "Marketing 360°" },
  { value: "ATL",            label: "ATL" },
  { value: "BTL",            label: "BTL" },
  { value: "Production",     label: "Production" },
  { value: "Brand Marketing",label: "Brand Marketing" },
];

const COLLAB_TYPES = [
  { value: "",             label: "Toutes collaborations" },
  { value: "service",      label: "Service" },
  { value: "partnership",  label: "Partenariat" },
  { value: "sponsorship",  label: "Sponsoring" },
  { value: "exposure",     label: "Exposition" },
];

const STATUS_OPTS = [
  { value: "open",        label: "Ouvert" },
  { value: "in_progress", label: "En cours" },
  { value: "reactivated", label: "Réactivé" },
  { value: "closed",      label: "Fermé" },
];

const STATUS_LABELS = {
  open:        { label: "Ouvert",   color: "#10b981" },
  in_progress: { label: "En cours", color: "#f59e0b" },
  closed:      { label: "Fermé",    color: "#6b7280" },
  reactivated: { label: "Réactivé", color: "#3b82f6" },
};

const COLLAB_FR = {
  service:     "Service",
  partnership: "Partenariat",
  sponsorship: "Sponsoring",
  exposure:    "Exposition",
};

const COMP_FR = {
  monetary: "Monétaire",
  benefits: "Avantages",
  mixed:    "Mixte",
};

const ClientBrowse = () => {
  const [search,        setSearch]        = useState("");
  const [marketingType, setMarketingType] = useState("");
  const [collabType,    setCollabType]    = useState("");
  const [region,        setRegion]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState("open");
  const [selected,      setSelected]      = useState(null);

  const { posts, pagination, loading, error, applyFilters, nextPage, prevPage } = usePosts({
    status: "open",
    sort:   "deadline",
    order:  "asc",
    limit:  12,
  });

  const handleSearch = () => {
    applyFilters({
      search:        search || undefined,
      marketingType: marketingType || undefined,
      collaborationType: collabType || undefined,
      region:        region || undefined,
      status:        statusFilter || "open",
    });
  };

  const handleReset = () => {
    setSearch(""); setMarketingType(""); setCollabType(""); setRegion(""); setStatusFilter("open");
    applyFilters({ search: undefined, marketingType: undefined, collaborationType: undefined,
      region: undefined, status: "open" });
  };

  if (selected) {
    return <PostDetail post={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Explorer les posts</h2>
          <p>Découvrez les briefs publiés sur la plateforme</p>
        </div>
      </div>

      {/* ── Filter panel ── */}
      <div className="card" style={{ padding: "18px 22px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          {/* Search */}
          <div style={{ gridColumn: "1 / -1" }}>
            <input className="dash-form-input"
              placeholder="Rechercher un post (titre, description)..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              style={{ width: "100%" }} />
          </div>

          {/* Status pills */}
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {STATUS_OPTS.map(o => {
              const isActive = statusFilter === o.value;
              const meta = STATUS_LABELS[o.value];
              return (
                <button key={o.value} type="button"
                  onClick={() => setStatusFilter(o.value)}
                  style={{
                    padding: "5px 14px", borderRadius: 20, fontSize: "0.77rem",
                    fontWeight: 700, border: "1.5px solid", cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                    borderColor: isActive ? meta.color : "#f0dede",
                    background:  isActive ? meta.color + "22" : "white",
                    color:       isActive ? meta.color : "#9a6060",
                  }}>
                  {o.label}
                </button>
              );
            })}
          </div>

          {/* Marketing type */}
          <select className="dash-form-select" value={marketingType}
            onChange={e => setMarketingType(e.target.value)}>
            {MARKETING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {/* Collaboration type */}
          <select className="dash-form-select" value={collabType}
            onChange={e => setCollabType(e.target.value)}>
            {COLLAB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          {/* Wilaya */}
          <select className="dash-form-select" value={region}
            onChange={e => setRegion(e.target.value)}>
            <option value="">Toute l'Algérie</option>
            {WILAYAT.map(w => <option key={w} value={w}>{w}</option>)}
          </select>

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="section-cta-btn" style={{ flex: 1 }}
              onClick={handleSearch}>
              Rechercher
            </button>
            <button type="button" onClick={handleReset} style={{
              padding: "0 14px", borderRadius: 9, border: "1.5px solid #f0dede",
              background: "white", color: "#9a6060", fontSize: "0.82rem",
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
            }}>
              Réinitialiser
            </button>
          </div>
        </div>

        {pagination && (
          <div style={{ fontSize: "0.75rem", color: "#9a6060" }}>
            {pagination.total} post{pagination.total !== 1 ? "s" : ""} trouvé{pagination.total !== 1 ? "s" : ""}
            {pagination.totalPages > 1 && ` · Page ${pagination.page}/${pagination.totalPages}`}
          </div>
        )}
      </div>

      {/* ── Results ── */}
      {loading ? (
        <div className="spinner-wrap" style={{ padding: 60 }}><div className="spinner" /></div>
      ) : error ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "48px 24px" }}>
            <div className="empty-state-title">Erreur de chargement</div>
            <div className="empty-state-desc">{error}</div>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon">-</div>
            <div className="empty-state-title">Aucun post trouvé</div>
            <div className="empty-state-desc">Essayez d'autres filtres ou revenez plus tard.</div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: 16, marginBottom: 24 }}>
            {posts.map((post, i) => (
              <BrowsePostCard key={post._id} post={post} index={i} onClick={() => setSelected(post)} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
              <button onClick={prevPage} disabled={!pagination.hasPrev} style={paginBtn}>
                ← Précédent
              </button>
              <span style={{ fontSize: "0.82rem", color: "#9a6060" }}>
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <button onClick={nextPage} disabled={!pagination.hasNext} style={paginBtn}>
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Post card for browse view ─────────────────────────────────────────────────
const BrowsePostCard = ({ post, index, onClick }) => {
  const dlColor = getDeadlineColor(post.deadline);
  const dlLabel = getDeadlineLabel(post.deadline);
  const statusMeta = STATUS_LABELS[post.status] || { label: post.status, color: "#6b7280" };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={onClick}
      style={{
        cursor: "pointer",
        borderLeft: `3px solid ${dlColor}`,
        transition: "box-shadow 0.2s, transform 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(192,21,42,0.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ padding: "18px 20px" }}>
        {/* Row 1: status + deadline */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{
            padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700,
            background: statusMeta.color + "22", color: statusMeta.color,
          }}>{statusMeta.label}</span>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: dlColor }}>
            {dlLabel}
          </span>
        </div>

        {/* Title */}
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a", marginBottom: 6 }}>
          {post.title}
        </div>

        {/* Description excerpt */}
        <div style={{
          fontSize: "0.8rem", color: "#7a4a4a", lineHeight: 1.5, marginBottom: 12,
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {post.description}
        </div>

        {/* Tags: categories + marketingType */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {post.marketingType && (
            <span style={{
              padding: "2px 9px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 700,
              background: "#1a0a0a11", color: "#4a2a2a",
            }}>{post.marketingType}</span>
          )}
          {(post.categories || []).slice(0, 2).map(c => (
            <span key={c} style={{
              padding: "2px 9px", borderRadius: 20, fontSize: "0.68rem",
              fontWeight: 600, background: "#fff0f0", color: "#c0152a",
            }}>{c}</span>
          ))}
          {(post.categories || []).length > 2 && (
            <span style={{ fontSize: "0.68rem", color: "#9a6060" }}>
              +{post.categories.length - 2}
            </span>
          )}
        </div>

        {/* Footer: budget + collab + region */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 12, borderTop: "1px solid #faeaea", gap: 8, flexWrap: "wrap",
        }}>
          <div style={{ fontSize: "0.75rem", color: "#9a6060" }}>
            {post.compensationType === "benefits"
              ? "Avantages uniquement"
              : post.budget?.min || post.budget?.max
                ? `${post.budget.min?.toLocaleString() || "?"} – ${post.budget.max?.toLocaleString() || "?"} DZD`
                : "Budget ouvert"}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {post.collaborationType && (
              <span style={{
                fontSize: "0.68rem", fontWeight: 600, color: "#6366f1",
                background: "#6366f111", padding: "2px 8px", borderRadius: 20,
              }}>{COLLAB_FR[post.collaborationType] || post.collaborationType}</span>
            )}
            {post.location?.region && (
              <span style={{ fontSize: "0.73rem", color: "#9a6060" }}>
                {post.location.region}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Post detail (read-only for client browse) ─────────────────────────────────
const PostDetail = ({ post, onBack }) => {
  const dlColor = getDeadlineColor(post.deadline);
  const dlLabel = getDeadlineLabel(post.deadline);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          background: "none", border: "1.5px solid #f0dede", borderRadius: 8,
          padding: "6px 14px", cursor: "pointer", fontSize: "0.82rem",
          color: "#9a6060", fontFamily: "inherit", fontWeight: 600,
        }}>
          ← Retour
        </button>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a0a0a" }}>{post.title}</h2>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: dlColor }}>{dlLabel}</span>
        </div>
      </div>

      <div className="card" style={{ padding: "22px 24px", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
          Description
        </div>
        <p style={{ fontSize: "0.88rem", color: "#1a0a0a", lineHeight: 1.7 }}>{post.description}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Type de marketing",     value: post.marketingType },
          { label: "Type de collaboration", value: COLLAB_FR[post.collaborationType] || post.collaborationType },
          { label: "Compensation",          value: COMP_FR[post.compensationType] || post.compensationType },
          { label: "Région",                value: post.location?.region },
          { label: "Date limite",           value: post.deadline
            ? new Date(post.deadline).toLocaleDateString("fr-DZ") : null },
          { label: "Budget",                value: post.budget?.min || post.budget?.max
            ? `${post.budget.min?.toLocaleString() || "?"} – ${post.budget.max?.toLocaleString() || "?"} DZD`
            : post.compensationType === "benefits" ? "Non monétaire" : "Non défini" },
        ].filter(i => i.value).map(({ label, value }) => (
          <div key={label} style={{ background: "#fdf8f8", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#9a6060",
              textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#1a0a0a", fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      {post.benefits && (
        <div className="card" style={{ padding: "18px 22px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Avantages proposés
          </div>
          <p style={{ fontSize: "0.85rem", color: "#1a0a0a", lineHeight: 1.6 }}>{post.benefits}</p>
        </div>
      )}

      {post.requiredSkills?.length > 0 && (
        <div className="card" style={{ padding: "18px 22px", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
            Compétences requises
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {post.requiredSkills.map(skill => (
              <span key={skill} style={{
                padding: "4px 12px", borderRadius: 20, fontSize: "0.78rem",
                fontWeight: 600, background: "#fff0f0", color: "#c0152a",
                border: "1px solid #f0dede",
              }}>{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const paginBtn = {
  padding: "8px 18px", borderRadius: 9, border: "1.5px solid #f0dede",
  background: "white", color: "#4a2a2a", fontSize: "0.82rem", fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
};

export default ClientBrowse;
