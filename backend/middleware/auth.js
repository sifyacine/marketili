const jwt = require("jsonwebtoken");
const Client       = require("../models/Client");
const Agency       = require("../models/Agency");
const AgencyMember = require("../models/AgencyMember");
const Team         = require("../models/Team");
const TeamMember   = require("../models/TeamMember");
const Freelancer   = require("../models/Freelancer");
const Admin        = require("../models/Admin");




const MODEL_MAP = {
  client:        Client,
  agency:        Agency,
  agency_member: AgencyMember,
  team:          Team,
  team_member:   TeamMember,
  freelancer:    Freelancer,
  admin:         Admin,
};




const protect = async (req, res, next) => {
  try {
    
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Non autorisé — token manquant",
      });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
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

    req.user = user;
    req.userRole = decoded.role;

    next();
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




const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      req.user = null;
      req.userRole = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const Model = MODEL_MAP[decoded.role];

    if (Model) {
      req.user = await Model.findById(decoded.id);
      req.userRole = decoded.role;
    }

    next();
  } catch {
    req.user = null;
    req.userRole = null;
    next();
  }
};




const adminOnly = (req, res, next) => {
  if (!req.user || req.userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Accès refusé — administrateurs uniquement",
    });
  }
  next();
};

module.exports = { protect, authorize, optionalAuth, adminOnly };