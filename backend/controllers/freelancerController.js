

const Freelancer = require("../models/Freelancer");
const Project    = require("../models/Project");
const Pitch      = require("../models/Pitch");

const ok   = (res, data, code = 200) => res.status(code).json({ success: true,  ...data });
const fail = (res, msg,  code = 400) => res.status(code).json({ success: false, message: msg });


exports.getCollaborations = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id)
      .populate("agencyCollaborations.agency", "agencyName logo bio specialties address")
      .lean();

    if (!freelancer) return fail(res, "Freelancer introuvable", 404);

    const active = (freelancer.agencyCollaborations || [])
      .filter(c => c.status === "active" && c.agency);

    return ok(res, { collaborations: active });
  } catch (err) {
    console.error("getCollaborations:", err);
    return fail(res, "Erreur serveur", 500);
  }
};


exports.getFreelancerProjects = async (req, res) => {
  try {
    const { id }      = req.params;
    const { agencyId, status } = req.query;

    let filter;
    if (agencyId) {
      filter = {
        providerAgency: agencyId,
        "assignedMembers.memberId": id,
      };
    } else {
      filter = { providerFreelancer: id };
    }

    if (status) filter.projectStatus = status;

    const projects = await Project.find(filter)
      .populate("client", "firstName lastName companyName accountType")
      .populate("post",   "title categories")
      .sort({ deadline: 1 })
      .lean();

    return ok(res, { projects });
  } catch (err) {
    console.error("getFreelancerProjects:", err);
    return fail(res, "Erreur serveur", 500);
  }
};


exports.getFreelancerPitches = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {
      $or: [
        { senderFreelancer: id },
        { pitchType: "agency_to_freelancer", freelancer: id },
      ],
    };
    if (status && status !== "all") filter.status = status;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, parseInt(limit, 10));

    const [pitches, total] = await Promise.all([
      Pitch.find(filter)
        .populate("post",         "title status deadline budget")
        .populate("client",       "firstName lastName companyName accountType")
        .populate("senderAgency", "agencyName logo")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Pitch.countDocuments(filter),
    ]);

    return ok(res, { pitches, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error("getFreelancerPitches:", err);
    return fail(res, "Erreur serveur", 500);
  }
};
