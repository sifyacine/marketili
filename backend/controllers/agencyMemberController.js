const AgencyMember = require("../models/AgencyMember"); // ✅ fixed casing

exports.createMember = async (req, res) => {
  try {
    const { firstName, lastName, email, password, jobTitle, phone } = req.body;
    const agencyId = req.user._id;

    const existing = await AgencyMember.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Email déjà utilisé" });

    const member = await AgencyMember.create({
      agency: agencyId,
      firstName, lastName, email, password, jobTitle, phone,
    });

    const safe = member.toObject();
    delete safe.password;
    res.status(201).json({ success: true, member: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

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