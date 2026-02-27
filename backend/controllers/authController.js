// ─── controllers/authController.js ────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Contains all authentication business logic.
// Split into three dedicated functions:
//   registerTeacher → only handles teacher-specific fields
//   registerStudent → only handles student-specific fields
//   login           → common for both roles, routes by `role` field
//
// JWT PAYLOAD: { id, role } — enough for authMiddleware to query the right
// MongoDB collection on every subsequent protected request.
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

// ─── HELPER: Generate JWT ─────────────────────────────────────────────────────
// Stores both id and role so authMiddleware knows which DB collection to query.
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ─── REGISTER TEACHER ─────────────────────────────────────────────────────────
// POST /api/auth/register/teacher
// Only teacher-specific fields accepted here — no chance of mixing up roles.
const registerTeacher = async (req, res) => {
    try {
        const { employeeId, employeeName, subjectDealing, section, email, password, confirmPassword } = req.body;

        // ── Validation ──────────────────────────────────────────────────────────
        if (!employeeId || !employeeName || !subjectDealing || !section || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required including confirmPassword",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        // ── Institutional Email Validation ───────────────────────────────────
        if (!email.endsWith("@vnrvjiet.in")) {
            return res.status(400).json({
                success: false,
                message: "Invalid email. Only @vnrvjiet.in emails are allowed.",
            });
        }

        // ── Duplicate email check ────────────────────────────────────────────────
        // Checks only the teachers collection — a student with the same email is allowed
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: "A teacher with this email already exists",
            });
        }

        // ── Duplicate employeeId check ───────────────────────────────────────────
        const existingId = await Teacher.findOne({ employeeId });
        if (existingId) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is already registered",
            });
        }

        // ── Create teacher (password auto-hashed by pre-save hook in Teacher.js) ─
        const teacher = await Teacher.create({
            employeeId,
            employeeName,
            subjectDealing,
            section,
            email,
            password,
        });

        res.status(201).json({
            success: true,
            message: "Teacher registered successfully",
            token: generateToken(teacher._id, teacher.role),
            user: {
                id: teacher._id,
                employeeId: teacher.employeeId,
                employeeName: teacher.employeeName,
                subjectDealing: teacher.subjectDealing,
                section: teacher.section,
                email: teacher.email,
                role: teacher.role,
            },
        });
    } catch (error) {
        // Mongoose validation errors — e.g., invalid email format
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }
        console.error("registerTeacher error:", error);
        res.status(500).json({ success: false, message: "Server error during teacher registration" });
    }
};

// ─── REGISTER STUDENT ─────────────────────────────────────────────────────────
// POST /api/auth/register/student
const registerStudent = async (req, res) => {
    try {
        const { name, rollNo, section, year, semester, regulation, email, password, confirmPassword } = req.body;

        // ── Validation ──────────────────────────────────────────────────────────
        if (!name || !rollNo || !section || !year || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required including confirmPassword",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        // year must be 1–4 (Mongoose enum also enforces this, but catch early)
        if (![1, 2, 3, 4].includes(Number(year))) {
            return res.status(400).json({
                success: false,
                message: "Year must be 1, 2, 3, or 4",
            });
        }

        // ── Duplicate checks ─────────────────────────────────────────────────────
        const existingEmail = await Student.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "A student with this email already exists",
            });
        }

        const existingRoll = await Student.findOne({ rollNo });
        if (existingRoll) {
            return res.status(400).json({
                success: false,
                message: "Roll number is already registered",
            });
        }

        // ── Create student (Strictly enforced Year 2, Sem 1) ──────────────────────
        const student = await Student.create({
            name,
            rollNo,
            section,
            year: 2,
            semester: 1,
            regulation: "R22",
            email,
            password,
        });

        res.status(201).json({
            success: true,
            message: "Student registered successfully",
            token: generateToken(student._id, student.role),
            user: {
                id: student._id,
                name: student.name,
                rollNo: student.rollNo,
                section: student.section,
                year: student.year,
                email: student.email,
                role: student.role,
            },
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: messages.join(", ") });
        }
        console.error("registerStudent error:", error);
        res.status(500).json({ success: false, message: "Server error during student registration" });
    }
};

// ─── LOGIN (common for both roles) ───────────────────────────────────────────
// POST /api/auth/login
// Client sends { email, password, role } — role tells us which collection to query.
const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // ── Validation ──────────────────────────────────────────────────────────
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "email, password, and role are required",
            });
        }

        if (!["teacher", "student"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be 'teacher' or 'student'",
            });
        }

        // ── Pick the right collection based on role ──────────────────────────────
        const Model = role === "teacher" ? Teacher : Student;

        // ── Find user ────────────────────────────────────────────────────────────
        const user = await Model.findOne({ email });
        if (!user) {
            // Generic message — doesn't reveal whether email exists (security)
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // ── Compare password (uses instance method from model) ───────────────────
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // ── Issue token ──────────────────────────────────────────────────────────
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: generateToken(user._id, user.role),
            user: {
                id: user._id,
                role: user.role,
                email: user.email,
                // Works for both models: teacher has employeeName, student has name
                name: user.employeeName || user.name,
            },
        });
    } catch (error) {
        console.error("login error:", error.message);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
};

// ─── GET TEACHER'S STUDENTS ──────────────────────────────────────────────────
// GET /api/auth/my-students
// Only returns students in the teacher's assigned section
const getMyStudents = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ success: false, message: "Only teachers can access student lists" });
        }

        const teacher = await Teacher.findById(req.user._id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        // Find students in the SAME section as the teacher
        const students = await Student.find({ section: teacher.section })
            .select("-password") // Never return passwords
            .sort({ rollNo: 1 })
            .lean(); // Use lean to add virtual fields

        // Fetch Quiz Scores
        const Quiz = require("../models/Quiz");
        const Submission = require("../models/Submission");

        const teacherQuizzes = await Quiz.find({ createdBy: teacher._id }).select("_id");
        const quizIds = teacherQuizzes.map(q => q._id);

        const submissions = await Submission.find({ quiz: { $in: quizIds } });

        // Map submissions to students
        const studentsWithPerformance = students.map(student => {
            const studentSubs = submissions.filter(sub => String(sub.student) === String(student._id));
            const totalQuizzesAttempted = studentSubs.length;
            const totalScoreEarned = studentSubs.reduce((sum, sub) => sum + sub.totalScore, 0);
            const totalMaxScore = studentSubs.reduce((sum, sub) => sum + sub.maxScore, 0);

            return {
                ...student,
                performance: {
                    quizzesAttempted: totalQuizzesAttempted,
                    totalScore: totalScoreEarned,
                    maxScore: totalMaxScore,
                    averagePercentage: totalMaxScore > 0 ? ((totalScoreEarned / totalMaxScore) * 100).toFixed(1) + "%" : "N/A",
                }
            };
        });

        res.status(200).json({
            success: true,
            count: studentsWithPerformance.length,
            section: teacher.section,
            students: studentsWithPerformance,
        });
    } catch (error) {
        console.error("getMyStudents error:", error);
        res.status(500).json({ success: false, message: "Server error fetching students" });
    }
};

module.exports = { registerTeacher, registerStudent, login, getMyStudents };
