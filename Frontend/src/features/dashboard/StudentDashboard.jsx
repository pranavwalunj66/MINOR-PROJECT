import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { HiAcademicCap, HiClipboardCheck, HiTrophy } from 'react-icons/hi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    completedQuizzes: 0,
    averageScore: 0,
    upcomingQuizzes: [],
    recentResults: [],
    performanceData: [],
  });

  // Fetch dashboard data
  useEffect(() => {
    // TODO: Implement API call to fetch dashboard data
    // For now, using mock data
    setStats({
      totalClasses: 4,
      completedQuizzes: 8,
      averageScore: 82,
      upcomingQuizzes: [
        {
          id: 1,
          title: 'Final Assessment',
          subject: 'Mathematics',
          date: '2025-04-05T14:00:00',
          duration: 60,
        },
        {
          id: 2,
          title: 'Chapter Test',
          subject: 'Physics',
          date: '2025-04-07T10:00:00',
          duration: 45,
        },
      ],
      recentResults: [
        { id: 1, title: 'Mid-term Test', score: 85, total: 100, date: '2025-03-28' },
        { id: 2, title: 'Quiz 3', score: 18, total: 20, date: '2025-03-25' },
        { id: 3, title: 'Practice Test', score: 45, total: 50, date: '2025-03-20' },
      ],
      performanceData: [
        { quiz: 'Quiz 1', score: 80 },
        { quiz: 'Quiz 2', score: 75 },
        { quiz: 'Quiz 3', score: 90 },
        { quiz: 'Quiz 4', score: 85 },
        { quiz: 'Quiz 5', score: 88 },
      ],
    });
  }, []);

  const performanceChartData = {
    labels: stats.performanceData.map(item => item.quiz),
    datasets: [
      {
        label: 'Quiz Performance',
        data: stats.performanceData.map(item => item.score),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <HiAcademicCap className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Enrolled Classes</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalClasses}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <HiClipboardCheck className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Completed Quizzes</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.completedQuizzes}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <HiTrophy className="h-8 w-8" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Average Score</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.averageScore}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trend</h3>
          <Line data={performanceChartData} options={{ maintainAspectRatio: false }} height={300} />
        </div>

        {/* Upcoming Quizzes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Quizzes</h3>
          <div className="space-y-4">
            {stats.upcomingQuizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                  <p className="text-sm text-gray-500">{quiz.subject}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(quiz.date)} • {quiz.duration} minutes
                  </p>
                </div>
                <Link
                  to={`/quizzes/${quiz.id}`}
                  className="btn btn-primary text-sm"
                >
                  View Details
                </Link>
              </div>
            ))}
            {stats.upcomingQuizzes.length === 0 && (
              <p className="text-gray-500 text-center py-4">No upcoming quizzes</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentResults.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/quizzes/${result.id}`} className="text-primary-600 hover:text-primary-700">
                        {result.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{result.score}/{result.total}</span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({((result.score / result.total) * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.date).toLocaleDateString()}
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

export default StudentDashboard;
