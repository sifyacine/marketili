const jwt = require("jsonwebtoken");

const Client       = require("../models/Client");
const Agency       = require("../models/Agency");
const AgencyMember = require("../models/AgencyMember");
const Team         = require("../models/Team");
const TeamMember   = require("../models/TeamMember");  // ← fixed: was Teammember
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

// ── Helper: format user for response (remove sensitive fields) ──
const formatUser = (user, role) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return { ...obj, role };
};

/**
 * POST /api/auth/register
 *
 * Body:
 *   role: "client" | "agency" | "team" | "freelancer"
 *   + all fields for that role
 *
 * Returns: { success, token, user }
 */
const register = async (req, res) => {
  try {
    const { role, ...data } = req.body;

    console.log("📝 Register attempt:", { role, email: data.email, accountType: data.accountType });

    // Validate role
    const allowedRoles = ["client", "agency", "team", "freelancer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Rôle invalide. Choisissez: client, agency, team ou freelancer",
      });
    }

    let user;

    // Create the right type of user based on role
    switch (role) {
      case "client":
        // Validate accountType is present
        if (!data.accountType) {
          return res.status(400).json({
            success: false,
            message: "Type de compte requis (person ou company)",
          });
        }
        // Validate that the right name fields are present
        if (data.accountType === "person" && (!data.firstName || !data.lastName)) {
          return res.status(400).json({
            success: false,
            message: "Prénom et nom requis pour un compte personnel",
          });
        }
        if (data.accountType === "company" && !data.companyName) {
          return res.status(400).json({
            success: false,
            message: "Nom de l'entreprise requis pour un compte entreprise",
          });
        }
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
    console.log("✅ Registered successfully:", { role, email: data.email });

    return res.status(201).json({
      success: true,
      token,
      user: formatUser(user, role),
    });
  } catch (error) {
    // Duplicate email — MongoDB error code 11000
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé",
      });
    }
    // Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
    }
    console.error("❌ Register error:", error.message, error.stack);
    return res.status(500).json({ success: false, message: "Erreur serveur: " + error.message });
  }
};

/**
 * POST /api/auth/login
 *
 * Body: { email, password, role? }
 *
 * If role is provided — searches only that collection (original behavior).
 * If role is omitted — searches ALL collections in order (email-only login).
 * Admin is always included in the search.
 *
 * Returns: { success, token, user }
 */
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { email, password } = req.body;

  // ... your existing user lookup logic

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // ✅ SET HTTP-ONLY COOKIE
  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // ⚠️ true in production (HTTPS)
    sameSite: "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // ❗ DO NOT send token anymore
  res.json({
    user,
  });
};

/**
 * GET /api/auth/me
 * Protected — returns the currently authenticated user.
 * Used by the frontend to restore session on page refresh.
 */
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: formatUser(req.user, req.userRole),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * POST /api/auth/logout
 * Clears the refresh token from the DB (stateless JWT just discarded client-side).
 */
const logout = async (req, res) => {
  try {
    // Just return success — the client discards the token
    return res.status(200).json({ success: true, message: "Déconnexion réussie" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

module.exports = { register, login, getMe, logout };