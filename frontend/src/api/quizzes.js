import axios from "axios";

// Standardized API client
const API_URL = "http://localhost:5000/api/quizzes/";

// Setup axios instance with interceptors if needed, or just send token manually
const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// ─── TEACHER & STUDENT API ────────────────────────────────────────────────────────

// Fetch quizzes (works differently based on role, handled by backend)
export const getQuizzes = async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
};

// Get single quiz details
export const getQuizById = async (id) => {
    const response = await axios.get(`${API_URL}${id}`, getAuthHeaders());
    return response.data;
};

// ─── TEACHER ONLY API ─────────────────────────────────────────────────────────────

export const createQuiz = async (quizData) => {
    const response = await axios.post(API_URL, quizData, getAuthHeaders());
    return response.data;
};

// Get all students (Teacher only)
export const getStudents = async () => {
    const response = await axios.get(`${API_URL}students`, getAuthHeaders());
    return response.data;
};

// Get student performance by ID (Teacher only)
export const getStudentPerformance = async (studentId) => {
    const response = await axios.get(`${API_URL}students/${studentId}/performance`, getAuthHeaders());
    return response.data;
};

// ─── STUDENT ONLY API ─────────────────────────────────────────────────────────────

export const submitQuiz = async (id, answers, timeTaken = 0) => {
    const response = await axios.post(`${API_URL}${id}/submit`, { answers, timeTaken }, getAuthHeaders());
    return response.data;
};

// Get student's own quiz attempts
export const getMyAttempts = async () => {
    const response = await axios.get(`${API_URL}my-attempts`, getAuthHeaders());
    return response.data;
};

// Get student's own performance
export const getMyPerformance = async () => {
    const response = await axios.get(`${API_URL}my-performance`, getAuthHeaders());
    return response.data;
};
