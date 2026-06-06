const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/profileController");


router.get("/providers",           c.browseProviders);
router.get("/:role/:id/posts",     c.getProfilePosts);
router.get("/:role/:id",           c.getProfile);


router.patch("/me",                protect, c.updateProfile);
router.post("/posts",              protect, c.createProfilePost);
router.delete("/posts/:id",        protect, c.deleteProfilePost);

module.exports = router;
