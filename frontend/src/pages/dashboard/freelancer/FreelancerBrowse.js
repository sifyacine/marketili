import React, { useState } from "react";
import { usePosts } from "../../../hooks/usePosts";
import { PostCard } from "../agency/shared";
import { IconSearch, IconCompass } from "../../../components/ui/Icons";

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
  const [search, setSearch]     = useState("");
  const [mType,  setMType]      = useState("Tout");
  const [compType, setCompType] = useState("");
  const [region, setRegion]     = useState("");

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: 16 }}>
          {posts.map((post, i) => (
            <PostCard
              key={post._id}
              post={post}
              index={i}
              actionLabel="Envoyer une offre"
              onAction={() => onPitch({ post })}
            />
          ))}
        </div>
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
