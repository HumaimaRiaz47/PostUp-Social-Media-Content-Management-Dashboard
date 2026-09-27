const express = require("express");
const router = express.Router();
const multer = require("multer");
const Post = require("../models/Post");

// Multer config (assuming you're storing files in 'uploads/' folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post(
  "/",
  upload.fields([
    { name: "verticalImage", maxCount: 1 },
    { name: "horizontalImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, comments } = req.body;

      const platform = {
        facebook: req.body.facebook === "true",
        instagram: req.body.instagram === "true",
        linkedin: req.body.linkedin === "true",
        threads: req.body.threads === "true",
      };

      const verticalImage = req.files.verticalImage?.[0]?.filename || null;
      const horizontalImage = req.files.horizontalImage?.[0]?.filename || null;

      const count = await Post.countDocuments();
      const newPost = new Post({
        serial: count + 1,
        title,
        description,
        comments,
        platform, 
        verticalImage,
        horizontalImage,
      });

      await newPost.save();
      res.status(201).json(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Get all posts
// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a post by ID
router.put(
  "/:id",
  upload.fields([
    { name: "verticalImage", maxCount: 1 },
    { name: "horizontalImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, comments } = req.body;

      const platform = {
        facebook: req.body.facebook === "true",
        instagram: req.body.instagram === "true",
        linkedin: req.body.linkedin === "true",
        threads: req.body.threads === "true",
      };

      const updatedFields = {
        title,
        description,
        comments,
        platform,
      };

      if (req.files.verticalImage) {
        updatedFields.verticalImage = req.files.verticalImage[0].filename;
      }

      if (req.files.horizontalImage) {
        updatedFields.horizontalImage = req.files.horizontalImage[0].filename;
      }

      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        updatedFields,
        { new: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);



// DELETE a post by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
