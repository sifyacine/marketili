// src/pages/dashboard/agency/CommercialBrowse.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PostCard } from "./shared";
import { usePosts } from "../../../hooks/usePosts";
import projectService from "../../../services/projectService";

const CommercialBrowse = ({ user }) => {
  const { posts, loading, applyFilters } = usePosts({ status: "open", limit: 12 });
  const [search,   setSearch]   = useState("");
  const [flagging, setFlagging] = useState(null);
  const [note,     setNote]     = useState("");
  const [saving,   setSaving]   = useState(false);
  const [flagged,  setFlagged]  = useState(new Set());

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

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Parcourir les posts</h2>
          <p>Signalez les opportunités au directeur</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input className="dash-form-input" placeholder="Rechercher..."
          value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && applyFilters({ search })}
          style={{ flex: 1 }} />
        <button className="section-cta-btn" onClick={() => applyFilters({ search })}>
          Rechercher
        </button>
      </div>

      {loading ? <div className="spinner-wrap" style={{ padding: 60 }}><div className="spinner" /></div>
      : posts.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Aucun post trouvé</div>
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