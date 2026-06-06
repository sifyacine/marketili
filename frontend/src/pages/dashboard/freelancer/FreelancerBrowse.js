import React, { useState } from "react";
import { usePosts } from "../../../hooks/usePosts";
import { PostCard } from "../agency/shared";
import uploadService from "../../../services/uploadService";
import { IconSearch, IconCompass } from "../../../components/ui/Icons";

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
                    style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
                ) : (
                  <a key={i} href={uploadService.resolveUrl(m.url)} target="_blank" rel="noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px",
                      borderRadius: 8, border: "1px solid #eee", background: "#f8f8f8",
                      fontSize: "0.8rem", color: "#444", textDecoration: "none" }}>
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
  "Tout", "Social Media", "SEO/SEM", "Email Marketing",
  "Contenu", "Influenceur", "Publicité", "Autre",
];

const COMP_TYPES = [
  { v: "", l: "Toute rémunération" },
  { v: "paid", l: "Rémunéré" },
  { v: "barter", l: "Troc" },
  { v: "exposure", l: "Exposition" },
];

const FreelancerBrowse = ({ onPitch }) => {
  const { posts, loading, applyFilters } = usePosts({ status: "open", limit: 15 });
  const [search,     setSearch]     = useState("");
  const [mType,      setMType]      = useState("Tout");
  const [compType,   setCompType]   = useState("");
  const [region,     setRegion]     = useState("");
  const [detailPost, setDetailPost] = useState(null);

  const handleSearch = () => {
    applyFilters({
      search: search || undefined,
      marketingType: mType !== "Tout" ? mType : undefined,
      compensationType: compType || undefined,
      region: region || undefined,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Explorer les opportunités</h2>
          <p style={{ color: "var(--d-muted)" }}>
            Parcourez les posts ouverts et proposez vos services
          </p>
        </div>
      </div>

      {}
      <div className="card" style={{ padding: "16px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <input
              className="dash-form-input"
              placeholder="Rechercher un post..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ paddingLeft: 36 }}
            />
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              color: "#bbb", pointerEvents: "none" }}>
              <IconSearch size={14} />
            </span>
          </div>
          <select
            className="dash-form-input"
            value={compType}
            onChange={e => setCompType(e.target.value)}
            style={{ flex: "0 0 180px" }}>
            {COMP_TYPES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
          <input
            className="dash-form-input"
            placeholder="Wilaya..."
            value={region}
            onChange={e => setRegion(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: "0 0 140px" }}
          />
          <button className="section-cta-btn" onClick={handleSearch}>
            Rechercher
          </button>
        </div>

        {}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {MARKETING_TYPES.map(t => (
            <button
              key={t}
              onClick={() => { setMType(t); applyFilters({ marketingType: t !== "Tout" ? t : undefined }); }}
              style={{
                padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600,
                cursor: "pointer", border: "none",
                background: mType === t ? "#7c3aed" : "#f3f4f6",
                color: mType === t ? "#fff" : "#555",
                transition: "background 0.15s, color 0.15s",
              }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap" style={{ padding: 80 }}><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon"><IconCompass size={22} /></div>
            <div className="empty-state-title">Aucun post trouvé</div>
            <div className="empty-state-sub">Modifiez vos filtres pour voir plus de résultats</div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: 16 }}>
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
                <PostCard
                  post={post}
                  index={i}
                  actionLabel="Envoyer une offre"
                  onAction={() => onPitch({ post })}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {detailPost && (
        <PostDetailModal post={detailPost} onClose={() => setDetailPost(null)} />
      )}

      {!loading && posts.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            className="section-cta-btn"
            style={{ background: "none", border: "1px solid #ddd", color: "#555" }}
            onClick={() => applyFilters({ limit: (posts.length || 15) + 15 })}>
            Charger plus
          </button>
        </div>
      )}
    </div>
  );
};

export default FreelancerBrowse;
