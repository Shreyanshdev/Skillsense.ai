 // src/models/ReviewSession.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { ReviewedQuestion, AIAnalysisResult } from '@/types/index'; // Import types

// Mongoose Sub-Schema for AIAnalysisResult
const AIAnalysisResultSchema: Schema = new Schema({
    assessmentResult: { type: String, required: true, enum: ['correct', 'partially_correct', 'wrong'] },
    aiExplanation: { type: String, required: true },
    feedbackPoints: { type: [String], default: [] },
}, { _id: false });

// Mongoose Sub-Schema for ReviewedQuestion (inherits from Question, adds userAnswer and analysis)
const ReviewedQuestionSchema: Schema = new Schema({
    id: { type: String, required: true },
    type: { type: String, required: true },
    questionText: { type: String, required: true },
    options: { type: [String], default: null },
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    difficulty: { type: String, required: true },
    relatedSkills: { type: [String], required: true },
    testCases: { type: Schema.Types.Mixed, default: null },
    documentation: { type: String, default: null },
    language: { type: String, default: null },
    starterCode: { type: String, default: null },
    maxLength: { type: Number, default: null },
    userAnswer: { type: String, required: true }, // User's submitted answer
    analysis: { type: AIAnalysisResultSchema, default: null }, // AI's analysis
}, { _id: false });

// Main ReviewSession Schema
export interface IReviewSession extends Document {
    testId: string;
    userId: string; // To link to a specific user (e.g., from frontend-generated ID or simple auth)
    submissionTime: Date;
    reviewedQuestions: ReviewedQuestion[];
    flaggedQuestions: string[];
    finalFeedback?: string;
    feedbackGeneratedTime?: Date;
}

const ReviewSessionSchema: Schema = new Schema({
    testId: { type: String, required: true, index: true }, // Index for faster lookups
    userId: { type: String, required: true, index: true }, // Index for faster lookups
    submissionTime: { type: Date, default: Date.now },
    reviewedQuestions: { type: [ReviewedQuestionSchema], required: true },
    flaggedQuestions: { type: [String], default: [] },
    finalFeedback: { type: String, default: null },
    feedbackGeneratedTime: { type: Date, default: null },
}, { timestamps: true });

// Use existing model if it exists, otherwise create a new one
const ReviewSession: Model<IReviewSession> = mongoose.models.ReviewSession || mongoose.model<IReviewSession>('ReviewSession', ReviewSessionSchema);

export default ReviewSession;