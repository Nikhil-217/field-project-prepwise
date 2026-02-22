// WHY THIS FILE EXISTS:
// Separate Student model — students have different identity fields (roll no, section, year)
// that are completely meaningless for teachers. Keeping models separate means:
//   - No nullable/unused fields
//   - Queries like "find all students in section B, year 2" are simple and direct
//   - Role is guaranteed — a student document can NEVER have role="teacher"

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const studentSchema = new mongoose.Schema(
    {
        // ── IDENTITY FIELDS ────────────────────────────────────────────────────────
        name: {
            type: String,
            required: [true, "Student name is required"],
            trim: true,
        },
        rollNo: {
            // University roll number — unique identifier within the institution
            type: String,
            required: [true, "Roll number is required"],
            unique: true,
            trim: true,
            uppercase: true, // Normalise e.g. "22cs001" → "22CS001"
        },
        section: {
            // e.g. "A", "B", "C" — used for filtering and grouping
            type: String,
            required: [true, "Section is required"],
            trim: true,
            uppercase: true,
        },
        year: {
            // Academic year: 1, 2, 3, or 4
            type: Number,
            required: [true, "Year is required"],
            enum: {
                values: [1, 2, 3, 4],
                message: "Year must be 1, 2, 3, or 4",
            },
        },
        semester: {
            type: Number,
            required: [true, "Semester is required"],
            enum: {
                values: [1, 2],
                message: "Semester must be 1 or 2",
            },
            default: 1,
        },
        regulation: {
            type: String,
            required: [true, "Regulation is required"],
            enum: {
                values: ["R19", "R20", "R22"],
                message: "Regulation must be R19, R20, or R22",
            },
            default: "R22",
        },

        // ── AUTH FIELDS ────────────────────────────────────────────────────────────
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email address",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },

        // ── ROLE ──────────────────────────────────────────────────────────────────
        // Hardcoded to "student" — immutable after creation.
        // No student can escalate privileges to "teacher" by editing their profile.
        role: {
            type: String,
            default: "student",
            immutable: true,
        },
    },
    {
        timestamps: true,
    }
);

// ─── PRE-SAVE HOOK ────────────────────────────────────────────────────────────
studentSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ─── INSTANCE METHOD ──────────────────────────────────────────────────────────
studentSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Student", studentSchema);
