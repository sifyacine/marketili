import React, { useState, useEffect, useRef, useCallback } from "react";
import chatService from "../../services/chatService";
import { getSocket } from "../../services/socketService";
import MessageBubble from "./MessageBubble";
import useAuth from "../../hooks/useAuth";

// Accepts either:
//   projectId     — resolves conversation from a project (legacy)
//   conversationId — uses conversation directly (direct messages)
const ChatWindow = ({ projectId, conversationId: directConvId, style: rootStyle }) => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState(directConvId || null);
  const [messages,       setMessages]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [sending,        setSending]        = useState(false);
  const [text,           setText]           = useState("");
  const [selectedFile,   setSelectedFile]   = useState(null);
  const [error,          setError]          = useState("");

  const bottomRef  = useRef();
  const fileRef    = useRef();
  const pollRef    = useRef();
  const convIdRef  = useRef();

  // Keep ref in sync so the poll closure always has the latest id
  convIdRef.current = conversationId;

  const scrollBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(async (convId) => {
    try {
      const data = await chatService.getMessages(convId);
      setMessages(data.messages || []);
    } catch {}
  }, []);

  // When directConvId prop changes, reset
  useEffect(() => {
    if (directConvId) {
      setConversationId(directConvId);
      setMessages([]);
      setError("");
      setLoading(true);
      loadMessages(directConvId)
        .then(() => chatService.markRead(directConvId).catch(() => {}))
        .finally(() => setLoading(false));
    }
  }, [directConvId, loadMessages]);

  // Init: get or create conversation from project, then load messages and mark read
  useEffect(() => {
    if (!projectId || directConvId) return;
    setLoading(true);

    chatService.getConversation(projectId)
      .then(async (data) => {
        const cid = data.conversation._id;
        setConversationId(cid);
        await loadMessages(cid);
        chatService.markRead(cid).catch(() => {});
      })
      .catch(() => setError("Impossible de charger la messagerie."))
      .finally(() => setLoading(false));
  }, [projectId, directConvId, loadMessages]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollBottom();
  }, [messages]);

  // Real-time: join socket room and listen for new messages
  useEffect(() => {
    if (!conversationId) return;
    const socket = getSocket();
    socket.emit("join_conversation", conversationId);

    const handleNewMessage = ({ message }) => {
      setMessages(prev => {
        // Deduplicate by _id — sender already appended optimistically
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
      socket.emit("leave_conversation", conversationId);
    };
  }, [conversationId]);

  // Fallback poll every 30s in case the socket drops
  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (convIdRef.current) {
        loadMessages(convIdRef.current);
      }
    }, 30000);
    return () => clearInterval(pollRef.current);
  }, [loadMessages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !selectedFile) || !conversationId) return;

    setSending(true);
    setError("");
    try {
      const result = await chatService.sendMessage(conversationId, {
        content: text.trim() || undefined,
        file:    selectedFile || undefined,
      });
      setMessages(prev => [...prev, result.message]);
      setText("");
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("Erreur lors de l'envoi du message.");
    } finally {
      setSending(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error && !conversationId) {
    return (
      <div style={{ padding: "24px", fontSize: "0.85rem", color: "#c0152a", textAlign: "center" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: 480, border: "1.5px solid var(--d-border-soft, #eee)",
      borderRadius: 12, overflow: "hidden",
      background: "var(--d-bg, #fff)",
      ...rootStyle,
    }}>

      {/* ── Messages area ── */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.82rem", color: "var(--d-muted, #9a6060)", fontStyle: "italic",
          }}>
            Aucun message pour l'instant. Commencez la conversation.
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              isMine={msg.sender?.toString() === user?._id?.toString()}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── File preview strip ── */}
      {selectedFile && (
        <div style={{
          padding: "8px 18px",
          borderTop: "1px solid var(--d-border-soft, #eee)",
          background: "var(--d-surface-alt, #fafafa)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: "0.8rem", color: "var(--d-ink, #1a0a0a)", fontWeight: 600 }}>
            {selectedFile.name}
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--d-muted, #9a6060)" }}>
            ({(selectedFile.size / 1024).toFixed(0)} Ko)
          </span>
          <button onClick={removeFile}
            style={{
              marginLeft: "auto", background: "none", border: "none",
              cursor: "pointer", color: "#c0152a", fontSize: "0.8rem", fontWeight: 700,
              padding: "2px 6px",
            }}>
            Retirer
          </button>
        </div>
      )}

      {/* ── Error strip ── */}
      {error && (
        <div style={{
          padding: "6px 18px", fontSize: "0.75rem", color: "#c0152a",
          background: "#c0152a08", borderTop: "1px solid #c0152a22",
        }}>
          {error}
        </div>
      )}

      {/* ── Input bar ── */}
      <form onSubmit={handleSend}
        style={{
          display: "flex", gap: 8, padding: "12px 14px",
          borderTop: "1.5px solid var(--d-border-soft, #eee)",
          background: "var(--d-surface, #f8f8f8)",
        }}>
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf,video/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Attach button */}
        <button type="button"
          onClick={() => fileRef.current?.click()}
          title="Joindre un fichier"
          style={{
            flexShrink: 0, width: 36, height: 36, borderRadius: 8,
            border: "1.5px solid var(--d-border-soft, #eee)",
            background: selectedFile ? "#c0152a18" : "transparent",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", color: selectedFile ? "#c0152a" : "var(--d-muted, #9a6060)",
          }}>
          📎
        </button>

        {/* Text input */}
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          placeholder="Écrire un message..."
          style={{
            flex: 1, padding: "9px 14px",
            borderRadius: 20, border: "1.5px solid var(--d-border-soft, #eee)",
            fontSize: "0.85rem", fontFamily: "inherit",
            background: "var(--d-bg, #fff)", color: "var(--d-ink, #1a0a0a)",
            outline: "none",
          }}
        />

        {/* Send button */}
        <button type="submit"
          disabled={sending || (!text.trim() && !selectedFile)}
          style={{
            flexShrink: 0, height: 36, padding: "0 16px",
            borderRadius: 20, border: "none",
            background: sending || (!text.trim() && !selectedFile)
              ? "var(--d-border-soft, #eee)"
              : "#c0152a",
            color: sending || (!text.trim() && !selectedFile)
              ? "var(--d-muted, #9a6060)"
              : "#fff",
            cursor: sending || (!text.trim() && !selectedFile) ? "not-allowed" : "pointer",
            fontFamily: "inherit", fontWeight: 700, fontSize: "0.82rem",
            transition: "background 0.15s",
          }}>
          {sending ? "..." : "Envoyer"}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
