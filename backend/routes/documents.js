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
// @desc    Get document by ID
// @access  Private
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    // Check permissions
    if (
      document.owner.toString() !== req.user.id &&
      !document.sharedWith.includes(req.user.id)
    ) {
      return res.status(401).json({ msg: "User not authorized" });
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
// @desc    Update a document's title or content manually (Fallback, since socket handles real-time)
// @access  Private
router.put("/:id", authMiddleware, async (req, res) => {
  const { title, content } = req.body;

  try {
    let document = await Document.findById(req.params.id);

    if (!document) return res.status(404).json({ msg: "Document not found" });

    // Ensure authorized
    if (
      document.owner.toString() !== req.user.id &&
      !document.sharedWith.includes(req.user.id)
    ) {
      return res.status(401).json({ msg: "Not authorized" });
    }

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

module.exports = router;
