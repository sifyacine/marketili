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
} = require("../controllers/pitchController");

router.post("/",                        upload.single("file"), sendPitch);
router.get("/my",                       getMyPitches);
router.get("/post/:postId",             getPitchesForPost);
router.get("/client/:clientId",         getPitchesForClient);
router.get("/:id",                      getPitch);
router.patch("/:id/accept",             acceptPitch);
router.patch("/:id/reject",             rejectPitch);
router.patch("/:id/withdraw",           withdrawPitch);
router.patch("/:id/internal-status",    updateInternalStatus);

module.exports = router;