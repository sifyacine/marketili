import api from "./api";

const profileService = {
  getProfile: (role, id) =>
    api.get(`/profile/${role}/${id}`).then(r => r.data),

  updateProfile: (data) =>
    api.patch("/profile/me", data).then(r => r.data),

  browseProviders: (params = {}) =>
    api.get("/profile/providers", { params }).then(r => r.data),

  createPost: (data) =>
    api.post("/profile/posts", data).then(r => r.data),

  getPosts: (role, id, params = {}) =>
    api.get(`/profile/${role}/${id}/posts`, { params }).then(r => r.data),

  deletePost: (id) =>
    api.delete(`/profile/posts/${id}`).then(r => r.data),
};

export default profileService;
