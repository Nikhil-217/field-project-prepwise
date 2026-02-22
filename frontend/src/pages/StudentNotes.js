// ─── src/pages/StudentNotes.js ────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// Specialized page for Students to browse and download study materials.
// It automatically scopes the view to the student's academic batch (Year/Sem/Reg)
// and allows filtering by Subject and Unit.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import { fetchNotes } from "../api/noteService";


const StudentNotes = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);


    const [filters, setFilters] = useState({
        search: "",
        subject: "",
        unit: "",
    });

    const loadNotes = useCallback(async () => {
        try {
            setLoading(true);

            // Pass filters to search specifically for Year 2 Sem 1
            const data = await fetchNotes({
                title: filters.search,
                subject: filters.subject,
                unit: filters.unit,
                year: 2,
                semester: 1
            });
            setNotes(data.notes);
        } catch (err) {
            console.error(err || "Failed to fetch notes.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div style={styles.notesContainer}>
            <header style={styles.header}>
                <h1 style={styles.title}>Notes Library</h1>
                <p style={styles.subtitle}>Browse and download study materials</p>
            </header>

            {/* SEARCH & FILTERS */}
            <div style={styles.filterBar}>
                <div style={styles.searchWrapper}>
                    <span style={styles.searchIcon}>🔍</span>
                    <input
                        type="text"
                        name="search"
                        placeholder="Search notes..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        style={styles.searchInput}
                    />
                </div>
                <select
                    name="subject"
                    value={filters.subject}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="">All Subjects</option>
                    <option value="OOPS">OOPS</option>
                    <option value="SMDA">SMDA</option>
                    <option value="DLD">DLD</option>
                    <option value="DBMS">DBMS</option>
                    <option value="MFCS">MFCS</option>
                </select>
                <select
                    name="unit"
                    value={filters.unit}
                    onChange={handleFilterChange}
                    style={styles.select}
                >
                    <option value="">All Units</option>
                    {[1, 2, 3, 4, 5].map(u => <option key={u} value={u}>Unit {u}</option>)}
                </select>
            </div>

            {/* NOTES LIST */}
            <div style={styles.notesList}>
                {loading ? (
                    <p style={styles.statusMsg}>Loading...</p>
                ) : notes.length === 0 ? (
                    <p style={styles.statusMsg}>No notes found.</p>
                ) : (
                    notes.map((note) => (
                        <div key={note._id} style={styles.noteCard}>
                            <div style={styles.noteMain}>
                                <div style={styles.pdfIcon}>📄</div>
                                <div style={styles.noteInfo}>
                                    <h4 style={styles.noteTitle}>{note.title}</h4>
                                    <div style={styles.tagContainer}>
                                        <span style={styles.subjectTag}>{note.subject}</span>
                                        <span style={styles.unitTag}>Unit {note.unit}</span>
                                    </div>
                                </div>
                            </div>
                            <a
                                href={note.fullFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.downloadIcon}
                            >
                                📥
                            </a>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const styles = {
    notesContainer: {
        maxWidth: "1000px",
        margin: "0 auto",
    },
    header: {
        marginBottom: "32px",
    },
    title: {
        fontSize: "32px",
        fontWeight: "700",
        color: "#111827",
        margin: "0 0 8px 0",
    },
    subtitle: {
        fontSize: "16px",
        color: "#6B7280",
        margin: 0,
    },
    filterBar: {
        backgroundColor: "white",
        padding: "12px",
        borderRadius: "16px",
        display: "flex",
        gap: "12px",
        marginBottom: "32px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        border: "1px solid #EAECEF",
    },
    searchWrapper: {
        flex: 1,
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    searchIcon: {
        position: "absolute",
        left: "12px",
        color: "#9CA3AF",
    },
    searchInput: {
        width: "100%",
        padding: "10px 10px 10px 36px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: "transparent",
        fontSize: "14px",
        outline: "none",
    },
    select: {
        padding: "10px 16px",
        borderRadius: "10px",
        border: "1px solid #EAECEF",
        backgroundColor: "#F9FAFB",
        fontSize: "14px",
        color: "#374151",
        outline: "none",
        minWidth: "150px",
    },
    notesList: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    noteCard: {
        backgroundColor: "white",
        padding: "20px 24px",
        borderRadius: "16px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #EAECEF",
        transition: "transform 0.2s, box-shadow 0.2s",
    },
    noteMain: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
    },
    pdfIcon: {
        width: "48px",
        height: "48px",
        backgroundColor: "#FEF2F2",
        color: "#EF4444",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
    },
    noteInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
    },
    noteTitle: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#111827",
        margin: 0,
        textTransform: "lowercase",
    },
    tagContainer: {
        display: "flex",
        gap: "8px",
    },
    subjectTag: {
        fontSize: "12px",
        color: "#4F46E5",
        backgroundColor: "#EEF2FF",
        padding: "2px 10px",
        borderRadius: "6px",
        fontWeight: "500",
    },
    unitTag: {
        fontSize: "12px",
        color: "#374151",
        backgroundColor: "#F3F4F6",
        padding: "2px 10px",
        borderRadius: "6px",
        fontWeight: "500",
    },
    downloadIcon: {
        fontSize: "20px",
        color: "#9CA3AF",
        textDecoration: "none",
        cursor: "pointer",
        transition: "color 0.2s",
        "&:hover": {
            color: "#4F46E5",
        },
    },
    statusMsg: {
        textAlign: "center",
        padding: "40px",
        color: "#6B7280",
    }
};


export default StudentNotes;
