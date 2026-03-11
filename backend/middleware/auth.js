const jwt = require("jsonwebtoken");

// Import all user models so we can fetch the actual user after verifying the token
const Client       = require("../models/Client");
const Agency       = require("../models/Agency");
const AgencyMember = require("../models/AgencyMember");
const Team         = require("../models/Team");
const TeamMember   = require("../models/TeamMember");
const Freelancer   = require("../models/Freelancer");

/**
 * Map role strings to their Mongoose models.
 * When the JWT says role: "agency", we know to look in the Agency collection.
 */
const MODEL_MAP = {
  client:        Client,
  agency:        Agency,
  agency_member: AgencyMember,
  team:          Team,
  team_member:   TeamMember,
  freelancer:    Freelancer,
};

/**
 * protect — verifies the JWT and attaches the user to req.user
 *
 * Every protected route uses this as middleware:
 *   router.get("/my-posts", protect, myPostsController)
 *
 * The token is expected in the Authorization header:
 *   Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Non autorisé — token manquant",
      });
    }

    const token = authHeader.split(" ")[1];
    // "Bearer eyJhbGci..." → ["Bearer", "eyJhbGci..."] → take index 1

    // 2. Verify the token
    // jwt.verify throws an error if the token is expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "abc123", role: "client", iat: 1234567890, exp: 1234567890 }

    // 3. Find the user in the correct collection
    const Model = MODEL_MAP[decoded.role];
    if (!Model) {
      return res.status(401).json({
        success: false,
        message: "Rôle invalide dans le token",
      });
    }

    const user = await Model.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Utilisateur introuvable",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Compte désactivé",
      });
    }

    // 4. Attach user to request for downstream controllers
    req.user = user;
    req.userRole = decoded.role;

    next(); // Continue to the actual route handler
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Token invalide" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expiré" });
    }
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * authorize(...roles) — checks that the authenticated user has one of the allowed roles
 *
 * Usage:
 *   router.post("/create-post", protect, authorize("client"), createPost)
 *   router.post("/send-pitch", protect, authorize("agency", "team", "freelancer"), sendPitch)
 *
 * This is a "middleware factory" — it returns a middleware function.
 * authorize("agency") returns: (req, res, next) => { ... }
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé — rôle requis: ${roles.join(" ou ")}`,
      });
    }
    next();
  };
};

/**
 * optionalAuth — like protect but doesn't fail if no token.
 * Used for public routes where we want to know if the user is logged in
 * but don't require it (e.g. browsing open posts).
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      req.userRole = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const Model = MODEL_MAP[decoded.role];
    if (Model) {
      req.user = await Model.findById(decoded.id);
      req.userRole = decoded.role;
    }

    next();
  } catch {
    // Token invalid or expired — treat as unauthenticated
    req.user = null;
    req.userRole = null;
    next();
  }
};

module.exports = { protect, authorize, optionalAuth };