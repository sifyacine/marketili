// frontend/src/services/notificationService.js

import api from "./api";

const notificationService = {
  // Get notifications (paginated, filterable by category)
  getAll: (params = {}) =>
    api.get("/notifications", { params }).then(r => r.data),

  // Get just the unread count (for bell badge)
  getUnreadCount: () =>
    api.get("/notifications/unread-count").then(r => r.data.count),

  // Mark one as read
  markRead: (id) =>
    api.patch(`/notifications/${id}/read`).then(r => r.data),

  // Mark all as read
  markAllRead: () =>
    api.patch("/notifications/mark-all-read").then(r => r.data),

  // Delete one
  delete: (id) =>
    api.delete(`/notifications/${id}`).then(r => r.data),

  // Check for approaching deadlines — call once on dashboard mount
  checkDeadlines: () =>
    api.get("/notifications/check-deadlines").then(r => r.data).catch(() => {}),
};

export default notificationService;