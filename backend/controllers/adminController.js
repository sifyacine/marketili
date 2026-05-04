const Client       = require("../models/Client");
const Agency       = require("../models/Agency");
const AgencyMember = require("../models/AgencyMember"); // ✅ fixed casing
const Team         = require("../models/Team");
const TeamMember   = require("../models/TeamMember");
const Freelancer   = require("../models/Freelancer");
const Admin        = require("../models/Admin"); // ✅ added

exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let results = [];

    const matchSearch = () =>
      search ? {
        $or: [
          { firstName:  { $regex: search, $options: "i" } },
          { lastName:   { $regex: search, $options: "i" } },
          { email:      { $regex: search, $options: "i" } },
          { agencyName: { $regex: search, $options: "i" } },
          { teamName:   { $regex: search, $options: "i" } },
        ],
      } : {};

    if (!role || role === "client") {
      const docs = await Client.find(matchSearch()).select("-password");
      results.push(...docs.map(u => ({ ...u.toObject(), _roleLabel: "client" })));
    }
    if (!role || role === "agency") {
      const docs = await Agency.find(matchSearch()).select("-password");
      results.push(...docs.map(u => ({ ...u.toObject(), _roleLabel: "agency" })));
    }
    if (!role || role === "agency_member") {
      const docs = await AgencyMember.find(matchSearch()).select("-password");
      results.push(...docs.map(u => ({ ...u.toObject(), _roleLabel: "agency_member" })));
    }
    if (!role || role === "team") {
      const docs = await Team.find(matchSearch()).select("-password");
      results.push(...docs.map(u => ({ ...u.toObject(), _roleLabel: "team" })));
    }
    if (!role || role === "team_member") {
      const docs = await TeamMember.find(matchSearch()).select("-password");
      results.push(...docs.map(u => ({ ...u.toObject(), _roleLabel: "team_member" })));
    }
    if (!role || role === "freelancer") {
      const docs = await Freelancer.find(matchSearch()).select("-password");
      results.push(...docs.map(u => ({ ...u.toObject(), _roleLabel: "freelancer" })));
    }

    res.json({ success: true, users: results, total: results.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { id, role } = req.params;

    const MODEL_MAP = {
      client:        Client,
      agency:        Agency,
      agency_member: AgencyMember, // ✅ fixed casing
      team:          Team,
      team_member:   TeamMember,
      freelancer:    Freelancer,
      admin:         Admin,        // ✅ added
    };

    const Model = MODEL_MAP[role];
    if (!Model) return res.status(400).json({ success: false, message: "Rôle invalide" });

    const user = await Model.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur introuvable" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};