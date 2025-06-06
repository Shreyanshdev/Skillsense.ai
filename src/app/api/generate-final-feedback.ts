// src/app/api/generate-final-feedback/route.ts (for Next.js App Router)
// Or src/pages/api/generate-final-feedback.ts (for Next.js Pages Router)

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbconnect';
import Test from '@/models/Test';
import ReviewSession from '@/models/ReviewSession';
import { TestData, ReviewedQuestion, ReviewSession as ReviewSessionType, ExtractedInfo } from '@/types/index';
import mongoose from 'mongoose'; // Import mongoose for ObjectId

/**
 * Calls the Gemini API to generate final feedback.
 * @param {string} prompt - The prompt for the LLM.
 * @returns {Promise<string>} - The generated feedback text.
 */
const getFinalFeedbackFromAI = async (prompt: string): Promise<string> => {
    console.log("Calling Gemini API for final feedback (truncated):", prompt.substring(0, 200) + "...");

    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return "Internal server error: AI API key missing for feedback.";
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
            console.error("Gemini API error response for feedback:", response.status, errorBody);
            throw new Error(`Gemini API request failed with status ${response.status}: ${errorBody}`);
        }

        const result = await response.json();
        const feedbackText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (feedbackText) {
            return feedbackText;
        } else {
            console.warn("Gemini API feedback response structure unexpected or content missing:", result);
            return "Could not generate comprehensive feedback at this time.";
        }
    } catch (error: any) {
        console.error("Error calling Gemini API for final feedback:", error);
        return `Failed to generate feedback: ${error.message}`;
    }
};

