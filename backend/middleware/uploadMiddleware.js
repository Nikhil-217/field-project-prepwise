// ─── middleware/uploadMiddleware.js ───────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Multer is an npm package that handles multipart/form-data — the format browsers
// use when uploading files. Without Multer, req.body is empty for file uploads.
//
// This file creates and exports a configured Multer instance that:
//   1. Accepts ONLY PDF files (rejects everything else)
//   2. Stores files in uploads/<subject>/ folders organised by subject
//   3. Renames files with a timestamp to prevent name collisions
//   4. Enforces a 5MB maximum file size
// ─────────────────────────────────────────────────────────────────────────────

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── HOW MULTER WORKS ─────────────────────────────────────────────────────────
//
// Normal form:      Content-Type: application/json   → req.body has data
// File upload form: Content-Type: multipart/form-data → req.body is EMPTY
//
// Multer intercepts multipart/form-data requests and:
//   1. Reads the file stream from the request
//   2. Runs fileFilter → rejects if not PDF
//   3. Runs storage → decides WHERE and WHAT NAME to save the file
//   4. Saves the file to disk
//   5. Attaches file metadata to req.file (single) or req.files (multiple)
//   6. Continues to your route handler via next()
//
// After Multer runs, in your controller:
//   req.file.path         → "uploads/Data Structures/1708531200000-notes.pdf"
//   req.file.originalname → "notes.pdf"
//   req.file.size         → 204800  (bytes)
//   req.body.subject      → "Data Structures"  (non-file fields still in req.body)
// ─────────────────────────────────────────────────────────────────────────────

// ─── STORAGE ENGINE ───────────────────────────────────────────────────────────
// diskStorage gives us full control over destination folder + filename.
// (The alternative, memoryStorage, stores files in RAM — bad for large files.)
const storage = multer.diskStorage({

    // destination: decides which folder to save the file in
    destination: (req, file, cb) => {
        // Read the subject from the form body
        // e.g., "Data Structures" or "Operating Systems"
        const subject = req.body.subject
            ? req.body.subject.trim().replace(/[^a-zA-Z0-9 _-]/g, "") // Remove special chars
            : "General";

        const uploadPath = path.join(__dirname, "..", "uploads", subject);

        // Create the folder if it doesn't exist yet (recursive: true = mkdir -p)
        fs.mkdirSync(uploadPath, { recursive: true });

        // cb(error, folderPath) — null means no error
        cb(null, uploadPath);
    },

    // filename: decides what to name the saved file
    filename: (req, file, cb) => {
        // Problem: two students upload "notes.pdf" → second overwrites the first.
        // Solution: prefix with timestamp (milliseconds since epoch) — guaranteed unique.
        // e.g.,  1708531200000-notes.pdf
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
        //                                                        ↑ replace spaces with _
        cb(null, uniqueName);
    },
});

// ─── FILE FILTER ──────────────────────────────────────────────────────────────
// Runs BEFORE the file is saved. Return cb(null, true) to accept, cb(error) to reject.
// We check BOTH the mimetype AND the extension — checking only one is bypassable.
const fileFilter = (req, file, cb) => {
    const allowedMimeType = "application/pdf";
    const allowedExtension = ".pdf";
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (file.mimetype === allowedMimeType && fileExtension === allowedExtension) {
        cb(null, true); // ✅ Accept the file
    } else {
        // Pass a real Error object — Multer will attach it to the request
        cb(new Error("Only PDF files are allowed"), false);
    }
};

// ─── MULTER INSTANCE ──────────────────────────────────────────────────────────
const upload = multer({
    storage,     // Use our diskStorage config above
    fileFilter,  // Use our PDF-only filter

    limits: {
        fileSize: 5 * 1024 * 1024,  // 5MB in bytes (5 × 1024 × 1024)
        // Why 5MB? A typical 50-page academic PDF is ~1–2MB.
        // 5MB allows room for scanned PDFs while protecting server disk space.
        files: 1,  // Maximum 1 file per request
    },
});

// ─── EXPORTS ──────────────────────────────────────────────────────────────────
// We export named middleware functions rather than the raw `upload` object.
// This gives route files a clean, readable API:
//   router.post("/upload", protect, uploadPDF, noteController.createNote)

// uploadPDF: for single PDF field named "file" in the form
const uploadPDF = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific errors (e.g., file too large)
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "File too large. Maximum size is 5MB",
                });
            }
            return res.status(400).json({ success: false, message: err.message });
        }

        if (err) {
            // Our custom fileFilter error ("Only PDF files are allowed")
            return res.status(400).json({ success: false, message: err.message });
        }

        // No error — file is saved, req.file is populated, continue to controller
        next();
    });
};

module.exports = { uploadPDF };
