// ─── app.js ───────────────────────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// app.js configures and exports the Express application object.
// It wires together: middleware → routes → error handlers.
//
// Keeping this separate from server.js means:
//   - server.js handles "how to run" (port, DB)
//   - app.js handles "how to respond" (routes, middleware)
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const cors = require("cors");
const path = require("path");

// Route files
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

// Error middleware (must come AFTER routes)
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
// These run on EVERY request, in order, before reaching any route handler.

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true, // Allow cookies/auth headers from the React frontend
}));

app.use(express.json());                        // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form-encoded data

// Serve uploaded files as static assets at /uploads/filename
// e.g., a file stored at uploads/note.pdf → accessible at http://localhost:5000/uploads/note.pdf
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
// Simple route to confirm the API is alive — useful for deployment monitoring.
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "PrepWise API is running 🚀",
        version: "1.0.0",
    });
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
// Mount route files at their base paths.
const quizRoutes = require("./routes/quizRoutes");

app.use("/api/auth", authRoutes);   // POST /api/auth/register, POST /api/auth/login
app.use("/api/notes", noteRoutes);  // GET /api/notes, POST /api/notes, etc.
app.use("/api/quizzes", quizRoutes); // GET /api/quizzes, POST /api/quizzes, etc.

// ─── ERROR HANDLERS ───────────────────────────────────────────────────────────
// These must be LAST — Express only passes control here if no route matched,
// or if a route/middleware called next(error).

app.use(notFound);     // 404 — no route matched
app.use(errorHandler); // 500 — catch all unhandled errors

module.exports = app;
