const express = require("express");
const router  = express.Router();
const { upload } = require("../config/db");
const {
  sendPitch,
  getPitchesForPost,
  getMyPitches,
  acceptPitch,
  rejectPitch,
  getPitchesForClient,
  getPitch,
} = require("../controllers/pitchController");

router.post("/",                      upload.single("file"), sendPitch);
router.get("/my",                     getMyPitches);
router.get("/post/:postId",           getPitchesForPost);
router.get("/client/:clientId",       getPitchesForClient);  // ✅ BEFORE /:id
router.get("/:id",                    getPitch);
router.patch("/:id/accept",           acceptPitch);
router.patch("/:id/reject",           rejectPitch);

module.exports = router;