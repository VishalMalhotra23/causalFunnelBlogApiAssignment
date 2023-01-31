const express = require("express");
const router = express.Router();

const {
  getBlogById,
  createBlog,
  getBlog,
  deleteBlog,
  photo,
  updateBlog,
  getAllBlogs,
} = require("../controllers/blog");
const { isSignedIn, isAuthenticated } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

//params
router.param("userId", getUserById);
router.param("blogId", getBlogById);

//actual routes
//create
router.post("/blog/create/:userId", isSignedIn, isAuthenticated, createBlog);

//read
router.get("/blog/:blogId", getBlog);
router.get("/blog/photo/:blogId", photo);

//delete
router.delete("/blog/:blogId/:userId", isSignedIn, isAuthenticated, deleteBlog);

//update
router.put("/blog/:blogId/:userId", isSignedIn, isAuthenticated, updateBlog);

//listing
router.get("/blogs", getAllBlogs);

module.exports = router;
