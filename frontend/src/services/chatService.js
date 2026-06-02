import api from "./api";

const chatService = {
  // Project-tied conversation (legacy)
  getConversation: (projectId) =>
    api.get(`/chat/project/${projectId}`).then(r => r.data),

  // Direct conversations
  getMyConversations: () =>
    api.get("/chat/conversations").then(r => r.data),

  startDirectConversation: (targetUserId, targetRole) =>
    api.post("/chat/conversations/direct", { targetUserId, targetRole }).then(r => r.data),

  getMessages: (conversationId, page = 1, limit = 50) =>
    api.get(`/chat/${conversationId}/messages`, { params: { page, limit } }).then(r => r.data),

  sendMessage: (conversationId, { content, file, messageType, metadata }) => {
    if (file) {
      const form = new FormData();
      form.append("file", file);
      if (content)     form.append("content", content);
      if (messageType) form.append("messageType", messageType);
      if (metadata)    form.append("metadata", JSON.stringify(metadata));
      // Do NOT set Content-Type manually — axios detects FormData and adds the boundary automatically
      return api.post(`/chat/${conversationId}/messages`, form).then(r => r.data);
    }
    return api.post(`/chat/${conversationId}/messages`, { content, messageType, metadata })
      .then(r => r.data);
  },

  markRead: (conversationId) =>
    api.patch(`/chat/${conversationId}/read`).then(r => r.data),

  getUnreadCount: () =>
    api.get("/chat/unread-count").then(r => r.data),
};

export default chatService;
