const TeamMember = require("../models/TeamMember");
const Team       = require("../models/Team");

const ok   = (res, data, code = 200) => res.status(code).json({ success: true,  ...data });
const fail = (res, msg,  code = 400) => res.status(code).json({ success: false, message: msg });




exports.createMember = async (req, res) => {
  try {
    const { firstName, lastName, email, password, jobTitle, phone } = req.body;
    const teamId = req.user._id;

    const existing = await TeamMember.findOne({ email });
    if (existing) return fail(res, "Email déjà utilisé");

    const member = await TeamMember.create({
      team: teamId, firstName, lastName, email, password,
      jobTitle, phone, mustChangePassword: true,
    });

    
    await Team.findByIdAndUpdate(teamId, { $addToSet: { members: member._id } });

    const safe = member.toObject();
    delete safe.password;
    return ok(res, { member: safe }, 201);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};




exports.getMembers = async (req, res) => {
  try {
    const teamId = req.user._id;
    const members = await TeamMember.find({ team: teamId })
      .select("-password")
      .sort({ createdAt: -1 });
    return ok(res, { members });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};




exports.toggleMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return fail(res, "Membre introuvable", 404);

    member.isActive = !member.isActive;
    await member.save();
    return ok(res, { isActive: member.isActive });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};




exports.restoreMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return fail(res, "Membre introuvable", 404);

    member.isActive = true;
    await member.save();
    return ok(res, { isActive: member.isActive });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};




exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return fail(res, "Le mot de passe doit contenir au moins 8 caractères");
    }

    const member = await TeamMember.findById(req.user._id).select("+password");
    if (!member) return fail(res, "Membre introuvable", 404);

    member.password          = newPassword;
    member.mustChangePassword = false;
    await member.save();

    const safe = member.toObject();
    delete safe.password;
    return ok(res, { user: safe });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
