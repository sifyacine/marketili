const AgencyMember = require("../models/AgencyMember");

// ─────────────────────────────────────────────
// CREATE MEMBER  POST /api/agency-members/create
// Called by director — generates a temporary password
// mustChangePassword is true by default on the model
// ─────────────────────────────────────────────
exports.createMember = async (req, res) => {
  try {
    const { firstName, lastName, email, password, jobTitle, phone } = req.body;
    const agencyId = req.user._id;

    const existing = await AgencyMember.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email déjà utilisé" });
    }

    const member = await AgencyMember.create({
      agency: agencyId,
      firstName, lastName, email, password, jobTitle, phone,
      mustChangePassword: true, // always forced on creation
    });

    const safe = member.toObject();
    delete safe.password;
    res.status(201).json({ success: true, member: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET MEMBERS  GET /api/agency-members
// ─────────────────────────────────────────────
exports.getMembers = async (req, res) => {
  try {
    const agencyId = req.user._id;
    const members = await AgencyMember.find({ agency: agencyId })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, members });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// CHANGE PASSWORD  POST /api/agency-members/change-password
// Called by member on first login
// Clears mustChangePassword flag after success
// ─────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const memberId = req.user._id;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 8 caractères",
      });
    }

    // Must use findById with +password to trigger the pre-save hook
    const member = await AgencyMember.findById(memberId).select("+password");
    if (!member) {
      return res.status(404).json({ success: false, message: "Membre introuvable" });
    }

    member.password          = newPassword; // pre-save hook will hash it
    member.mustChangePassword = false;
    await member.save();

    const safe = member.toObject();
    delete safe.password;
    res.json({ success: true, user: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// TOGGLE ACTIVE  PATCH /api/agency-members/:id/toggle
// ─────────────────────────────────────────────
exports.toggleMember = async (req, res) => {
  try {
    const member = await AgencyMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Membre introuvable" });
    }
    member.isActive = !member.isActive;
    await member.save();
    res.json({ success: true, isActive: member.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};