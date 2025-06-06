// src/models/Test.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import { QuestionType, Question, Round, ExtractedInfo } from '@/types/index'; // Import types

// Mongoose Sub-Schemas for nested objects
const QuestionSchema: Schema = new Schema({
    id: { type: String, required: true },
    type: { type: String, required: true, enum: ['multiple-choice', 'coding-challenge', 'theoretical', 'general-aptitude'] },
    questionText: { type: String, required: true },
    options: { type: [String], default: null }, // Array of strings, can be null
    correctAnswer: { type: Schema.Types.Mixed, required: true }, // Mixed type for various answer formats
    difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
    relatedSkills: { type: [String], required: true },
    testCases: { type: Schema.Types.Mixed, default: null }, // Can be null or array of objects
    documentation: { type: String, default: null },
    language: { type: String, default: null },
    starterCode: { type: String, default: null },
    maxLength: { type: Number, default: null },
}, { _id: false }); // Don't generate _id for subdocuments if not needed

const RoundSchema: Schema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ['multiple-choice', 'coding-challenge', 'theoretical', 'general-aptitude'] },
    questions: { type: [QuestionSchema], required: true },
}, { _id: false });

const ExtractedInfoSchema: Schema = new Schema({
    inferredRole: { type: String, default: null },
    inferredExperienceYears: { type: Number, default: null },
    extractedSkills: { type: [String], required: true },
    summary: { type: String, required: true },
}, { _id: false });

// Main TestData Schema
export interface ITest extends Document {
    id: string;
    title: string;
    rounds: Round[];
    totalDurationMinutes: number;
    extractedInfo: ExtractedInfo;
}

const TestSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true }, // Make ID unique
    title: { type: String, required: true },
    rounds: { type: [RoundSchema], required: true },
    totalDurationMinutes: { type: Number, required: true },
    extractedInfo: { type: ExtractedInfoSchema, required: true },
}, { timestamps: true }); // Add timestamps for creation/update dates

// Use existing model if it exists, otherwise create a new one
const Test: Model<ITest> = mongoose.models.Test || mongoose.model<ITest>('Test', TestSchema);

export default Test;