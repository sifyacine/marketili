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

// ── Public / open routes (no auth yet — Phase 7 will add protect middleware) ──

// Browse all posts (everyone can see open posts)
router.get("/",           getPosts);

// Client's own posts
router.get("/my",         getMyPosts);

// Single post detail
router.get("/:id",        getPost);

// Create new post
router.post("/",          createPost);

// Edit post
router.put("/:id",        updatePost);

// Status changes
router.patch("/:id/close",       closePost);
router.patch("/:id/reactivate",  reactivatePost);

// Send post to a specific provider
router.post("/:id/send",  sendPostToProvider);

// Delete (only if 0 pitches)
router.delete("/:id",     deletePost);

module.exports = router;