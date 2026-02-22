import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EduLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isStudent = user?.role === "student";

    const menuItems = isStudent ? [
        { name: "Dashboard", path: "/student-dashboard", icon: "🏠" },
        { name: "Notes", path: "/student-notes", icon: "📑" },
    ] : [
        { name: "Dashboard", path: "/teacher-dashboard", icon: "🏠" },
        { name: "Upload Notes", path: "/upload-notes", icon: "➕" },
        { name: "Notes Library", path: "/notes", icon: "📑" },
        { name: "Student List", path: "/students", icon: "👥" },
    ];

    return (
        <div style={styles.container}>
            {/* SIDEBAR */}
            <aside style={styles.sidebar}>
                <div style={styles.brandSection}>
                    <div style={styles.logoContainer}>
                        <div style={styles.logoIcon}>🎓</div>
                        <div>
                            <h1 style={styles.brandName}>EduPlatform</h1>
                            <p style={styles.brandTag}>R22 • CS • Year 2 • Sem 1</p>
                        </div>
                    </div>
                </div>

                <div style={styles.navSection}>
                    <p style={styles.sectionLabel}>{isStudent ? "STUDENT PANEL" : "TEACHER PANEL"}</p>
                    <nav style={styles.nav}>
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.disabled ? "#" : item.path}
                                style={{
                                    ...styles.navLink,
                                    ...(location.pathname === item.path ? styles.activeLink : {}),
                                    ...(item.disabled ? styles.disabledLink : {}),
                                }}
                            >
                                <span style={styles.icon}>{item.icon}</span>
                                <span style={styles.linkText}>{item.name}</span>
                                {location.pathname === item.path && <span style={styles.arrow}>›</span>}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div style={styles.logoutSection}>
                    <div style={styles.profileInfo}>
                        <div style={styles.avatar}>
                            {user?.name?.charAt(0) || user?.employeeName?.charAt(0) || "U"}
                        </div>
                        <div style={styles.nameSection}>
                            <p style={styles.profileName}>{user?.name || user?.employeeName || "User"}</p>
                            <p style={styles.profileRole}>{user?.role === "teacher" ? "Admin" : "Student"}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutBtn}>
                        <span style={styles.icon}>↪️</span> Sign Out
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main style={styles.mainContent}>
                <header style={styles.topHeader}>
                    <p style={styles.roleHeader}>
                        {user?.role === "teacher" ? "Teacher" : "Student"} • <span style={styles.emailHeader}>{user?.email}</span>
                    </p>
                </header>
                <div style={styles.pageContent}>
                    {children}
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        height: "100vh",
        backgroundColor: "#F8F9FD",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: "hidden",
    },
    sidebar: {
        width: "280px",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #EAECEF",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
    },
    brandSection: {
        padding: "30px 24px",
    },
    logoContainer: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    logoIcon: {
        width: "40px",
        height: "40px",
        backgroundColor: "#4F46E5",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "20px",
        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
    },
    brandName: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#111827",
        margin: 0,
    },
    brandTag: {
        fontSize: "12px",
        color: "#6B7280",
        margin: "2px 0 0 0",
    },
    navSection: {
        padding: "0 16px",
        flex: 1,
        overflowY: "auto",
    },
    sectionLabel: {
        fontSize: "11px",
        fontWeight: "600",
        color: "#9CA3AF",
        letterSpacing: "0.05em",
        padding: "0 12px",
        marginBottom: "16px",
        marginTop: "10px",
    },
    nav: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    navLink: {
        display: "flex",
        alignItems: "center",
        padding: "12px 14px",
        textDecoration: "none",
        color: "#4B5563",
        borderRadius: "12px",
        transition: "all 0.2s ease",
        fontSize: "14px",
        fontWeight: "500",
    },
    activeLink: {
        backgroundColor: "#EEF2FF",
        color: "#4F46E5",
    },
    disabledLink: {
        opacity: 0.5,
        cursor: "not-allowed",
    },
    icon: {
        marginRight: "12px",
        fontSize: "18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "20px",
    },
    linkText: {
        flex: 1,
    },
    arrow: {
        fontSize: "18px",
        fontWeight: "300",
    },
    logoutSection: {
        padding: "24px",
        borderTop: "1px solid #EAECEF",
    },
    profileInfo: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
    },
    avatar: {
        width: "40px",
        height: "40px",
        backgroundColor: "#6366F1",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: "700",
        fontSize: "16px",
    },
    nameSection: {
        overflow: "hidden",
    },
    profileName: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#111827",
        margin: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    profileRole: {
        fontSize: "12px",
        color: "#6B7280",
        margin: 0,
    },
    logoutBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        padding: "10px 0",
        border: "none",
        background: "none",
        color: "#6B7280",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        textAlign: "left",
        transition: "color 0.2s",
    },
    mainContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    topHeader: {
        padding: "16px 40px",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #EAECEF",
    },
    roleHeader: {
        fontSize: "13px",
        color: "#6B7280",
        margin: 0,
    },
    emailHeader: {
        color: "#374151",
        fontWeight: "500",
    },
    pageContent: {
        flex: 1,
        overflowY: "auto",
        padding: "40px",
    }
};

export default EduLayout;
