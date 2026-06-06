const Ad = require("../models/Ad");
const logActivity = require("../utils/logActivity");


exports.getAds = async (req, res) => {
  try {
    const { placement, role } = req.query;
    const now = new Date();
    const filter = {
      isActive: true,
      $or: [
        { startDate: { $exists: false } },
        { startDate: { $lte: now } },
      ],
      $and: [
        { $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }] },
      ],
    };
    if (placement) filter.placement = placement;
    if (role) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { targetRoles: "all" },
          { targetRoles: role },
        ],
      });
    }
    const ads = await Ad.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ success: true, ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getAdminAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, ads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.createAd = async (req, res) => {
  try {
    const { title, imageUrl, linkUrl, targetRoles, placement, isActive, startDate, endDate } = req.body;
    const ad = await Ad.create({
      title, imageUrl, linkUrl,
      targetRoles: Array.isArray(targetRoles) ? targetRoles : [targetRoles || "all"],
      placement: placement || "banner",
      isActive: isActive !== false,
      startDate: startDate || undefined,
      endDate:   endDate   || undefined,
      createdBy: req.user._id,
    });
    logActivity({
      actorId: req.user._id, actorRole: "admin",
      actorName: req.user.email || "Admin",
      actionType: "ad_created", targetId: ad._id, targetType: "Ad",
      description: `Publicité créée : "${ad.title}"`,
    });
    res.status(201).json({ success: true, ad });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


exports.updateAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ad) return res.status(404).json({ success: false, message: "Publicité introuvable" });
    res.json({ success: true, ad });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


exports.toggleAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ success: false, message: "Publicité introuvable" });
    ad.isActive = !ad.isActive;
    await ad.save();
    res.json({ success: true, ad });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.deleteAd = async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
