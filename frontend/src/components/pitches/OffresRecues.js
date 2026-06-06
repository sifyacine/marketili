

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePitchesForPost } from "../../hooks/usePitches";
import { useMyPosts } from "../../hooks/usePosts";
import pitchService from "../../services/pitchService";
import uploadService from "../../services/uploadService";
import { IconInbox, IconClipboard } from "../ui/Icons";
import "../../styles/OffresRecues.css";

const OffresRecues = ({ user }) => {
  const { posts, loading: postsLoading } = useMyPosts(user._id);
  const [selectedPost, setSelectedPost] = useState(null);

  const postsWithPitches = posts.filter(
    (p) => (p.pitchCount || 0) > 0 || p.status === "in_progress"
  );

  if (selectedPost) {
    return (
      <PitchDetail
        post={selectedPost}
        clientId={user._id}
        onBack={() => setSelectedPost(null)}
      />
    );
  }

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Offres reçues</h2>
          <p>Sélectionnez un post pour voir les offres</p>
        </div>
      </div>

      {postsLoading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : postsWithPitches.length === 0 ? (
        <div className="card">
          <div className="empty-state offres-recues-empty">
            <div className="empty-state-icon"><IconInbox size={20} /></div>
            <div className="empty-state-title">Aucune offre reçue</div>
            <div className="empty-state-desc">
              Dès qu'une agence, équipe ou freelancer répond à l'un de vos posts, l'offre apparaîtra ici.
            </div>
          </div>
        </div>
      ) : (
        <div className="offres-recues-list">
          {postsWithPitches.map((post, i) => (
            <motion.div
              key={post._id}
              className="card offres-recues-post-card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedPost(post)}
              whileHover={{ boxShadow: "0 4px 20px rgba(192,21,42,0.1)" }}
            >
              <div className="offres-recues-post-card-inner">
                <div className="offres-recues-post-info">
                  <div className="offres-recues-post-title">{post.title}</div>
                  <div className="offres-recues-post-deadline">
                    Échéance : {new Date(post.deadline).toLocaleDateString("fr-DZ")}
                  </div>
                </div>
                <div className="offres-recues-post-meta">
                  <div className="offres-recues-pitch-count">
                    <div className="offres-recues-pitch-count-number">{post.pitchCount || 0}</div>
                    <div className="offres-recues-pitch-count-label">
                      offre{(post.pitchCount || 0) !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span className={`status-badge ${post.status}`}>
                    {post.status === "in_progress" ? "En cours"
                      : post.status === "open" ? "Ouvert"
                      : post.status}
                  </span>
                  <span className="offres-recues-arrow">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const PitchDetail = ({ post, clientId, onBack }) => {
  const { pitches, loading, refetch } = usePitchesForPost(post._id, clientId);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const postFiles = useMemo(() => collectFiles(post), [post]);

  const handleAccept = async (pitchId) => {
    if (!window.confirm("Accepter cette offre ? Toutes les autres offres en attente seront automatiquement rejetées."))
      return;
    setActionLoading(pitchId);
    try {
      const response = await pitchService.accept(pitchId, clientId);
      setSuccessMsg("Offre acceptée — le projet a été créé.");
      refetch();
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (pitchId) => {
    const reason = window.prompt("Raison du rejet (optionnel) :");
    if (reason === null) return;
    setActionLoading(pitchId);
    try {
      await pitchService.reject(pitchId, clientId, reason);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setActionLoading(null);
    }
  };

  const STATUS_META = {
    pending:   { label: "En attente", color: "#f59e0b", bg: "#fffbeb" },
    accepted:  { label: "Acceptée",   color: "#10b981", bg: "#f0fdf4" },
    rejected:  { label: "Rejetée",    color: "#ef4444", bg: "#fef2f2" },
    withdrawn: { label: "Retirée",    color: "#6b7280", bg: "#f9fafb" },
  };

  const budgetText = post?.budget
    ? post.budget.min || post.budget.max
      ? `${post.budget.min ?? "-"} / ${post.budget.max ?? "-"} ${post.budget.currency || "DZD"}`
      : post.budget.currency || "-"
    : "-";

  return (
    <div>
      <div className="offres-recues-back-header">
        <button onClick={onBack} className="offres-recues-back-btn">Retour aux posts</button>
        <div>
          <h2 className="offres-recues-detail-title">{post.title}</h2>
          <p className="offres-recues-detail-subtitle">
            {pitches.length} offre{pitches.length !== 1 ? "s" : ""} reçue{pitches.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {}
      <div className="card offres-recues-brief-card">
        <div className="offres-brief-header">
          <h3 className="offres-brief-title">Votre brief</h3>
        </div>
        <div className="offres-brief-grid">
          {[
            { label: "Description", value: post.description },
            { label: "Budget", value: budgetText },
            { label: "Deadline", value: post.deadline ? new Date(post.deadline).toLocaleDateString("fr-DZ") : "" },
            {
              label: "Localisation",
              value: post.location?.region || "",
            },
            { label: "Catégories", value: Array.isArray(post.categories) ? post.categories.join(", ") : "" },
            { label: "Ciblage", value: Array.isArray(post.targetProviders) ? post.targetProviders.join(", ") : "" },
          ].filter(x => x.value).map(x => (
            <div key={x.label} className="offres-brief-item">
              <div className="offres-brief-label">{x.label}</div>
              <div className="offres-brief-value">{x.value}</div>
            </div>
          ))}
        </div>
        {postFiles.length > 0 && (
          <div className="offres-brief-files">
            <div className="offres-brief-files-label">Fichiers joints</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              {postFiles.map((item) => {
                const src = uploadService.resolveUrl(item.url);
                const isImg = item.mimeType?.startsWith("image/") ||
                  /\.(jpe?g|png|gif|webp|svg)$/i.test(item.name);
                return isImg ? (
                  <a key={item.url} href={src} target="_blank" rel="noreferrer"
                    style={{ display: "block", flexShrink: 0 }}>
                    <img src={src} alt={item.name}
                      style={{ width: 120, height: 90, objectFit: "cover",
                        borderRadius: 8, border: "1px solid #f0dede", display: "block" }} />
                  </a>
                ) : (
                  <a key={item.url} href={src} target="_blank" rel="noreferrer" download
                    className="offres-brief-file-link">
                    <span className="offres-brief-file-name">{item.name}</span>
                    <span className="offres-brief-file-action">Télécharger</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {successMsg && <div className="offres-recues-success-msg">{successMsg}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : pitches.length === 0 ? (
        <div className="card">
          <div className="empty-state offres-recues-empty-pitches">
            <div className="empty-state-icon"><IconClipboard size={20} /></div>
            <div className="empty-state-title">Aucune offre pour ce post</div>
          </div>
        </div>
      ) : (
        <div className="offres-recues-pitches-grid">
          {pitches.map((pitch, i) => {
            const meta = STATUS_META[pitch.status] || STATUS_META.pending;
            const senderName = pitch.senderAgency?.agencyName
              || pitch.senderTeam?.teamName
              || (pitch.senderFreelancer ? `${pitch.senderFreelancer.firstName} ${pitch.senderFreelancer.lastName}` : "Prestataire");
            const senderType = pitch.senderAgency ? "Agence"
              : pitch.senderTeam ? "Équipe" : "Freelancer";
            const attachments = collectFiles(pitch);

            return (
              <motion.div
                key={pitch._id}
                className="offres-recues-pitch-card-unified"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {}
                <div className="offres-pitch-header">
                  <div className="offres-pitch-header-left">
                    <h3 className="offres-pitch-sender-name">{senderName}</h3>
                    <div className="offres-pitch-badges">
                      <span className="offres-pitch-type-badge">{senderType}</span>
                      <span className="offres-pitch-status-badge" style={{ color: meta.color, background: meta.bg }}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  <div className="offres-pitch-header-stats">
                    {pitch.proposedPrice?.amount && (
                      <div className="offres-pitch-stat">
                        <div className="offres-pitch-stat-value">
                          {pitch.proposedPrice.amount.toLocaleString()} {pitch.proposedPrice.currency}
                        </div>
                        <div className="offres-pitch-stat-label">Prix proposé</div>
                      </div>
                    )}
                    {pitch.timeline?.duration && (
                      <div className="offres-pitch-stat">
                        <div className="offres-pitch-stat-value">
                          {pitch.timeline.duration} {pitch.timeline.unit === "days" ? "j"
                            : pitch.timeline.unit === "weeks" ? "sem" : "mois"}
                        </div>
                        <div className="offres-pitch-stat-label">Durée</div>
                      </div>
                    )}
                  </div>
                </div>

                {}
                <div className="offres-pitch-body">
                  {pitch.description && (
                    <div className="offres-pitch-section">
                      <div className="offres-pitch-section-label">Description</div>
                      <p className="offres-pitch-description">{pitch.description}</p>
                    </div>
                  )}

                  <div className="offres-pitch-grid-sections">
                    {pitch.strategy?.strategyOverview && (
                      <div className="offres-pitch-section">
                        <div className="offres-pitch-section-label">Stratégie</div>
                        <div className="offres-pitch-detail-grid">
                          {[
                            { label: "Aperçu", value: pitch.strategy.strategyOverview },
                            { label: "Idée créative", value: pitch.strategy.creativeIdea },
                            { label: "Objectifs", value: pitch.strategy.objectives },
                            { label: "Buts mesurables", value: pitch.strategy.measurableGoals },
                            { label: "Techniques", value: pitch.strategy.techniques },
                          ].filter(x => x.value).map(x => (
                            <div key={x.label} className="offres-pitch-detail-item">
                              <div className="offres-pitch-detail-label">{x.label}</div>
                              <div className="offres-pitch-detail-value">{x.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pitch.content?.postingFrequency && (
                      <div className="offres-pitch-section">
                        <div className="offres-pitch-section-label">Contenu</div>
                        <div className="offres-pitch-detail-grid">
                          {[
                            { label: "Fréquence", value: pitch.content.postingFrequency },
                            { label: "Calendrier", value: pitch.content.publicationCalendar },
                            { label: "Piliers", value: pitch.content.contentPillars?.join(", ") },
                            { label: "Feed", value: pitch.content.feedOrganization },
                          ].filter(x => x.value).map(x => (
                            <div key={x.label} className="offres-pitch-detail-item">
                              <div className="offres-pitch-detail-label">{x.label}</div>
                              <div className="offres-pitch-detail-value">{x.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pitch.analysis?.competitiveAnalysis && (
                      <div className="offres-pitch-section">
                        <div className="offres-pitch-section-label">Analyse</div>
                        <div className="offres-pitch-detail-grid">
                          {[
                            { label: "Concurrence", value: pitch.analysis.competitiveAnalysis },
                            { label: "Positionnement", value: pitch.analysis.positioningStrategy },
                          ].filter(x => x.value).map(x => (
                            <div key={x.label} className="offres-pitch-detail-item">
                              <div className="offres-pitch-detail-label">{x.label}</div>
                              <div className="offres-pitch-detail-value">{x.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pitch.targetAudience?.gender && (
                      <div className="offres-pitch-section">
                        <div className="offres-pitch-section-label">Audience cible</div>
                        <div className="offres-pitch-detail-grid">
                          {[
                            {
                              label: "Âge",
                              value: pitch.targetAudience.ageMin
                                ? `${pitch.targetAudience.ageMin} – ${pitch.targetAudience.ageMax} ans`
                                : null,
                            },
                            {
                              label: "Genre",
                              value: pitch.targetAudience.gender === "all" ? "Tous"
                                : pitch.targetAudience.gender === "male" ? "Hommes" : "Femmes",
                            },
                            { label: "Niche", value: pitch.targetAudience.niche?.join(", ") },
                            { label: "Zones", value: pitch.targetAudience.locations?.join(", ") },
                          ].filter(x => x.value).map(x => (
                            <div key={x.label} className="offres-pitch-detail-item">
                              <div className="offres-pitch-detail-label">{x.label}</div>
                              <div className="offres-pitch-detail-value">{x.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {attachments.length > 0 && (
                    <div className="offres-pitch-section">
                      <div className="offres-pitch-section-label">Fichiers joints</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                        {attachments.map((item) => {
                          const src = uploadService.resolveUrl(item.url);
                          const isImg = item.mimeType?.startsWith("image/") ||
                            /\.(jpe?g|png|gif|webp|svg)$/i.test(item.name);
                          return isImg ? (
                            <a key={item.url} href={src} target="_blank" rel="noreferrer"
                              style={{ display: "block", flexShrink: 0 }}>
                              <img src={src} alt={item.name}
                                style={{ width: 100, height: 75, objectFit: "cover",
                                  borderRadius: 6, border: "1px solid #f0dede", display: "block" }} />
                            </a>
                          ) : (
                            <a key={item.url} href={src} target="_blank" rel="noreferrer" download
                              className="offres-pitch-attachment">
                              <span className="offres-pitch-attachment-name">{item.name}</span>
                              <span className="offres-pitch-attachment-action">Télécharger</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {}
                {pitch.status === "pending" ? (
                  <div className="offres-pitch-footer">
                    <button
                      disabled={!!actionLoading}
                      onClick={() => handleAccept(pitch._id)}
                      className="offres-pitch-accept-btn"
                      style={{ opacity: actionLoading === pitch._id ? 0.6 : 1 }}
                    >
                      {actionLoading === pitch._id ? "..." : "Accepter cette offre"}
                    </button>
                    <button
                      disabled={!!actionLoading}
                      onClick={() => handleReject(pitch._id)}
                      className="offres-pitch-reject-btn"
                      style={{ opacity: actionLoading === pitch._id ? 0.6 : 1 }}
                    >
                      Rejeter
                    </button>
                  </div>
                ) : pitch.rejectionReason ? (
                  <div className="offres-pitch-footer-rejected">
                    Motif de rejet : {pitch.rejectionReason}
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const collectFiles = (source) => {
  const raw = [
    ...(source?.media || []),
    ...(source?.pictures || []),
    ...(source?.attachments || []),
  ];
  const seen = new Set();
  return raw
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") return { url: item, name: item.split("/").pop() || "fichier", mimeType: "" };
      const url = item.url || item.fileUrl || item.link || "";
      const name = item.filename || item.name || item.title || url.split("/").pop() || "fichier";
      const mimeType = item.mimeType || item.contentType || "";
      return url ? { url, name, mimeType } : null;
    })
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
};

export default OffresRecues;