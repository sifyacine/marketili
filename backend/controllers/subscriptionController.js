// backend/controllers/subscriptionController.js

const chargily = require("../config/chargily");
const {
  PLANS,
  CURRENCY,
  getPlanAmount,
  TRIAL_DAYS,
} = require("../config/plans");
const subService = require("../services/subscriptionService");
const Subscription = require("../models/Subscription");

const Client = require("../models/Client");
const Agency = require("../models/Agency");
const Team = require("../models/Team");
const Freelancer = require("../models/Freelancer");

const USER_MODELS = [
  { role: "client", Model: Client },
  { role: "agency", Model: Agency },
  { role: "team", Model: Team },
  { role: "freelancer", Model: Freelancer },
];

function deriveName(u, role) {
  if (!u) return "—";
  if (role === "agency") return u.agencyName || "—";
  if (role === "team") return u.teamName || "—";
  const full = `${u.firstName || ""} ${u.lastName || ""}`.trim();
  return full || u.companyName || "—";
}

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
const BACKEND_PUBLIC_URL = (process.env.BACKEND_PUBLIC_URL || "http://localhost:5000").replace(/\/$/, "");

// ── GET /api/subscriptions/plans ───────────────────────────────────────────────
// Public-ish catalog. If authenticated as a billed role, highlights their plan.
const getPlans = async (req, res) => {
  return res.status(200).json({
    success: true,
    trialDays: TRIAL_DAYS,
    currency: CURRENCY,
    plans: PLANS,
    role: req.userRole || null,
  });
};

