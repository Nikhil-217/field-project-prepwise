// ─── models/Note.js ───────────────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Defines the shape of a note document in MongoDB.
// This schema is designed for an R22 CS curriculum — each note belongs to a
// specific regulation, year, semester, and unit so students can filter precisely
// (e.g., "show me all Year 2, Sem 1, Data Structures, Unit 3 notes").
//
// DESIGN DECISIONS:
//   - uploadedBy → Teacher ObjectId  (only teachers upload; students read)
//   - regulation, year, semester, unit → compound index  (the most common query)
//   - subject + uploadedBy → compound index  (teacher's own notes by subject)
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        // ── CONTENT FIELDS ────────────────────────────────────────────────────
        title: {
            type: String,
            required: [true, "Note title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },

        subject: {
            // e.g., "Data Structures and Algorithms", "Operating Systems"
            type: String,
            required: [true, "Subject is required"],
            trim: true,
        },

        // ── ACADEMIC CLASSIFICATION FIELDS ────────────────────────────────────
        // These four fields together uniquely identify WHERE in the curriculum a
        // note belongs. Students filter by exactly these fields on the frontend.

        regulation: {
            // The university regulation batch — R22 means admitted in 2022.
            // Stored as a string so future regulations (R26, R28) are just new values.
            type: String,
            required: [true, "Regulation is required"],
            enum: {
                values: ["R19", "R20", "R22"],
                message: "Regulation must be R19, R20, or R22",
            },
            default: "R22",
        },

        year: {
            // Academic year: 1 (freshman) → 4 (final year)
            type: Number,
            required: [true, "Year is required"],
            enum: {
                values: [1, 2, 3, 4],
                message: "Year must be 1, 2, 3, or 4",
            },
            default: 2,
        },

        semester: {
            // Semester within the year: 1 (odd) or 2 (even)
            type: Number,
            required: [true, "Semester is required"],
            enum: {
                values: [1, 2],
                message: "Semester must be 1 or 2",
            },
            default: 1,
        },

        unit: {
            // Most Indian university syllabi divide each subject into 5 units.
            // Storing as Number allows range queries: unit >= 1 && unit <= 3
            type: Number,
            required: [true, "Unit number is required"],
            min: [1, "Unit must be at least 1"],
            max: [5, "Unit cannot exceed 5"],
        },

        // ── FILE ──────────────────────────────────────────────────────────────
        fileUrl: {
            // Relative path saved by Multer, e.g.:
            // "uploads/Data Structures/1708531200000-unit1.pdf"
            // The frontend constructs the full URL: http://localhost:5000/<fileUrl>
            type: String,
            required: [true, "File URL is required"],
        },

        // ── OWNERSHIP ─────────────────────────────────────────────────────────
        uploadedBy: {
            // Reference to the Teacher who uploaded the note.
            // Using ref: "Teacher" allows .populate("uploadedBy") to fetch
            // teacher details (name, subject) in a single query.
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: [true, "uploadedBy teacher reference is required"],
        },
    },
    {
        timestamps: true, // Adds createdAt (upload date) and updatedAt automatically
    }
);

// ─── INDEXES ──────────────────────────────────────────────────────────────────
// WHY INDEXES?
// MongoDB scans EVERY document ("collection scan") when no index exists.
// With 70 students × 5 subjects × 5 units = thousands of notes over 4 years.
// An index is a sorted lookup table that MongoDB uses to jump straight to
// matching documents without scanning everything — like a book's index vs.
// reading every page.

// INDEX 1: Compound index on the four classification fields
// This serves the PRIMARY READ QUERY: "get all notes for R22, Year 2, Sem 1, DS"
// Compound index covers exact matches AND partial matches (any left-prefix combo):
//   e.g., { regulation } alone, or { regulation, year }, or { regulation, year, semester }
//   are all accelerated by this same index.
noteSchema.index(
    { regulation: 1, year: 1, semester: 1, subject: 1 },
    // background: true means MongoDB builds the index without locking the collection
    { background: true }
);

// INDEX 2: Teacher's notes lookup
// Serves: "show all notes uploaded by this teacher" (teacher dashboard)
// Also helps: "show notes for subject X by teacher Y"
noteSchema.index(
    { uploadedBy: 1, subject: 1 },
    { background: true }
);

// INDEX 3: createdAt for sorting (newest first)
// MongoDB's default sort on _id is insertion order, not always what we want.
// This makes .sort({ createdAt: -1 }) fast regardless of collection size.
noteSchema.index(
    { createdAt: -1 },
    { background: true }
);

// ─── VIRTUAL FIELD ────────────────────────────────────────────────────────────
// A virtual is a computed property NOT stored in MongoDB — computed on the fly.
// fullFileUrl builds the accessible URL from the stored relative path.
// Usage: note.fullFileUrl → "http://localhost:5000/uploads/..."
noteSchema.virtual("fullFileUrl").get(function () {
    const base = process.env.BASE_URL || "http://localhost:5000";
    // Fix: Handle absolute paths stored on Windows by extracting the 'uploads/...' part
    let path = this.fileUrl.replace(/\\/g, "/");
    if (path.includes("/uploads/")) {
        path = "uploads/" + path.split("/uploads/")[1];
    } else if (path.includes("uploads/")) {
        path = "uploads/" + path.split("uploads/")[1];
    }
    return `${base}/${path}`;
});

// Ensure virtuals are included when converting to JSON (for API responses)
noteSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Note", noteSchema);
