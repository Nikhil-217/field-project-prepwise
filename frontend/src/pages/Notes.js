// ─── src/pages/Notes.js ───────────────────────────────────────────────────────
// WHY THIS FILE EXISTS:
// The heart of the app. Teachers upload PDFs; Students download/view them.
// High usage of Axios (api) and AuthContext (user role).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Notes = () => {
    const { user, role } = useAuth();

    // 1. STATE
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Filter state (Used by Students)
    const [filters, setFilters] = useState({ subject: "", unit: "" });


    // 2. FETCH NOTES
    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            // Build query string from filters: ?subject=Math&unit=1
            const params = new URLSearchParams();
            if (filters.subject) params.append("subject", filters.subject);
            if (filters.unit) params.append("unit", filters.unit);

            const response = await api.get(`/notes?${params.toString()}`);
            setNotes(response.data.notes);
        } catch (err) {
            setError("Failed to load notes.");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // 3. HANDLERS (Teacher only)
    const handleFileChange = (e) => {
        // Removed as upload moved to TeacherUpload.js
    };

    const handleUpload = async (e) => {
        // Removed as upload moved to TeacherUpload.js
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/notes/${id}`);
            fetchNotes();
        } catch (err) {
            alert(err);
        }
    };

    // 4. UI SECTIONS
    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <h1>Notes Management</h1>
                <p>Viewing notes for: <strong>{user.regulation} | Year {user.year} | Sem {user.semester}</strong></p>
            </header>

            <div style={styles.mainLayout}>

                {/* LEFT COLUMN: FILTERS (Student) or UPLOAD (Teacher) */}
                <aside style={styles.sidebar}>
                    {role === "teacher" ? (
                        <div style={styles.card}>
                            <h3>Notes Library</h3>
                            <p>You can manage and delete your uploaded notes from this list. To upload new materials, use the <strong>Upload Notes</strong> page from your dashboard.</p>
                        </div>
                    ) : (
                        <div style={styles.card}>
                            <h3>Filter Notes</h3>
                            <select name="subject" value={filters.subject} onChange={(e) => setFilters({ ...filters, [e.target.name]: e.target.value })} style={styles.input}>
                                <option value="">All Subjects</option>
                                <option value="OOPS">OOPS</option>
                                <option value="SMDA">SMDA</option>
                                <option value="DLD">DLD</option>
                                <option value="DBMS">DBMS</option>
                                <option value="MFCS">MFCS</option>
                            </select>
                            <select name="unit" value={filters.unit} onChange={(e) => setFilters({ ...filters, [e.target.name]: e.target.value })} style={styles.input}>
                                <option value="">All Units</option>
                                {[1, 2, 3, 4, 5].map(u => <option key={u} value={u}>Unit {u}</option>)}
                            </select>
                            <button onClick={() => setFilters({ subject: "", unit: "" })} style={styles.resetBtn}>Reset Filters</button>
                        </div>
                    )}
                </aside>

                {/* RIGHT COLUMN: THE LIST */}
                <section style={styles.content}>
                    {loading && <p>Loading notes...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {!loading && notes.length === 0 && <p>No notes found for this category.</p>}

                    <div style={styles.grid}>
                        {notes.map((note) => (
                            <div key={note._id} style={styles.noteCard}>
                                <h4>{note.title}</h4>
                                <p>Subject: {note.subject} | Unit: {note.unit}</p>
                                <p style={styles.meta}>By: {note.uploadedBy?.employeeName || "Teacher"}</p>
                                <div style={styles.actions}>
                                    <a href={note.fullFileUrl} target="_blank" rel="noreferrer" style={styles.viewBtn}>View PDF</a>
                                    {role === "teacher" && (
                                        <button onClick={() => handleDelete(note._id)} style={styles.delBtn}>Delete</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const styles = {
    page: { padding: "40px", maxWidth: "1200px", margin: "0 auto" },
    header: { marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "20px" },
    mainLayout: { display: "flex", gap: "40px" },
    sidebar: { flex: "0 0 300px" },
    content: { flex: 1 },
    card: { padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
    input: { width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ddd", boxSizing: "border-box" },
    uploadBtn: { width: "100%", padding: "12px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
    resetBtn: { width: "100%", padding: "8px", backgroundColor: "#6c757d", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "20px" },
    noteCard: { padding: "20px", border: "1px solid #eee", borderRadius: "10px", backgroundColor: "#fff" },
    meta: { fontSize: "12px", color: "#666" },
    actions: { marginTop: "15px", display: "flex", gap: "10px" },
    viewBtn: { flex: 1, padding: "8px", backgroundColor: "#007bff", color: "#fff", textDecoration: "none", textAlign: "center", borderRadius: "5px", fontSize: "14px" },
    delBtn: { padding: "8px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }
};

export default Notes;
