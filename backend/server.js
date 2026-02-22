// ─── server.js ────────────────────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// server.js is the ENTRY POINT — the very first file Node.js runs (node server.js).
// Its only job: load environment variables, connect to the database, and start
// listening for HTTP requests. All actual app configuration lives in app.js.
//
// FLOW OF EXECUTION:
//   1. dotenv loads .env → process.env variables are now available everywhere
//   2. connectDB() opens a Mongoose connection to MongoDB
//   3. If DB connects → app.listen() starts accepting HTTP traffic
//   4. If DB fails → log the error and exit (no point running without a DB)
//
// WHY SPLIT server.js and app.js?
//   - app.js is a pure Express config (testable without starting a real server)
//   - server.js is the runtime launcher (handles ports, DB, process lifecycle)
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config(); // Must be first — loads .env before any other import reads process.env

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, THEN start the HTTP server.
// This order matters: routes may query DB on startup, so DB must be ready first.
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
        });
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1); // Exit with failure code — crash loudly rather than run broken
    });