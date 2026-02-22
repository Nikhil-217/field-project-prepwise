// ─── controllers/noteController.js ────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Handles all Notes logic including role-based access control (RBAC).
//
//   TEACHER: Can upload PDF notes (create) and manage their own uploads.
//   STUDENT: Can view and filter notes matching their year/semester/regulation.
// ─────────────────────────────────────────────────────────────────────────────

const Note = require("../models/Note");
const Teacher = require("../models/Teacher");

// ─── CREATE NOTE (Teacher only) ──────────────────────────────────────────────
// POST /api/notes
// Expects: multipart/form-data (title, subject, unit, year, semester, regulation, file)
const createNote = async (req, res) => {
    try {
        // Validation: Ensure a file was actually uploaded (Multer handles errors, but we check if empty)
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Please upload a PDF file" });
        }

        const { title, subject, unit, year, semester, regulation } = req.body;

        // Validation: Required body fields
        if (!title || !subject || !unit) {
            return res.status(400).json({ success: false, message: "Title, subject, and unit are required" });
        }

        // Create the Note in MongoDB (Strictly Y2 S1)
        const note = await Note.create({
            title,
            subject,
            unit,
            year: 2,
            semester: 1,
            regulation: "R22",
            // Store as a cleaner relative path for the virtual to handle
            fileUrl: req.file.path.replace(/\\/g, "/").split("backend/")[1] || req.file.path.replace(/\\/g, "/"),
            uploadedBy: req.user._id, // Set from protect middleware
        });

        res.status(201).json({
            success: true,
            message: "Note uploaded successfully",
            note,
        });
    } catch (error) {
        console.error("createNote error:", error.message);
        res.status(500).json({ success: false, message: "Server error while uploading note" });
    }
};

// ─── GET NOTES (Filtered for Students / List for Teachers) ──────────────────
// GET /api/notes
// Query Params: subject, unit
const getNotes = async (req, res) => {
    try {
        let query = {};

        // ── ROLE-BASED FILTERING ──────────────────────────────────────────────
        if (req.user.role === "student") {
            // 1. Find all teachers in the student's section
            const sectionTeachers = await Teacher.find({ section: req.user.section }).select("_id");
            const teacherIds = sectionTeachers.map(t => t._id);

            // 2. Only show notes from these teachers
            query.uploadedBy = { $in: teacherIds };

            // Also apply batch filters
            query.regulation = req.user.regulation;
            query.year = req.user.year;
            query.semester = req.user.semester;
        } else if (req.user.role === "teacher") {
            // Teachers see the notes they uploaded
            query.uploadedBy = req.user._id;
        }

        // ── USER-DEFINED FILTERS ──────────────────────────────────────────────
        if (req.query.subject) query.subject = req.query.subject;
        if (req.query.unit) query.unit = req.query.unit;

        const notes = await Note.find(query)
            .populate("uploadedBy", "employeeName subjectDealing section")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notes.length,
            notes,
        });
    } catch (error) {
        console.error("getNotes error:", error.message);
        res.status(500).json({ success: false, message: "Server error while fetching notes" });
    }
};

// ─── DELETE NOTE (Teacher only - their own notes) ────────────────────────────
// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, uploadedBy: req.user._id });

        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found or unauthorized" });
        }

        // Optional: Add logic here to delete the physical file using fs.unlinkSync()
        await Note.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: "Note deleted successfully" });
    } catch (error) {
        console.error("deleteNote error:", error.message);
        res.status(500).json({ success: false, message: "Server error while deleting note" });
    }
};

module.exports = { createNote, getNotes, deleteNote };
