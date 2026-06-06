const express = require("express");
const router  = express.Router();
const c       = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);


router.get("/users",                    c.getAllUsers);
router.patch("/users/:role/:id/toggle", c.toggleUserStatus);


router.get("/stats",    c.getStats);


router.get("/activity",       c.getRecentActivity);
router.get("/activity/log",   c.getActivityLog);


router.get("/ads",               c.getAdminAds);
router.post("/ads",              c.createAd);
router.patch("/ads/:id",         c.updateAd);
router.patch("/ads/:id/toggle",  c.toggleAd);
router.delete("/ads/:id",        c.deleteAd);


router.get("/posts",                    c.getAdminPosts);
router.patch("/posts/:id/remove",       c.removePost);
router.patch("/posts/:id/reactivate",   c.reactivatePost);


router.get("/options",                     c.getAllOptions);
router.get("/options/:key",                c.getOptions);
router.post("/options/:key/add",           c.addOptionValue);
router.delete("/options/:key/:value",      c.deleteOptionValue);

module.exports = router;
