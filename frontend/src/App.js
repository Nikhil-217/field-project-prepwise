import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

// 1. IMPORT GLOBAL STATE
import { AuthProvider } from "./context/AuthContext";

// 2. IMPORT ROUTE PROTECTION
import PrivateRoute from "./components/PrivateRoute";
import EduLayout from "./components/EduLayout";

// 3. PAGE IMPORTS
import Login from "./pages/Login";
import Register from "./pages/Register";
import Notes from "./pages/Notes";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherUpload from "./pages/TeacherUpload";
import StudentNotes from "./pages/StudentNotes";
import Quizzes from "./pages/Quizzes";
import QuizCreator from "./pages/QuizCreator";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResults from "./pages/QuizResults";
import StudentList from "./pages/StudentList";
import StudentPerformance from "./pages/StudentPerformance";


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* PROTECTED ROUTES (Wrapped in EduLayout) */}
            <Route element={<PrivateRoute allowedRoles={["student", "teacher"]} />}>
              <Route element={<EduLayout children={<Outlet />} />}>
                <Route path="/notes" element={<Notes />} />
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/upload-notes" element={<TeacherUpload />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/student-notes" element={<StudentNotes />} />
                <Route path="/quizzes" element={<Quizzes />} />
                <Route path="/quizzes/create" element={<QuizCreator />} />
                <Route path="/quizzes/:id" element={<QuizResults />} />
                <Route path="/quizzes/:id/attempt" element={<QuizAttempt />} />
                <Route path="/students" element={<StudentList />} />
                <Route path="/students/performance" element={<StudentPerformance />} />
                <Route path="/students/:id" element={<StudentPerformance />} />
              </Route>
            </Route>

            {/* REDIRECTS */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<h1 style={{ padding: "50px" }}>404 - Page Not Found</h1>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