// ── GET /api/subscriptions/me ──────────────────────────────────────────────────
const getMySubscription = async (req, res) => {
  try {
    const role = req.userRole;
    if (!subService.isBilledRole(role)) {
      // Members / admin are never billed.
      return res.status(200).json({
        success: true,
        billed: false,
        subscription: { status: "exempt", allowed: true },
      });
    }
    const sub = await subService.ensureSubscription(req.user._id, role, req.user.email, req.user.createdAt);
    await subService.reconcile(sub);
    return res.status(200).json({ success: true, billed: true, subscription: subService.toPublic(sub) });
  } catch (err) {
    console.error("❌ getMySubscription:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ── POST /api/subscriptions/checkout ───────────────────────────────────────────
// body: { interval: "month" | "year" }
const createCheckout = async (req, res) => {
  try {
    const role = req.userRole;
    if (!subService.isBilledRole(role)) {
      return res.status(400).json({ success: false, message: "Ce rôle ne nécessite pas d'abonnement." });
    }
    if (!chargily.isConfigured()) {
      return res.status(503).json({
        success: false,
        code: "CHARGILY_NOT_CONFIGURED",
        message: "Le paiement n'est pas encore configuré. Contactez l'administrateur.",
      });
    }

    const interval = req.body.interval === "year" ? "year" : "month";
    const amount = getPlanAmount(role, interval);
    const plan = PLANS[role];
    if (!amount) {
      return res.status(400).json({ success: false, message: "Plan introuvable." });
    }

    const sub = await subService.ensureSubscription(req.user._id, role, req.user.email, req.user.createdAt);

    const checkout = await chargily.createCheckout({
      amount,
      currency: CURRENCY,
      success_url: `${FRONTEND_URL}/billing?payment=success`,
      failure_url: `${FRONTEND_URL}/billing?payment=failed`,
      description: `Abonnement Marketili ${plan.name} (${interval === "year" ? "annuel" : "mensuel"})`,
      locale: "fr",
      metadata: {
        subscriptionId: String(sub._id),
        userId: String(req.user._id),
        role,
        interval,
      },
      webhook_endpoint: `${BACKEND_PUBLIC_URL}/api/subscriptions/webhook`,
    });

    // Remember what's being paid so the webhook / verify step can fulfil it.
    sub.pendingInterval = interval;
    sub.pendingAmount = amount;
    sub.chargily.lastCheckoutId = checkout.id;
    sub.chargily.lastCheckoutUrl = checkout.checkout_url;
    sub.history.push({ event: "checkout_created", interval, amount, checkoutId: checkout.id });
    await sub.save();

    return res.status(200).json({
      success: true,
      checkout_url: checkout.checkout_url,
      checkoutId: checkout.id,
      amount,
      interval,
    });
  } catch (err) {
    console.error("❌ createCheckout:", err.message, err.chargily || "");
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Impossible de créer le paiement.",
    });
  }
};

// ── POST /api/subscriptions/verify ─────────────────────────────────────────────
// Re-reads the last checkout from Chargily and activates the subscription if
// it's paid. Lets the success-redirect flow work in local/test dev without a
// publicly reachable webhook. Idempotent.
const verifyLastCheckout = async (req, res) => {
  try {
    const role = req.userRole;
    if (!subService.isBilledRole(role)) {
      return res.status(200).json({ success: true, subscription: { status: "exempt", allowed: true } });
    }
    const sub = await subService.ensureSubscription(req.user._id, role, req.user.email, req.user.createdAt);
    const checkoutId = sub.chargily.lastCheckoutId;

    if (checkoutId && chargily.isConfigured() && sub.status !== "active") {
      const checkout = await chargily.getCheckout(checkoutId).catch(() => null);
      if (checkout && checkout.status === "paid") {
        const interval = checkout?.metadata?.interval || sub.pendingInterval || "month";
        const amount = Number(checkout.amount) || sub.pendingAmount || getPlanAmount(role, interval);
        await subService.activatePaid(sub, {
          interval,
          amount,
          checkoutId,
          paymentId: checkout.payment_id || checkout.id,
        });
      }
    }

    await subService.reconcile(sub);
    return res.status(200).json({ success: true, subscription: subService.toPublic(sub) });
  } catch (err) {
    console.error("❌ verifyLastCheckout:", err);
    return res.status(500).json({ success: false, message: "Erreur de vérification du paiement." });
  }
};

// ── POST /api/subscriptions/cancel ─────────────────────────────────────────────
// Cancels at period end (keeps access until currentPeriodEnd).
const cancelSubscription = async (req, res) => {
  try {
    const role = req.userRole;
    if (!subService.isBilledRole(role)) {
      return res.status(400).json({ success: false, message: "Aucun abonnement à annuler." });
    }
    const sub = await subService.ensureSubscription(req.user._id, role, req.user.email, req.user.createdAt);
    sub.cancelAtPeriodEnd = true;
    sub.history.push({ event: "canceled", note: "Annulation programmée en fin de période" });
    await sub.save();
    return res.status(200).json({ success: true, subscription: subService.toPublic(sub) });
  } catch (err) {
    console.error("❌ cancelSubscription:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ── POST /api/subscriptions/webhook ────────────────────────────────────────────
// Chargily server-to-server callback. No cookie auth — verified by signature.
// Needs the RAW body (captured in server.js via express.json's verify hook).
const webhook = async (req, res) => {
  try {
    const signature = req.get("signature") || req.get("Signature");
    const raw = req.rawBody || JSON.stringify(req.body || {});

    if (!chargily.verifyWebhookSignature(raw, signature)) {
      console.warn("[CHARGILY_WEBHOOK] signature invalide");
      return res.status(403).json({ success: false, message: "Signature invalide" });
    }

    const event = req.body;
    const type = event?.type;
    const data = event?.data || {};

    if (type === "checkout.paid") {
      const meta = data.metadata || {};
      let sub = null;
      if (meta.subscriptionId) sub = await Subscription.findById(meta.subscriptionId);
      if (!sub && data.id) sub = await Subscription.findOne({ "chargily.lastCheckoutId": data.id });

      if (sub && sub.status !== "active") {
        const interval = meta.interval || sub.pendingInterval || "month";
        const amount = Number(data.amount) || sub.pendingAmount || getPlanAmount(sub.role, interval);
        await subService.activatePaid(sub, {
          interval,
          amount,
          checkoutId: data.id,
          paymentId: data.payment_id || data.id,
        });
        console.log(`[CHARGILY_WEBHOOK] subscription ${sub._id} activée (${interval})`);
      }
    }

    // Always 200 so Chargily stops retrying once received.
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ chargily webhook:", err);
    // Still 200 to avoid infinite retries on our own bug; logged for review.
    return res.status(200).json({ received: true });
  }
};

// ── GET /api/subscriptions/connection (admin) ──────────────────────────────────
// Confirms the Chargily API key works by fetching the wallet balance.
const checkConnection = async (req, res) => {
  try {
    if (!chargily.isConfigured()) {
      return res.status(200).json({
        success: true,
        configured: false,
        mode: chargily.mode,
        message: "CHARGILY_SECRET_KEY non défini.",
      });
    }
    const balance = await chargily.getBalance();
    return res.status(200).json({ success: true, configured: true, mode: chargily.mode, balance });
  } catch (err) {
    return res.status(200).json({
      success: false,
      configured: true,
      mode: chargily.mode,
      message: err.message || "Connexion Chargily échouée",
    });
  }
};

// ── POST /api/subscriptions/admin/backfill (admin) ─────────────────────────────
// Creates a (signup-anchored) trial subscription for every billed user that
// doesn't have one yet — brings legacy accounts into the billing system so the
// overview shows real statuses. Idempotent.
const backfillTrials = async (req, res) => {
  try {
    let created = 0;
    let skipped = 0;
    for (const { role, Model } of USER_MODELS) {
      const users = await Model.find({}).select("email createdAt").lean();
      for (const u of users) {
        const existing = await Subscription.findOne({ user: u._id, role }).select("_id").lean();
        if (existing) { skipped++; continue; }
        await subService.createTrialSubscription(u._id, role, u.email, u.createdAt);
        created++;
      }
    }
    return res.status(200).json({ success: true, created, skipped });
  } catch (err) {
    console.error("❌ backfillTrials:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ── GET /api/subscriptions (admin) ─────────────────────────────────────────────
// Full per-user billing overview: every billed account joined with its
// subscription, the *effective* status (so an expired trial reads "expired"
// even if the stored status is stale), plus a summary + total collected.
// Query: ?status=active|trialing|expired|none  ?role=client|agency|team|freelancer  ?search=
const listSubscriptions = async (req, res) => {
  try {
    const { status: statusFilter, role: roleFilter, search } = req.query;

    // 1. All subscriptions, indexed by user id.
    const subs = await Subscription.find({}).lean();
    const subByUser = new Map(subs.map((s) => [String(s.user), s]));

    // 2. Join with every billed user.
    let rows = [];
    let collected = 0;
    for (const { role, Model } of USER_MODELS) {
      const users = await Model.find({})
        .select("firstName lastName companyName agencyName teamName email isActive createdAt")
        .lean();
      for (const u of users) {
        const sub = subByUser.get(String(u._id));
        const eff = sub
          ? subService.getEffectiveStatus(sub)
          : { status: "none", allowed: false, daysLeft: 0, periodEnd: null };

        const paidHistory = (sub?.history || []).filter((h) => h.event === "paid");
        for (const h of paidHistory) collected += Number(h.amount) || 0;
        const lastPaid = paidHistory[paidHistory.length - 1] || null;

        rows.push({
          id: String(u._id),
          role,
          name: deriveName(u, role),
          email: u.email,
          accountActive: u.isActive !== false,
          hasSubscription: !!sub,
          status: eff.status, // effective: active | trialing | expired | past_due | canceled | none
          allowed: eff.allowed,
          daysLeft: eff.daysLeft,
          interval: sub?.interval || null,
          amount: sub?.amount || 0,
          currency: sub?.currency || CURRENCY,
          trialEndsAt: sub?.trialEndsAt || null,
          currentPeriodEnd: sub?.currentPeriodEnd || null,
          cancelAtPeriodEnd: !!sub?.cancelAtPeriodEnd,
          lastPaidAt: lastPaid?.at || null,
          lastPaidAmount: lastPaid?.amount || null,
          createdAt: u.createdAt,
        });
      }
    }

    // 3. Summary over the unfiltered set.
    const isExpired = (s) => ["expired", "past_due", "canceled"].includes(s);
    const summary = {
      total: rows.length,
      active: rows.filter((r) => r.status === "active").length,
      trialing: rows.filter((r) => r.status === "trialing").length,
      expired: rows.filter((r) => isExpired(r.status)).length,
      none: rows.filter((r) => r.status === "none").length,
      collected,
      currency: CURRENCY,
    };

    // 4. Apply filters (summary above stays global).
    if (roleFilter) rows = rows.filter((r) => r.role === roleFilter);
    if (statusFilter) {
      rows =
        statusFilter === "expired"
          ? rows.filter((r) => isExpired(r.status))
          : rows.filter((r) => r.status === statusFilter);
    }
    if (search) {
      const q = String(search).toLowerCase();
      rows = rows.filter(
        (r) => r.name.toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q)
      );
    }

    rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      mode: chargily.mode,
      configured: chargily.isConfigured(),
      summary,
      count: rows.length,
      users: rows,
    });
  } catch (err) {
    console.error("❌ listSubscriptions:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

module.exports = {
  getPlans,
  getMySubscription,
  createCheckout,
  verifyLastCheckout,
  cancelSubscription,
  webhook,
  checkConnection,
  listSubscriptions,
  backfillTrials,
};
