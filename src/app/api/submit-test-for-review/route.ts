// src/app/api/submit-test-for-review/route.ts (for Next.js App Router)
// Or src/pages/api/submit-test-for-review.ts (for Next.js Pages Router)

import { NextRequest, NextResponse } from 'next/server';
import Test from '@/models/Test'; // Import your Test model
import ReviewSession from '@/models/ReviewSession'; // Import your ReviewSession model
import { TestData, ReviewedQuestion, AIAnalysisResult, Question, QuestionType } from '@/types/index';
import { v4 as uuidv4 } from 'uuid'; // For generating unique user IDs if needed
import { connectDB } from '@/lib/dbconnect';

/**
 * Calls the Gemini API to get AI analysis for a question.
 * @param {string} prompt - The prompt for the LLM.
 * @returns {Promise<AIAnalysisResult>}
 */
const getAIAnalysis = async (prompt: string): Promise<AIAnalysisResult> => {
    console.log("Calling Gemini API with prompt (truncated):", prompt.substring(0, 200) + "...");

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "assessmentResult": { "type": "STRING", "enum": ["correct", "partially_correct", "wrong"] },
                    "aiExplanation": { "type": "STRING" },
                    "feedbackPoints": { "type": "ARRAY", "items": { "type": "STRING" } }
                },
                required: ["assessmentResult", "aiExplanation"]
            }
        }
    };

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return {
            assessmentResult: 'wrong',
            aiExplanation: "Internal server error: AI API key missing.",
            feedbackPoints: ["Missing API key."]
        };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Gemini API error response:", response.status, errorBody);
            throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
        }

        const result = await response.json();
        const jsonString = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (jsonString) {
            try {
                const parsedJson: AIAnalysisResult = JSON.parse(jsonString);
                if (!['correct', 'partially_correct', 'wrong'].includes(parsedJson.assessmentResult) || !parsedJson.aiExplanation) {
                    console.warn("Gemini API returned incomplete or invalid analysis structure:", parsedJson);
                    return {
                        assessmentResult: 'wrong',
                        aiExplanation: "Could not generate full analysis due to unexpected AI response structure.",
                        feedbackPoints: ["Internal AI error: Malformed response."]
                    };
                }
                return parsedJson;
            } catch (jsonParseError) {
                console.error("Failed to parse Gemini API JSON response:", jsonParseError, "Raw text:", jsonString);
                return {
                    assessmentResult: 'wrong',
                    aiExplanation: "Internal error: Failed to parse AI analysis.",
                    feedbackPoints: ["Internal AI error: JSON parsing failed."]
                };
            }
        } else {
            console.warn("Gemini API response structure unexpected or content missing:", result);
            return {
                assessmentResult: 'wrong',
                aiExplanation: "Could not generate analysis. AI response was empty or malformed.",
                feedbackPoints: ["No AI analysis available."]
            };
        }
    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        return {
            assessmentResult: 'wrong',
            aiExplanation: `Failed to get AI analysis: ${error.message}`,
            feedbackPoints: ["Network error or AI service issue."]
        };
    }
};

export async function POST(req: NextRequest) {
    await connectDB(); // Connect to MongoDB

    try {
        const { testId, userAnswers, flaggedQuestions, userId: clientUserId } = await req.json();

        // Simple userId handling for beginner context:
        // Use provided userId or generate a new one (e.g., for anonymous sessions)
        // In a real app, this would come from a secure authentication system.
        const userId = clientUserId || uuidv4();
        if (!clientUserId) {
            console.warn(`No userId provided from client. Generated new anonymous ID: ${userId}`);
        }

        if (!testId || !userAnswers || !Array.isArray(flaggedQuestions)) {
            return NextResponse.json(
                { error: 'Missing required fields: testId, userAnswers, or flaggedQuestions.' },
                { status: 400 }
            );
        }

        // 1. Fetch the original TestData from MongoDB
        const originalTest = await Test.findOne({ id: testId });

        if (!originalTest) {
            return NextResponse.json({ error: 'Test not found.' }, { status: 404 });
        }

        const originalTestData: TestData = originalTest.toObject() as TestData; // Convert Mongoose document to plain object

        const reviewedQuestions: ReviewedQuestion[] = [];

        // 2. Iterate through all questions and evaluate using AI
        for (const round of originalTestData.rounds) {
            for (const question of round.questions) {
                const userAnswer = userAnswers[question.id] !== undefined && userAnswers[question.id] !== null
                    ? String(userAnswers[question.id])
                    : ''; // Default to empty string for not attempted/left blank

                let llmPrompt = `You are an expert technical interviewer and AI assistant providing detailed feedback on a test question.
                Analyze the user's answer against the correct answer.

                Question Type: ${question.type}
                Question Text: ${question.questionText}
                Correct Answer: ${JSON.stringify(question.correctAnswer)}
                User's Answer: ${userAnswer === '' ? "N/A (Not Attempted/Left Blank)" : userAnswer === 'SKIPPED' ? "SKIPPED" : JSON.stringify(userAnswer)}
                
                Provide your analysis in JSON format, including:
                - "assessmentResult": "correct", "partially_correct", or "wrong".
                - "aiExplanation": A detailed explanation.
                    - If "correct": Explain why the user's answer is correct, and elaborate on the correct concept.
                    - If "partially_correct": Explain the correct answer, highlight what was missing or incorrect in the user's answer, and suggest improvements.
                    - If "wrong": Explain the correct answer in detail and clearly state why the user's answer is incorrect.
                    - If "SKIPPED" or "N/A (Not Attempted/Left Blank)": State that the question was skipped/not attempted and provide the correct answer with an explanation.
                - "feedbackPoints": An optional array of specific, actionable feedback points (e.g., "Review Big O notation", "Practice recursion").

                Your response MUST be a JSON object matching this schema:
                {
                    "assessmentResult": "correct" | "partially_correct" | "wrong",
                    "aiExplanation": "Detailed explanation here.",
                    "feedbackPoints": ["Point 1", "Point 2"] // Optional array of strings
                }
                `;

                // Add context specific to question type
                if (question.type === 'multiple-choice' && question.options) {
                    llmPrompt += `\nOptions: ${JSON.stringify(question.options)}`;
                }
                if (question.type === 'coding-challenge') {
                    if (question.starterCode) llmPrompt += `\nStarter Code: ${question.starterCode}`;
                    if (question.documentation) llmPrompt += `\nDocumentation: ${question.documentation}`;
                    if (question.language) llmPrompt += `\nLanguage: ${question.language}`;
                }

                const aiAnalysis = await getAIAnalysis(llmPrompt);

                reviewedQuestions.push({
                    ...question,
                    userAnswer: userAnswer,
                    analysis: aiAnalysis,
                });
            }
        }

        // 3. Store the review session in MongoDB
        const newReviewSession = await ReviewSession.create({
            testId: testId,
            userId: userId, // Use the determined userId
            submissionTime: new Date(),
            reviewedQuestions: reviewedQuestions,
            flaggedQuestions: flaggedQuestions,
        });

        console.log("Review session saved with ID:", newReviewSession._id);

        return NextResponse.json({ reviewSessionId: newReviewSession._id }, { status: 200 });

    } catch (error: any) {
        console.error('Error in submit-test-for-review API:', error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}