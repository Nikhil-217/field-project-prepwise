import React, { useState } from "react";
import { uploadNote } from "../api/noteService";

const TeacherUpload = () => {
    const [formData, setFormData] = useState({
        title: "",
        subject: "",
        unit: "",
        year: "2",
        semester: "1",
        description: "",
        regulation: "R22",
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage({ type: "error", text: "Please select a PDF file." });
            return;
        }

        const data = new FormData();
        Object.keys(formData).forEach((key) => data.append(key, formData[key]));
        data.append("file", file);

        try {
            setLoading(true);
            await uploadNote(data);
            setMessage({ type: "success", text: "Note uploaded successfully!" });
            setFormData({ ...formData, title: "", description: "" });
            setFile(null);
        } catch (err) {
            setMessage({ type: "error", text: err || "Failed to upload note." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.uploadContainer}>
            <header style={styles.header}>
                <p style={styles.subtitle}>Upload PDF study materials for students</p>
            </header>

            <form onSubmit={handleSubmit} style={styles.formCard}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Title *</label>
                    <input
                        type="text"
                        name="title"
                        placeholder="e.g. Unit 1 - Introduction to Data Structures"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        style={styles.input}
                    />
                </div>

                <div style={styles.row}>
                    <div style={{ ...styles.inputGroup, flex: 1 }}>
                        <label style={styles.label}>Subject *</label>
                        <select name="subject" value={formData.subject} onChange={handleInputChange} required style={styles.select}>
                            <option value="">Select subject</option>
                            <option value="OOPS">OOPS</option>
                            <option value="SMDA">SMDA</option>
                            <option value="DLD">DLD</option>
                            <option value="DBMS">DBMS</option>
                            <option value="MFCS">MFCS</option>
                        </select>
                    </div>
                    <div style={{ ...styles.inputGroup, flex: 1 }}>
                        <label style={styles.label}>Unit *</label>
                        <select name="unit" value={formData.unit} onChange={handleInputChange} required style={styles.select}>
                            <option value="">Select unit</option>
                            {[1, 2, 3, 4, 5].map(u => <option key={u} value={u}>Unit {u}</option>)}
                        </select>
                    </div>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                        name="description"
                        placeholder="Brief description of the content..."
                        value={formData.description}
                        onChange={handleInputChange}
                        style={styles.textarea}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>PDF File *</label>
                    <div style={styles.fileUploadArea} onClick={() => document.getElementById("fileInput").click()}>
                        <div style={styles.fileIcon}>📄</div>
                        <p style={styles.fileText}>{file ? file.name : "Click to upload PDF"}</p>
                        <input
                            id="fileInput"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                    </div>
                </div>

                <button type="submit" disabled={loading} style={styles.submitBtn}>
                    {loading ? "Uploading..." : "Upload Notes"}
                </button>

                {message.text && (
                    <p style={{ ...styles.message, color: message.type === "success" ? "#10B981" : "#EF4444" }}>
                        {message.text}
                    </p>
                )}
            </form>
        </div>
    );
};

const styles = {
    uploadContainer: {
        maxWidth: "800px",
        margin: "0 auto",
    },
    header: {
        marginBottom: "24px",
    },
    subtitle: {
        fontSize: "16px",
        color: "#6B7280",
        margin: 0,
    },
    formCard: {
        backgroundColor: "white",
        borderRadius: "24px",
        padding: "40px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        border: "1px solid #EAECEF",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    row: {
        display: "flex",
        gap: "24px",
    },
    label: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151",
    },
    input: {
        padding: "12px 16px",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        fontSize: "15px",
        outline: "none",
        transition: "border-color 0.2s",
    },
    select: {
        padding: "12px 16px",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        fontSize: "15px",
        backgroundColor: "#F9FAFB",
        outline: "none",
    },
    textarea: {
        padding: "12px 16px",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        fontSize: "15px",
        minHeight: "100px",
        outline: "none",
        resize: "vertical",
    },
    fileUploadArea: {
        border: "2px dashed #E5E7EB",
        borderRadius: "16px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "border-color 0.2s, background-color 0.2s",
        "&:hover": {
            borderColor: "#4F46E5",
            backgroundColor: "#F9FAFB",
        },
    },
    fileIcon: {
        fontSize: "32px",
        color: "#9CA3AF",
        marginBottom: "12px",
    },
    fileText: {
        fontSize: "14px",
        color: "#6B7280",
        margin: 0,
    },
    submitBtn: {
        backgroundColor: "#4F46E5",
        color: "white",
        border: "none",
        borderRadius: "12px",
        padding: "16px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background-color 0.2s",
        marginTop: "12px",
    },
    message: {
        textAlign: "center",
        fontSize: "14px",
        fontWeight: "500",
        margin: 0,
    }
};

export default TeacherUpload;
