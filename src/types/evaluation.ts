// src/types/evaluation.ts

/**
 * Interface for the result of a single question in the evaluation.
 */
export interface QuestionResult {
    /** Unique identifier for the question. */
    questionId: string;
    /** The full text of the question asked. */
    questionText: string;
    /** The type of question (e.g., 'mcq', 'theory', 'coding'). */
    questionType: 'multiple-choice' | 'theory' | 'coding-challenge' | 'general-aptitude'; // Use exact types from your frontend
    /** The user's submitted answer for the question. */
    userAnswer: string;
    /** The correct answer for MCQs (from your DB). For theory/coding, this is not directly used for evaluation. */
    correctAnswer?: string; // Optional for theory/coding
    /** Boolean indicating if the user's answer was fully correct. */
    isCorrect: boolean;
    /** Marks awarded for this question (0, 0.5, or 1). */
    marksAwarded: 0 | 0.5 | 1;
    /** Feedback explaining why the answer was wrong or partially correct (from Gemini for theory/coding, or direct for MCQ). */
    feedback: string;
    /** Detailed explanation of the correct answer (from Gemini for theory/coding, or simply the correct option for MCQs). */
    correctAnswerExplanation: string;
    /** Status of the question attempt (e.g., 'correct', 'wrong', 'partially_correct', 'unattempted'). */
    status: 'correct' | 'wrong' | 'partially_correct' | 'unattempted';
    /** (Optional) For MCQs, the selected option's value or index. */
    selectedOptionValue?: string;
    /** (Optional) For MCQs, the full options presented to the user. */
    options?: string[];
    // Removed expectedAnswer here as per clarification
  }
  
  /**
   * Interface for the overall evaluation report for a test submission.
   */
  export interface EvaluationReport {
    /** Unique identifier for the test instance/session. */
    testId: string;
    /** User ID of the person who took the test. */
    userId: string;
    /** Timestamp of when the test was submitted and evaluated. */
    submissionTimestamp: Date;
    /** Total score obtained across all rounds. */
    totalScore: number;
    /** Score for the first round (e.g., MCQ). */
    round1Score: number;
    /** Score for the second round (e.g., Theory). */
    round2Score: number;
    /** Score for the third round (e.g., Coding). */
    round3Score: number;
    /** (Optional) Score for the General Aptitude round. */
    gaRoundScore?: number;
    /** An array containing the detailed results for each question. */
    questionResults: QuestionResult[];
    overallFeedback?: string;
    /** New LLM-generated overall insights about the candidate. */
    llmInsights: {
      /** Array of specific areas where the candidate can improve. */
      areaForImprovement: string[];
      /** Array of specific strengths or good aspects of the candidate's performance. */
      whatsGood: string[];
      /** A summary statement on how ready the candidate is for the role. */
      readinessForRole: string;
      /** Array of general suggestions for the candidate's development. */
      suggestions: string[];
      /** A motivational quote for the candidate who attempted the test. */
      motivationalQuote: string;
      /** A concise, encouraging summary about the candidate's test performance. */
      summaryAboutCandidate: string;

      /** Object mapping specific skills to their inferred proficiency level. */
    skillProficiency?: { [skillName: string]: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' };
    /** More detailed list of specific technical strengths. */
    detailedStrengths?: string[];
    /** More detailed list of specific technical weaknesses/misconceptions. */
    detailedWeaknesses?: string[];
    /** Array of specific conceptual misunderstandings identified. */
    technicalConceptMisconceptions?: string[];
    /** A concise statement describing the overall performance trend (e.g., "Consistent", "Improved during test"). */
    performanceTrend?: string;
    /** Array of specific actionable learning recommendations. */
    personalizedLearningRecommendations?: string[];
    /** Overall assessment of clarity, approach, or other non-direct answer qualities. */
    overallApproachAnalysis?: string;
    };
  }