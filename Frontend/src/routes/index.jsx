import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import VerifyOTP from '../features/auth/VerifyOTP';
import Dashboard from '../features/dashboard/Dashboard';
import Classes from '../features/classes/Classes';
import CreateClass from '../features/classes/CreateClass';
import JoinClass from '../features/classes/JoinClass';
import Quizzes from '../features/quizzes/Quizzes';
import CreateQuiz from '../features/quizzes/CreateQuiz';
import TakeQuiz from '../features/quizzes/TakeQuiz';
import Results from '../features/results/Results';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="login" />} />
        <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
      </Route>

      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route path="classes">
          <Route index element={<Classes />} />
          <Route path="create" element={<CreateClass />} />
          <Route path="join" element={<JoinClass />} />
          <Route path=":classId">
            <Route index element={<Quizzes />} />
            <Route path="quizzes/create" element={<CreateQuiz />} />
            <Route path="quizzes/:quizId">
              <Route index element={<TakeQuiz />} />
              <Route path="results" element={<Results />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
