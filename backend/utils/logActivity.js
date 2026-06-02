const ActivityLog = require("../models/ActivityLog");

async function logActivity({ actorId, actorRole, actorName, actionType, targetId, targetType, description, metadata }) {
  try {
    await ActivityLog.create({ actorId, actorRole, actorName, actionType, targetId, targetType, description, metadata });
  } catch {}
}

module.exports = logActivity;
