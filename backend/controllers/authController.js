const jwt = require("jsonwebtoken");

const Client       = require("../models/Client");
const Agency       = require("../models/Agency");
const AgencyMember = require("../models/AgencyMember");
const Team         = require("../models/Team");
const TeamMember   = require("../models/TeamMember");
const Freelancer   = require("../models/Freelancer");
const Admin        = require("../models/Admin");

// ── Helper: generate JWT ──
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ── Helper: format user ──
const formatUser = (user, role) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return { ...obj, role };
};

/**
 * REGISTER (already correct)
 */
const register = async (req, res) => {
  try {
    const { role, ...data } = req.body;

    const allowedRoles = ["client", "agency", "team", "freelancer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Rôle invalide",
      });
    }

    let user;

    switch (role) {
      case "client":
        user = await Client.create(data);
        break;
      case "agency":
        user = await Agency.create(data);
        break;
      case "team":
        user = await Team.create(data);
        break;
      case "freelancer":
        user = await Freelancer.create(data);
        break;
    }

    const token = generateToken(user._id, role);

    // ✅ cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      user: formatUser(user, role),
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * LOGIN — ✅ FIXED
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const models = [
      { model: Client, role: "client" },
      { model: Agency, role: "agency" },
      { model: AgencyMember, role: "agency_member" },
      { model: Team, role: "team" },
      { model: TeamMember, role: "team_member" },
      { model: Freelancer, role: "freelancer" },
      { model: Admin, role: "admin" },
    ];

    let user = null;
    let role = null;

    for (const entry of models) {
      const found = await entry.model.findOne({ email });
      if (found) {
        user = found;
        role = entry.role;
        break;
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Compte désactivé",
      });
    }

    const token = generateToken(user._id, role);

    // ✅ UPDATED COOKIE (same as register)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      user: formatUser(user, role),
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

/**
 * GET ME (unchanged)
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: formatUser(req.user, req.userRole),
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

/**
 * LOGOUT — ✅ FIXED
 */
const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    });

    return res.status(200).json({
      success: true,
      message: "Déconnexion réussie",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

module.exports = { register, login, getMe, logout };