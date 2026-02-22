// ─── src/pages/Quizzes.js ───────────────────────────────────────────────────
import React from "react";
import { useNavigate } from "react-router-dom";

const Quizzes = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: "50px", textAlign: "center" }}>
            <h1>🎓 Interactive Quizzes</h1>
            <p style={{ color: "#666", fontSize: "18px" }}>
                This module is currently under development.
                Keep studying your notes to prepare for future assessments!
            </p>
            <div style={{ marginTop: "40px", padding: "40px", border: "2px dashed #ccc", borderRadius: "20px" }}>
                <h3 style={{ color: "#aaa" }}>Upcoming Features:</h3>
                <ul style={{ listStyle: "none", padding: 0, color: "#999" }}>
                    <li>Multiple Choice Questions (MCQs)</li>
                    <li>Timed Mock Tests</li>
                    <li>Leaderboards & Progress Tracking</li>
                </ul>
            </div>
            <button
                onClick={() => navigate(-1)}
                style={{ marginTop: "30px", padding: "10px 25px", cursor: "pointer", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "5px" }}
            >
                Go Back
            </button>
        </div>
    );
};

export default Quizzes;
