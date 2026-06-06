

import api from "./api";

const notificationService = {
  
  getAll: (params = {}) =>
    api.get("/notifications", { params }).then(r => r.data),

  
  getUnreadCount: () =>
    api.get("/notifications/unread-count").then(r => r.data.count),

  
  markRead: (id) =>
    api.patch(`/notifications/${id}/read`).then(r => r.data),

  
  markAllRead: () =>
    api.patch("/notifications/mark-all-read").then(r => r.data),

  
  delete: (id) =>
    api.delete(`/notifications/${id}`).then(r => r.data),

  
  checkDeadlines: () =>
    api.get("/notifications/check-deadlines").then(r => r.data).catch(() => {}),
};

export default notificationService;