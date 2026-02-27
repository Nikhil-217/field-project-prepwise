const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    answer: {
        type: String,
        default: "",
    },
    isCorrect: {
        type: Boolean,
        default: false,
    },
    earnedPoints: {
        type: Number,
        default: 0,
    },
});

const submissionSchema = new mongoose.Schema(
    {
        quiz: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Quiz",
            required: [true, "Quiz reference is required"],
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "Student reference is required"],
        },
        answers: {
            type: [answerSchema],
            required: true,
        },
        totalScore: {
            type: Number,
            default: 0,
        },
        maxScore: {
            type: Number,
            required: true,
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

// Ensure a student can only submit a particular quiz once
submissionSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
