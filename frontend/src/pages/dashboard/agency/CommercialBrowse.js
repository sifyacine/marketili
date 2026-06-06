
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PostCard } from "./shared";
import { usePosts } from "../../../hooks/usePosts";
import projectService from "../../../services/projectService";
import uploadService from "../../../services/uploadService";
import { IconSearch } from "../../../components/ui/Icons";
import BrowseBanner  from "../../../components/ui/BrowseBanner";

const COLLAB_LABELS = {
  service: "Service", partnership: "Partenariat", sponsorship: "Sponsoring", exposure: "Exposition",
};

const PostDetailModal = ({ post, onClose }) => {
  if (!post) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "28px 28px 24px",
        width: "100%", maxWidth: 640, maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{post.title}</div>
            <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 2 }}>
              {post.pitchCount || 0} offre{post.pitchCount !== 1 ? "s" : ""}
              {post.deadline && ` · Échéance : ${new Date(post.deadline).toLocaleDateString("fr-DZ")}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
            fontSize: "1.1rem", color: "#999", padding: "2px 6px" }}>✕</button>
        </div>

        {post.media?.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#c0152a",
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Médias</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {post.media.map((m, i) => (
                (m.mimeType?.startsWith("image/") || /\.(jpe?g|png|gif|webp|svg|bmp)$/i.test(m.filename || "")) ? (
                  <img key={i} src={uploadService.resolveUrl(m.url)} alt={m.filename}
                    onError={e => { e.target.style.display = "none"; }}
                    style={{ width: 120, height: 90, objectFit: "cover",
                      borderRadius: 8, border: "1px solid #eee" }} />
                ) : (
                  <a key={i} href={uploadService.resolveUrl(m.url)} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 12px", borderRadius: 8, border: "1px solid #eee",
                      background: "#f8f8f8", fontSize: "0.8rem", color: "#444",
                      textDecoration: "none" }}>
                    🎬 {m.filename?.split("-").slice(1).join("-") || m.filename}
                  </a>
                )
              ))}
            </div>
          </div>
        )}

        {post.description && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#c0152a",
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Description</div>
            <p style={{ fontSize: "0.88rem", color: "#333", lineHeight: 1.65, margin: 0 }}>{post.description}</p>
          </div>
        )}

        {post.objectives && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: "0.78rem", color: "#c0152a",
              textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>Objectifs</div>
            <p style={{ fontSize: "0.85rem", color: "#555", lineHeight: 1.6, margin: 0 }}>{post.objectives}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          {(post.budget?.min || post.budget?.max) && (
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "#f8f8f8",
              border: "1px solid #eee", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "#c0152a" }}>
                {post.compensationType === "benefits"
                  ? "Avantages"
                  : `${(post.budget.min||0).toLocaleString()}–${(post.budget.max||0).toLocaleString()} ${post.budget.currency||"DZD"}`}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#888" }}>Budget</div>
            </div>
          )}
          {post.location?.region && (
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "#f8f8f8",
              border: "1px solid #eee", textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: "1rem" }}>{post.location.region}</div>
              <div style={{ fontSize: "0.7rem", color: "#888" }}>Wilaya</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {post.marketingType && (
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
              fontWeight: 600, background: "#f3f4f6", color: "#374151" }}>{post.marketingType}</span>
          )}
          {post.collaborationType && (
            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
              fontWeight: 600, background: "#ede9fe", color: "#5b21b6" }}>
              {COLLAB_LABELS[post.collaborationType] || post.collaborationType}
            </span>
          )}
          {(post.categories || []).map(c => (
            <span key={c} style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem",
              fontWeight: 600, background: "#fff0f0", color: "#c0152a" }}>{c}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const MARKETING_TYPES = [
  { value: "",               label: "Tous les types"    },
  { value: "Events",         label: "Événements"        },
  { value: "360 Marketing",  label: "360 Marketing"     },
  { value: "ATL",            label: "ATL"               },
  { value: "BTL",            label: "BTL"               },
  { value: "Production",     label: "Production"        },
  { value: "Brand Marketing",label: "Brand Marketing"   },
];

const STATUS_OPTIONS = [
  { value: "open",        label: "Ouvert"       },
  { value: "in_progress", label: "En cours"     },
  { value: "reactivated", label: "Réactivé"     },
  { value: "all",         label: "Tous statuts" },
];

const CommercialBrowse = ({ user }) => {
  const { posts, loading, applyFilters, filters } = usePosts({ status: "open", limit: 12 });

  const [search,       setSearch]       = useState("");
  const [category,     setCategory]     = useState("");
  const [region,       setRegion]       = useState("");
  const [marketingType,setMarketingType]= useState("");
  const [status,       setStatus]       = useState("open");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [showFilters,  setShowFilters]  = useState(false);

  const [flagging,     setFlagging]     = useState(null);
  const [note,         setNote]         = useState("");
  const [saving,       setSaving]       = useState(false);
  const [flagged,      setFlagged]      = useState(new Set());
  const [detailPost,   setDetailPost]   = useState(null);

  const handleApply = () => {
    applyFilters({
      search:        search || undefined,
      category:      category || undefined,
      region:        region || undefined,
      marketingType: marketingType || undefined,
      status:        status || "open",
      dateFrom:      dateFrom || undefined,
      dateTo:        dateTo || undefined,
    });
  };

  const handleReset = () => {
    setSearch(""); setCategory(""); setRegion("");
    setMarketingType(""); setStatus("open");
    setDateFrom(""); setDateTo("");
    applyFilters({ status: "open" });
  };

  const handleFlag = async (post) => {
    setSaving(true);
    try {
      await projectService.flagPost(
        user.agency, post._id, user._id,
        `${user.firstName} ${user.lastName}`, note
      );
      setFlagged(prev => new Set([...prev, post._id]));
      setFlagging(null);
      setNote("");
    } catch {}
    finally { setSaving(false); }
  };

  const activeFilterCount = [category, region, marketingType, dateFrom, dateTo]
    .filter(Boolean).length;

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Parcourir les posts</h2>
          <p>Signalez les opportunités au directeur</p>
        </div>
      </div>

      <BrowseBanner />

      {}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input className="dash-form-input" placeholder="Rechercher..."
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleApply()}
          style={{ flex: 1, minWidth: 180 }} />
        <button className="section-cta-btn" onClick={handleApply}>
          Rechercher
        </button>
        <button
          onClick={() => setShowFilters(o => !o)}
          style={{ padding: "8px 14px", borderRadius: 8, fontFamily: "inherit",
            fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
            border: showFilters ? "2px solid #c0152a" : "1.5px solid var(--d-border-soft)",
            background: showFilters ? "#fff0f0" : "transparent",
            color: showFilters ? "#c0152a" : "var(--d-muted)",
            transition: "all 0.15s" }}>
          Filtres {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

      {}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div className="dash-form-group" style={{ flex: "1 1 160px" }}>
                  <label className="dash-form-label">Catégorie</label>
                  <input className="dash-form-input" value={category}
                    placeholder="Social Media, SEO..."
                    onChange={e => setCategory(e.target.value)} />
                </div>
                <div className="dash-form-group" style={{ flex: "1 1 140px" }}>
                  <label className="dash-form-label">Wilaya</label>
                  <input className="dash-form-input" value={region}
                    placeholder="Alger, Oran..."
                    onChange={e => setRegion(e.target.value)} />
                </div>
                <div className="dash-form-group" style={{ flex: "1 1 160px" }}>
                  <label className="dash-form-label">Type marketing</label>
                  <select className="dash-form-select" value={marketingType}
                    onChange={e => setMarketingType(e.target.value)}>
                    {MARKETING_TYPES.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="dash-form-group" style={{ flex: "1 1 140px" }}>
                  <label className="dash-form-label">Statut</label>
                  <select className="dash-form-select" value={status}
                    onChange={e => setStatus(e.target.value)}>
                    {STATUS_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="dash-form-group" style={{ flex: "1 1 140px" }}>
                  <label className="dash-form-label">Échéance de</label>
                  <input className="dash-form-input" type="date" value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="dash-form-group" style={{ flex: "1 1 140px" }}>
                  <label className="dash-form-label">Échéance à</label>
                  <input className="dash-form-input" type="date" value={dateTo}
                    onChange={e => setDateTo(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="section-cta-btn"
                  style={{ fontSize: "0.8rem", padding: "7px 14px" }}
                  onClick={handleApply}>
                  Appliquer
                </button>
                <button onClick={handleReset}
                  style={{ padding: "7px 14px", borderRadius: 8, fontSize: "0.8rem",
                    fontFamily: "inherit", fontWeight: 600, cursor: "pointer",
                    border: "1.5px solid var(--d-border-soft)", background: "none",
                    color: "var(--d-muted)" }}>
                  Réinitialiser
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {detailPost && (
        <PostDetailModal post={detailPost} onClose={() => setDetailPost(null)} />
      )}

      {}
      {loading ? (
        <div className="spinner-wrap" style={{ padding: 60 }}><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon"><IconSearch size={20} /></div>
            <div className="empty-state-title">Aucun post trouvé</div>
            <div className="empty-state-desc">Essayez de modifier vos filtres.</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: 16 }}>
          {posts.map((post, i) => (
            <div key={post._id} style={{ position: "relative" }}>
              <button
                onClick={() => setDetailPost(post)}
                style={{ position: "absolute", top: 10, right: 10, zIndex: 2,
                  padding: "4px 10px", borderRadius: 6, border: "1px solid #ddd",
                  background: "#fff", cursor: "pointer", fontSize: "0.72rem",
                  color: "#555", fontFamily: "inherit", fontWeight: 600 }}>
                Voir détail
              </button>
              <PostCard post={post} index={i}
                actionLabel={flagged.has(post._id) ? "✓ Signalé" : "Signaler au directeur"}
                actionColor={flagged.has(post._id) ? "#10b981" : "#f59e0b"}
                onAction={() => !flagged.has(post._id) && setFlagging(post)} />
            </div>
          ))}
        </div>
      )}

      {}
      <AnimatePresence>
        {flagging && (
          <motion.div className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={e => e.target === e.currentTarget && setFlagging(null)}>
            <motion.div className="modal-box"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}>
              <div className="modal-header">
                <div className="modal-title">Signaler au directeur</div>
                <button className="modal-close" onClick={() => setFlagging(null)}>✕</button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: 16, padding: "12px 14px",
                  background: "#fffbfb", border: "1px solid #faeaea", borderRadius: 10,
                  fontSize: "0.87rem", fontWeight: 600, color: "#1a0a0a" }}>
                  {flagging.title}
                </div>
                <div className="dash-form-group">
                  <label className="dash-form-label">Note pour le directeur (optionnel)</label>
                  <textarea className="dash-form-textarea" rows={3}
                    placeholder="Pourquoi ce post est intéressant..."
                    value={note} onChange={e => setNote(e.target.value)} />
                </div>
                <button className="dash-form-submit" style={{ marginTop: 16, width: "100%" }}
                  disabled={saving} onClick={() => handleFlag(flagging)}>
                  {saving ? "Envoi..." : "Signaler"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommercialBrowse;
