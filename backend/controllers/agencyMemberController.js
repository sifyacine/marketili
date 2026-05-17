const AgencyMember = require("../models/AgencyMember");
const Freelancer   = require("../models/Freelancer");
const Agency       = require("../models/Agency");

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
// SET MEMBER STATUS  PATCH /api/agency-members/:id/status
// Accepts target accountStatus instead of toggling
// ─────────────────────────────────────────────
const VALID_STATUSES = ["active", "inactive", "suspended", "archived"];

exports.setMemberStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Statut invalide" });
    }
    const member = await AgencyMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: "Membre introuvable" });
    }
    const prevStatus = member.accountStatus;
    member.accountStatus = status;
    await member.save();

    // Notify member when their account is restored to active
    if (status === "active" && prevStatus && prevStatus !== "active") {
      const Notification = require("../models/Notification");
      Notification.notify({
        recipient: member._id, recipientRole: "agency_member", recipientModel: "AgencyMember",
        type: "system", category: "admin",
        title: "Votre compte a été réactivé",
        body: "Votre accès à la plateforme a été restauré par l'administrateur.",
        link: "/dashboard",
      });
    }

    res.json({ success: true, accountStatus: member.accountStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// ATTACH FREELANCER  PATCH /api/agency-members/attach-freelancer
// Body: { agencyId, freelancerId, role, contractId }
// ─────────────────────────────────────────────
exports.attachFreelancer = async (req, res) => {
  try {
    const { agencyId, freelancerId, role, contractId } = req.body;
    if (!agencyId || !freelancerId) {
      return res.status(400).json({ success: false, message: "agencyId et freelancerId requis" });
    }

    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ success: false, message: "Freelancer introuvable" });
    }

    const alreadyActive = freelancer.agencyCollaborations.some(
      c => c.agency?.toString() === agencyId && c.status === "active"
    );
    if (alreadyActive) {
      return res.status(400).json({ success: false, message: "Collaboration déjà active avec cette agence" });
    }

    freelancer.agencyCollaborations.push({
      agency: agencyId,
      role: role || "collaborateur",
      contractId: contractId || undefined,
      startDate: new Date(),
      status: "active",
    });
    await freelancer.save();

    res.json({ success: true, message: "Freelancer attaché à l'agence" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// DETACH FREELANCER  PATCH /api/agency-members/detach-freelancer
// Body: { agencyId, freelancerId }
// ─────────────────────────────────────────────
exports.detachFreelancer = async (req, res) => {
  try {
    const { agencyId, freelancerId } = req.body;
    const freelancer = await Freelancer.findById(freelancerId);
    if (!freelancer) {
      return res.status(404).json({ success: false, message: "Freelancer introuvable" });
    }

    const collab = freelancer.agencyCollaborations.find(
      c => c.agency?.toString() === agencyId && c.status === "active"
    );
    if (!collab) {
      return res.status(404).json({ success: false, message: "Collaboration active introuvable" });
    }

    const { reason } = req.body;
    collab.status   = "ended";
    collab.endDate  = new Date();
    collab.endedBy  = agencyId;
    if (reason) collab.endReason = reason;
    await freelancer.save();

    res.json({ success: true, message: "Collaboration terminée" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET FREELANCERS FOR AGENCY  GET /api/agency-members/freelancers
// Returns freelancers with active/all collaborations for this agency
// ─────────────────────────────────────────────
exports.getFreelancers = async (req, res) => {
  try {
    const agencyId = req.user._id;
    const freelancers = await Freelancer.find({
      "agencyCollaborations.agency": agencyId,
    }).select("-password").lean();

    const result = freelancers.map(f => {
      const collab = f.agencyCollaborations.find(
        c => c.agency?.toString() === agencyId.toString()
      );
      return { ...f, collaboration: collab };
    });

    res.json({ success: true, freelancers: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// RESTORE MEMBER  PATCH /api/agency-members/:id/restore
// Sets accountStatus back to "active"
// ─────────────────────────────────────────────
exports.restoreMember = async (req, res) => {
  try {
    const member = await AgencyMember.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Membre introuvable" });

    member.accountStatus = "active";
    await member.save();
    res.json({ success: true, accountStatus: member.accountStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// GET MEMBER HISTORY  GET /api/agency-members/:id/history
// Returns projects + tasks the member worked on
// ─────────────────────────────────────────────
const Project = require("../models/Project");

exports.getMemberHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const projects = await Project.find({
      $or: [
        { "assignedMembers.memberId": id },
        { "tasks.assignedTo.memberId": id },
        { "tasks.previousAssignees.memberId": id },
      ],
    })
      .select("title projectStatus deadline progress tasks assignedMembers")
      .lean();

    const history = projects.map(p => {
      const myTasks = (p.tasks || []).filter(t =>
        (t.assignedTo || []).some(a => String(a.memberId) === id) ||
        (t.previousAssignees || []).some(a => String(a.memberId) === id)
      );
      return {
        _id:      p._id,
        title:    p.title,
        status:   p.projectStatus,
        deadline: p.deadline,
        progress: p.progress,
        tasks: myTasks.map(t => ({
          _id:               t._id,
          title:             t.title,
          status:            t.status,
          priority:          t.priority,
          dueDate:           t.dueDate,
          isCurrentAssignee: (t.assignedTo || []).some(a => String(a.memberId) === id),
          isPreviousAssignee: (t.previousAssignees || []).some(a => String(a.memberId) === id),
          removedAt: (t.previousAssignees || []).find(a => String(a.memberId) === id)?.removedAt,
        })),
      };
    });

    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};