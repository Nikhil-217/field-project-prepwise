import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizById } from "../api/quizzes";

const QuizResults = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        try {
            const data = await getQuizById(id);
            setQuiz(data.data);
        } catch (error) {
            console.error(error);
            alert("Failed to load results");
            navigate("/quizzes");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading results...</div>;
    if (!quiz) return <div>Quiz not found.</div>;

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
            <button onClick={() => navigate("/quizzes")} style={{ marginBottom: "20px", padding: "8px 15px", cursor: "pointer" }}>&larr; Back to Quizzes</button>

            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "8px", marginBottom: "20px" }}>
                <h2>Results: {quiz.title}</h2>
                <p><strong>Subject:</strong> {quiz.subject}</p>
                <p><strong>Total Submissions:</strong> {quiz.submissions?.length || 0}</p>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                <thead>
                    <tr style={{ background: "#34495e", color: "white", textAlign: "left" }}>
                        <th style={{ padding: "15px" }}>Roll No</th>
                        <th style={{ padding: "15px" }}>Name</th>
                        <th style={{ padding: "15px" }}>Section</th>
                        <th style={{ padding: "15px" }}>Score</th>
                        <th style={{ padding: "15px" }}>Submitted At</th>
                    </tr>
                </thead>
                <tbody>
                    {quiz.submissions?.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#7f8c8d" }}>No submissions yet.</td>
                        </tr>
                    ) : (
                        quiz.submissions?.map(sub => (
                            <tr key={sub._id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={{ padding: "15px" }}>{sub.student.rollNo}</td>
                                <td style={{ padding: "15px" }}>{sub.student.name}</td>
                                <td style={{ padding: "15px" }}>{sub.student.section}</td>
                                <td style={{ padding: "15px", fontWeight: "bold", color: "#27ae60" }}>{sub.totalScore} / {sub.maxScore}</td>
                                <td style={{ padding: "15px" }}>{new Date(sub.submittedAt).toLocaleString()}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default QuizResults;
