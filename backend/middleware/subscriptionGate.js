// backend/middleware/subscriptionGate.js
//
// Server-side enforcement of the trial/paywall for "value" actions
// (e.g. creating a post, sending a pitch). Self-contained: it reads and
// verifies the JWT cookie itself, so it can guard routes that don't run the
// `protect` middleware (several create endpoints take the user id from the body
// rather than the token). Token-less requests pass through unchanged, preserving
// existing behaviour — enforcement applies to authenticated billed users.
//
// On a lapsed trial/period it responds 402 Payment Required with
// { code: "SUBSCRIPTION_REQUIRED" } so the frontend can route to /billing.

const jwt = require("jsonwebtoken");
const { ensureSubscription, getEffectiveStatus, isBilledRole } = require("../services/subscriptionService");

module.exports = async function subscriptionGate(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return next(); // unauthenticated — leave existing flow untouched

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(); // invalid/expired token — let the route's own logic handle it
    }

    // Only billed roles are gated; members / admin are exempt.
    if (!isBilledRole(decoded.role)) return next();

    const sub = await ensureSubscription(decoded.id, decoded.role);
    const eff = getEffectiveStatus(sub);
    if (eff.allowed) return next();

    return res.status(402).json({
      success: false,
      code: "SUBSCRIPTION_REQUIRED",
      message:
        eff.trialEnded || eff.status === "expired"
          ? "Votre période d'essai a expiré. Abonnez-vous pour continuer."
          : "Un abonnement actif est requis pour cette action.",
      status: eff.status,
      trialEndsAt: sub?.trialEndsAt,
      currentPeriodEnd: sub?.currentPeriodEnd,
    });
  } catch (err) {
    // Never block the app on a gate bug — log and let the request proceed.
    console.error("⚠️ subscriptionGate error:", err.message);
    return next();
  }
};
