// ─── src/pages/StudentDashboard.js ─────────────────────────────────────────────
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div style={styles.dashboardContainer}>
            {/* HERO BANNER */}
            <div style={styles.heroBanner}>
                <div style={styles.heroContent}>
                    <p style={styles.welcomeText}>Welcome back,</p>
                    <h1 style={styles.userName}>{user?.name || "Nikhil Pamu"}</h1>
                    <p style={styles.heroSub}>Access high-quality study materials and notes for Year 2, Semester 1.</p>
                </div>
            </div>

            {/* STATUS CARDS */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statIconContainer}>📄</div>
                    <div style={styles.statContent}>
                        <h2 style={styles.statNumber}>1</h2>
                        <p style={styles.statLabel}>Available Notes</p>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Quick Actions</h3>
            </div>
            <div style={styles.actionsGrid}>
                <div style={styles.actionCard} onClick={() => navigate("/student-notes")}>
                    <div style={styles.actionIcon}>📄</div>
                    <div style={styles.actionText}>
                        <p style={styles.actionName}>Browse Notes</p>
                        <p style={styles.actionDesc}>Access study materials</p>
                    </div>
                    <span style={styles.actionArrow}>→</span>
                </div>
            </div>

            {/* INFO BAR */}
            <div style={styles.infoBar}>
                <div style={styles.infoIcon}>🕒</div>
                <div style={styles.infoText}>
                    <p style={styles.infoTitle}>Regulation R22 • Computer Science • Year 2 • Semester 1</p>
                    <p style={styles.infoSub}>System configured for 70 students with 6 core subjects</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    dashboardContainer: {
        maxWidth: "1100px",
        margin: "0 auto",
    },
    heroBanner: {
        background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
        borderRadius: "24px",
        padding: "48px",
        color: "white",
        marginBottom: "32px",
        position: "relative",
        overflow: "hidden",
    },
    heroContent: {
        position: "relative",
        zIndex: 2,
    },
    welcomeText: {
        fontSize: "16px",
        margin: 0,
        opacity: 0.9,
    },
    userName: {
        fontSize: "36px",
        fontWeight: "700",
        margin: "8px 0 16px 0",
    },
    heroSub: {
        fontSize: "15px",
        margin: 0,
        opacity: 0.8,
        maxWidth: "400px",
        lineHeight: "1.5",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "24px",
        marginBottom: "48px",
    },
    statCard: {
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    statIconContainer: {
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        backgroundColor: "#F3F4F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
    },
    statContent: {
        display: "flex",
        flexDirection: "column",
    },
    statNumber: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#111827",
        margin: 0,
    },
    statLabel: {
        fontSize: "12px",
        color: "#6B7280",
        margin: 0,
    },
    sectionHeader: {
        marginBottom: "24px",
    },
    sectionTitle: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#111827",
        margin: 0,
    },
    actionsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "24px",
        marginBottom: "32px",
    },
    actionCard: {
        backgroundColor: "white",
        borderRadius: "20px",
        padding: "24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        position: "relative",
    },
    actionIcon: {
        width: "56px",
        height: "56px",
        borderRadius: "14px",
        backgroundColor: "#F0F7FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
    },
    actionText: {
        flex: 1,
    },
    actionName: {
        fontSize: "15px",
        fontWeight: "600",
        color: "#111827",
        margin: 0,
    },
    actionDesc: {
        fontSize: "13px",
        color: "#6B7280",
        margin: "2px 0 0 0",
    },
    actionArrow: {
        fontSize: "18px",
        color: "#9CA3AF",
    },
    infoBar: {
        backgroundColor: "#EEF2FF",
        borderRadius: "20px",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    infoIcon: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: "#E0E7FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        color: "#4F46E5",
    },
    infoText: {
        display: "flex",
        flexDirection: "column",
    },
    infoTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151",
        margin: 0,
    },
    infoSub: {
        fontSize: "12px",
        color: "#6B7280",
        margin: "2px 0 0 0",
    }
};



export default StudentDashboard;
