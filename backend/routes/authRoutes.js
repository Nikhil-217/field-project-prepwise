// ─── routes/authRoutes.js ─────────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Maps HTTP method + URL path → controller function.
// Routes are intentionally thin — no logic here, just wiring.
//
// Mounted in app.js at /api/auth, so full paths are:
//   POST /api/auth/register/teacher
//   POST /api/auth/register/student
//   POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const {
    registerTeacher,
    registerStudent,
    login,
    getMyStudents,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// ── Registration routes ────────────────────────────────────────────────────────
// Two separate endpoints — each only accepts fields relevant to that role.
// No middleware needed here — these are public routes (no token required to register).

router.post("/register/teacher", registerTeacher);  // POST /api/auth/register/teacher
router.post("/register/student", registerStudent);  // POST /api/auth/register/student

// ── Login route ───────────────────────────────────────────────────────────────
// Common for both roles. Client must send { email, password, role }.

router.post("/login", login);                       // POST /api/auth/login

// ── Teacher specific routes ──────────────────────────────────────────────────
router.get("/my-students", protect, getMyStudents); // GET /api/auth/my-students

module.exports = router;
