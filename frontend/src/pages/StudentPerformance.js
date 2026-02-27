import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getStudents, getStudentPerformance } from "../api/quizzes";

const StudentPerformance = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingPerformance, setLoadingPerformance] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (id) {
            fetchStudentPerformance(id);
        }
    }, [id]);

    const fetchStudents = async () => {
        try {
            const data = await getStudents();
            setStudents(data.data);
        } catch (error) {
            console.error("Failed to fetch students", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudentPerformance = async (studentId) => {
        setLoadingPerformance(true);
        try {
            const data = await getStudentPerformance(studentId);
            setPerformance(data.data);
            setSelectedStudent(data.data.student);
        } catch (error) {
            console.error("Failed to fetch performance", error);
        } finally {
            setLoadingPerformance(false);
        }
    };

    const handleStudentClick = (studentId) => {
        navigate(`/students/${studentId}`);
    };

    const handleBack = () => {
        setSelectedStudent(null);
        setPerformance(null);
        navigate("/students");
    };

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", color: "#6B7280" }}>Loading students...</div>
            </div>
        );
    }

    // If a student is selected, show their performance
    if (selectedStudent && performance) {
        return (
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
                <button 
                    onClick={handleBack}
                    style={{ 
                        padding: "10px 20px", 
                        background: "#f3f4f6", 
                        border: "none", 
                        borderRadius: "8px", 
                        cursor: "pointer",
                        marginBottom: "20px",
                        fontSize: "14px"
                    }}
                >
                    ← Back to Students
                </button>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
                    {/* Student Info Card */}
                    <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        <h3 style={{ margin: "0 0 10px 0", color: "#111827" }}>Student Information</h3>
                        <p style={{ margin: "5px 0", color: "#4B5563" }}><strong>Name:</strong> {selectedStudent.name}</p>
                        <p style={{ margin: "5px 0", color: "#4B5563" }}><strong>Roll No:</strong> {selectedStudent.rollNo}</p>
                        <p style={{ margin: "5px 0", color: "#4B5563" }}><strong>Section:</strong> {selectedStudent.section}</p>
                    </div>

                    {/* Overall Performance Card */}
                    <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        <h3 style={{ margin: "0 0 10px 0", color: "#111827" }}>Overall Performance</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                            <div style={{ textAlign: "center", padding: "15px", background: "#f9fafb", borderRadius: "8px" }}>
                                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#3B82F6" }}>{performance.totalAttempts}</div>
                                <div style={{ fontSize: "14px", color: "#6B7280" }}>Total Attempts</div>
                            </div>
                            <div style={{ textAlign: "center", padding: "15px", background: "#f9fafb", borderRadius: "8px" }}>
                                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#10B981" }}>{performance.overallAverageAccuracy}%</div>
                                <div style={{ fontSize: "14px", color: "#6B7280" }}>Avg Accuracy</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject-wise Performance */}
                <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "30px" }}>
                    <h3 style={{ margin: "0 0 20px 0", color: "#111827" }}>Subject-wise Performance</h3>
                    {performance.subjectWise && performance.subjectWise.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "15px" }}>
                            {performance.subjectWise.map((subj, idx) => (
                                <div key={idx} style={{ padding: "15px", background: "#f9fafb", borderRadius: "8px" }}>
                                    <div style={{ fontWeight: "600", color: "#111827", marginBottom: "10px" }}>{subj.subject}</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#6B7280" }}>
                                        <span>Attempts: {subj.totalAttempts}</span>
                                        <span>Avg Score: {subj.averageScore}</span>
                                    </div>
                                    <div style={{ marginTop: "10px", height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                                        <div style={{ 
                                            height: "100%", 
                                            background: subj.averageAccuracy >= 70 ? "#10B981" : subj.averageAccuracy >= 50 ? "#f59e0b" : "#ef4444",
                                            width: `${subj.averageAccuracy}%`
                                        }}></div>
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "5px", textAlign: "right" }}>{subj.averageAccuracy}% Accuracy</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "#6B7280" }}>No subject-wise data available.</p>
                    )}
                </div>

                {/* Unit-wise Performance */}
                <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", marginBottom: "30px" }}>
                    <h3 style={{ margin: "0 0 20px 0", color: "#111827" }}>Unit-wise Performance</h3>
                    {performance.unitWise && performance.unitWise.length > 0 ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "15px" }}>
                            {performance.unitWise.map((unit, idx) => (
                                <div key={idx} style={{ padding: "15px", background: "#f9fafb", borderRadius: "8px", textAlign: "center" }}>
                                    <div style={{ fontWeight: "600", color: "#111827", marginBottom: "10px" }}>{unit.unit}</div>
                                    <div style={{ fontSize: "24px", fontWeight: "bold", color: unit.averageAccuracy >= 70 ? "#10B981" : unit.averageAccuracy >= 50 ? "#f59e0b" : "#ef4444" }}>
                                        {unit.averageAccuracy}%
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#6B7280" }}>Avg Accuracy</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "#6B7280" }}>No unit-wise data available.</p>
                    )}
                </div>

                {/* Recent Attempts */}
                <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <h3 style={{ margin: "0 0 20px 0", color: "#111827" }}>Recent Quiz Attempts</h3>
                    {performance.attempts && performance.attempts.length > 0 ? (
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                                    <th style={{ padding: "12px", textAlign: "left", color: "#6B7280", fontSize: "13px" }}>Quiz</th>
                                    <th style={{ padding: "12px", textAlign: "left", color: "#6B7280", fontSize: "13px" }}>Subject</th>
                                    <th style={{ padding: "12px", textAlign: "left", color: "#6B7280", fontSize: "13px" }}>Unit</th>
                                    <th style={{ padding: "12px", textAlign: "center", color: "#6B7280", fontSize: "13px" }}>Score</th>
                                    <th style={{ padding: "12px", textAlign: "center", color: "#6B7280", fontSize: "13px" }}>Accuracy</th>
                                    <th style={{ padding: "12px", textAlign: "right", color: "#6B7280", fontSize: "13px" }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {performance.attempts.map((attempt, idx) => (
                                    <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "12px", color: "#111827" }}>{attempt.quiz?.title || "Quiz"}</td>
                                        <td style={{ padding: "12px", color: "#4B5563" }}>{attempt.subject}</td>
                                        <td style={{ padding: "12px", color: "#4B5563" }}>Unit {attempt.unit}</td>
                                        <td style={{ padding: "12px", textAlign: "center", fontWeight: "600", color: "#111827" }}>
                                            {attempt.score} / {attempt.totalMarks}
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "center" }}>
                                            <span style={{ 
                                                padding: "4px 10px", 
                                                borderRadius: "12px", 
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                background: attempt.accuracy >= 70 ? "#d1fae5" : attempt.accuracy >= 50 ? "#fef3c7" : "#fee2e2",
                                                color: attempt.accuracy >= 70 ? "#065f46" : attempt.accuracy >= 50 ? "#92400e" : "#991b1b"
                                            }}>
                                                {attempt.accuracy}%
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px", textAlign: "right", color: "#6B7280", fontSize: "13px" }}>
                                            {new Date(attempt.submittedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: "#6B7280", textAlign: "center", padding: "20px" }}>No quiz attempts yet.</p>
                    )}
                </div>
            </div>
        );
    }

    // Show student list
    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
            <h2 style={{ marginBottom: "20px", color: "#111827" }}>Student Performance</h2>
            <p style={{ color: "#6B7280", marginBottom: "30px" }}>
                Click on a student to view their quiz performance details.
            </p>

            <div style={{ display: "grid", gap: "12px" }}>
                {students.length === 0 ? (
                    <p style={{ color: "#6B7280", textAlign: "center", padding: "40px" }}>No students found.</p>
                ) : (
                    students.map((student) => (
                        <div 
                            key={student._id}
                            onClick={() => handleStudentClick(student._id)}
                            style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between",
                                padding: "20px",
                                background: "white",
                                borderRadius: "12px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                cursor: "pointer",
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                <div style={{ 
                                    width: "48px", 
                                    height: "48px", 
                                    borderRadius: "50%", 
                                    background: "#EEF2FF",
                                    color: "#4F46E5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "18px",
                                    fontWeight: "600"
                                }}>
                                    {student.name?.charAt(0) || "S"}
                                </div>
                                <div>
                                    <div style={{ fontWeight: "600", color: "#111827", fontSize: "16px" }}>{student.name}</div>
                                    <div style={{ color: "#6B7280", fontSize: "14px" }}>{student.rollNo} • Section {student.section}</div>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#3B82F6" }}>{student.attemptCount || 0}</div>
                                    <div style={{ fontSize: "12px", color: "#6B7280" }}>Attempts</div>
                                </div>
                                <div style={{ color: "#9CA3AF", fontSize: "20px" }}>→</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentPerformance;
