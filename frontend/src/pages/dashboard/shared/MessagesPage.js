import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import chatService from "../../../services/chatService";
import ChatWindow  from "../../../components/chat/ChatWindow";
import useAuth     from "../../../hooks/useAuth";

// ── Helpers ────────────────────────────────────────────────────────────────────
const ROLE_LABELS = {
  client:        "Client",
  agency:        "Agence",
  agency_member: "Membre",
  team:          "Équipe",
  team_member:   "Membre",
  freelancer:    "Freelancer",
  project:       "Projet",
};

const ROLE_COLORS = {
  client:     "#c0152a",
  agency:     "#7c3aed",
  team:       "#0891b2",
  freelancer: "#d97706",
  project:    "#059669",
};

const relativeTime = (date) => {
  if (!date) return "";
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "à l'instant";
  if (mins < 60)  return `${mins} min`;
  if (hours < 24) return `${hours}h`;
  return `${days}j`;
};

const getOtherParticipant = (conv, currentUserId) => {
  if (!conv.participantInfo?.length) return { name: "Conversation", role: "unknown" };
  const other = conv.participantInfo.find(
    (p) => String(p.userId) !== String(currentUserId)
  );
  return other || conv.participantInfo[0];
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

// ── Conversation row ───────────────────────────────────────────────────────────
const ConvRow = ({ conv, currentUserId, isSelected, onClick }) => {
  const other   = getOtherParticipant(conv, currentUserId);
  const color   = ROLE_COLORS[other.role] || "#6b7280";
  const hasUnread = conv.unreadCount > 0;

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", gap: 12, alignItems: "center",
        padding: "12px 16px", cursor: "pointer",
        borderBottom: "1px solid var(--d-border-soft, #f0f0f0)",
        background: isSelected
          ? "var(--d-surface-hi, rgba(192,21,42,0.06))"
          : "transparent",
        transition: "background 0.12s",
        borderLeft: isSelected ? "3px solid #c0152a" : "3px solid transparent",
      }}
    >
      {/* Avatar */}
      <div style={{
        width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
        background: `linear-gradient(135deg, ${color}, ${color}99)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "0.85rem", fontWeight: 800, color: "#fff",
      }}>
        {initials(other.name)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{
            fontWeight: hasUnread ? 800 : 600,
            fontSize: "0.82rem",
            color: "var(--d-ink, #1a1a1a)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {other.name}
          </span>
          <span style={{ fontSize: "0.65rem", color: "var(--d-muted, #aaa)", flexShrink: 0, marginLeft: 6 }}>
            {relativeTime(conv.lastMessageAt || conv.updatedAt)}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
          <span style={{
            fontSize: "0.72rem",
            color: hasUnread ? "var(--d-ink-soft, #555)" : "var(--d-muted, #aaa)",
            fontWeight: hasUnread ? 600 : 400,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            flex: 1,
          }}>
            {conv.lastMessagePreview || "Commencer la conversation…"}
          </span>
          {hasUnread && (
            <span style={{
              marginLeft: 8, minWidth: 18, height: 18, borderRadius: 9,
              background: "#c0152a", color: "#fff",
              fontSize: "0.62rem", fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 5px", flexShrink: 0,
            }}>
              {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.62rem", color, marginTop: 2, fontWeight: 600 }}>
          {ROLE_LABELS[other.role] || other.role}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGES PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const MessagesPage = () => {
  const { user }   = useAuth();
  const location   = useLocation();
  const openConvId = location.state?.openConvId || null;

  const [conversations,  setConversations]  = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(openConvId);
  const [loading,        setLoading]        = useState(true);
  // Mobile: show thread panel instead of list (only relevant on small screens)
  const [mobileThread,   setMobileThread]   = useState(!!openConvId);
  const [isMobile,       setIsMobile]       = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getMyConversations();
      setConversations(data.conversations || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // When navigated here with an openConvId, reload list if conversation isn't in it yet
  useEffect(() => {
    if (openConvId && conversations.length > 0) {
      if (!conversations.find(c => c._id === openConvId)) loadConversations();
    }
  }, [openConvId, conversations, loadConversations]);

  const handleSelectConv = (convId) => {
    setSelectedConvId(convId);
    setMobileThread(true);
    setTimeout(() => loadConversations(), 1500);
  };

  const handleBack = () => {
    setMobileThread(false);
    setSelectedConvId(null);
  };

  const selectedConv     = conversations.find((c) => c._id === selectedConvId);
  const otherParticipant = selectedConv && user
    ? getOtherParticipant(selectedConv, user._id)
    : null;

  // On mobile: show either list or thread. On desktop: always show both.
  const showSidebar = !isMobile || !mobileThread;
  const showThread  = !isMobile || mobileThread;

  return (
    <div style={{
      display: "flex",
      height: "calc(100vh - 112px)",
      minHeight: 480,
      overflow: "hidden",
      borderRadius: 14,
      border: "1.5px solid var(--d-border-soft, #eee)",
      background: "var(--d-card, #fff)",
    }}>

      {/* ── Sidebar: conversation list ── */}
      <div style={{
        width: 300, flexShrink: 0,
        borderRight: "1.5px solid var(--d-border-soft, #eee)",
        display: showSidebar ? "flex" : "none",
        flexDirection: "column",
      }}
        className="messages-sidebar"
      >
        {/* Header */}
        <div style={{
          padding: "16px 16px 12px",
          borderBottom: "1px solid var(--d-border-soft, #f0f0f0)",
        }}>
          <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--d-ink, #1a1a1a)" }}>
            Messages
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "var(--d-muted, #aaa)" }}>
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
              <div className="spinner" />
            </div>
          ) : conversations.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "48px 24px", gap: 10, textAlign: "center",
            }}>
              <div style={{ fontSize: "2rem" }}>✉</div>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--d-ink-soft, #555)" }}>
                Aucun message
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--d-muted, #aaa)", lineHeight: 1.5 }}>
                Envoyez un message depuis la page de profil d'un prestataire.
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {conversations.map((conv) => (
                <motion.div
                  key={conv._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ConvRow
                    conv={conv}
                    currentUserId={user?._id}
                    isSelected={conv._id === selectedConvId}
                    onClick={() => handleSelectConv(conv._id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ── Thread panel ── */}
      <div style={{
        flex: 1,
        display: showThread ? "flex" : "none",
        flexDirection: "column",
        minWidth: 0,
      }}>
        {/* Thread header */}
        {selectedConvId && otherParticipant ? (
          <>
            <div style={{
              padding: "12px 18px",
              borderBottom: "1px solid var(--d-border-soft, #f0f0f0)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              {/* Back button (mobile: always; desktop: always shown) */}
              <button
                onClick={handleBack}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--d-ink, #1a1a1a)", fontSize: "1.1rem",
                  padding: "0 4px 0 0", display: "flex", alignItems: "center",
                }}
              >
                ←
              </button>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${ROLE_COLORS[otherParticipant.role] || "#6b7280"}, ${(ROLE_COLORS[otherParticipant.role] || "#6b7280") + "99"})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.78rem", fontWeight: 800, color: "#fff",
              }}>
                {initials(otherParticipant.name)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--d-ink, #1a1a1a)" }}>
                  {otherParticipant.name}
                </div>
                <div style={{ fontSize: "0.67rem", color: ROLE_COLORS[otherParticipant.role] || "#6b7280", fontWeight: 600 }}>
                  {ROLE_LABELS[otherParticipant.role] || otherParticipant.role}
                </div>
              </div>
            </div>

            {/* Thread content */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <ChatWindow
                conversationId={selectedConvId}
                style={{ height: "100%", borderRadius: 0, border: "none", flex: 1 }}
              />
            </div>
          </>
        ) : (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "var(--d-muted, #aaa)", gap: 12, textAlign: "center", padding: 32,
          }}>
            <div style={{ fontSize: "3rem", opacity: 0.4 }}>✉</div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--d-ink-soft, #555)" }}>
              Sélectionnez une conversation
            </div>
            <div style={{ fontSize: "0.78rem", lineHeight: 1.6 }}>
              Choisissez une conversation dans la liste à gauche<br />
              ou envoyez un message depuis un profil de prestataire.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
