import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizById, submitQuiz } from "../api/quizzes";

const QuizAttempt = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({}); // { questionId: answerText }
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const startTimeRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchQuiz();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [id]);

    const fetchQuiz = async () => {
        try {
            const data = await getQuizById(id);
            setQuiz(data.data);

            // Initialize answers
            const initialAnswers = {};
            data.data.questions?.forEach(q => {
                initialAnswers[q._id] = "";
            });
            setAnswers(initialAnswers);

            // Set up timer if timeLimit is set
            if (data.data.timeLimit) {
                setTimeLeft(data.data.timeLimit * 60); // Convert minutes to seconds
                startTimeRef.current = Date.now();
                
                timerRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current);
                            handleSubmit(null, true);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        } catch (error) {
            console.error(error);
            alert("Failed to load quiz");
            navigate("/quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async (e, autoSubmit = false) => {
        if (e) e.preventDefault();
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        // Stop timer
        if (timerRef.current) clearInterval(timerRef.current);
        
        try {
            const answerArray = Object.keys(answers).map(qId => ({
                questionId: qId,
                answer: answers[qId]
            }));

            // Calculate time taken in seconds
            const timeTaken = startTimeRef.current 
                ? Math.round((Date.now() - startTimeRef.current) / 1000)
                : 0;

            const result = await submitQuiz(id, answerArray, timeTaken);
            
            if (autoSubmit) {
                alert("Time's up! Quiz submitted automatically.");
            } else {
                alert(`Quiz submitted successfully!\nScore: ${result.data.result.score}/${result.data.result.totalMarks}\nAccuracy: ${result.data.result.accuracy}%`);
            }
            navigate("/quizzes");
        } catch (error) {
            console.error(error);
            alert("Submission failed: " + (error.response?.data?.message || "Error"));
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "18px", color: "#6B7280" }}>Loading exam environment...</div>
        </div>
    );
    
    if (!quiz) return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <div style={{ fontSize: "18px", color: "#EF4444" }}>Quiz not found.</div>
        </div>
    );

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "30px" }}>
            {timeLeft !== null && (
                <div style={{ 
                    position: "fixed", 
                    top: "20px", 
                    right: "20px", 
                    padding: "15px 25px", 
                    background: timeLeft < 60 ? "#e74c3c" : "#3498db", 
                    color: "white", 
                    borderRadius: "8px",
                    fontSize: "20px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                    zIndex: 1000
                }}>
                    Time: {formatTime(timeLeft)}
                </div>
            )}
            
            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "8px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                <h2 style={{ margin: "0 0 10px 0", color: "#111827" }}>{quiz.title}</h2>
                <p style={{ margin: "5px 0", color: "#4B5563" }}><strong>Subject:</strong> {quiz.subject}</p>
                <p style={{ margin: "5px 0", color: "#4B5563" }}><strong>Unit:</strong> {quiz.unit || 1}</p>
                <p style={{ margin: "5px 0", color: "#6B7280" }}>{quiz.description}</p>
                {quiz.timeLimit && <p style={{ margin: "5px 0", color: "#4B5563" }}><strong>Time Limit:</strong> {quiz.timeLimit} minutes</p>}
                {quiz.endTime && (
                    <p style={{ color: "#c0392b", fontWeight: "bold", marginTop: "10px" }}>
                        Deadline: {new Date(quiz.endTime).toLocaleString()}
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                {quiz.questions?.map((q, index) => (
                    <div key={q._id} style={{ marginBottom: "20px", padding: "20px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#111827" }}>
                            Q{index + 1}. {q.text} 
                            <span style={{ fontSize: "12px", color: "#7f8c8d", fontWeight: "normal", marginLeft: "8px" }}>
                                ({q.points} pt{q.points > 1 ? "s" : ""})
                            </span>
                        </h4>

                        {q.type === "MCQ" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                                {q.options.map((opt, oIdx) => (
                                    <label key={oIdx} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "8px 12px", borderRadius: "6px", background: answers[q._id] === opt ? "#EEF2FF" : "transparent", border: "1px solid", borderColor: answers[q._id] === opt ? "#4F46E5" : "#e5e7eb" }}>
                                        <input
                                            type="radio"
                                            name={`question-${q._id}`}
                                            value={opt}
                                            checked={answers[q._id] === opt}
                                            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                            style={{ accentColor: "#4F46E5" }}
                                        />
                                        <span style={{ color: "#374151" }}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.type === "FITB" && (
                            <input
                                type="text"
                                value={answers[q._id]}
                                onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                placeholder="Type your answer here..."
                                style={{ width: "100%", padding: "10px", marginTop: "10px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "14px" }}
                            />
                        )}

                        {q.type === "DESCRIPTIVE" && (
                            <textarea
                                value={answers[q._id]}
                                onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                placeholder="Write your detailed answer..."
                                rows="4"
                                style={{ width: "100%", padding: "10px", marginTop: "10px", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "14px", fontFamily: "inherit" }}
                            />
                        )}
                    </div>
                ))}

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    style={{ 
                        width: "100%", 
                        padding: "15px", 
                        background: isSubmitting ? "#9CA3AF" : "#3498db", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "8px", 
                        cursor: isSubmitting ? "not-allowed" : "pointer", 
                        fontSize: "16px", 
                        fontWeight: "bold",
                        marginTop: "20px"
                    }}
                >
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </button>
            </form>
        </div>
    );
};

export default QuizAttempt;
