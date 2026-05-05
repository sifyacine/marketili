// src/pages/dashboard/agency/DirectorFlaggedPosts.jsx
import React from "react";
import { PostCard } from "./shared";

const DirectorFlaggedPosts = ({ user, onPitch, flaggedPosts = [], loading }) => (
  <div>
    <div className="section-header">
      <div className="section-header-left">
        <h2>Posts flaggés</h2>
        <p>Signalés par votre équipe commerciale — cliquez pour pitcher</p>
      </div>
    </div>
    {loading ? (
      <div className="spinner-wrap"><div className="spinner" /></div>
    ) : flaggedPosts.length === 0 ? (
      <div className="card">
        <div className="empty-state" style={{ padding: "64px 24px" }}>
          <div className="empty-state-icon">🚩</div>
          <div className="empty-state-title">Aucun post signalé</div>
          <div className="empty-state-desc">Vos commerciaux n'ont pas encore signalé de posts.</div>
        </div>
      </div>
    ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: 16 }}>
        {flaggedPosts.map((f, i) => f.post && (
          <div key={f._id || i} style={{ position: "relative" }}>
            <PostCard
              post={f.post}
              index={i}
              actionLabel={f.pitched ? "Déjà pitché ✓" : "Pitcher →"}
              actionColor={f.pitched ? "#10b981" : undefined}
              onAction={() => !f.pitched && onPitch({ post: f.post, flagEntry: f })}
            />
            <div style={{ padding: "0 20px 16px", fontSize: "0.73rem",
              color: "#9a6060", marginTop: -8 }}>
              🚩 Signalé par {f.flaggedByName || "commercial"}
              {f.note && <> · <em>{f.note}</em></>}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default DirectorFlaggedPosts;