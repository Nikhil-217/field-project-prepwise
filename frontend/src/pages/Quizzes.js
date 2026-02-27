import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizzes } from "../api/quizzes";
import { useAuth } from "../context/AuthContext";

const Quizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const data = await getQuizzes();
                setQuizzes(data.data);
            } catch (error) {
                console.error("Failed to fetch quizzes", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    if (loading) return <div>Loading quizzes...</div>;

    const isTeacher = user?.role === "teacher";

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>{isTeacher ? "My Quizzes" : "Available Quizzes"}</h2>
                {isTeacher && (
                    <button
                        onClick={() => navigate("/quizzes/create")}
                        style={{ padding: "10px 20px", background: "#3498db", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    >
                        + Create Quiz
                    </button>
                )}
            </div>

            <div style={{ marginTop: "20px", display: "grid", gap: "15px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                {quizzes.length === 0 ? (
                    <p>No quizzes available.</p>
                ) : (
                    quizzes.map((quiz) => (
                        <div key={quiz._id} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px", background: "#fff", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                            <h3>{quiz.title}</h3>
                            <p><strong>Subject:</strong> {quiz.subject}</p>
                            {isTeacher ? (
                                <p><strong>Audience:</strong> {quiz.regulation} - Year {quiz.year} - Sem {quiz.semester}</p>
                            ) : (
                                <p><strong>Status:</strong> <span style={{ color: quiz.status === "AVAILABLE" ? "green" : quiz.status === "CLOSED" ? "red" : "blue" }}>{quiz.status}</span></p>
                            )}

                            {quiz.startTime && <p><small>Starts: {new Date(quiz.startTime).toLocaleString()}</small></p>}
                            {quiz.endTime && <p><small>Ends: {new Date(quiz.endTime).toLocaleString()}</small></p>}

                            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
                                {isTeacher ? (
                                    <button
                                        onClick={() => navigate(`/quizzes/${quiz._id}`)}
                                        style={{ padding: "8px 15px", background: "#2ecc71", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                    >
                                        View Results
                                    </button>
                                ) : (
                                    <>
                                        {quiz.isSubmitted ? (
                                            <span style={{ color: "green", fontWeight: "bold" }}>Submitted</span>
                                        ) : quiz.status === "AVAILABLE" ? (
                                            <button
                                                onClick={() => navigate(`/quizzes/${quiz._id}/attempt`)}
                                                style={{ padding: "8px 15px", background: "#f39c12", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                                            >
                                                Attempt Quiz
                                            </button>
                                        ) : (
                                            <span style={{ color: "#7f8c8d" }}>{quiz.status === "SCHEDULED" ? "Not Started" : "Closed"}</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Quizzes;
