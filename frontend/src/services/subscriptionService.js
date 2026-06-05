// frontend/src/services/subscriptionService.js

import api from "./api";

const subscriptionService = {
  // Current user's subscription + effective status + their plan.
  getMine: () => api.get("/subscriptions/me").then((r) => r.data),

  // Full plan catalog (works logged-out too).
  getPlans: () => api.get("/subscriptions/plans").then((r) => r.data),

  // Create a Chargily checkout for the user's role plan.
  // interval: "month" | "year" → returns { checkout_url }.
  createCheckout: (interval) =>
    api.post("/subscriptions/checkout", { interval }).then((r) => r.data),

  // Re-check the last checkout with Chargily and activate if paid.
  // Used on return from the hosted payment page (works in test mode locally).
  verify: () => api.post("/subscriptions/verify").then((r) => r.data),

  // Cancel at the end of the current period (keeps access until then).
  cancel: () => api.post("/subscriptions/cancel").then((r) => r.data),

  // ── Admin ──────────────────────────────────────────────────────────────────
  // Full per-user billing overview + summary.
  adminOverview: (params = {}) =>
    api.get("/subscriptions", { params }).then((r) => r.data),

  // Chargily connection / wallet balance check (confirms the API key works).
  connection: () => api.get("/subscriptions/connection").then((r) => r.data),

  // Create signup-anchored trials for billed users that don't have one yet.
  backfill: () => api.post("/subscriptions/admin/backfill").then((r) => r.data),
};

export default subscriptionService;
