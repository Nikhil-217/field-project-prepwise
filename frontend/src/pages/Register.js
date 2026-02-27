// ─── src/pages/Register.js ────────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// This page handles onboarding for both Teachers and Students.
// It dynamically changes fields based on the chosen role to match the 
// specific backend requirements (Teacher model vs Student model).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const [role, setRole] = useState("student"); // "student" or "teacher"
    const [formData, setFormData] = useState({
        // Student fields
        name: "",
        rollNo: "",
        year: 2,
        semester: 1,
        regulation: "R22",

        // Teacher fields
        employeeId: "",
        employeeName: "",
        subjectDealing: "",

        // Common fields
        section: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [errors, setErrors] = useState({}); // Tracking individual field errors
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: false });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const newErrors = {};
        setLoading(true);

        // Client-side validation
        if (!formData.email.endsWith("@vnrvjiet.in")) {
            setError("Invalid email. Please use your @vnrvjiet.in email address.");
            newErrors.email = true;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            newErrors.password = true;
            newErrors.confirmPassword = true;
        }

        // Check required fields based on role
        if (role === "student") {
            if (!formData.name) newErrors.name = true;
            if (!formData.rollNo) newErrors.rollNo = true;
            if (!formData.section) newErrors.section = true;
        } else {
            if (!formData.employeeName) newErrors.employeeName = true;
            if (!formData.employeeId) newErrors.employeeId = true;
            if (!formData.subjectDealing) newErrors.subjectDealing = true;
            if (!formData.section) newErrors.section = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        try {
            // Determine endpoint based on role
            const endpoint = role === "teacher" ? "/auth/register/teacher" : "/auth/register/student";

            // Filter out empty fields not relevant to the current role
            const payload = { ...formData, semester: "1" };
            if (role === "teacher") {
                delete payload.name;
                delete payload.rollNo;
                delete payload.year;
                delete payload.semester;
            } else {
                delete payload.employeeId;
                delete payload.employeeName;
                delete payload.subjectDealing;
            }

            const response = await api.post(endpoint, payload);
            const { user, token } = response.data;

            login(user, token);
            navigate("/notes");
        } catch (err) {
            const errorMessage = typeof err === 'string' ? err : err.message || "Registration failed";
            setError(errorMessage);

            // Highlight fields based on error message if possible
            if (errorMessage.toLowerCase().includes("email")) setErrors(prev => ({ ...prev, email: true }));
            if (errorMessage.toLowerCase().includes("roll")) setErrors(prev => ({ ...prev, rollNo: true }));
            if (errorMessage.toLowerCase().includes("employee id")) setErrors(prev => ({ ...prev, employeeId: true }));
        } finally {
            setLoading(false);
        }
    };

    const getInputStyle = (fieldName) => ({
        ...styles.input,
        borderColor: errors[fieldName] ? "#c62828" : "#ddd",
        backgroundColor: errors[fieldName] ? "#fff5f5" : "#fff",
    });

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.title}>Register for PrepWise</h2>

                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.inputGroup}>
                    <label>I am a:</label>
                    <div style={styles.roleToggle}>
                        <button
                            type="button"
                            onClick={() => setRole("student")}
                            style={role === "student" ? styles.activeRole : styles.inactiveRole}
                        >Student</button>
                        <button
                            type="button"
                            onClick={() => setRole("teacher")}
                            style={role === "teacher" ? styles.activeRole : styles.inactiveRole}
                        >Teacher</button>
                    </div>
                </div>

                {/* SHARED FIELDS */}
                <div style={styles.inputGroup}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={getInputStyle("email")}
                        placeholder="email@college.edu"
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label>Password</label>
                    <div style={styles.passwordWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={getInputStyle("password")}
                            placeholder=""
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

                <div style={styles.inputGroup}>
                    <label>Confirm Password</label>
                    <div style={styles.passwordWrapper}>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            style={getInputStyle("confirmPassword")}
                            placeholder=""
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={styles.toggleBtn}
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                {/* STUDENT FIELDS */}
                {role === "student" && (
                    <>
                        <div style={styles.inputGroup}>
                            <label>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={getInputStyle("name")} placeholder="Arjun Kumar" />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Roll Number</label>
                            <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} required style={getInputStyle("rollNo")} placeholder="24071A0589" />
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <div style={{ ...styles.inputGroup, flex: 1 }}>
                                <label>Section</label>
                                <select name="section" value={formData.section} onChange={handleChange} required style={getInputStyle("section")}>
                                    <option value="">Select Section</option>
                                    <option value="A">Section A</option>
                                    <option value="B">Section B</option>
                                    <option value="C">Section C</option>
                                    <option value="D">Section D</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}

                {/* TEACHER FIELDS */}
                {role === "teacher" && (
                    <>
                        <div style={styles.inputGroup}>
                            <label>Full Name</label>
                            <input type="text" name="employeeName" value={formData.employeeName} onChange={handleChange} required style={getInputStyle("employeeName")} placeholder="Dr. Sandeep" />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Employee ID</label>
                            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required style={getInputStyle("employeeId")} placeholder="TCH001" />
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Subject Dealing</label>
                            <select name="subjectDealing" value={formData.subjectDealing} onChange={handleChange} required style={getInputStyle("subjectDealing")}>
                                <option value="">Select Subject</option>
                                <option value="OOPS">OOPS</option>
                                <option value="SMDA">SMDA</option>
                                <option value="Software Engineering">Software Engineering</option>
                                <option value="DLD">DLD</option>
                                <option value="DBMS">DBMS</option>
                                <option value="MFCS">MFCS</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label>Assigned Section</label>
                            <select name="section" value={formData.section} onChange={handleChange} required style={getInputStyle("section")}>
                                <option value="">Select Section</option>
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                                <option value="C">Section C</option>
                                <option value="D">Section D</option>
                            </select>
                        </div>
                    </>
                )}

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? "Creating Account..." : "Register Now"}
                </button>

                <p style={styles.footer}>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </form>
        </div>
    );
};

const styles = {
    container: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f4f7f6", padding: "20px" },
    form: { width: "100%", maxWidth: "500px", padding: "40px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
    title: { textAlign: "center", marginBottom: "30px", fontSize: "24px", color: "#333" },
    inputGroup: { marginBottom: "20px", display: "flex", flexDirection: "column" },
    roleToggle: { display: "flex", gap: "10px", marginTop: "8px" },
    activeRole: { flex: 1, padding: "10px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" },
    inactiveRole: { flex: 1, padding: "10px", backgroundColor: "#f8f9fa", color: "#333", border: "1px solid #ddd", borderRadius: "8px", cursor: "pointer" },
    input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", marginTop: "8px", fontSize: "16px", outline: "none", width: "100%", boxSizing: "border-box" },
    passwordWrapper: { position: "relative", display: "flex", alignItems: "center" },
    toggleBtn: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-20%)", background: "none", border: "none", color: "#007bff", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
    button: { width: "100%", padding: "12px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer", marginTop: "10px" },
    error: { padding: "12px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "8px", marginBottom: "20px", textAlign: "center", border: "1px solid #ffcdd2" },
    footer: { textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#666" }
};

export default Register;
