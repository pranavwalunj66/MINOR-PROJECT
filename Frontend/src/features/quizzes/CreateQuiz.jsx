import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiPlus, HiTrash, HiArrowUp, HiArrowDown } from 'react-icons/hi';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    classId: '',
    startTime: '',
    duration: 30,
    passingCriteria: 40,
    questions: [
      {
        text: '',
        options: ['', '', '', ''],
        correctOption: 0,
        points: 1,
      },
    ],
  });

  useEffect(() => {
    fetchClasses();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setFormData((prev) => {
      const questions = [...prev.questions];
      questions[index] = {
        ...questions[index],
        [field]: value,
      };
      return { ...prev, questions };
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData((prev) => {
      const questions = [...prev.questions];
      const options = [...questions[questionIndex].options];
      options[optionIndex] = value;
      questions[questionIndex] = {
        ...questions[questionIndex],
        options,
      };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    if (formData.questions.length >= 50) {
      toast.error('Maximum 50 questions allowed');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          options: ['', '', '', ''],
          correctOption: 0,
          points: 1,
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      toast.error('Quiz must have at least one question');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const moveQuestion = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.questions.length) return;

    setFormData((prev) => {
      const questions = [...prev.questions];
      [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
      return { ...prev, questions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }

    const invalidQuestions = formData.questions.filter(
      (q) => !q.text || q.options.some((opt) => !opt)
    );
    if (invalidQuestions.length > 0) {
      toast.error('All questions must have text and all options filled');
      return;
    }

    try {
      // TODO: Replace with actual API call
      toast.success('Quiz created successfully!');
      navigate('/quizzes');
    } catch (error) {
      toast.error('Failed to create quiz');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Create Quiz</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Details */}
        <div className="bg-white shadow rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Quiz Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Quiz Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 input"
                placeholder="Enter quiz title"
              />
            </div>

            <div>
              <label htmlFor="classId" className="block text-sm font-medium text-gray-700">
                Class
              </label>
              <select
                id="classId"
                name="classId"
                required
                value={formData.classId}
                onChange={handleChange}
                className="mt-1 input"
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                required
                value={formData.startTime}
                onChange={handleChange}
                className="mt-1 input"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                required
                min="1"
                max="180"
                value={formData.duration}
                onChange={handleChange}
                className="mt-1 input"
              />
            </div>

            <div>
              <label htmlFor="passingCriteria" className="block text-sm font-medium text-gray-700">
                Passing Criteria (%)
              </label>
              <input
                type="number"
                id="passingCriteria"
                name="passingCriteria"
                required
                min="0"
                max="100"
                value={formData.passingCriteria}
                onChange={handleChange}
                className="mt-1 input"
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {formData.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Question {questionIndex + 1}
                </h4>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => moveQuestion(questionIndex, 'up')}
                    disabled={questionIndex === 0}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <HiArrowUp className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(questionIndex, 'down')}
                    disabled={questionIndex === formData.questions.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <HiArrowDown className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="p-1 text-red-400 hover:text-red-500"
                  >
                    <HiTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Question Text
                  </label>
                  <textarea
                    required
                    value={question.text}
                    onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                    className="mt-1 input"
                    rows="2"
                    placeholder="Enter question text"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Options
                  </label>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name={`correct-${questionIndex}`}
                        checked={question.correctOption === optionIndex}
                        onChange={() =>
                          handleQuestionChange(questionIndex, 'correctOption', optionIndex)
                        }
                        className="h-4 w-4 text-primary-600"
                      />
                      <input
                        type="text"
                        required
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(questionIndex, optionIndex, e.target.value)
                        }
                        className="input flex-1"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Points
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={question.points}
                    onChange={(e) =>
                      handleQuestionChange(questionIndex, 'points', parseInt(e.target.value))
                    }
                    className="mt-1 input w-24"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            disabled={formData.questions.length >= 50}
            className="btn btn-secondary w-full flex items-center justify-center"
          >
            <HiPlus className="h-5 w-5 mr-2" />
            Add Question
          </button>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/quizzes')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;
