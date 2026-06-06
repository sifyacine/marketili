

const express = require("express");
const router  = express.Router();
const c       = require("../controllers/contractController");
const { protect } = require("../middleware/auth");


router.use(protect);


router.post("/",                          c.createContract);       
router.get("/",                           c.getContracts);         
router.get("/project/:projectId",         c.getContractByProject); 
router.get("/:id",                        c.getContract);          
router.patch("/:id",                      c.updateContract);       


router.post("/:id/generate-pdf",          c.generateAndSendPdf);   
router.patch("/:id/send",                 c.sendContract);         
router.patch("/:id/receipt",              c.uploadReceipt);        
router.patch("/:id/bon-de-commande",      c.sendBonDeCommande);    
router.patch("/:id/confirm-start",        c.confirmAndStart);      
router.patch("/:id/skip",                 c.skipContract);         
router.patch("/:id/resiliation",          c.resiliate);            

module.exports = router;