// src/redux/slices/testSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question, TestData, Round, TestState, ExtractedInfo } from '../../types'; // Adjust the import path as necessary
// Define interfaces for the test data structure (should match your backend output)

// It's a good practice to define these types in a central `types/index.ts` file
// and import them here, but for now, we'll keep them inline for clarity.

const initialState: TestState = {
    testData: null,
    userAnswers: {}, // Initialize as an empty object for answers
    flaggedQuestions: [], // Initialize as an empty array for flagged questions
    loading: false,
    error: null,
    currentQuestionIndex: 0, // Start at the first question
};

// Create the test slice
const testSlice = createSlice({
    name: 'test', // Slice name
    initialState, // Initial state
    reducers: {
        setTestData: (state, action: PayloadAction<TestData>) => {
            state.testData = action.payload;
            state.loading = false;
            state.error = null;
            state.currentQuestionIndex = 0; // Reset to first question for a new test
        },
        clearTestData: (state) => {
            state.testData = null;
            state.userAnswers = {}; // Clear answers
            state.flaggedQuestions = []; // Clear flags
            state.loading = false;
            state.error = null;
            state.currentQuestionIndex = 0;
        },
        setTestLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setTestError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
            state.testData = null; // Clear data on error
            state.userAnswers = {};
            state.flaggedQuestions = [];
        },
        // Action to update a user's answer for a specific question
        setUserAnswer: (state, action: PayloadAction<{ questionId: string; answer: string }>) => {
            state.userAnswers[action.payload.questionId] = action.payload.answer;
        },
        // Action to flag a question
        setFlaggedQuestion: (state, action: PayloadAction<string>) => {
            if (!state.flaggedQuestions.includes(action.payload)) {
                state.flaggedQuestions.push(action.payload);
            }
        },
        // Action to unflag a question
        unsetFlaggedQuestion: (state, action: PayloadAction<string>) => {
            state.flaggedQuestions = state.flaggedQuestions.filter(id => id !== action.payload);
        },
        // Action to navigate between questions
        setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
            state.currentQuestionIndex = action.payload;
        },
        // NEW: Action to clear all test-related state after submission
        clearTestState: (state) => {
            Object.assign(state, initialState); // Reset to initial state
        },
    },
});

// Export the actions
export const {
    setTestData,
    clearTestData,
    setTestLoading,
    setTestError,
    setUserAnswer, // Export new action
    setFlaggedQuestion, // Export new action
    unsetFlaggedQuestion, // Export new action
    setCurrentQuestionIndex,
    clearTestState, // Export new action
} = testSlice.actions;

// Export the reducer
export default testSlice.reducer;