export async function POST(req: NextRequest) {
    await connectDB(); // Connect to MongoDB

    try {
        const { reviewSessionId, userId: clientUserId } = await req.json(); // Assuming userId is passed from client

        // Simple userId handling for beginner context:
        // In a real app, this would come from a secure authentication system.
        const userId = clientUserId; // Use provided userId
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
        }

        if (!reviewSessionId) {
            return NextResponse.json({ error: 'Missing required field: reviewSessionId.' }, { status: 400 });
        }

        // 1. Fetch the review session data from MongoDB
        // Use new mongoose.Types.ObjectId(reviewSessionId) if reviewSessionId is a string and MongoDB _id is ObjectId
        const reviewSession = await ReviewSession.findOne({ _id: new mongoose.Types.ObjectId(reviewSessionId), userId: userId });

        if (!reviewSession) {
            return NextResponse.json({ error: 'Review session not found for this user.' }, { status: 404 });
        }

        // 2. Fetch the original TestData to get ExtractedInfo (resume/evaluation form data)
        const originalTest = await Test.findOne({ id: reviewSession.testId });

        if (!originalTest) {
            return NextResponse.json({ error: 'Original test data not found for feedback generation.' }, { status: 404 });
        }

        const originalTestData: TestData = originalTest.toObject() as TestData;
        const extractedInfo = originalTestData.extractedInfo;

        // 3. Prepare data for LLM prompt
        const reviewedQuestions: ReviewedQuestion[] = reviewSession.reviewedQuestions as ReviewedQuestion[]; // Cast to types/index.ts type
        const totalQuestions = reviewedQuestions.length;
        const correctCount = reviewedQuestions.filter(q => q.analysis?.assessmentResult === 'correct').length;
        const partiallyCorrectCount = reviewedQuestions.filter(q => q.analysis?.assessmentResult === 'partially_correct').length;
        const wrongCount = reviewedQuestions.filter(q => q.analysis?.assessmentResult === 'wrong').length;

        let performanceSummary = `Overall Performance:
        - Total Questions: ${totalQuestions}
        - Correct: ${correctCount}
        - Partially Correct: ${partiallyCorrectCount}
        - Incorrect (including skipped/not attempted): ${wrongCount}
        `;

        const skillFeedback: { [key: string]: { correct: number; partiallyCorrect: number; wrong: number; feedbackPoints: Set<string> } } = {};
        const questionTypeBreakdown: { [key: string]: { correct: number; partiallyCorrect: number; wrong: number; total: number } } = {};

        reviewedQuestions.forEach(q => {
            q.relatedSkills.forEach(skill => {
                if (!skillFeedback[skill]) {
                    skillFeedback[skill] = { correct: 0, partiallyCorrect: 0, wrong: 0, feedbackPoints: new Set() };
                }
                if (q.analysis?.assessmentResult === 'correct') skillFeedback[skill].correct++;
                else if (q.analysis?.assessmentResult === 'partially_correct') skillFeedback[skill].partiallyCorrect++;
                else skillFeedback[skill].wrong++;

                if (q.analysis?.feedbackPoints) {
                    q.analysis.feedbackPoints.forEach(point => skillFeedback[skill].feedbackPoints.add(point));
                }
            });

            if (!questionTypeBreakdown[q.type]) {
                questionTypeBreakdown[q.type] = { correct: 0, partiallyCorrect: 0, wrong: 0, total: 0 };
            }
            questionTypeBreakdown[q.type].total++;
            if (q.analysis?.assessmentResult === 'correct') questionTypeBreakdown[q.type].correct++;
            else if (q.analysis?.assessmentResult === 'partially_correct') questionTypeBreakdown[q.type].partiallyCorrect++;
            else questionTypeBreakdown[q.type].wrong++;
        });

        let detailedPerformance = `\nPerformance Breakdown by Question Type:\n`;
        for (const type in questionTypeBreakdown) {
            const data = questionTypeBreakdown[type];
            detailedPerformance += `- ${type} questions: ${data.correct} Correct, ${data.partiallyCorrect} Partially Correct, ${data.wrong} Incorrect out of ${data.total}.\n`;
        }

        let skillStrengthsWeaknesses = `\nSkill-based Analysis:\n`;
        for (const skill in skillFeedback) {
            const data = skillFeedback[skill];
            const totalSkillQuestions = data.correct + data.partiallyCorrect + data.wrong;
            skillStrengthsWeaknesses += `- ${skill}: ${data.correct} Correct, ${data.partiallyCorrect} Partially Correct, ${data.wrong} Incorrect out of ${totalSkillQuestions}. `;
            if (data.feedbackPoints.size > 0) {
                skillStrengthsWeaknesses += `Consolidated Feedback: ${Array.from(data.feedbackPoints).join(', ')}.\n`;
            } else {
                skillStrengthsWeaknesses += `No specific feedback points for ${skill} questions.`;
            }
            skillStrengthsWeaknesses += '\n';
        }

        // 4. Construct comprehensive LLM prompt for final feedback
        let llmPrompt = `You are an AI career coach providing comprehensive and personalized feedback to a user who has completed a technical assessment.
        
        Here is the user's overall test performance:
        ${performanceSummary}
        ${detailedPerformance}
        ${skillStrengthsWeaknesses}

        Here is the user's extracted information from their resume/evaluation form:
        - Inferred Role: ${extractedInfo.inferredRole || 'N/A'}
        - Inferred Experience Years: ${extractedInfo.inferredExperienceYears || 'N/A'}
        - Extracted Skills: ${extractedInfo.extractedSkills.join(', ') || 'N/A'}
        - Summary: ${extractedInfo.summary || 'N/A'}

        Based on the test evaluation and the user's profile information, provide a detailed and encouraging feedback report.
        The feedback should include:
        1.  **Overall Assessment**: A general statement about their performance.
        2.  **Strengths**: Highlight areas where they performed well, relating to their skills and inferred role.
        3.  **Areas for Improvement**: Pinpoint specific skills or question types where they struggled, referencing the consolidated feedback points.
        4.  **Actionable Recommendations**: Suggest concrete steps for improvement (e.g., specific topics to study, practice problems, resources). Tailor these to their inferred role and experience.
        5.  **Next Steps**: Encourage them on their learning journey and suggest how this assessment helps their career development.

        Format the feedback clearly with headings and bullet points where appropriate. Use a professional and supportive tone.
        `;

        const finalFeedback = await getFinalFeedbackFromAI(llmPrompt);

        // 5. Update the review session document in MongoDB with the generated feedback
        await ReviewSession.updateOne(
            { _id: reviewSession._id },
            { $set: { finalFeedback: finalFeedback, feedbackGeneratedTime: new Date() } }
        );

        console.log("Final feedback generated and saved for review session:", reviewSession._id);

        return NextResponse.json({ finalFeedback: finalFeedback }, { status: 200 });

    } catch (error: any) {
        console.error('Error in generate-final-feedback API:', error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}