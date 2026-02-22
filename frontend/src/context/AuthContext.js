// ─── src/context/AuthContext.js ───────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// React Context API allows us to share data (like the logged-in user) across
// the entire app without passing props down through every single component.
//
// This file manages:
//   - auth state: { user, token, role }
//   - Persistence: saving/loading from localStorage
//   - Helpers: login and logout functions accessible anywhere
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useState, useEffect, useContext } from "react";

// 1. CREATE THE CONTEXT
const AuthContext = createContext();

// 2. CREATE THE PROVIDER COMPONENT
// This component will wrap our entire App in index.js or App.js
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true); // Prevents flash of "logged out" UI

    // ── ON MOUNT: Check localStorage ───────────────────────────────────────────
    // When the app first loads (or is refreshed), we check if a session exists.
    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");

        if (savedUser && savedToken) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setToken(savedToken);
            setRole(parsedUser.role);
        }
        setLoading(false); // Done checking localStorage
    }, []);

    // ── LOGIN FUNCTION ──────────────────────────────────────────────────────────
    // data: the user object from our backend (includes id, name, role, email)
    // token: the JWT string from our backend
    const login = (userData, userToken) => {
        // 1. Update State
        setUser(userData);
        setToken(userToken);
        setRole(userData.role);

        // 2. Persist to localStorage (Browser memory)
        // localStorage only stores strings, so we JSON.stringify the user object.
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", userToken);
    };

    // ── LOGOUT FUNCTION ─────────────────────────────────────────────────────────
    const logout = () => {
        // 1. Clear State
        setUser(null);
        setToken(null);
        setRole(null);

        // 2. Clear localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    // 3. RETURN THE PROVIDER
    // We pass the state and functions into the "value" prop.
    // Any component inside this Provider can access these via useAuth().
    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                role,
                loading,
                login,
                logout,
                isAuthenticated: !!token, // boolean helper
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// 4. CUSTOM HOOK FOR CONVENIENCE
// This lets us do: const { user, logout } = useAuth();
// Instead of: const { user, logout } = useContext(AuthContext);
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
