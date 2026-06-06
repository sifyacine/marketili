import React, { useState } from "react";
import { motion } from "framer-motion";
import { usePosts } from "../../hooks/usePosts";
import uploadService from "../../services/uploadService";
import { getDeadlineColor, getDeadlineLabel } from "../../utils/deadlineColor";
import { IconSearch, IconCompass, IconFilter, IconMapPin } from "../../components/ui/Icons";
import BrowseBanner from "../../components/ui/BrowseBanner";

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
  { value: "", label: "Tout type" },
  { value: "Events",          label: "Événementiel" },
  { value: "360 Marketing",   label: "Marketing 360°" },
  { value: "ATL",             label: "ATL" },
  { value: "BTL",             label: "BTL" },
  { value: "Production",      label: "Production" },
  { value: "Brand Marketing", label: "Brand Marketing" },
];

const COLLAB_TYPES = [
  { value: "",            label: "Toutes" },
  { value: "service",     label: "Service" },
  { value: "partnership", label: "Partenariat" },
  { value: "sponsorship", label: "Sponsoring" },
  { value: "exposure",    label: "Exposition" },
];

const STATUS_TABS = [
  { value: "open",        label: "Ouverts",   color: "#10b981" },
  { value: "in_progress", label: "En cours",  color: "#f59e0b" },
  { value: "reactivated", label: "Réactivés", color: "#3b82f6" },
  { value: "closed",      label: "Fermés",    color: "#6b7280" },
];

const STATUS_LABELS = {
  open:        { label: "Ouvert",   color: "#10b981" },
  in_progress: { label: "En cours", color: "#f59e0b" },
  closed:      { label: "Fermé",    color: "#6b7280" },
  reactivated: { label: "Réactivé", color: "#3b82f6" },
};

const COLLAB_FR = {
  service: "Service", partnership: "Partenariat",
  sponsorship: "Sponsoring", exposure: "Exposition",
};

const COMP_FR = {
  monetary: "Monétaire", benefits: "Avantages", mixed: "Mixte",
};

