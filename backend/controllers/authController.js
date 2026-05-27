const jwt = require("jsonwebtoken");

const Client       = require("../models/Client");
const Agency       = require("../models/Agency");
const AgencyMember = require("../models/AgencyMember");
const Team         = require("../models/Team");
const TeamMember   = require("../models/TeamMember");
const Freelancer   = require("../models/Freelancer");
const Admin        = require("../models/Admin");
const logActivity  = require("../utils/logActivity");

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
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
    // ✅ Log the real error so we can see it in the terminal
    console.error("❌ Register error:", error.message, error.stack);

    // Duplicate email
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé" });
    }
    // Mongoose validation errors
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
      return res.status(400).json({ success: false, message: "Email ou mot de passe incorrect" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
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

module.exports = { register, login, getMe, logout };