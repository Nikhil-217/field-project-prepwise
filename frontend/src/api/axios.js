// ─── src/api/axios.js ──────────────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// We centralize all API settings here so we don't have to repeat the base URL
// and headers in every component. "api" is our custom Axios instance.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

// 1. CREATE AXIOS INSTANCE
// baseURL points to our backend server.
const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// 2. REQUEST INTERCEPTOR: Automatic JWT attachment
// This function runs BEFORE every request leaves the browser.
api.interceptors.request.use(
    (config) => {
        // We retrieve the token from localStorage (saved during login)
        const token = localStorage.getItem("token");

        // If token exists, attach it to the "Authorization" header
        // The backend's authMiddleware expects: "Bearer <token>"
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. RESPONSE INTERCEPTOR: Centralized Error Handling
// This function runs AFTER a response is received from the server.
api.interceptors.response.use(
    (response) => {
        // If request was successful, just return the data
        return response;
    },
    (error) => {
        // If server sent a 401 Unauthorized, it means the token is invalid or expired
        if (error.response && error.response.status === 401) {
            console.warn("Session expired. Logging out...");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Optional: window.location.href = "/login";
        }

        // Return a clean error message from our backend errorMiddleware
        const message = error.response?.data?.message || "Something went wrong";
        return Promise.reject(message);
    }
);

export default api;
