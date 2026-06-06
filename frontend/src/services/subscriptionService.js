

import api from "./api";

const subscriptionService = {
  
  getMine: () => api.get("/subscriptions/me").then((r) => r.data),

  
  getPlans: () => api.get("/subscriptions/plans").then((r) => r.data),

  
  
  createCheckout: (interval) =>
    api.post("/subscriptions/checkout", { interval }).then((r) => r.data),

  
  
  verify: () => api.post("/subscriptions/verify").then((r) => r.data),

  
  cancel: () => api.post("/subscriptions/cancel").then((r) => r.data),

  
  
  adminOverview: (params = {}) =>
    api.get("/subscriptions", { params }).then((r) => r.data),

  
  connection: () => api.get("/subscriptions/connection").then((r) => r.data),

  
  backfill: () => api.post("/subscriptions/admin/backfill").then((r) => r.data),
};

export default subscriptionService;
