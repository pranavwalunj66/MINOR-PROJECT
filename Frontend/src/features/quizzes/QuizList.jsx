import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { HiPlus, HiClock, HiClipboardList, HiUserGroup } from 'react-icons/hi';
import { selectCurrentUser } from '../auth/authSlice';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [classes, setClasses] = useState([]);
  const user = useSelector(selectCurrentUser);
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    fetchQuizzes();
    fetchClasses();
  }, [selectedClass]);

  const fetchQuizzes = async () => {
    try {
      // TODO: Replace with actual API call
      const mockQuizzes = [
        {
          id: 1,
          title: 'Mid-term Assessment',
          class: { id: 1, name: 'Mathematics 101' },
          totalQuestions: 25,
          duration: 60,
          startTime: '2025-04-05T14:00:00',
          endTime: '2025-04-05T15:00:00',
          participants: 42,
          averageScore: 78,
          status: 'upcoming', // upcoming, active, completed
        },
        {
          id: 2,
          title: 'Chapter 5 Quiz',
          class: { id: 2, name: 'Physics Advanced' },
          totalQuestions: 15,
          duration: 30,
          startTime: '2025-04-02T10:00:00',
          endTime: '2025-04-02T10:30:00',
          participants: 38,
          averageScore: 82,
          status: 'completed',
        },
      ];
      setQuizzes(mockQuizzes);
    } catch (error) {
      toast.error('Failed to fetch quizzes');
    }
  };

  const fetchClasses = async () => {
    try {
      // TODO: Replace with actual API call
      const mockClasses = [
        { id: 1, name: 'Mathematics 101' },
        { id: 2, name: 'Physics Advanced' },
      ];
      setClasses(mockClasses);
    } catch (error) {
      toast.error('Failed to fetch classes');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'text-yellow-600 bg-yellow-100';
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Quizzes</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="input"
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {isTeacher && (
            <Link to="/quizzes/create" className="btn btn-primary flex items-center">
              <HiPlus className="h-5 w-5 mr-2" />
              Create Quiz
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                  <Link
                    to={`/quizzes/${quiz.id}`}
                    className="text-lg font-medium text-primary-600 hover:text-primary-700"
                  >
                    {quiz.title}
                  </Link>
                  <p className="mt-1 text-sm text-gray-500">
                    {quiz.class.name}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    quiz.status
                  )}`}
                >
                  {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <HiClipboardList className="h-5 w-5 mr-2" />
                  {quiz.totalQuestions} questions
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <HiClock className="h-5 w-5 mr-2" />
                  {quiz.duration} minutes
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <HiUserGroup className="h-5 w-5 mr-2" />
                  {quiz.participants} participants
                </div>
                {quiz.status === 'completed' && (
                  <div className="text-sm text-gray-500">
                    Average Score: {quiz.averageScore}%
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Start Time</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateTime(quiz.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Time</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDateTime(quiz.endTime)}
                  </p>
                </div>
              </div>

              {quiz.status === 'upcoming' && !isTeacher && (
                <div className="mt-4 pt-4 border-t">
                  <Link
                    to={`/quizzes/${quiz.id}`}
                    className="btn btn-primary w-full sm:w-auto"
                  >
                    View Details
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {quizzes.length === 0 && (
          <div className="text-center py-12">
            <HiClipboardList className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {isTeacher
                ? 'Get started by creating a new quiz'
                : 'No quizzes are available at the moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;
