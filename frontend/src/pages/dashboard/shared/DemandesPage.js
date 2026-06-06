import React, { useState } from "react";
import { usePosts } from "../../../hooks/usePosts";
import { PostCard } from "../agency/shared";
import { IconInbox } from "../../../components/ui/Icons";
import PitchForm from "../../../components/pitches/PitchForm";
import pitchService from "../../../services/pitchService";
import useAuth from "../../../hooks/useAuth";

const DemandesPage = ({ senderType }) => {
  const { user } = useAuth();
  const { posts, loading, refetch } = usePosts({ targeted: "true", status: "open", limit: 50 });
  const [pitchTarget, setPitchTarget] = useState(null);

  const handlePitchSubmit = async (pitchData) => {
    await pitchService.send({
      ...pitchData,
      postId:     pitchTarget.post._id,
      senderType: senderType || "Agency",
      senderId:   user._id,
    });
    setPitchTarget(null);
    refetch();
  };

  return (
    <>
      <div>
        <div className="section-header">
          <div className="section-header-left">
            <h2>Demandes privées</h2>
            <p>Posts envoyés directement à votre organisation</p>
          </div>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon"><IconInbox size={20} /></div>
              <div className="empty-state-title">Aucune demande</div>
              <div className="empty-state-desc">
                Vous n'avez pas encore reçu de demandes privées de clients.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: 16 }}>
            {posts.map((post, i) => (
              <PostCard
                key={post._id}
                post={post}
                index={i}
                actionLabel="Soumettre une offre"
                onAction={() => setPitchTarget({ post })}
              />
            ))}
          </div>
        )}
      </div>

      {pitchTarget && (
        <PitchForm
          post={pitchTarget.post}
          senderType={senderType || "Agency"}
          onClose={() => setPitchTarget(null)}
          onSubmit={handlePitchSubmit}
        />
      )}
    </>
  );
};

export default DemandesPage;
