const express   = require("express");
const rateLimit = require("express-rate-limit");
const router    = express.Router();
const { protect } = require("../middleware/auth");
const { upload }  = require("../config/db");
const ctrl        = require("../controllers/chatController");


const msgLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Envoi trop rapide. Ralentissez." },
});



router.get("/unread-count",                protect, ctrl.getUnreadCount);
router.get("/conversations",               protect, ctrl.getMyConversations);
router.post("/conversations/direct",       protect, ctrl.startDirectConversation);
router.get("/project/:projectId",          protect, ctrl.getOrCreateConversation);
router.get("/:conversationId/messages",    protect, ctrl.getMessages);
router.post(
  "/:conversationId/messages",
  protect,
  msgLimiter,
  upload.single("file"),
  ctrl.sendMessage
);
router.patch("/:conversationId/read",                              protect, ctrl.markRead);
router.delete("/:conversationId/messages/:messageId",             protect, ctrl.deleteMessage);

module.exports = router;
