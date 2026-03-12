const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Document = require("../models/Document");

// @route   POST api/documents
// @desc    Create a new document
// @access  Private
router.post("/", authMiddleware, async (req, res) => {
  try {
    const newDoc = new Document({
      title: req.body.title || "Untitled Document",
      description: req.body.description || "",
      owner: req.user.id,
      content: {},
    });

    const document = await newDoc.save();
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/documents
// @desc    Get all documents for user
// @access  Private
router.get("/", authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [{ owner: req.user.id }, { sharedWith: req.user.id }],
    }).sort({ updatedAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/documents/:id
// @desc    Get document by ID (Public access via link)
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    res.json(document);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Document not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/documents/:id
// @desc    Update a document's title or content manually (Public access via link)
// @access  Public
router.put("/:id", async (req, res) => {
  const { title, content } = req.body;

  try {
    let document = await Document.findById(req.params.id);

    if (!document) return res.status(404).json({ msg: "Document not found" });

    if (title) document.title = title;
    if (content) document.content = content;

    await document.save();
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    // Check user (only owner can delete)
    if (document.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized to delete" });
    }

    await document.deleteOne();
    res.json({ msg: "Document removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Document not found" });
    }
    res.status(500).send("Server Error");
  }
});

const User = require("../models/User");

// @route   POST api/documents/:id/share
// @desc    Share a document with another user by email
// @access  Private (owner only)
router.post("/:id/share", authMiddleware, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email is required" });
  }

  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    // Only owner can share
    if (document.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Only the document owner can share" });
    }

    // Find user by email
    const userToShare = await User.findOne({ email: email.toLowerCase() });

    if (!userToShare) {
      return res.status(404).json({ msg: "No user found with that email" });
    }

    // Can't share with yourself
    if (userToShare._id.toString() === req.user.id) {
      return res.status(400).json({ msg: "You cannot share a document with yourself" });
    }

    // Check if already shared
    if (document.sharedWith.includes(userToShare._id)) {
      return res.status(400).json({ msg: "Document already shared with this user" });
    }

    document.sharedWith.push(userToShare._id);
    await document.save();

    res.json({ msg: `Document shared with ${userToShare.username}`, user: { username: userToShare.username, email: userToShare.email } });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Document not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
