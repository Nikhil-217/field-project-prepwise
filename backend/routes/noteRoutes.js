// ─── routes/noteRoutes.js ─────────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Defines all URL routes for Notes.
// ALL routes here are protected — you must be logged in (valid JWT) to use them.
//
// Mounted in app.js at /api/notes, so full paths are:
//   GET  /api/notes         → filterable list
//   POST /api/notes         → teacher upload (multipart/form-data)
//   DELETE /api/notes/:id   → teacher deletes their own note
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const router = express.Router();

// Middleware
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { uploadPDF } = require("../middleware/uploadMiddleware");

// Controllers
const {
    createNote,
    getNotes,
    deleteNote,
} = require("../controllers/noteController");

// ── GET NOTES ─────────────────────────────────────────────────────────────────
// Accessible by both Students and Teachers.
//   - Students see notes matching their year/semester/regulation.
//   - Teachers see the notes they uploaded.
router.get("/", protect, getNotes);

// ── UPLOAD NOTE ───────────────────────────────────────────────────────────────
// Only Teachers can upload notes.
// protect    → checks JWT
// restrictTo → checks if user is a teacher
// uploadPDF  → handles the multipart PDF file stream
router.post("/", protect, restrictTo("teacher"), uploadPDF, createNote);

// ── DELETE NOTE ───────────────────────────────────────────────────────────────
// Only Teachers can delete.
router.delete("/:id", protect, restrictTo("teacher"), deleteNote);

module.exports = router;
