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
import { HiUserGroup, HiClipboardList, HiAcademicCap, HiArrowRight } from 'react-icons/hi';

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
        { id: 1, title: 'Mid-term Test', participants: 45, averageScore: 78, date: '2023-06-15' },
        { id: 2, title: 'Chapter 5 Quiz', participants: 38, averageScore: 82, date: '2023-06-10' },
        { id: 3, title: 'Practice Test', participants: 42, averageScore: 75, date: '2023-06-05' },
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
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(79, 70, 229)',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const averageScoresData = {
    labels: stats.averageScores.map(item => item.class),
    datasets: [
      {
        label: 'Average Scores',
        data: stats.averageScores.map(item => item.score),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 1,
        borderRadius: 4,
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
            return `${context.dataset.label}: ${context.raw}`;
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
            return value;
          }
        }
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
        <p className="text-gray-600">Overview of your teaching activities and student performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Students Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <HiUserGroup className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalStudents}</h3>
              <p className="text-xs text-gray-500 mt-1">Across all classes</p>
            </div>
          </div>
        </div>

        {/* Quizzes Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <HiClipboardList className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalQuizzes}</h3>
              <p className="text-xs text-gray-500 mt-1">Created this term</p>
            </div>
          </div>
        </div>

        {/* Classes Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="p-6 flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <HiAcademicCap className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Classes</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalClasses}</h3>
              <p className="text-xs text-gray-500 mt-1">Currently teaching</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Participation Chart */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Quiz Participation Trend</h3>
            <div className="flex items-center text-sm text-gray-500">
              <div className="flex items-center mr-4">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-1"></div>
                <span>Students</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <Line data={participationData} options={chartOptions} />
          </div>
        </div>

        {/* Average Scores Chart */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Average Scores by Class</h3>
            <div className="flex items-center text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-500 rounded mr-1"></div>
                <span>Scores</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <Bar data={averageScoresData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Quizzes */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Recent Quizzes</h3>
            <Link 
              to="/quizzes" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              View all <HiArrowRight className="ml-1" />
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentQuizzes.length > 0 ? (
            stats.recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-500 mr-3">
                        {formatDate(quiz.date)}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                        {quiz.participants} participants
                      </span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{quiz.title}</h4>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${quiz.averageScore}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {quiz.averageScore}% avg
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/quizzes/${quiz.id}`}
                    className="ml-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Results
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <HiClipboardList className="mx-auto" style={{ fontSize: '3rem' }} />
              </div>
              <p className="text-gray-500">No quizzes created yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first quiz to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;