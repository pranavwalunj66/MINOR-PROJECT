import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { HiUserGroup, HiClipboardList, HiAcademicCap } from 'react-icons/hi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalQuizzes: 0,
    totalClasses: 0,
    recentQuizzes: [],
    quizParticipation: [],
    averageScores: [],
  });

  // Fetch dashboard data
  useEffect(() => {
    // TODO: Implement API call to fetch dashboard data
    // For now, using mock data
    setStats({
      totalStudents: 150,
      totalQuizzes: 12,
      totalClasses: 5,
      recentQuizzes: [
        { id: 1, title: 'Mid-term Test', participants: 45, averageScore: 78 },
        { id: 2, title: 'Chapter 5 Quiz', participants: 38, averageScore: 82 },
        { id: 3, title: 'Practice Test', participants: 42, averageScore: 75 },
      ],
      quizParticipation: [
        { month: 'Jan', count: 120 },
        { month: 'Feb', count: 150 },
        { month: 'Mar', count: 180 },
        { month: 'Apr', count: 165 },
      ],
      averageScores: [
        { class: 'Class A', score: 85 },
        { class: 'Class B', score: 78 },
        { class: 'Class C', score: 82 },
        { class: 'Class D', score: 76 },
        { class: 'Class E', score: 80 },
      ],
    });
  }, []);

  const participationData = {
    labels: stats.quizParticipation.map(item => item.month),
    datasets: [
      {
        label: 'Quiz Participation',
        data: stats.quizParticipation.map(item => item.count),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const averageScoresData = {
    labels: stats.averageScores.map(item => item.class),
    datasets: [
      {
        label: 'Average Scores by Class',
        data: stats.averageScores.map(item => item.score),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <HiUserGroup className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalStudents}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <HiClipboardList className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Quizzes</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <HiAcademicCap className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Classes</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalClasses}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Participation Trend</h3>
          <Line data={participationData} options={{ maintainAspectRatio: false }} height={300} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Average Scores by Class</h3>
          <Bar data={averageScoresData} options={{ maintainAspectRatio: false }} height={300} />
        </div>
      </div>

      {/* Recent Quizzes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Quizzes</h3>
            <Link to="/quizzes" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentQuizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/quizzes/${quiz.id}`} className="text-primary-600 hover:text-primary-700">
                        {quiz.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quiz.participants} students
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quiz.averageScore}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
