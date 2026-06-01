// backend/controllers/activityController.js

const ActivityLog = require("../models/ActivityLog");

const ok   = (res, data, code = 200) => res.status(code).json({ success: true,  ...data });
const fail = (res, msg,  code = 400) => res.status(code).json({ success: false, message: msg });

// GET /api/activity/me
// Returns the activity log for the currently authenticated user
exports.getMyActivity = async (req, res) => {
  try {
    const { page = 1, limit = 30, actionType } = req.query;
    const pageNum  = Math.max(1, parseInt(page,  10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const filter = { actorId: req.user._id };
    if (actionType && actionType !== "all") filter.actionType = actionType;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return ok(res, { logs, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error("getMyActivity:", err);
    return fail(res, "Erreur serveur", 500);
  }
};
