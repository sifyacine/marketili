const AgencyMember = require("../models/AgencyMember");

async function findDirectorId(agencyId) {
  const director = await AgencyMember.findOne({
    agency: agencyId,
    jobTitle: "director",
    accountStatus: "active",
  }).select("_id").lean();
  return director?._id || null;
}

module.exports = findDirectorId;
