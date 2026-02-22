// ─── src/components/PrivateRoute.js ───────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Handles Route Protection (Authentication) and Role-Based Access Control (RBAC).
//
// Props:
//   allowedRoles: Array of strings (e.g., ["teacher", "student"])
//
// Logic:
//   1. Not Logged In → Redirect to /login
//   2. Logged In but Wrong Role → Redirect to /login (or an unauthorized page)
//   3. Logged In & Correct Role → Show the page (Outlet)
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ allowedRoles }) => {
    const { isAuthenticated, role, loading } = useAuth();

    // 1. Loading state (checking localStorage)
    if (loading) return <div>Loading session...</div>;

    // 2. Authentication check
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // 3. Authorization (Role) check
    // If allowedRoles is provided, check if user's role matches
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Option A: Send them back to login
        // Option B: Send them to their own dashboard (safer)
        const redirectPath = role === "teacher" ? "/teacher-dashboard" : "/student-dashboard";
        return <Navigate to={redirectPath} />;
    }

    // 4. All checks passed
    return <Outlet />;
};

export default PrivateRoute;
