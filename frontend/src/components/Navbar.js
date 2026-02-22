// ─── src/components/Navbar.js ──────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Provides navigation links and displays the current user's name/role.
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav style={styles.nav}>
            <h2 style={styles.logo}>PrepWise</h2>
            <div style={styles.links}>
                {isAuthenticated ? (
                    <>
                        <span style={styles.user}>
                            Hello, <strong>{user?.name || user?.employeeName}</strong> ({user?.role})
                        </span>
                        <Link to="/notes" style={styles.link}>My Notes</Link>
                        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={styles.link}>Login</Link>
                        <Link to="/register" style={styles.link}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

const styles = {
    nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 40px", backgroundColor: "#333", color: "#fff" },
    logo: { margin: 0, fontSize: "20px" },
    links: { display: "flex", gap: "20px", alignItems: "center" },
    link: { color: "#fff", textDecoration: "none" },
    user: { fontSize: "14px", color: "#ccc" },
    logoutBtn: { padding: "6px 15px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }
};

export default Navbar;