const ClientBrowse = () => {
  const [search,    setSearch]    = useState("");
  const [mktType,   setMktType]   = useState("");
  const [collab,    setCollab]    = useState("");
  const [region,    setRegion]    = useState("");
  const [status,    setStatus]    = useState("open");
  const [selected,  setSelected]  = useState(null);

  const { posts, pagination, loading, error, applyFilters, nextPage, prevPage } = usePosts({
    status: "open",
    sort:   "deadline",
    order:  "asc",
    limit:  12,
  });

  const doSearch = () => {
    applyFilters({
      search:            search || undefined,
      marketingType:     mktType || undefined,
      collaborationType: collab  || undefined,
      region:            region  || undefined,
      status:            status  || "open",
    });
  };

  const doReset = () => {
    setSearch(""); setMktType(""); setCollab(""); setRegion(""); setStatus("open");
    applyFilters({ search: undefined, marketingType: undefined,
      collaborationType: undefined, region: undefined, status: "open" });
  };

  const handleStatusTab = (v) => {
    setStatus(v);
    applyFilters({
      search:            search || undefined,
      marketingType:     mktType || undefined,
      collaborationType: collab  || undefined,
      region:            region  || undefined,
      status:            v,
    });
  };

  if (selected) return <PostDetail post={selected} onBack={() => setSelected(null)} />;

  return (
    <div>
      {}
      <div className="section-header">
        <div className="section-header-left">
          <h2>Explorer les posts</h2>
          <p>Découvrez les briefs publiés sur la plateforme</p>
        </div>
        {pagination && (
          <span style={{ fontSize: "0.78rem", color: "var(--d-muted)", fontWeight: 500 }}>
            {pagination.total} post{pagination.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <BrowseBanner />

      {}
      <div className="card" style={{ marginBottom: 20, overflow: "visible" }}>
        {}
        <div style={{
          display: "flex", gap: 0, borderBottom: "1px solid var(--d-border-soft)",
          overflow: "hidden",
        }}>
          {STATUS_TABS.map(t => (
            <button key={t.value} onClick={() => handleStatusTab(t.value)} style={{
              flex: 1, padding: "12px 8px",
              border: "none", background: "none",
              fontFamily: "inherit", cursor: "pointer",
              fontSize: "0.8rem", fontWeight: status === t.value ? 700 : 500,
              color:  status === t.value ? t.color : "var(--d-muted)",
              borderBottom: status === t.value ? `2px solid ${t.color}` : "2px solid transparent",
              transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                background: status === t.value ? t.color : "transparent",
                border: `1.5px solid ${t.color}`,
              }} />
              {t.label}
            </button>
          ))}
        </div>

        {}
        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {}
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
              color: "var(--d-muted)", pointerEvents: "none", display: "flex",
            }}>
              <IconSearch size={14} />
            </span>
            <input className="dash-form-input"
              style={{ paddingLeft: 34, width: "100%" }}
              placeholder="Rechercher par titre ou description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
            />
          </div>

          {}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 10 }}>
            <select className="dash-form-select" value={mktType}
              onChange={e => setMktType(e.target.value)}>
              {MARKETING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <select className="dash-form-select" value={collab}
              onChange={e => setCollab(e.target.value)}>
              {COLLAB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <select className="dash-form-select" value={region}
              onChange={e => setRegion(e.target.value)}>
              <option value="">Toute l'Algérie</option>
              {WILAYAT.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            <button type="button" className="section-cta-btn" onClick={doSearch}
              style={{ whiteSpace: "nowrap" }}>
              <IconFilter size={13} /> Filtrer
            </button>

            <button type="button" onClick={doReset} style={{
              padding: "0 14px", borderRadius: 8, border: "1.5px solid var(--d-border)",
              background: "var(--d-bg)", color: "var(--d-muted)", fontSize: "0.82rem",
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            }}>
              Réinit.
            </button>
          </div>
        </div>
      </div>

      {}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : error ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-title">Erreur de chargement</div>
            <div className="empty-state-desc">{error}</div>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconCompass size={20} /></div>
            <div className="empty-state-title">Aucun post trouvé</div>
            <div className="empty-state-desc">Ajustez les filtres ou revenez plus tard.</div>
          </div>
        </div>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 14, marginBottom: 22,
          }}>
            {posts.map((post, i) => (
              <BrowseCard key={post._id} post={post} index={i}
                onClick={() => setSelected(post)} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center",
              alignItems: "center", gap: 12 }}>
              <button onClick={prevPage} disabled={!pagination.hasPrev}
                className="pagination-btn">Précédent</button>
              <span style={{ fontSize: "0.8rem", color: "var(--d-muted)" }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button onClick={nextPage} disabled={!pagination.hasNext}
                className="pagination-btn">Suivant</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};


const BrowseCard = ({ post, index, onClick }) => {
  const dlColor  = getDeadlineColor(post.deadline);
  const dlLabel  = getDeadlineLabel(post.deadline);
  const sMeta    = STATUS_LABELS[post.status] || { label: post.status, color: "#6b7280" };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035 }}
      onClick={onClick}
      style={{ cursor: "pointer", borderLeft: `3px solid ${dlColor}` }}
      onMouseEnter={e => Object.assign(e.currentTarget.style, {
        transform: "translateY(-2px)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.09)",
      })}
      onMouseLeave={e => Object.assign(e.currentTarget.style, {
        transform: "",
        boxShadow: "",
      })}
    >
      <div style={{ padding: "16px 18px" }}>
        {}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 10 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: "0.69rem", fontWeight: 600,
            color: sMeta.color, background: sMeta.color + "18",
            padding: "3px 9px", borderRadius: 20,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%",
              background: sMeta.color, display: "inline-block" }} />
            {sMeta.label}
          </span>
          <span style={{ fontSize: "0.71rem", fontWeight: 700, color: dlColor }}>
            {dlLabel}
          </span>
        </div>

        {}
        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--d-ink)",
          marginBottom: 5, lineHeight: 1.3 }}>
          {post.title}
        </div>

        {}
        <div style={{ fontSize: "0.78rem", color: "var(--d-ink-muted)", lineHeight: 1.55,
          marginBottom: 12, overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {post.description}
        </div>

        {}
        {post.media?.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
            {post.media.slice(0, 3).map((m, i) => (
              (m.mimeType?.startsWith("image/") || /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(m.filename || "")) ? (
                <img key={i} src={uploadService.resolveUrl(m.url)} alt={m.filename}
                  onError={e => { e.target.style.display = "none"; }}
                  style={{ width: 64, height: 48, objectFit: "cover",
                    borderRadius: 6, border: "1px solid #f0dede", flexShrink: 0 }} />
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
          {post.marketingType && (
            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "0.67rem",
              fontWeight: 600, background: "#f3f4f6", color: "#374151" }}>
              {post.marketingType}
            </span>
          )}
          {post.collaborationType && (
            <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: "0.67rem",
              fontWeight: 600, background: "#ede9fe", color: "#5b21b6" }}>
              {COLLAB_FR[post.collaborationType] || post.collaborationType}
            </span>
          )}
          {(post.categories || []).slice(0, 2).map(c => (
            <span key={c} style={{ padding: "2px 8px", borderRadius: 20, fontSize: "0.67rem",
              fontWeight: 600, background: "#fff0f0", color: "#c0152a" }}>{c}</span>
          ))}
        </div>

        {}
        <div style={{ display: "flex", alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 11, borderTop: "1px solid var(--d-border-soft)",
          gap: 8 }}>
          <div style={{ fontSize: "0.73rem", color: "var(--d-muted)" }}>
            {post.compensationType === "benefits"
              ? "Avantages uniquement"
              : post.budget?.min || post.budget?.max
                ? `${(post.budget.min || 0).toLocaleString()}–${(post.budget.max || 0).toLocaleString()} DZD`
                : "Budget ouvert"}
          </div>
          {post.location?.region && (
            <div style={{ display: "flex", alignItems: "center", gap: 3,
              fontSize: "0.71rem", color: "var(--d-muted)" }}>
              <IconMapPin size={11} />
              {post.location.region}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};


const PostDetail = ({ post, onBack }) => {
  const dlColor = getDeadlineColor(post.deadline);
  const dlLabel = getDeadlineLabel(post.deadline);
  const sMeta   = STATUS_LABELS[post.status] || { label: post.status, color: "#6b7280" };

  const facts = [
    { label: "Statut",                 value: sMeta.label },
    { label: "Type de marketing",      value: post.marketingType },
    { label: "Type de collaboration",  value: COLLAB_FR[post.collaborationType] },
    { label: "Compensation",           value: COMP_FR[post.compensationType] },
    { label: "Wilaya",                  value: post.location?.region },
    { label: "Date limite",            value: post.deadline
        ? new Date(post.deadline).toLocaleDateString("fr-DZ") : null },
    { label: "Budget",                 value: post.budget?.min || post.budget?.max
        ? `${(post.budget.min || 0).toLocaleString()}–${(post.budget.max || 0).toLocaleString()} DZD`
        : post.compensationType === "benefits" ? "Non monétaire" : null },
  ].filter(f => f.value);

  return (
    <div>
      {}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          background: "none", border: "1.5px solid var(--d-border)", borderRadius: 7,
          padding: "6px 14px", cursor: "pointer", fontSize: "0.8rem",
          color: "var(--d-muted)", fontFamily: "inherit", fontWeight: 600,
          transition: "border-color 0.13s",
        }}>
          Retour
        </button>
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--d-ink)" }}>
            {post.title}
          </h2>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: dlColor }}>{dlLabel}</span>
        </div>
      </div>

      {}
      <div className="card" style={{ padding: "20px 22px", marginBottom: 14 }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--d-muted)",
          textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Description
        </div>
        <p style={{ fontSize: "0.86rem", color: "var(--d-ink)", lineHeight: 1.7 }}>
          {post.description}
        </p>
      </div>

      {}
      <div style={{ display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(190px,1fr))",
        gap: 10, marginBottom: 14 }}>
        {facts.map(({ label, value }) => (
          <div key={label} style={{
            background: "var(--d-bg)", borderRadius: 9, padding: "11px 14px",
            border: "1px solid var(--d-border-soft)",
          }}>
            <div style={{ fontSize: "0.66rem", fontWeight: 700, color: "var(--d-muted)",
              textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ fontSize: "0.84rem", color: "var(--d-ink)", fontWeight: 600 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {}
      {post.benefits && (
        <div className="card" style={{ padding: "18px 22px", marginBottom: 14 }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--d-muted)",
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Avantages proposés
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--d-ink)", lineHeight: 1.65 }}>
            {post.benefits}
          </p>
        </div>
      )}

      {}
      {post.requiredSkills?.length > 0 && (
        <div className="card" style={{ padding: "18px 22px" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--d-muted)",
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Compétences requises
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {post.requiredSkills.map(s => (
              <span key={s} style={{
                padding: "4px 12px", borderRadius: 20, fontSize: "0.77rem",
                fontWeight: 600, background: "#fff0f0", color: "#c0152a",
                border: "1px solid #f0dede",
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBrowse;
