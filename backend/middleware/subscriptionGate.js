











const jwt = require("jsonwebtoken");
const { ensureSubscription, getEffectiveStatus, isBilledRole } = require("../services/subscriptionService");

module.exports = async function subscriptionGate(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return next(); 

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(); 
    }

    
    if (!isBilledRole(decoded.role)) return next();

    // Agency-to-freelancer conventions are a platform collaboration feature,
    // not a marketplace action — exempt them from the subscription gate.
    if (req.body?.pitchType === "agency_to_freelancer") return next();

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
    
    console.error("⚠️ subscriptionGate error:", err.message);
    return next();
  }
};
