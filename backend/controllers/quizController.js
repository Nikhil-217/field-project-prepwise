const Quiz = require("../models/Quiz");
const Submission = require("../models/Submission");
const QuizAttempt = require("../models/QuizAttempt");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// ─── TEACHER CONTROLLERS ────────────────────────────────────────────────────────

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Teacher)
exports.createQuiz = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ success: false, message: "Only teachers can create quizzes" });
        }

        const quizData = { ...req.body, createdBy: req.user._id };
        const quiz = await Quiz.create(quizData);

        res.status(201).json({ success: true, data: quiz });
    } catch (error) {
        console.error("Create Quiz Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all quizzes (Teacher: created by them, Student: for their section)
// @route   GET /api/quizzes
// @access  Private
exports.getQuizzes = async (req, res) => {
    try {
        if (req.user.role === "teacher") {
            const quizzes = await Quiz.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
            return res.status(200).json({ success: true, count: quizzes.length, data: quizzes });
        } else {
            // Student
            const { regulation, year, semester } = req.user;
            const quizzes = await Quiz.find({ regulation, year, semester })
                .select("-questions.correctAnswer") // Don't send answers to students in list
                .sort({ createdAt: -1 });

            // Check for submissions
            const submissions = await Submission.find({ student: req.user._id }).select("quiz totalScore");
            const submittedQuizIds = submissions.map(sub => sub.quiz.toString());

            const quizzesWithStatus = quizzes.map(quiz => {
                const quizObj = quiz.toObject();
                const now = new Date();

                quizObj.isSubmitted = submittedQuizIds.includes(quiz._id.toString());
                quizObj.status = "AVAILABLE";

                if (quiz.startTime && quiz.startTime > now) {
                    quizObj.status = "SCHEDULED";
                } else if (quiz.endTime && quiz.endTime < now) {
                    quizObj.status = "CLOSED";
                }

                // If scheduled and not yet started, hide questions completely
                if (quizObj.status === "SCHEDULED") {
                    delete quizObj.questions;
                }

                return quizObj;
            });

            return res.status(200).json({ success: true, count: quizzesWithStatus.length, data: quizzesWithStatus });
        }
    } catch (error) {
        console.error("Get Quizzes Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get single quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        // Check permissions
        if (req.user.role === "teacher") {
            if (quiz.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: "Unauthorized access" });
            }

            // Fetch all submissions for this quiz
            const submissions = await Submission.find({ quiz: quiz._id })
                .populate("student", "name rollNo section")
                .sort({ totalScore: -1 });

            const quizObj = quiz.toObject();
            quizObj.submissions = submissions;

            return res.status(200).json({ success: true, data: quizObj });

        } else {
            // Student
            if (quiz.regulation !== req.user.regulation ||
                quiz.year !== req.user.year ||
                quiz.semester !== req.user.semester) {
                return res.status(403).json({ success: false, message: "Unauthorized access" });
            }

            const now = new Date();
            if (quiz.startTime && quiz.startTime > now) {
                return res.status(403).json({ success: false, message: "Quiz has not started yet" });
            }

            const quizObj = quiz.toObject();

            // Remove correct answers
            quizObj.questions.forEach(q => delete q.correctAnswer);

            return res.status(200).json({ success: true, data: quizObj });
        }
    } catch (error) {
        console.error("Get Quiz Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Submit a quiz
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ success: false, message: "Only students can submit quizzes" });
        }

        const quizId = req.params.id;
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        // Validate time window
        const now = new Date();
        if (quiz.startTime && quiz.startTime > now) {
            return res.status(400).json({ success: false, message: "Quiz has not started yet" });
        }
        if (quiz.endTime && quiz.endTime < now) {
            return res.status(400).json({ success: false, message: "Quiz submission period has ended" });
        }

        // Check if already submitted
        const existingSubmission = await Submission.findOne({ quiz: quizId, student: req.user._id });
        if (existingSubmission) {
            return res.status(400).json({ success: false, message: "You have already submitted this quiz" });
        }

        // Get time taken from request (in seconds)
        const timeTaken = req.body.timeTaken || 0;
        const studentAnswers = req.body.answers; // Array of { questionId, answer }
        const evaluatedAnswers = [];
        let totalScore = 0;
        let maxScore = 0;
        let correctAnswers = 0;

        // Evaluate answers
        quiz.questions.forEach(question => {
            const studentA = studentAnswers.find(a => String(a.questionId) === String(question._id));
            const ansObj = {
                questionId: question._id,
                answer: studentA ? studentA.answer : "",
                isCorrect: false,
                earnedPoints: 0,
            };

            maxScore += question.points || 1;

            if (question.type === "MCQ" || question.type === "FITB") {
                if (studentA && studentA.answer && question.correctAnswer) {
                    if (studentA.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
                        ansObj.isCorrect = true;
                        ansObj.earnedPoints = question.points || 1;
                        totalScore += ansObj.earnedPoints;
                        correctAnswers++;
                    }
                }
            } else if (question.type === "DESCRIPTIVE") {
                // Not auto-graded
                ansObj.isCorrect = false;
                ansObj.earnedPoints = 0;
            }

            evaluatedAnswers.push(ansObj);
        });

        // Calculate accuracy (only for auto-graded questions)
        const autoGradedQuestions = quiz.questions.filter(q => q.type !== "DESCRIPTIVE");
        const accuracy = autoGradedQuestions.length > 0 
            ? Math.round((correctAnswers / autoGradedQuestions.length) * 100)
            : 0;

        const submission = await Submission.create({
            quiz: quizId,
            student: req.user._id,
            answers: evaluatedAnswers,
            totalScore,
            maxScore,
        });

        // Create QuizAttempt for performance tracking
        await QuizAttempt.create({
            student: req.user._id,
            quiz: quizId,
            subject: quiz.subject,
            unit: quiz.unit || 1,
            regulation: quiz.regulation,
            year: quiz.year,
            semester: quiz.semester,
            score: totalScore,
            totalMarks: maxScore,
            accuracy,
            timeTaken,
            submittedAt: new Date(),
        });

        res.status(201).json({
            success: true,
            data: {
                submission,
                result: {
                    score: totalScore,
                    totalMarks: maxScore,
                    accuracy,
                    timeTaken,
                }
            },
            message: "Quiz submitted successfully",
        });
    } catch (error) {
        console.error("Submit Quiz Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ─── PERFORMANCE ANALYTICS CONTROLLERS ──────────────────────────────────────────

// @desc    Get all students (for teacher's performance view)
// @route   GET /api/quizzes/students
// @access  Private (Teacher)
exports.getStudents = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ success: false, message: "Only teachers can view students" });
        }

        // Get teacher's section to filter students
        const teacher = await Teacher.findById(req.user._id);
        
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        // Get students for teacher's section (R22, Year 2, Semester 1, CSE)
        const students = await Student.find({
            regulation: "R22",
            year: 2,
            semester: 1,
            section: teacher.section,
        })
        .select("name rollNo section email")
        .sort({ rollNo: 1 });

        // Get attempt counts for each student
        const studentIds = students.map(s => s._id);
        const attemptCounts = await QuizAttempt.aggregate([
            { $match: { student: { $in: studentIds } } },
            { $group: { _id: "$student", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        attemptCounts.forEach(a => {
            countMap[a._id.toString()] = a.count;
        });

        const studentsWithAttempts = students.map(s => ({
            _id: s._id,
            name: s.name,
            rollNo: s.rollNo,
            section: s.section,
            email: s.email,
            attemptCount: countMap[s._id.toString()] || 0,
        }));

        res.status(200).json({ 
            success: true, 
            count: studentsWithAttempts.length, 
            data: studentsWithAttempts 
        });
    } catch (error) {
        console.error("Get Students Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get specific student's performance
// @route   GET /api/quizzes/students/:id/performance
// @access  Private (Teacher)
exports.getStudentPerformance = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ success: false, message: "Only teachers can view student performance" });
        }

        const studentId = req.params.id;
        const student = await Student.findById(studentId).select("name rollNo section");

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Get all quiz attempts for this student
        const attempts = await QuizAttempt.find({ student: studentId })
            .populate({
                path: "quiz",
                select: "title questions timeLimit",
            })
            .sort({ submittedAt: -1 });

        // Calculate subject-wise performance
        const subjectPerformance = {};
        const unitPerformance = {};

        attempts.forEach(attempt => {
            // Subject-wise
            if (!subjectPerformance[attempt.subject]) {
                subjectPerformance[attempt.subject] = {
                    totalAttempts: 0,
                    totalScore: 0,
                    totalMarks: 0,
                    totalAccuracy: 0,
                };
            }
            subjectPerformance[attempt.subject].totalAttempts++;
            subjectPerformance[attempt.subject].totalScore += attempt.score;
            subjectPerformance[attempt.subject].totalMarks += attempt.totalMarks;
            subjectPerformance[attempt.subject].totalAccuracy += attempt.accuracy;

            // Unit-wise
            const unitKey = `Unit ${attempt.unit}`;
            if (!unitPerformance[unitKey]) {
                unitPerformance[unitKey] = {
                    totalAttempts: 0,
                    totalScore: 0,
                    totalMarks: 0,
                    totalAccuracy: 0,
                };
            }
            unitPerformance[unitKey].totalAttempts++;
            unitPerformance[unitKey].totalScore += attempt.score;
            unitPerformance[unitKey].totalMarks += attempt.totalMarks;
            unitPerformance[unitKey].totalAccuracy += attempt.accuracy;
        });

        // Calculate averages
        const subjectWise = Object.keys(subjectPerformance).map(subject => {
            const data = subjectPerformance[subject];
            return {
                subject,
                totalAttempts: data.totalAttempts,
                averageScore: Math.round(data.totalScore / data.totalAttempts),
                averageAccuracy: Math.round(data.totalAccuracy / data.totalAttempts),
            };
        });

        const unitWise = Object.keys(unitPerformance).map(unit => {
            const data = unitPerformance[unit];
            return {
                unit: unit.replace("Unit ", ""),
                totalAttempts: data.totalAttempts,
                averageScore: Math.round(data.totalScore / data.totalAttempts),
                averageAccuracy: Math.round(data.totalAccuracy / data.totalAttempts),
            };
        });

        // Overall statistics
        const totalAttempts = attempts.length;
        const overallAverageAccuracy = totalAttempts > 0 
            ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / totalAttempts)
            : 0;
        const overallAverageScore = totalAttempts > 0
            ? Math.round(attempts.reduce((sum, a) => sum + (a.score / a.totalMarks * 100), 0) / totalAttempts)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                student,
                totalAttempts,
                overallAverageAccuracy,
                overallAverageScore,
                attempts,
                subjectWise,
                unitWise,
            },
        });
    } catch (error) {
        console.error("Get Student Performance Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all students' performance summary
// @route   GET /api/quizzes/analytics/overview
// @access  Private (Teacher)
exports.getAnalyticsOverview = async (req, res) => {
    try {
        if (req.user.role !== "teacher") {
            return res.status(403).json({ success: false, message: "Only teachers can view analytics" });
        }

        // Get teacher's section
        const teacher = await Teacher.findById(req.user._id);
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        // Get all attempts for students in teacher's section
        const studentsInSection = await Student.find({
            regulation: "R22",
            year: 2,
            semester: 1,
            section: teacher.section,
        }).select("_id");

        const studentIds = studentsInSection.map(s => s._id);

        const allAttempts = await QuizAttempt.find({ student: { $in: studentIds } })
            .populate({
                path: "student",
                select: "name rollNo section",
            })
            .sort({ submittedAt: -1 });

        // Subject-wise analytics
        const subjectStats = {};
        allAttempts.forEach(attempt => {
            if (!subjectStats[attempt.subject]) {
                subjectStats[attempt.subject] = {
                    totalAttempts: 0,
                    totalScore: 0,
                    totalMarks: 0,
                    students: new Set(),
                };
            }
            subjectStats[attempt.subject].totalAttempts++;
            subjectStats[attempt.subject].totalScore += attempt.score;
            subjectStats[attempt.subject].totalMarks += attempt.totalMarks;
            subjectStats[attempt.subject].students.add(attempt.student._id.toString());
        });

        const subjectAnalytics = Object.keys(subjectStats).map(subject => {
            const data = subjectStats[subject];
            return {
                subject,
                totalAttempts: data.totalAttempts,
                uniqueStudents: data.students.size,
                averageScore: Math.round((data.totalScore / data.totalMarks) * 100),
            };
        });

        // Unit-wise analytics
        const unitStats = {};
        allAttempts.forEach(attempt => {
            const unitKey = attempt.unit;
            if (!unitStats[unitKey]) {
                unitStats[unitKey] = {
                    totalAttempts: 0,
                    totalScore: 0,
                    totalMarks: 0,
                };
            }
            unitStats[unitKey].totalAttempts++;
            unitStats[unitKey].totalScore += attempt.score;
            unitStats[unitKey].totalMarks += attempt.totalMarks;
        });

        const unitAnalytics = Object.keys(unitStats).map(unit => {
            const data = unitStats[unit];
            return {
                unit: parseInt(unit),
                totalAttempts: data.totalAttempts,
                averageScore: Math.round((data.totalScore / data.totalMarks) * 100),
            };
        });

        // Overall stats
        const totalStudentsAttempted = new Set(allAttempts.map(a => a.student._id.toString())).size;
        const overallAverageAccuracy = allAttempts.length > 0
            ? Math.round(allAttempts.reduce((sum, a) => sum + a.accuracy, 0) / allAttempts.length)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                totalAttempts: allAttempts.length,
                totalStudentsAttempted,
                overallAverageAccuracy,
                subjectAnalytics,
                unitAnalytics,
                recentAttempts: allAttempts.slice(0, 10),
            },
        });
    } catch (error) {
        console.error("Get Analytics Overview Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get student's own performance
// @route   GET /api/quizzes/my-performance
// @access  Private (Student)
exports.getMyPerformance = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ success: false, message: "Only students can view their performance" });
        }

        const attempts = await QuizAttempt.find({ student: req.user._id })
            .populate({
                path: "quiz",
                select: "title subject unit timeLimit",
            })
            .sort({ submittedAt: -1 });

        const totalAttempts = attempts.length;
        const overallAverageAccuracy = totalAttempts > 0
            ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / totalAttempts)
            : 0;
        
        const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
        const totalMarks = attempts.reduce((sum, a) => sum + a.totalMarks, 0);
        const overallPercentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;

        // Subject-wise
        const subjectStats = {};
        attempts.forEach(attempt => {
            if (!subjectStats[attempt.subject]) {
                subjectStats[attempt.subject] = { attempts: 0, totalAccuracy: 0 };
            }
            subjectStats[attempt.subject].attempts++;
            subjectStats[attempt.subject].totalAccuracy += attempt.accuracy;
        });

        const subjectWise = Object.keys(subjectStats).map(subject => ({
            subject,
            attempts: subjectStats[subject].attempts,
            averageAccuracy: Math.round(subjectStats[subject].totalAccuracy / subjectStats[subject].attempts),
        }));

        res.status(200).json({
            success: true,
            data: {
                totalAttempts,
                overallAverageAccuracy,
                overallPercentage,
                subjectWise,
                recentAttempts: attempts.slice(0, 5),
            },
        });
    } catch (error) {
        console.error("Get My Performance Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get my quiz attempts (Student)
// @route   GET /api/quizzes/my-attempts
// @access  Private (Student)
exports.getMyAttempts = async (req, res) => {
    try {
        if (req.user.role !== "student") {
            return res.status(403).json({ success: false, message: "Only students can view their attempts" });
        }

        const attempts = await QuizAttempt.find({ student: req.user._id })
            .populate({
                path: "quiz",
                select: "title subject unit timeLimit",
            })
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            count: attempts.length,
            data: attempts,
        });
    } catch (error) {
        console.error("Get My Attempts Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
