// ─── middleware/errorMiddleware.js ────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Without this, unhandled errors in routes crash the server or leak
// sensitive stack traces to the client. Centralising error handling here means:
//   - Every route just throws / calls next(error) — no repetitive try/catch responses
//   - Error format is consistent across the whole API
//   - Stack traces are hidden in production but visible in development
//
// HOW IT WORKS:
//   notFound    → catches requests that didn't match ANY route (404)
//   errorHandler → catches anything that called next(error) (500-level)
//
//   Express recognises errorHandler as an error handler because it has 4 params:
//   (err, req, res, next) — the leading "err" is the signal.
// ─────────────────────────────────────────────────────────────────────────────

// ─── 404 Handler ──────────────────────────────────────────────────────────────
// If a request reaches this middleware, no route above it matched.
// We create an Error object and pass it to the next error handler.
const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404);
    next(error); // Pass to errorHandler below
};

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches EVERY error in the app (thrown in controllers, middleware, etc.)
// If a controller throws or calls next(someError), execution jumps here.
const errorHandler = (err, req, res, next) => {
    // Sometimes Express sets status 200 even for errors (before res.status was called).
    // If that happens, override with 500 (Internal Server Error).
    const statusCode = res.statusCode && res.statusCode !== 200
        ? res.statusCode
        : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message,
        // Only send stack trace in development — never expose internals in production
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };
