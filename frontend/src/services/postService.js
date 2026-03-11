import api from "./api";

const postService = {
  /** Create a new post */
  create: (data) =>
    api.post("/posts", data).then(r => r.data),

  /** Get all open posts with filters */
  getAll: (params = {}) =>
    api.get("/posts", { params }).then(r => r.data),

  /** Get the current client's posts */
  getMy: (clientId, params = {}) =>
    api.get("/posts/my", { params: { clientId, ...params } }).then(r => r.data),

  /** Get a single post by ID */
  getById: (id) =>
    api.get(`/posts/${id}`).then(r => r.data),

  /** Update a post */
  update: (id, data) =>
    api.put(`/posts/${id}`, data).then(r => r.data),

  /** Close a post (auto-rejects pending pitches) */
  close: (id, clientId, reason = "") =>
    api.patch(`/posts/${id}/close`, { clientId, reason }).then(r => r.data),

  /** Reactivate a closed post */
  reactivate: (id, clientId) =>
    api.patch(`/posts/${id}/reactivate`, { clientId }).then(r => r.data),

  /** Send post to a specific provider */
  sendTo: (id, clientId, providerType, providerId) =>
    api.post(`/posts/${id}/send`, { clientId, providerType, providerId }).then(r => r.data),

  /** Delete a post (only if 0 pitches) */
  delete: (id, clientId) =>
    api.delete(`/posts/${id}`, { data: { clientId } }).then(r => r.data),
};

export default postService;