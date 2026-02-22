// ─── middleware/authMiddleware.js ─────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Protects private routes. Reads the JWT from the Authorization header,
// verifies it, and attaches the decoded user to req.user.
//
// Since we have TWO user types, we use the `role` stored in the JWT payload
// to query the right MongoDB collection (Teacher or Student).
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

const protect = async (req, res, next) => {
    let token;

    // Tokens arrive in headers as: Authorization: Bearer <token>
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        try {
            // Extract the token string after "Bearer "
            token = req.headers.authorization.split(" ")[1];

            // Verify signature and expiry — throws if invalid
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // decoded = { id: "...", role: "teacher" | "student", iat: ..., exp: ... }

            // Use the role in the token to choose the correct model
            let Model;
            if (decoded.role === "teacher") Model = Teacher;
            else if (decoded.role === "student") Model = Student;
            else return res.status(401).json({ message: "Invalid token role" });

            // Fetch fresh user data from DB (token may be old — DB is the source of truth)
            // .select("-password") = get all fields EXCEPT the hashed password
            req.user = await Model.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "User no longer exists" });
            }

            next(); // All checks passed — proceed to the route handler
        } catch (error) {
            console.error("Auth middleware error:", error.message);
            return res.status(401).json({ message: "Not authorized, invalid token" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token provided" });
    }
};

// ─── ROLE GUARD ───────────────────────────────────────────────────────────────
// Optional middleware to restrict routes to a specific role.
// Usage: router.post("/admin-route", protect, restrictTo("teacher"), handler)
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Only ${roles.join(" or ")} can access this.`,
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };
