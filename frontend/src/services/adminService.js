import api from "./api";

const adminService = {
  getUsers: (params = {}) =>
    api.get("/admin/users", { params }),

  toggleUser: (role, id) =>
    api.patch(`/admin/users/${role}/${id}/toggle`),

  getStats: () =>
    api.get("/admin/stats").then(r => r.data),

  getActivity: () =>
    api.get("/admin/activity").then(r => r.data),

  getPosts: (params = {}) =>
    api.get("/admin/posts", { params }).then(r => r.data),

  removePost: (id, reason) =>
    api.patch(`/admin/posts/${id}/remove`, { reason }).then(r => r.data),

  reactivatePost: (id) =>
    api.patch(`/admin/posts/${id}/reactivate`).then(r => r.data),

  getAllOptions: () =>
    api.get("/admin/options").then(r => r.data),

  getOptions: (key) =>
    api.get(`/admin/options/${key}`).then(r => r.data),

  addOptionValue: (key, value) =>
    api.post(`/admin/options/${key}/add`, { value }).then(r => r.data),

  deleteOptionValue: (key, value) =>
    api.delete(`/admin/options/${key}/${encodeURIComponent(value)}`).then(r => r.data),
};

export default adminService;
