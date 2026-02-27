const mongoose = require("mongoose");

// Schema for storing individual quiz attempts for performance tracking
const quizAttemptSchema = new mongoose.Schema(
    {
        // ── STUDENT INFO ──
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "Student reference is required"],
        },

        // ── QUIZ INFO ──
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: [true, "Quiz reference is required"],
        },

        // ── ACADEMIC CLASSIFICATION ──
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
        },
        unit: {
            type: Number,
            required: [true, "Unit is required"],
            min: 1,
            max: 5,
        },
        regulation: {
            type: String,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        semester: {
            type: Number,
            required: true,
        },

        // ── SCORING ──
        score: {
            type: Number,
            required: true,
            default: 0,
        },
        totalMarks: {
            type: Number,
            required: [true, "Total marks is required"],
        },
        accuracy: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 100,
        },

        // ── TIME TRACKING ──
        timeTaken: {
            type: Number, // in seconds
            required: true,
            default: 0,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Compound indexes for efficient querying
quizAttemptSchema.index({ student: 1, submittedAt: -1 });
quizAttemptSchema.index({ student: 1, subject: 1 });
quizAttemptSchema.index({ student: 1, unit: 1 });
quizAttemptSchema.index({ subject: 1, unit: 1 });
quizAttemptSchema.index({ quiz: 1 });

// Prevent duplicate attempts per student per quiz
quizAttemptSchema.index({ student: 1, quiz: 1 }, { unique: true });

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
