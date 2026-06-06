const express = require("express");
const router  = express.Router();
const {
  createPost,
  getPosts,
  getMyPosts,
  getPost,
  updatePost,
  closePost,
  reactivatePost,
  sendPostToProvider,
  deletePost,
} = require("../controllers/Postcontroller");
const { optionalAuth } = require("../middleware/auth");
const subscriptionGate = require("../middleware/subscriptionGate");




router.get("/",           optionalAuth, getPosts);


router.get("/my",         getMyPosts);


router.get("/:id",        getPost);


router.post("/",          subscriptionGate, createPost);


router.put("/:id",        updatePost);


router.patch("/:id/close",       closePost);
router.patch("/:id/reactivate",  reactivatePost);


router.post("/:id/send",  sendPostToProvider);


router.delete("/:id",     deletePost);

module.exports = router;