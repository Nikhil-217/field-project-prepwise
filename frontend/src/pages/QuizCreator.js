import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuiz } from "../api/quizzes";

// Allowed subjects for R22 regulation (STRICT - ONLY THESE SUBJECTS)
const ALLOWED_SUBJECTS = [
    "DLD",
    "Software Engineering",
    "OOPS",
    "Design and Analysis of Algorithm",
    "Computer Organisation",
    "Economics and Engineering Accountancy"
];

const QuizCreator = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [unit, setUnit] = useState(1);
    const [timeLimit, setTimeLimit] = useState(30);
    const [regulation, setRegulation] = useState("R22");
    const [year, setYear] = useState(2);
    const [semester, setSemester] = useState(1);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [questions, setQuestions] = useState([
        { type: "MCQ", text: "", options: ["", ""], correctAnswer: "", points: 1 }
    ]);

    const handleAddQuestion = () => {
        setQuestions([...questions, { type: "MCQ", text: "", options: ["", ""], correctAnswer: "", points: 1 }]);
    };

    const handleQuestionChange = (index, field, value) => {
        const newQs = [...questions];
        newQs[index][field] = value;
        setQuestions(newQs);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQs = [...questions];
        newQs[qIndex].options[oIndex] = value;
        setQuestions(newQs);
    };

    const handleAddOption = (qIndex) => {
        const newQs = [...questions];
        newQs[qIndex].options.push("");
        setQuestions(newQs);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const quizData = {
                title, description, subject, unit, timeLimit, regulation, year, semester,
                startTime: startTime || null,
                endTime: endTime || null,
                questions
            };
            await createQuiz(quizData);
            alert("Quiz created successfully!");
            navigate("/quizzes");
        } catch (err) {
            console.error(err);
            alert("Failed to create quiz: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
            <h2>Create New Quiz</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                        <label>Title:</label>
                        <input required type="text" value={title} onChange={e => setTitle(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                    </div>
                    <div>
                        <label>Subject:</label>
                        <select required value={subject} onChange={e => setSubject(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                            <option value="">Select Subject</option>
                            {ALLOWED_SUBJECTS.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                        <label>Description:</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                    <div>
                        <label>Unit:</label>
                        <select value={unit} onChange={e => setUnit(Number(e.target.value))} style={{ width: "100%", padding: "8px" }}>
                            {[1,2,3,4,5].map(u => (
                                <option key={u} value={u}>Unit {u}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Time Limit (minutes):</label>
                        <input type="number" min="1" value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} style={{ width: "100%", padding: "8px" }} />
                    </div>
                    <div>
                        <label>Semester:</label>
                        <select value={semester} onChange={e => setSemester(Number(e.target.value))} style={{ width: "100%", padding: "8px" }}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                    <div>
                        <label>Regulation:</label>
                        <select value={regulation} onChange={e => setRegulation(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                            <option value="R19">R19</option>
                            <option value="R20">R20</option>
                            <option value="R22">R22</option>
                        </select>
                    </div>
                    <div>
                        <label>Year:</label>
                        <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ width: "100%", padding: "8px" }}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                    <div>
                        <label>Start Time (Optional):</label>
                        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                    </div>
                    <div>
                        <label>End Time (Optional):</label>
                        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: "100%", padding: "8px" }} />
                    </div>
                </div>

                <hr style={{ margin: "20px 0" }} />
                <h3>Questions</h3>

                {questions.map((q, qIndex) => (
                    <div key={qIndex} style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "5px", marginBottom: "15px" }}>
                        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                            <select value={q.type} onChange={e => handleQuestionChange(qIndex, "type", e.target.value)} style={{ padding: "8px" }}>
                                <option value="MCQ">Multiple Choice</option>
                                <option value="FITB">Fill in the Blanks</option>
                                <option value="DESCRIPTIVE">Descriptive</option>
                            </select>
                            <input type="number" min="1" value={q.points} onChange={e => handleQuestionChange(qIndex, "points", Number(e.target.value))} style={{ padding: "8px", width: "80px" }} title="Points" />
                        </div>

                        <input required type="text" placeholder="Question Text" value={q.text} onChange={e => handleQuestionChange(qIndex, "text", e.target.value)} style={{ width: "100%", padding: "8px", marginBottom: "10px" }} />

                        {q.type === "MCQ" && (
                            <div style={{ marginLeft: "20px" }}>
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
                                        <input required type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} style={{ padding: "5px", flex: 1 }} />
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleAddOption(qIndex)} style={{ marginTop: "5px", padding: "5px 10px", cursor: "pointer" }}>+ Add Option</button>
                            </div>
                        )}

                        {q.type !== "DESCRIPTIVE" && (
                            <div style={{ marginTop: "10px" }}>
                                <label>Correct Answer:</label>
                                <input required type="text" value={q.correctAnswer} onChange={e => handleQuestionChange(qIndex, "correctAnswer", e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} placeholder={q.type === "MCQ" ? "Must exactly match one option" : "Exact phrase to match"} />
                            </div>
                        )}
                    </div>
                ))}

                <button type="button" onClick={handleAddQuestion} style={{ padding: "10px", background: "#ecf0f1", border: "1px solid #bdc3c7", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>+ Add Another Question</button>

                <button type="submit" style={{ padding: "12px", background: "#27ae60", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontSize: "16px", marginTop: "20px" }}>Publish Quiz</button>
            </form>
        </div>
    );
};

export default QuizCreator;
