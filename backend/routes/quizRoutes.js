const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// All quiz routes require authentication
router.use(protect);

// Create quiz (Teacher only) - Security: ensure only teachers can create
router.post("/", restrictTo("teacher"), quizController.createQuiz);

// Get all quizzes (Teacher: created by them, Student: available to them)
router.get("/", quizController.getQuizzes);

// Get specific quiz
router.get("/:id", quizController.getQuizById);

// Submit quiz (Student only)
router.post("/:id/submit", quizController.submitQuiz);

// ─── PERFORMANCE ANALYTICS ─────────────────────────────────────────────────────
// Get all students (Teacher only)
router.get("/students", quizController.getStudents);

// Get specific student's performance (Teacher only)
router.get("/students/:id/performance", quizController.getStudentPerformance);

// Get analytics overview (Teacher only)
router.get("/analytics/overview", quizController.getAnalyticsOverview);

// Get student's own performance (Student only)
router.get("/my-performance", quizController.getMyPerformance);

// Get student's own quiz attempts (Student only)
router.get("/my-attempts", quizController.getMyAttempts);

module.exports = router;
