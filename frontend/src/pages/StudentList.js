import React, { useState, useEffect } from "react";
import api from "../api/axios";

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [section, setSection] = useState("");

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true);
                const response = await api.get("/auth/my-students");
                setStudents(response.data.students);
                setSection(response.data.section);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch students");
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Active Students</h1>
                <p style={styles.subtitle}>
                    Managing students for Section {section || "..."} - Year 2, Semester 1.
                </p>
            </header>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.tableContainer}>
                {loading ? (
                    <div style={styles.loading}>Loading students...</div>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Roll Number</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Section</th>
                                <th style={styles.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <tr key={student._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={styles.nameCell}>
                                                <div style={styles.avatar}>{student.name.charAt(0)}</div>
                                                {student.name}
                                            </div>
                                        </td>
                                        <td style={styles.td}>{student.rollNo}</td>
                                        <td style={styles.td}>{student.email}</td>
                                        <td style={styles.td}>
                                            <span style={styles.roleTag}>{student.section}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.statusDot}></span> Active
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={styles.noData}>No students found in your section.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {!loading && (
                <div style={styles.infoFooter}>
                    <p>Showing {students.length} students in Section {section}.</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: "1100px",
        margin: "0 auto",
    },
    header: {
        marginBottom: "32px",
    },
    title: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#111827",
        margin: "0 0 8px 0",
    },
    subtitle: {
        fontSize: "15px",
        color: "#6B7280",
        margin: 0,
    },
    tableContainer: {
        backgroundColor: "white",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        border: "1px solid #EAECEF",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
    },
    th: {
        padding: "16px 24px",
        backgroundColor: "#F9FAFB",
        fontSize: "13px",
        fontWeight: "600",
        color: "#4B5563",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        borderBottom: "1px solid #E5E7EB",
    },
    tr: {
        borderBottom: "1px solid #F3F4F6",
        transition: "background-color 0.2s",
        "&:hover": {
            backgroundColor: "#F9FAFB",
        },
    },
    td: {
        padding: "16px 24px",
        fontSize: "15px",
        color: "#374151",
        verticalAlign: "middle",
    },
    nameCell: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontWeight: "500",
    },
    avatar: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: "#EEF2FF",
        color: "#4F46E5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "600",
    },
    roleTag: {
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: "#F3F4F6",
        color: "#4B5563",
    },
    statusDot: {
        display: "inline-block",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: "#10B981",
        marginRight: "8px",
    },
    infoFooter: {
        marginTop: "24px",
        textAlign: "center",
        fontSize: "14px",
        color: "#9CA3AF",
    },
    loading: {
        padding: "40px",
        textAlign: "center",
        color: "#6B7280",
    },
    error: {
        color: "#EF4444",
        marginBottom: "16px",
    },
    noData: {
        padding: "40px",
        textAlign: "center",
        color: "#6B7280",
    }
};

export default StudentList;
