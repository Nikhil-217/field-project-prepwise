const mongoose = require("mongoose");

// Allowed subjects for R22 regulation (STRICT - ONLY THESE SUBJECTS)
const ALLOWED_SUBJECTS = [
    "Software Engineering",
    "Operating System",
    "Design and Analysis of Algorithm",
    "Computer Organisation",
    "Economics and Engineering Accountancy"
];

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ["MCQ", "FITB", "DESCRIPTIVE"],
    },
    text: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        validate: {
            validator: function (v) {
                // If MCQ, options array must have at least 2 items
                if (this.type === "MCQ") {
                    return v && v.length >= 2;
                }
                return true;
            },
            message: "MCQ questions must have at least 2 options.",
        },
    },
    correctAnswer: {
        type: String,
        // Descriptive questions might not have a single correct answer for auto-eval
        required: function () {
            return this.type !== "DESCRIPTIVE";
        },
    },
    points: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
});

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Quiz title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
            validate: {
                validator: function (v) {
                    // Only enforce subject validation for R22 regulation
                    if (this.regulation === "R22") {
                        return ALLOWED_SUBJECTS.includes(v);
                    }
                    return true;
                },
                message: `Subject must be one of: ${ALLOWED_SUBJECTS.join(", ")}`,
            },
        },

        // ── UNIT (NEW) ──
        unit: {
            type: Number,
            required: [true, "Unit is required"],
            min: 1,
            max: 5,
            default: 1,
        },

        // ── ACADEMIC CLASSIFICATION ──
        regulation: {
            type: String,
            required: [true, "Regulation is required"],
            enum: ["R19", "R20", "R22"],
            default: "R22",
        },
        year: {
            type: Number,
            required: [true, "Year is required"],
            enum: [1, 2, 3, 4],
            default: 2,
        },
        semester: {
            type: Number,
            required: [true, "Semester is required"],
            enum: [1, 2],
            default: 1,
        },

        // ── OWNERSHIP ──
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            required: [true, "createdBy teacher reference is required"],
        },

        // ── QUESTIONS ──
        questions: {
            type: [questionSchema],
            validate: [q => q.length > 0, "Quiz must have at least one question"],
        },

        // ── TIME LIMIT (NEW) ──
        timeLimit: {
            type: Number,
            min: 1,
            max: 180, // Max 3 hours
            default: 30, // Default 30 minutes
        },

        // ── SCHEDULING (Optional) ──
        startTime: {
            type: Date,
        },
        endTime: {
            type: Date,
            validate: {
                validator: function (v) {
                    if (this.startTime && v) {
                        return v > this.startTime;
                    }
                    return true;
                },
                message: "End time must be after start time",
            },
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for total marks
quizSchema.virtual("totalMarks").get(function () {
    return this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
});

// Ensure virtuals are included in JSON
quizSchema.set("toJSON", { virtuals: true });
quizSchema.set("toObject", { virtuals: true });

// Indexes for faster querying
quizSchema.index({ regulation: 1, year: 1, semester: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ subject: 1, unit: 1 });

module.exports = mongoose.model("Quiz", quizSchema);
module.exports.ALLOWED_SUBJECTS = ALLOWED_SUBJECTS;
