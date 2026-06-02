const express = require("express");
const router  = express.Router();
const { getAds } = require("../controllers/adController");

router.get("/", getAds);

module.exports = router;
