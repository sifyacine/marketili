// backend/routes/collaborationRequestRoutes.js

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/collaborationRequestController");

router.use(protect);

router.post(  "/",                  c.sendRequest);
router.get(   "/mine",              c.getMyRequests);
router.get(   "/incoming",          c.getIncomingRequests);
router.patch( "/:id/respond",       c.respondToRequest);
router.patch( "/:id/withdraw",      c.withdrawRequest);

module.exports = router;
