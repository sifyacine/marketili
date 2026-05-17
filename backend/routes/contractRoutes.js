// backend/routes/contractRoutes.js

const express = require("express");
const router  = express.Router();
const c       = require("../controllers/contractController");
const { protect } = require("../middleware/auth");

// All contract routes are protected
router.use(protect);

// ── CRUD ──
router.post("/",                          c.createContract);       // agency creates draft
router.get("/",                           c.getContracts);         // list by party
router.get("/project/:projectId",         c.getContractByProject); // get by project
router.get("/:id",                        c.getContract);          // get single
router.patch("/:id",                      c.updateContract);       // edit draft

// ── Workflow steps ──
router.post("/:id/generate-pdf",          c.generateAndSendPdf);   // fill form + generate PDF → sent
router.patch("/:id/send",                 c.sendContract);         // draft → sent (no PDF)
router.patch("/:id/receipt",              c.uploadReceipt);        // sent → acknowledged
router.patch("/:id/bon-de-commande",      c.sendBonDeCommande);    // acknowledged → signed
router.patch("/:id/resiliation",          c.resiliate);            // any → resiliation

module.exports = router;