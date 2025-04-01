import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiClock, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz) {
      // Initialize timer
      setTimeLeft(quiz.duration * 60); // Convert minutes to seconds
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz]);

  const fetchQuiz = async () => {
    try {
      // TODO: Replace with actual API call
      const mockQuiz = {
        id: 1,
        title: 'Mid-term Assessment',
        duration: 60,
        questions: [
          {
            id: 1,
            text: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            points: 1,
          },
          {
            id: 2,
            text: 'Which planet is known as the Red Planet?',
            options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
            points: 1,
          },
        ],
      };
      setQuiz(mockQuiz);
      // Initialize answers object
      const initialAnswers = {};
      mockQuiz.questions.forEach((q) => {
        initialAnswers[q.id] = null;
      });
      setAnswers(initialAnswers);
    } catch (error) {
      toast.error('Failed to fetch quiz');
      navigate('/quizzes');
    }
  };

  const handleTimeUp = () => {
    toast.error('Time is up! Submitting quiz...');
    handleSubmit();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handlePrevQuestion = () => {
    setCurrentQuestion((prev) => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestion((prev) => Math.min(quiz.questions.length - 1, prev + 1));
  };

  const handleSubmit = async () => {
    // Confirm submission if there are unanswered questions
    const unansweredCount = Object.values(answers).filter((a) => a === null).length;
    if (unansweredCount > 0) {
      const confirmed = window.confirm(
        `You have ${unansweredCount} unanswered question${
          unansweredCount === 1 ? '' : 's'
        }. Are you sure you want to submit?`
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      toast.success('Quiz submitted successfully!');
      navigate(`/quizzes/${quizId}/results`);
    } catch (error) {
      toast.error('Failed to submit quiz');
      setIsSubmitting(false);
    }
  };

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
          <div className="flex items-center space-x-2 text-gray-900">
            <HiClock className="h-5 w-5" />
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>
              {Object.values(answers).filter((a) => a !== null).length} of{' '}
              {quiz.questions.length} answered
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-primary-600 rounded-full transition-all"
              style={{
                width: `${
                  (Object.values(answers).filter((a) => a !== null).length /
                    quiz.questions.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </h3>
            <span className="text-sm text-gray-500">
              Points: {currentQuestionData.points}
            </span>
          </div>

          <p className="text-gray-900">{currentQuestionData.text}</p>

          <div className="space-y-3">
            {currentQuestionData.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers[currentQuestionData.id] === index
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionData.id}`}
                  checked={answers[currentQuestionData.id] === index}
                  onChange={() => handleAnswerSelect(currentQuestionData.id, index)}
                  className="h-4 w-4 text-primary-600"
                />
                <span className="ml-3">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestion === 0}
          className="btn btn-secondary flex items-center"
        >
          <HiChevronLeft className="h-5 w-5 mr-1" />
          Previous
        </button>

        <div className="flex space-x-4">
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="btn btn-primary flex items-center"
            >
              Next
              <HiChevronRight className="h-5 w-5 ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Question Navigation</h4>
        <div className="grid grid-cols-10 gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`p-2 text-sm font-medium rounded ${
                currentQuestion === index
                  ? 'bg-primary-600 text-white'
                  : answers[quiz.questions[index].id] !== null
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
