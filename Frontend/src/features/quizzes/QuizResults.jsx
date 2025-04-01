import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
  HiCheckCircle,
  HiXCircle,
  HiDownload,
  HiChartBar,
  HiUserGroup,
  HiClock,
} from 'react-icons/hi';
import { selectCurrentUser } from '../auth/authSlice';

const QuizResults = () => {
  const { quizId } = useParams();
  const user = useSelector(selectCurrentUser);
  const isTeacher = user?.role === 'teacher';
  const [results, setResults] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      // TODO: Replace with actual API call
      const mockResults = {
        quiz: {
          id: 1,
          title: 'Mid-term Assessment',
          class: { name: 'Mathematics 101' },
          totalQuestions: 25,
          totalPoints: 25,
          duration: 60,
          passingCriteria: 40,
        },
        statistics: {
          averageScore: 78,
          highestScore: 96,
          lowestScore: 52,
          totalParticipants: 42,
          scoreDistribution: [
            { range: '0-20', count: 0 },
            { range: '21-40', count: 2 },
            { range: '41-60', count: 8 },
            { range: '61-80', count: 20 },
            { range: '81-100', count: 12 },
          ],
        },
        students: [
          {
            id: 1,
            name: 'John Smith',
            score: 22,
            timeTaken: 45,
            answers: [
              { questionId: 1, isCorrect: true },
              { questionId: 2, isCorrect: false },
              // ... more answers
            ],
          },
          // ... more students
        ],
        questions: [
          {
            id: 1,
            text: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correctOption: 2,
            points: 1,
          },
          // ... more questions
        ],
      };
      setResults(mockResults);
    } catch (error) {
      toast.error('Failed to fetch results');
    }
  };

  const handleExportResults = async () => {
    try {
      // TODO: Replace with actual API call
      toast.success('Results exported successfully!');
    } catch (error) {
      toast.error('Failed to export results');
    }
  };

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{results.quiz.title}</h2>
            <p className="mt-1 text-gray-500">{results.quiz.class.name}</p>
          </div>
          {isTeacher && (
            <button
              onClick={handleExportResults}
              className="btn btn-secondary flex items-center"
            >
              <HiDownload className="h-5 w-5 mr-2" />
              Export Results
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <HiChartBar className="h-6 w-6 text-primary-600" />
              <span className="ml-2 text-sm text-gray-500">Average Score</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {results.statistics.averageScore}%
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <HiUserGroup className="h-6 w-6 text-primary-600" />
              <span className="ml-2 text-sm text-gray-500">Participants</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {results.statistics.totalParticipants}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <HiClock className="h-6 w-6 text-primary-600" />
              <span className="ml-2 text-sm text-gray-500">Duration</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {results.quiz.duration} min
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <HiCheckCircle className="h-6 w-6 text-primary-600" />
              <span className="ml-2 text-sm text-gray-500">Passing Score</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {results.quiz.passingCriteria}%
            </p>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Score Distribution</h3>
        <div className="space-y-2">
          {results.statistics.scoreDistribution.map((range) => (
            <div key={range.range} className="flex items-center">
              <span className="w-16 text-sm text-gray-500">{range.range}%</span>
              <div className="flex-1 ml-4">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full"
                    style={{
                      width: `${(range.count / results.statistics.totalParticipants) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <span className="ml-4 text-sm text-gray-500">{range.count} students</span>
            </div>
          ))}
        </div>
      </div>

      {/* Student Results */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Student Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Taken
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.students.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {student.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {student.score}/{results.quiz.totalPoints} ({Math.round((student.score / results.quiz.totalPoints) * 100)}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {student.timeTaken} minutes
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(student.score / results.quiz.totalPoints) * 100 >=
                      results.quiz.passingCriteria ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setSelectedStudent(null)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {selectedStudent.name}'s Results
                    </h3>
                    <div className="space-y-4">
                      {results.questions.map((question, index) => {
                        const answer = selectedStudent.answers[index];
                        return (
                          <div
                            key={question.id}
                            className={`p-4 rounded-lg ${
                              answer.isCorrect ? 'bg-green-50' : 'bg-red-50'
                            }`}
                          >
                            <div className="flex items-start">
                              <div
                                className={`mt-0.5 ${
                                  answer.isCorrect
                                    ? 'text-green-500'
                                    : 'text-red-500'
                                }`}
                              >
                                {answer.isCorrect ? (
                                  <HiCheckCircle className="h-5 w-5" />
                                ) : (
                                  <HiXCircle className="h-5 w-5" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-gray-900">
                                  {index + 1}. {question.text}
                                </p>
                                <div className="mt-2 space-y-2">
                                  {question.options.map((option, optIndex) => (
                                    <div
                                      key={optIndex}
                                      className={`text-sm ${
                                        optIndex === question.correctOption
                                          ? 'text-green-700'
                                          : 'text-gray-500'
                                      }`}
                                    >
                                      {option}
                                      {optIndex === question.correctOption &&
                                        ' (Correct)'}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="btn btn-primary w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizResults;
