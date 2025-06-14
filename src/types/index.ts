// types/index.ts (or similar)

// For the question object, likely coming from your initial test generation API

export type QuestionType = 'multiple-choice' | 'coding-challenge' | 'theoretical' | 'general-aptitude'; // Added 'general-aptitude'

export interface Question {
    question: any;
    testCases: { input: string; output: string; }[] | null; // Use null instead of undefined if object won't exist
    documentation: string | null; // Use null instead of undefined if string won't exist
    language?: string; // Optional if not always present
    starterCode?: string; // Optional if not always present
    maxLength?: number; // Optional if not always present
    id: string;
    type: QuestionType; // Use the union type
    questionText: string;
    options: string[] | null; // Use null if no options (e.g., for theoretical/coding)
    correctAnswer: any; // Consider a more specific type if possible (e.g., string | string[])
    difficulty: 'easy' | 'medium' | 'hard';
    relatedSkills: string[];
}

export interface ExtractedInfo {
    inferredRole: string | null;
    inferredExperienceYears: number | null;
    extractedSkills: string[];
    summary: string;
}

// This TestData represents what your /api/generate-test endpoint returns
export interface TestData {
    extractedInfo: ExtractedInfo;
    rounds: Round[]; // Your API returns 'rounds', not 'testQuestions' directly at the top level
    totalDurationMinutes: number; // Matches the API response
    title: string; // The title of the test
    id: string; // The unique test ID
}

// You need a 'Round' interface if your API response is structured with rounds
export interface Round {
  id: string;
  name: string;
  type: QuestionType;
  questions: Question[];
}

export interface TestDataWithRounds {
    id: string;
    title: string;
    rounds: Round[]; // Now an array of rounds
    totalDurationMinutes: number; // From backend
    // Add other test properties
    }

// Define the overall state for the test slice
export interface TestState {
    testData: TestData | null; // This now correctly points to your API's top-level response structure
    userAnswers: Record<string, string>; // Maps questionId (string) to userAnswer (string)
    flaggedQuestions: string[]; // Array of questionIds that are flagged
    loading: boolean; // Track loading state related to test fetching/generation
    error: string | null; // Track errors related to test fetching/generation
    currentQuestionIndex: number; // To keep track of which question the user is on
}
// This interface represents the question with user answer and AI analysis
export interface TestQuestion {
    id: string;
    type: 'multiple-choice' | 'coding-challenge' | 'theoretical' | 'general-aptitude';
    questionText: string;
    options: string[] | null;
    correctAnswer: any; // Can be string, array, or more complex
    difficulty: 'easy' | 'medium' | 'hard';
    relatedSkills: string[];
    testCases: { input: string; output: string }[] | null; // From initial test generation
    documentation: string | null;
  }
  
  // For the AI's analysis response from your new /api/analyze-answer endpoint
  export interface AIAnalysisResult {
    assessmentResult: 'correct' | 'partially_correct' | 'wrong';
    aiExplanation: string;
    feedbackPoints?: string[];
    scoreImpact?: number;
  }
  
  // Represents a question after it has been reviewed/evaluated
export interface ReviewedQuestion extends Question {
  userAnswer: string; // The answer the user submitted
  analysis?: AIAnalysisResult; // The AI's evaluation of the answer
}

// Represents an entire review session for a submitted test
export interface ReviewSession {
  id: string; // The document ID in Firestore for this review session
  testId: string;
  userId: string;
  submissionTime: Date; // Stored as Firestore Timestamp
  reviewedQuestions: ReviewedQuestion[];
  flaggedQuestions: string[];
  finalFeedback?: string; // Optional, will be added by /api/generate-final-feedback
  feedbackGeneratedTime?: Date; // Optional, when final feedback was generated
}

