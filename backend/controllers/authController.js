const jwt = require("jsonwebtoken");

const Client       = require("../models/Client");
const Agency       = require("../models/Agency");
const AgencyMember = require("../models/AgencyMember");
const Team         = require("../models/Team");
const TeamMember   = require("../models/TeamMember");
const Freelancer   = require("../models/Freelancer");
const Admin        = require("../models/Admin");
const logActivity  = require("../utils/logActivity");
const { createInitialSubscription } = require("../services/subscriptionService");
const mailer = require("../utils/mailer");

const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");


const VERIFIABLE_MODELS = {
  client:     Client,
  agency:     Agency,
  team:       Team,
  freelancer: Freelancer,
};

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};


const generateEmailToken = (id, role, email) =>
  jwt.sign(
    { id, role, email, purpose: "email_verification" },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );


const deriveName = (role, data = {}) => {
  if (role === "client") return data.firstName ? `${data.firstName} ${data.lastName || ""}`.trim() : data.companyName;
  if (role === "agency") return data.agencyName;
  if (role === "team")   return data.teamName;
  return `${data.firstName || ""} ${data.lastName || ""}`.trim();
};


const sendVerification = (user, role) => {
  try {
    const token = generateEmailToken(user._id, role, user.email);
    const link = `${FRONTEND_URL}/verify-email?token=${token}`;
    mailer
      .sendVerificationEmail({ to: user.email, name: deriveName(role, user), link })
      .catch((err) => console.error("⚠️ verification email failed:", err.message));
  } catch (err) {
    console.error("⚠️ verification email setup failed:", err.message);
  }
};

const formatUser = (user, role) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return { ...obj, role };
};

const hasLetter = (str) => /[a-zA-ZÀ-ÿ]/.test(str);

const register = async (req, res) => {
  try {
    const { role, ...data } = req.body;

    const allowedRoles = ["client", "agency", "team", "freelancer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Rôle invalide" });
    }

    const nameFields = {
      client:     ["firstName", "lastName", "companyName"],
      agency:     ["agencyName", "directorFirstName", "directorLastName"],
      team:       ["teamName", "leadFirstName", "leadLastName"],
      freelancer: ["firstName", "lastName"],
    };
    for (const field of (nameFields[role] || [])) {
      if (data[field] && !hasLetter(data[field])) {
        return res.status(400).json({
          success: false,
          message: `Le champ "${field}" doit contenir au moins une lettre`,
        });
      }
    }

    let user;
    switch (role) {
      case "client":     user = await Client.create(data);     break;
      case "agency":     user = await Agency.create(data);     break;
      case "team":       user = await Team.create(data);       break;
      case "freelancer": user = await Freelancer.create(data); break;
    }

    
    
    try {
      await createInitialSubscription(user._id, role, user.email, user.createdAt);
    } catch (subErr) {
      console.error("⚠️ initial subscription creation failed:", subErr.message);
    }

    
    
    sendVerification(user, role);

    const token = generateToken(user._id, role);
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const actorName = role === "client"
      ? (data.firstName ? `${data.firstName} ${data.lastName}` : data.companyName)
      : role === "agency" ? data.agencyName
      : role === "team" ? data.teamName
      : `${data.firstName || ""} ${data.lastName || ""}`.trim();
    logActivity({
      actorId: user._id, actorRole: role, actorName,
      actionType: "user_registered", targetId: user._id, targetType: "User",
      description: `Nouveau compte ${role} : ${actorName || user.email}`,
    });

    return res.status(201).json({ success: true, user: formatUser(user, role) });

  } catch (error) {
    
    console.error("❌ Register error:", error.message, error.stack);

    
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé" });
    }
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }

    return res.status(500).json({ success: false, message: "Erreur serveur: " + error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const models = [
      { model: Client,       role: "client"        },
      { model: Agency,       role: "agency"        },
      { model: AgencyMember, role: "agency_member" },
      { model: Team,         role: "team"          },
      { model: TeamMember,   role: "team_member"   },
      { model: Freelancer,   role: "freelancer"    },
      { model: Admin,        role: "admin"         },
    ];

    let user = null;
    let role = null;

    for (const entry of models) {
      const found = await entry.model.findOne({ email }).select("+password");
      if (found) { user = found; role = entry.role; break; }
    }

    if (!user) {
      console.warn(`[AUTH_FAIL] ${new Date().toISOString()} ip=${req.ip} email=${String(email).slice(0, 3)}***`);
      return res.status(400).json({ success: false, message: "Email ou mot de passe incorrect" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn(`[AUTH_FAIL] ${new Date().toISOString()} ip=${req.ip} email=${String(email).slice(0, 3)}***`);
      return res.status(400).json({ success: false, message: "Email ou mot de passe incorrect" });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: "Compte désactivé" });
    }

    const token = generateToken(user._id, role);
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true, user: formatUser(user, role) });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur: " + error.message });
  }
};

