// src/pages/dashboard/agency/CommercialBrowse.js
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PostCard } from "./shared";
import { usePosts } from "../../../hooks/usePosts";
import projectService from "../../../services/projectService";
import { IconSearch } from "../../../components/ui/Icons";
import BrowseBanner  from "../../../components/ui/BrowseBanner";

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

  const [flagging,  setFlagging]  = useState(null);
  const [note,      setNote]      = useState("");
  const [saving,    setSaving]    = useState(false);
  const [flagged,   setFlagged]   = useState(new Set());

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

      {/* Search + filter toggle row */}
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

      {/* Filter panel */}
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

      {/* Posts grid */}
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
            <PostCard key={post._id} post={post} index={i}
              actionLabel={flagged.has(post._id) ? "✓ Signalé" : "Signaler au directeur"}
              actionColor={flagged.has(post._id) ? "#10b981" : "#f59e0b"}
              onAction={() => !flagged.has(post._id) && setFlagging(post)} />
          ))}
        </div>
      )}

      {/* Flag modal */}
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
                  {saving ? "Envoi..." : "Signaler →"}
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
