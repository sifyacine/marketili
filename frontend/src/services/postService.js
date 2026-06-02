import api from "./api";

const postService = {
  create: (data) => {
    // ✅ Only use FormData when a file is actually attached
    if (data.file) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === "file") {
          formData.append("file", data.file);
        } else if (typeof data[key] === "object" && data[key] !== null) {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      });
      return api.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then(r => r.data);
    }

    // No file — send as JSON so nested objects (budget, location) parse correctly
    return api.post("/posts", data).then(r => r.data);
  },

  getAll: (params = {}) =>
    api.get("/posts", { params }).then(r => r.data),

  getMy: (clientId, params = {}) =>
    api.get("/posts/my", { params: { clientId, ...params } }).then(r => r.data),

  getById: (id) =>
    api.get(`/posts/${id}`).then(r => r.data),

  update: (id, data) =>
    api.put(`/posts/${id}`, data).then(r => r.data),

  close: (id, clientId, reason = "") =>
    api.patch(`/posts/${id}/close`, { clientId, reason }).then(r => r.data),

  reactivate: (id, clientId) =>
    api.patch(`/posts/${id}/reactivate`, { clientId }).then(r => r.data),

  sendTo: (id, clientId, providerType, providerId) =>
    api.post(`/posts/${id}/send`, { clientId, providerType, providerId }).then(r => r.data),

  delete: (id, clientId) =>
    api.delete(`/posts/${id}`, { data: { clientId } }).then(r => r.data),
};

export default postService;