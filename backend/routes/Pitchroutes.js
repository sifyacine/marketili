const express = require("express");
const router  = express.Router();
const { upload } = require("../config/db");
const {
  sendPitch,
  getPitchesForPost,
  getMyPitches,
  acceptPitch,
  rejectPitch,
  withdrawPitch,
  getPitchesForClient,
  getPitch,
  updateInternalStatus,
  getReceivedConventions,
  getSentConventions,
  acceptConvention,
  rejectConvention,
} = require("../controllers/pitchController");
const subscriptionGate = require("../middleware/subscriptionGate");
const { protect } = require("../middleware/auth");

// Multer runs first so req.body.pitchType is available inside subscriptionGate
router.post("/",                              upload.single("file"), subscriptionGate, sendPitch);
router.get("/my",                             getMyPitches);
router.get("/received-conventions",           protect, getReceivedConventions);
router.get("/sent-conventions",               protect, getSentConventions);
router.get("/post/:postId",                   getPitchesForPost);
router.get("/client/:clientId",               getPitchesForClient);
router.get("/:id",                            getPitch);
router.patch("/:id/accept",                   acceptPitch);
router.patch("/:id/reject",                   rejectPitch);
router.patch("/:id/withdraw",                 withdrawPitch);
router.patch("/:id/internal-status",          updateInternalStatus);
router.patch("/:id/convention-accept",        protect, acceptConvention);
router.patch("/:id/convention-reject",        protect, rejectConvention);

module.exports = router;