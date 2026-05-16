const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const c = require("../controllers/noteController");

router.get("/",        protect, c.getNotes);
router.post("/",       protect, c.createNote);
router.patch("/:id",   protect, c.updateNote);
router.delete("/:id",  protect, c.deleteNote);

module.exports = router;
