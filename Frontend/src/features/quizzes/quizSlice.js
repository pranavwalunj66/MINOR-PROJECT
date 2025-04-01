import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { quizService } from '../../services/quiz.service';
import { toast } from 'react-hot-toast';

// Async thunks
export const fetchQuizzes = createAsyncThunk(
  'quiz/fetchQuizzes',
  async (classId = null, { rejectWithValue }) => {
    try {
      return await quizService.getQuizzes(classId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes');
    }
  }
);

export const fetchQuizById = createAsyncThunk(
  'quiz/fetchQuizById',
  async (quizId, { rejectWithValue }) => {
    try {
      return await quizService.getQuizById(quizId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz');
    }
  }
);

export const createQuiz = createAsyncThunk(
  'quiz/createQuiz',
  async (quizData, { rejectWithValue }) => {
    try {
      const response = await quizService.createQuiz(quizData);
      toast.success('Quiz created successfully');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const startQuiz = createAsyncThunk(
  'quiz/startQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      return await quizService.startQuiz(quizId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start quiz');
    }
  }
);

export const submitQuiz = createAsyncThunk(
  'quiz/submitQuiz',
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      const response = await quizService.submitQuiz(quizId, answers);
      toast.success('Quiz submitted successfully');
      return response;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const saveQuizProgress = createAsyncThunk(
  'quiz/saveProgress',
  async ({ quizId, answers }, { rejectWithValue }) => {
    try {
      return await quizService.saveProgress(quizId, answers);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save progress');
    }
  }
);

export const fetchQuizResults = createAsyncThunk(
  'quiz/fetchResults',
  async ({ quizId, studentId = null }, { rejectWithValue }) => {
    try {
      return await quizService.getQuizResults(quizId, studentId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
    }
  }
);

const initialState = {
  quizzes: [],
  currentQuiz: null,
  activeAttempt: null,
  results: null,
  loading: false,
  error: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    resetQuizState: (state) => {
      state.currentQuiz = null;
      state.activeAttempt = null;
      state.results = null;
      state.error = null;
    },
    updateQuizTimer: (state, action) => {
      if (state.activeAttempt) {
        state.activeAttempt.timeLeft = action.payload;
      }
    },
    updateAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      if (state.activeAttempt) {
        state.activeAttempt.answers = {
          ...state.activeAttempt.answers,
          [questionId]: answer,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Quiz by ID
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Start Quiz
      .addCase(startQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.activeAttempt = action.payload;
      })
      .addCase(startQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Submit Quiz
      .addCase(submitQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.activeAttempt = null;
        state.results = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Save Progress
      .addCase(saveQuizProgress.fulfilled, (state, action) => {
        // Optionally update state if needed
      })

      // Fetch Results
      .addCase(fetchQuizResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchQuizResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetQuizState, updateQuizTimer, updateAnswer } = quizSlice.actions;

// Selectors
export const selectQuizzes = (state) => state.quiz.quizzes;
export const selectCurrentQuiz = (state) => state.quiz.currentQuiz;
export const selectActiveAttempt = (state) => state.quiz.activeAttempt;
export const selectQuizResults = (state) => state.quiz.results;
export const selectQuizLoading = (state) => state.quiz.loading;
export const selectQuizError = (state) => state.quiz.error;

export default quizSlice.reducer;
