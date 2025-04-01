import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      {user?.role === 'teacher' ? (
        <TeacherDashboard />
      ) : (
        <StudentDashboard />
      )}
    </>
  );
};

export default Dashboard;
