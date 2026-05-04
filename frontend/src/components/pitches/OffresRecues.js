import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePitchesForPost } from "../../hooks/usePitches";
import { useMyPosts } from "../../hooks/usePosts";
import pitchService from "../../services/pitchService";

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
          <p>Sélectionnez un post pour comparer les offres</p>
        </div>
      </div>

      {postsLoading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      ) : postsWithPitches.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon">💡</div>
            <div className="empty-state-title">Aucune offre reçue</div>
            <div className="empty-state-desc">
              Dès qu'une agence, équipe ou freelancer répond à l'un de vos posts, l'offre
              apparaîtra ici.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {postsWithPitches.map((post, i) => (
            <motion.div
              key={post._id}
              className="card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                padding: "18px 22px",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
              onClick={() => setSelectedPost(post)}
              whileHover={{ boxShadow: "0 4px 20px rgba(192,21,42,0.1)" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#1a0a0a",
                      marginBottom: 4,
                    }}
                  >
                    {post.title}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#9a6060" }}>
                    Échéance : {new Date(post.deadline).toLocaleDateString("fr-DZ")}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#c0152a" }}>
                      {post.pitchCount || 0}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#9a6060", fontWeight: 600 }}>
                      offre{(post.pitchCount || 0) !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span className={`status-badge ${post.status}`}>
                    {post.status === "in_progress"
                      ? "En cours"
                      : post.status === "open"
                      ? "Ouvert"
                      : post.status}
                  </span>
                  <span style={{ color: "#c0152a", fontSize: "1.1rem" }}>→</span>
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
  const [expandedPitch, setExpandedPitch] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const postFiles = useMemo(() => collectFiles(post), [post]);

  const handleAccept = async (pitchId) => {
    if (
      !window.confirm(
        "Accepter cette offre ? Toutes les autres offres en attente seront automatiquement rejetées."
      )
    )
      return;

    setActionLoading(pitchId);
    try {
      await pitchService.accept(pitchId, clientId);
      setSuccessMsg("✅ Offre acceptée ! Le post est maintenant en cours.");
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
    pending: { label: "En attente", color: "#f59e0b", bg: "#fffbeb" },
    accepted: { label: "Acceptée", color: "#10b981", bg: "#f0fdf4" },
    rejected: { label: "Rejetée", color: "#ef4444", bg: "#fef2f2" },
    withdrawn: { label: "Retirée", color: "#6b7280", bg: "#f9fafb" },
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "1.5px solid #f0dede",
            borderRadius: 8,
            padding: "6px 14px",
            cursor: "pointer",
            fontSize: "0.82rem",
            color: "#9a6060",
            fontFamily: "inherit",
            fontWeight: 600,
          }}
        >
          ← Retour
        </button>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a0a0a" }}>
            {post.title}
          </h2>
          <p style={{ fontSize: "0.78rem", color: "#9a6060", marginTop: 1 }}>
            {pitches.length} offre{pitches.length !== 1 ? "s" : ""} reçue
            {pitches.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <PostSummary post={post} postFiles={postFiles} />

      {successMsg && (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            padding: "12px 18px",
            marginBottom: 20,
            color: "#166534",
            fontWeight: 600,
            fontSize: "0.87rem",
          }}
        >
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      ) : pitches.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "48px 24px" }}>
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">Aucune offre pour ce post</div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {pitches.map((pitch, i) => {
            const meta = STATUS_META[pitch.status] || STATUS_META.pending;
            const isExpanded = expandedPitch === pitch._id;
            const senderName =
              pitch.senderAgency
                ? `${pitch.senderAgency.agencyName}`
                : pitch.senderTeam
                ? `${pitch.senderTeam.teamName}`
                : pitch.senderFreelancer
                ? `${pitch.senderFreelancer.firstName} ${pitch.senderFreelancer.lastName}`
                : "Prestataire";

            const senderType = pitch.senderAgency
              ? "Agence"
              : pitch.senderTeam
              ? "Équipe"
              : "Freelancer";

            const attachments = collectFiles(pitch);

            return (
              <motion.div
                key={pitch._id}
                className="card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    padding: "18px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedPitch(isExpanded ? null : pitch._id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a0a0a" }}>
                        {senderName}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          background: "#f5f3ff",
                          color: "#7c3aed",
                          borderRadius: 20,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                        }}
                      >
                        {senderType}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "#9a6060",
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      {pitch.proposedPrice?.amount && (
                        <span>
                          💰 {pitch.proposedPrice.amount.toLocaleString()} {pitch.proposedPrice.currency}
                        </span>
                      )}
                      {pitch.timeline?.duration && (
                        <span>
                          ⏱ {pitch.timeline.duration}{" "}
                          {pitch.timeline.unit === "days"
                            ? "jours"
                            : pitch.timeline.unit === "weeks"
                            ? "semaines"
                            : "mois"}
                        </span>
                      )}
                      <span>📅 {new Date(pitch.createdAt).toLocaleDateString("fr-DZ")}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        color: meta.color,
                        background: meta.bg,
                      }}
                    >
                      {meta.label}
                    </span>
                    <span
                      style={{
                        color: "#9a6060",
                        transition: "transform 0.2s",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      ▾
                    </span>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ padding: "0 22px 20px", borderTop: "1px solid #faeaea" }}>
                        {pitch.description && (
                          <Section title="Description">
                            <p style={{ fontSize: "0.84rem", color: "#4a2a2a", lineHeight: 1.6 }}>
                              {pitch.description}
                            </p>
                          </Section>
                        )}

                        {pitch.strategy?.strategyOverview && (
                          <Section title="🎯 Stratégie">
                            <DetailGrid
                              items={[
                                { label: "Aperçu", value: pitch.strategy.strategyOverview },
                                { label: "Idée créative", value: pitch.strategy.creativeIdea },
                                { label: "Objectifs", value: pitch.strategy.objectives },
                                { label: "Buts mesurables", value: pitch.strategy.measurableGoals },
                                { label: "Techniques", value: pitch.strategy.techniques },
                              ]}
                            />
                          </Section>
                        )}

                        {pitch.content?.postingFrequency && (
                          <Section title="📅 Contenu">
                            <DetailGrid
                              items={[
                                { label: "Fréquence", value: pitch.content.postingFrequency },
                                { label: "Calendrier", value: pitch.content.publicationCalendar },
                                {
                                  label: "Piliers",
                                  value: pitch.content.contentPillars?.join(", "),
                                },
                                { label: "Feed", value: pitch.content.feedOrganization },
                              ]}
                            />
                          </Section>
                        )}

                        {pitch.analysis?.competitiveAnalysis && (
                          <Section title="📊 Analyse">
                            <DetailGrid
                              items={[
                                {
                                  label: "Concurrence",
                                  value: pitch.analysis.competitiveAnalysis,
                                },
                                {
                                  label: "Positionnement",
                                  value: pitch.analysis.positioningStrategy,
                                },
                              ]}
                            />
                          </Section>
                        )}

                        {pitch.targetAudience?.gender && (
                          <Section title="👥 Audience cible">
                            <DetailGrid
                              items={[
                                {
                                  label: "Âge",
                                  value:
                                    pitch.targetAudience.ageMin &&
                                    `${pitch.targetAudience.ageMin} – ${pitch.targetAudience.ageMax} ans`,
                                },
                                {
                                  label: "Genre",
                                  value:
                                    pitch.targetAudience.gender === "all"
                                      ? "Tous"
                                      : pitch.targetAudience.gender === "male"
                                      ? "Hommes"
                                      : "Femmes",
                                },
                                { label: "Niche", value: pitch.targetAudience.niche?.join(", ") },
                                { label: "Zones", value: pitch.targetAudience.locations?.join(", ") },
                              ]}
                            />
                          </Section>
                        )}

                        {attachments.length > 0 && (
                          <Section title="📎 Fichiers joints">
                            <AttachmentList items={attachments} />
                          </Section>
                        )}

                        {pitch.status === "pending" && (
                          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                            <button
                              disabled={!!actionLoading}
                              onClick={() => handleAccept(pitch._id)}
                              style={{
                                flex: 1,
                                padding: "10px 0",
                                borderRadius: 9,
                                border: "none",
                                background: "#10b981",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "0.87rem",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                opacity: actionLoading === pitch._id ? 0.6 : 1,
                              }}
                            >
                              {actionLoading === pitch._id ? "..." : "✅ Accepter cette offre"}
                            </button>

                            <button
                              disabled={!!actionLoading}
                              onClick={() => handleReject(pitch._id)}
                              style={{
                                flex: 1,
                                padding: "10px 0",
                                borderRadius: 9,
                                border: "1.5px solid #f0dede",
                                background: "white",
                                color: "#c0152a",
                                fontWeight: 700,
                                fontSize: "0.87rem",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                opacity: actionLoading === pitch._id ? 0.6 : 1,
                              }}
                            >
                              ❌ Rejeter
                            </button>
                          </div>
                        )}

                        {pitch.rejectionReason && (
                          <div
                            style={{
                              marginTop: 12,
                              padding: "8px 12px",
                              background: "#fef2f2",
                              borderRadius: 7,
                              fontSize: "0.76rem",
                              color: "#b91c1c",
                            }}
                          >
                            Motif de rejet : {pitch.rejectionReason}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const collectFiles = (source) => {
  const raw = [...(source?.media || []), ...(source?.pictures || []), ...(source?.attachments || [])];
  const seen = new Set();

  return raw
    .map((item) => {
      if (!item) return null;

      if (typeof item === "string") {
        const url = item;
        const name = url.split("/").pop() || "fichier";
        return { url, name };
      }

      const url = item.url || item.fileUrl || item.link || "";
      const name = item.filename || item.name || item.title || (url ? url.split("/").pop() : "fichier");
      return url ? { url, name } : null;
    })
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
};

const PostSummary = ({ post, postFiles }) => {
  const budgetText = post?.budget
    ? post.budget.min || post.budget.max
      ? `${post.budget.min ?? "-"} / ${post.budget.max ?? "-"} ${post.budget.currency || "DZD"}`
      : post.budget.currency
      ? `${post.budget.currency}`
      : "-"
    : "-";

  return (
    <div className="card" style={{ marginBottom: 16, padding: "18px 22px" }}>
      <div className="section-header" style={{ marginBottom: 12 }}>
        <div className="section-header-left">
          <h2 style={{ margin: 0 }}>Détails du post</h2>
          <p style={{ margin: 0 }}>Résumé complet du brief et des fichiers joints</p>
        </div>
      </div>

      <DetailGrid
        items={[
          { label: "Description", value: post.description },
          { label: "Budget", value: budgetText },
          {
            label: "Deadline",
            value: post.deadline ? new Date(post.deadline).toLocaleDateString("fr-DZ") : "",
          },
          {
            label: "Localisation",
            value: [post.location?.city, post.location?.region, post.location?.country]
              .filter(Boolean)
              .join(", "),
          },
          {
            label: "Catégories",
            value: Array.isArray(post.categories) ? post.categories.join(", ") : "",
          },
          {
            label: "Ciblage",
            value: Array.isArray(post.targetProviders) ? post.targetProviders.join(", ") : "",
          },
        ]}
      />

      {postFiles.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#c0152a",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            Fichiers du post
          </div>
          <AttachmentList items={postFiles} />
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ marginTop: 16 }}>
    <div
      style={{
        fontSize: "0.75rem",
        fontWeight: 700,
        color: "#c0152a",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: 8,
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

const DetailGrid = ({ items }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
    {items
      .filter((i) => i.value)
      .map(({ label, value }) => (
        <div key={label} style={{ background: "#fdf8f8", borderRadius: 8, padding: "10px 12px" }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#9a6060",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 4,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#1a0a0a", lineHeight: 1.4 }}>{value}</div>
        </div>
      ))}
  </div>
);

const AttachmentList = ({ items }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {items.map((item) => (
      <a
        key={item.url}
        href={item.url}
        target="_blank"
        rel="noreferrer"
        download
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #f0dede",
          background: "#fff",
          color: "#1a0a0a",
          textDecoration: "none",
        }}
      >
        <span style={{ fontSize: "0.84rem", fontWeight: 600 }}>{item.name}</span>
        <span style={{ fontSize: "0.76rem", color: "#9a6060" }}>Télécharger</span>
      </a>
    ))}
  </div>
);

export default OffresRecues;