const getMe = async (req, res) => {
  try {
    return res.status(200).json({ success: true, user: formatUser(req.user, req.userRole) });
  } catch (error) {
    console.error("❌ getMe error:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};



const verifyEmail = async (req, res) => {
  try {
    const token = req.body.token || req.query.token;
    if (!token) {
      return res.status(400).json({ success: false, message: "Lien de vérification manquant." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const expired = err.name === "TokenExpiredError";
      return res.status(400).json({
        success: false,
        code: expired ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
        message: expired
          ? "Ce lien de vérification a expiré. Demandez-en un nouveau."
          : "Lien de vérification invalide.",
      });
    }

    if (decoded.purpose !== "email_verification") {
      return res.status(400).json({ success: false, message: "Lien de vérification invalide." });
    }

    const Model = VERIFIABLE_MODELS[decoded.role];
    if (!Model) {
      return res.status(400).json({ success: false, message: "Lien de vérification invalide." });
    }

    const user = await Model.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Compte introuvable." });
    }

    if (user.isVerified) {
      return res.status(200).json({ success: true, alreadyVerified: true, message: "Votre adresse email est déjà vérifiée." });
    }

    user.isVerified = true;
    await user.save();

    return res.status(200).json({ success: true, message: "Votre adresse email a été vérifiée avec succès." });
  } catch (error) {
    console.error("❌ verifyEmail error:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};



const resendVerification = async (req, res) => {
  try {
    const role = req.userRole;
    if (!VERIFIABLE_MODELS[role]) {
      return res.status(400).json({ success: false, message: "Aucune vérification requise pour ce compte." });
    }
    if (req.user.isVerified) {
      return res.status(200).json({ success: true, alreadyVerified: true, message: "Votre adresse email est déjà vérifiée." });
    }
    if (!mailer.isConfigured()) {
      return res.status(503).json({
        success: false,
        code: "MAIL_NOT_CONFIGURED",
        message: "L'envoi d'emails n'est pas encore configuré côté serveur.",
      });
    }

    sendVerification(req.user, role);
    return res.status(200).json({ success: true, message: "Email de vérification renvoyé. Vérifiez votre boîte de réception." });
  } catch (error) {
    console.error("❌ resendVerification error:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

const ALL_MODELS = [
  { model: Client,       role: "client"        },
  { model: Agency,       role: "agency"        },
  { model: AgencyMember, role: "agency_member" },
  { model: Team,         role: "team"          },
  { model: TeamMember,   role: "team_member"   },
  { model: Freelancer,   role: "freelancer"    },
];

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email requis." });

    let user = null;
    let role = null;
    for (const entry of ALL_MODELS) {
      const found = await entry.model.findOne({ email: email.toLowerCase().trim() });
      if (found) { user = found; role = entry.role; break; }
    }

    // Always return success to not leak whether email exists
    if (!user) {
      return res.status(200).json({ success: true, message: "Si cet email existe, un lien de réinitialisation vous a été envoyé." });
    }

    if (!mailer.isConfigured()) {
      return res.status(503).json({
        success: false,
        code: "MAIL_NOT_CONFIGURED",
        message: "L'envoi d'emails n'est pas encore configuré côté serveur. Contactez l'administrateur.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role, email: user.email, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const link = `${FRONTEND_URL}/reset-password?token=${token}`;
    mailer.sendPasswordResetEmail({ to: user.email, name: deriveName(role, user), link })
      .catch(err => console.error("⚠️ password reset email failed:", err.message));

    return res.status(200).json({ success: true, message: "Si cet email existe, un lien de réinitialisation vous a été envoyé." });
  } catch (err) {
    console.error("❌ forgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: "Token et mot de passe requis." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const expired = err.name === "TokenExpiredError";
      return res.status(400).json({
        success: false,
        code: expired ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
        message: expired
          ? "Ce lien a expiré. Demandez un nouveau lien de réinitialisation."
          : "Lien invalide.",
      });
    }

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ success: false, message: "Lien invalide." });
    }

    const entry = ALL_MODELS.find(e => e.role === decoded.role);
    if (!entry) return res.status(400).json({ success: false, message: "Lien invalide." });

    const user = await entry.model.findById(decoded.id).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "Compte introuvable." });

    user.password = password;
    await user.save();

    return res.status(200).json({ success: true, message: "Mot de passe réinitialisé avec succès. Vous pouvez vous connecter." });
  } catch (err) {
    console.error("❌ resetPassword error:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

const logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
    });
    return res.status(200).json({ success: true, message: "Déconnexion réussie" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

module.exports = { register, login, getMe, logout, verifyEmail, resendVerification, forgotPassword, resetPassword };
