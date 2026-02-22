// ─── config/db.js ─────────────────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Database connection logic is isolated here so server.js stays clean.
// If you ever switch databases (MongoDB → PostgreSQL) you only touch this file.
// Also makes it easy to test the connection independently.
//
// FLOW:
//   mongoose.connect() returns a Promise.
//   We await it in server.js: connectDB().then(() => app.listen(...))
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

const connectDB = async () => {
    // mongoose.connect() takes the URI and an options object.
    // The URI comes from .env — never hardcode it here.
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        // These options suppress deprecation warnings in newer Mongoose versions:
        // (Mongoose 6+ sets them by default, but explicit is better for beginners)
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // ── Connection event listeners ─────────────────────────────────────────────
    // These fire AFTER the initial connection — useful for catching issues
    // that happen mid-runtime (e.g., network drops).

    mongoose.connection.on("disconnected", () => {
        console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
        console.log("🔄 MongoDB reconnected successfully.");
    });

    mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB runtime error:", err.message);
    });

    return conn;
};

module.exports = connectDB;
