import api from "./api";

const adService = {
  getAds:      (placement, role) => api.get("/ads", { params: { placement, role } }).then(r => r.data),
  getAdminAds: ()                => api.get("/admin/ads").then(r => r.data),
  createAd:    (data)            => api.post("/admin/ads", data).then(r => r.data),
  updateAd:    (id, data)        => api.patch(`/admin/ads/${id}`, data).then(r => r.data),
  toggleAd:    (id)              => api.patch(`/admin/ads/${id}/toggle`).then(r => r.data),
  deleteAd:    (id)              => api.delete(`/admin/ads/${id}`).then(r => r.data),
  getActivityLog: (params)       => api.get("/admin/activity/log", { params }).then(r => r.data),
};

export default adService;
