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
import { School, AssignmentTurnedIn, EmojiEvents, Quiz, Alarm, BarChart } from '@mui/icons-material';

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
        { id: 1, title: 'Mid-term Test', score: 85, total: 100, date: '2025-03-28', subject: 'Mathematics' },
        { id: 2, title: 'Quiz 3', score: 18, total: 20, date: '2025-03-25', subject: 'Physics' },
        { id: 3, title: 'Practice Test', score: 45, total: 50, date: '2025-03-20', subject: 'Chemistry' },
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
        label: 'Quiz Performance (%)',
        data: stats.performanceData.map(item => item.score),
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (scorePercentage) => {
    if (scorePercentage >= 85) return 'text-emerald-500';
    if (scorePercentage >= 70) return 'text-blue-500';
    if (scorePercentage >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  // Simple circular progress component
  const CircularProgress = ({ percentage }) => {
    const strokeWidth = 8;
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-16 h-16">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-gray-200"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className="text-indigo-600"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800">{percentage}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-gray-600">Track your learning progress and upcoming activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Enrolled Classes Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6 flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <School className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Enrolled Classes</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalClasses}</h3>
            </div>
          </div>
        </div>

        {/* Completed Quizzes Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <AssignmentTurnedIn className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed Quizzes</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.completedQuizzes}</h3>
            </div>
          </div>
        </div>

        {/* Average Score Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6 flex items-center">
            <div className="mr-4">
              <CircularProgress percentage={stats.averageScore} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.averageScore}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance Chart */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart className="mr-2 text-indigo-500" />
              Performance Trend
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-1"></div>
                <span>Your Score</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <Line data={performanceChartData} options={chartOptions} />
          </div>
        </div>

        {/* Upcoming Quizzes */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Alarm className="mr-2 text-amber-500" />
              Upcoming Quizzes
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.upcomingQuizzes.length > 0 ? (
              stats.upcomingQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded mr-2">
                          {quiz.subject}
                        </span>
                        <span className="text-xs text-gray-500">
                          {quiz.duration} min
                        </span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{quiz.title}</h4>
                      <p className="text-sm text-gray-500 flex items-center">
                        <span className="mr-1">⏰</span>
                        {formatDate(quiz.date)}
                      </p>
                    </div>
                    <Link
                      to={`/quizzes/${quiz.id}`}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                    >
                      <Quiz className="mr-1" style={{ fontSize: '1rem' }} />
                      Start
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <Quiz style={{ fontSize: '3rem' }} />
                </div>
                <p className="text-gray-500">No upcoming quizzes scheduled</p>
                <p className="text-sm text-gray-400 mt-1">Check back later for new quizzes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <EmojiEvents className="mr-2 text-emerald-500" />
            Recent Results
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quiz Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentResults.map((result) => {
                const percentage = (result.score / result.total) * 100;
                return (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        to={`/quizzes/${result.id}`} 
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        {result.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.subject || 'General'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`font-medium ${getScoreColor(percentage)}`}>
                          {result.score}/{result.total}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/quizzes/${result.id}/review`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {stats.recentResults.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No quiz results available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;