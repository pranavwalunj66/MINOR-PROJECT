import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './features/auth/authSlice';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import VerifyOtp from './features/auth/VerifyOtp';

// Protected Pages
import TeacherDashboard from './features/dashboard/TeacherDashboard';
import StudentDashboard from './features/dashboard/StudentDashboard';
import ClassList from './features/classes/ClassList';
import QuizList from './features/quizzes/QuizList';
import CreateQuiz from './features/quizzes/CreateQuiz';
import TakeQuiz from './features/quizzes/TakeQuiz';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/classes" element={<ClassList />} />
        <Route path="/quizzes" element={<QuizList />} />
        <Route path="/quizzes/create" element={<CreateQuiz />} />
        <Route path="/quizzes/:quizId" element={<TakeQuiz />} />
      </Route>

      {/* Redirect root to appropriate dashboard */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800">404</h1>
              <p className="mt-2 text-gray-600">Page not found</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
