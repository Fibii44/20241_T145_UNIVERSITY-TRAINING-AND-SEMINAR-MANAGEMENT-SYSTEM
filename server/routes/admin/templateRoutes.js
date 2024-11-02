const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/templates/"); // Ensure this folder exists on your server
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// Route to handle template upload
router.post("/api/templates", upload.single("template"), async (req, res) => {
  try {
    // Save template URL or file path to the database
    const templateUrl = `/uploads/templates/${req.file.filename}`;
    // Save `templateUrl` in your database here
    res.status(200).json({ templateUrl });
  } catch (error) {
    res.status(500).json({ error: "Error saving template to the database" });
  }
});

module.exports = router;