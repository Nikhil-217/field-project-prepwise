// WHY THIS FILE EXISTS:
// Separate Teacher model — teachers have completely different fields from students.
// A single "User" model would need nullable fields and confusing conditional logic.
// Two clean models = clear schema, easier queries, better data integrity.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Allowed subjects for R22 regulation (STRICT - ONLY THESE SUBJECTS)
const ALLOWED_SUBJECTS = [
    "Software Engineering",
    "Operating System",
    "Design and Analysis of Algorithm",
    "Computer Organisation",
    "Economics and Engineering Accountancy"
];

const teacherSchema = new mongoose.Schema(
    {
        // ── IDENTITY FIELDS ────────────────────────────────────────────────────────
        employeeId: {
            type: String,
            required: [true, "Employee ID is required"],
            unique: true,   // No two teachers share an employee ID
            trim: true,
            uppercase: true, // Store consistently as uppercase e.g. "TCH001"
        },
        employeeName: {
            type: String,
            required: [true, "Employee name is required"],
            trim: true,
        },
        subjectDealing: {
            // The subject this teacher teaches — must be from ALLOWED_SUBJECTS
            type: String,
            required: [true, "Subject is required"],
            trim: true,
            validate: {
                validator: function (v) {
                    return ALLOWED_SUBJECTS.includes(v);
                },
                message: `Subject must be one of: ${ALLOWED_SUBJECTS.join(", ")}`,
            },
        },
        section: {
            // The section this teacher is assigned to (A, B, C, D)
            type: String,
            required: [true, "Section is required"],
            trim: true,
            uppercase: true,
        },

        // ── AUTH FIELDS ────────────────────────────────────────────────────────────
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,       // Enforced at DB level — prevents duplicate accounts
            lowercase: true,    // Always store lowercase to avoid case-sensitivity bugs
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
        // Hardcoded to "teacher" — this is the source of truth for role-based access.
        // We store it in the DB (not just JWT) so it can be queried directly.
        role: {
            type: String,
            default: "teacher",
            immutable: true,  // Cannot be changed after creation — security measure
        },
    },
    {
        timestamps: true, // Adds createdAt & updatedAt automatically
    }
);

// ─── PRE-SAVE HOOK ────────────────────────────────────────────────────────────
// Runs before every document.save().
// Only hashes if the password field was modified — avoids double-hashing on updates.
teacherSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ─── INSTANCE METHOD ──────────────────────────────────────────────────────────
// Called during login: teacher.comparePassword("enteredPassword")
// bcrypt.compare handles the salt internally — we never store the plain password.
teacherSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Teacher", teacherSchema);
