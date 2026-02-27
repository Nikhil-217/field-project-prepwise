// ─── src/pages/Login.js ───────────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// This is the first entry point for our users.
// It captures credentials and communicates with our backend's /login endpoint.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Login = () => {
    // 1. STATE MANAGEMENT
    const [role, setRole] = useState("student"); // Which tab is active: student or teacher
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    // 2. FORM HANDLERS
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "email") setEmail(value);
        else if (name === "password") setPassword(value);
        else if (name === "role") setRole(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // POST the credentials to our backend
            const response = await api.post("/auth/login", { email, password, role });
            const { user, token } = response.data;

            login(user, token);

            if (user.role === "teacher") {
                navigate("/teacher-dashboard");
            } else {
                navigate("/student-dashboard");
            }
        } catch (err) {
            setError(err || "Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    // 3. UI RENDERING
    return (
        <div className="login-container" style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.title}>PrepWise Login</h2>

                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.inputGroup}>
                    <label>I am a:</label>
                    <select name="role" value={role} onChange={handleChange} style={styles.input}>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                    </select>
                </div>

                <div style={styles.inputGroup}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="enter your email"
                        value={email}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label>Password</label>
                    <div style={styles.passwordWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder=""
                            value={password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={styles.toggleBtn}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p style={styles.footer}>
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </form>
        </div>
    );
};

// BASIC STYLING (Vanilla CSS in JS for visual clarity)
const styles = {
    container: { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f4f7f6" },
    form: { width: "100%", maxWidth: "400px", padding: "40px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
    title: { textAlign: "center", marginBottom: "30px", fontSize: "24px", fontWeight: "600", color: "#333" },
    inputGroup: { marginBottom: "20px", display: "flex", flexDirection: "column" },
    input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "8px", fontSize: "16px", outline: "none", width: "100%", boxSizing: "border-box" },
    passwordWrapper: { position: "relative", display: "flex", alignItems: "center" },
    toggleBtn: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-20%)", background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
    button: { width: "100%", padding: "12px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", marginTop: "10px" },
    error: { padding: "12px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "8px", marginBottom: "20px", textAlign: "center" },
    footer: { textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }
};

export default Login;
