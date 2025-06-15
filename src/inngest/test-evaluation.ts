// src/inngest/functions/test-evaluation.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { inngest } from '@/inngest/client';
import { TestEvaluatorAgent } from '@/inngest/functions'; // Import the new agent
import { QuestionResult, EvaluationReport } from '@/types/evaluation';
import { db } from '@/lib/db';
import { HistoryTable } from '@/lib/schema';


// Initialize Gemini for use within the Inngest function (for basic explanations)
// This is needed because `TestEvaluatorAgent` is used for detailed evaluation,
// but the basic explanation logic still needs a direct model.
const directGenAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const directModel = directGenAI.getGenerativeModel({ model: "gemini-2.0-flash" });


// Helper function to extract JSON from markdown code block
function extractJsonFromMarkdown(markdownString: string): string {
  const jsonBlockRegex = /```json\n([\s\S]*?)\n```/;
  const match = markdownString.match(jsonBlockRegex);
  if (match && match[1]) {
    console.log(`[${new Date().toISOString()}] Successfully extracted JSON from markdown block.`);
    return match[1].trim();
  }
  console.warn(
    `[${new Date().toISOString()}] No '\`\`\`json' block found. Attempting to parse raw response as JSON. Response may be malformed: ${markdownString.substring(
      0,
      Math.min(markdownString.length, 100)
    )}...`
  );
  return markdownString.trim();
}

// Simple token estimation (approximate)
const estimateTokens = (text: string) => Math.ceil(text.length / 4);

export const evaluateTestFunction = inngest.createFunction(
  { id: 'evaluate-test-submission' },
  { event: 'test.evaluation.requested' },
  async ({ event, step }) => { // Keep `step` here, it's still needed for database operations
    const functionStartTime = Date.now();
    console.log(`[${new Date().toISOString()}] Inngest Function 'evaluate-test-submission' started for event ID: ${event.id}`);

    const { testId, userId, userEmail, questionsForEvaluation ,reviewSessionId } = event.data;

    const questionResults: QuestionResult[] = [];
    let totalScore = 0;
    const roundScores: { [key: string]: number } = {
      'multiple-choice': 0,
      'general-aptitude': 0,
      'theoretical': 0,
      'coding-challenge': 0,
    };

    let totalLlmInputTokens = 0;
    let totalLlmOutputTokens = 0;

    // --- Phase 1: Evaluate Individual Questions ---
    for (const qData of questionsForEvaluation) {
      const { questionId, questionText, questionType, userAnswer, options, correctAnswer } = qData;
      let marksAwarded: 0 | 0.5 | 1 = 0;
      let feedback = '';
      let explanation = '';
      let isCorrect = false;
      let status: QuestionResult['status'] = 'unattempted';

      console.log(`[${new Date().toISOString()}] Evaluating question ID: ${questionId}, Type: ${questionType}`);

      const formattedCorrectAnswer = Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer;

      if (!userAnswer || userAnswer.trim() === '' || userAnswer === 'SKIPPED') {
          marksAwarded = 0;
          status = 'unattempted';
          feedback = 'This question was not attempted.';

          if (questionType === 'multiple-choice' || questionType === 'general-aptitude') {
            explanation = `The correct answer was: ${formattedCorrectAnswer}.`;
          } else {
            const basicExplanationPrompt = `Provide a concise, ideal answer for the following question: "${questionText}"`;
            console.log(`[${new Date().toISOString()}] Calling LLM for unattempted question explanation: ${questionId}`);
            totalLlmInputTokens += estimateTokens(basicExplanationPrompt);
            try {
                // This `directModel` call is fine as it's not wrapped in a `step.run`
                const result = await directModel.generateContent(basicExplanationPrompt);
                explanation = await result.response.text();
                totalLlmOutputTokens += estimateTokens(explanation);
                console.log(`[${new Date().toISOString()}] LLM Explanation generated for unattempted question ${questionId}.`);
            } catch (llmError: any) {
                console.error(`[${new Date().toISOString()}] Error generating basic explanation for unattempted theoretical question ${questionId}:`, llmError);
                explanation = 'A detailed explanation could not be generated at this moment due to an LLM error.';
            }
          }
      } else if (questionType === 'multiple-choice' || questionType === 'general-aptitude') {
        if (userAnswer === formattedCorrectAnswer) {
          marksAwarded = 1;
          isCorrect = true;
          status = 'correct';
          feedback = 'Your answer is correct!';
          explanation = `The correct answer is: ${formattedCorrectAnswer}.`;
        } else {
          marksAwarded = 0;
          isCorrect = false;
          status = 'wrong';
          feedback = `Your answer is incorrect.`;
          explanation = `The correct answer was: ${formattedCorrectAnswer}.`;
        }
        console.log(`[${new Date().toISOString()}] MCQ/GA evaluation complete for ${questionId}. Status: ${status}, Score: ${marksAwarded}`);
      } else if (questionType === 'theoretical' || questionType === 'coding-challenge') {
        const prompt = `
        You are an expert examiner in the field of ${questionType === 'coding-challenge' ? 'software engineering and coding best practices' : 'general knowledge and theoretical concepts'}.

        Question: ${questionText}
        User's Answer: ${userAnswer}

        Your task is to:
        1.  Fully understand the question and determine the ideal correct answer based on your knowledge.
        2.  Evaluate the user's answer against this ideal correct answer.
        3.  Assign a score based on the following criteria:
            - 0 marks: User's answer is completely wrong, irrelevant, or unattempted.
            - 0.5 marks: User's answer is partially correct, containing some valid points but missing crucial details, containing minor inaccuracies, or being incomplete.
            - 1 mark: User's answer is fully correct, comprehensive, and accurate.
        4.  Provide concise and constructive 'Feedback' to the user regarding their answer and the assigned score.
        5.  Provide a 'Correct Answer Explanation' that fully and clearly explains the ideal correct answer to the original question. This explanation should be detailed enough to stand alone as the definitive correct solution.

        Ensure your output is a valid JSON object wrapped in a markdown code block (e.g., \`\`\`json{...}\`\`\`).
        Output format (JSON):
        {
            "score": <score_number_0_0.5_1>,
            "feedback": "<concise feedback on user's answer>",
            "correctAnswerExplanation": "<comprehensive explanation of the correct answer>"
        }
        `;

        console.log(`[${new Date().toISOString()}] Calling LLM for detailed evaluation of question ${questionId}, Type: ${questionType}`);
        totalLlmInputTokens += estimateTokens(prompt);

        try {
          // *** THE KEY CHANGE IS HERE: DO NOT WRAP `TestEvaluatorAgent.run` IN `step.run` ***
          // `TestEvaluatorAgent.run` already handles the Inngest step internally.
          const agentResult = await TestEvaluatorAgent.run(prompt);

          const responseText = (agentResult as any).output?.[0]?.content || agentResult; // Adjust based on actual agent.run output structure

          totalLlmOutputTokens += estimateTokens(responseText);
          console.log(`[${new Date().toISOString()}] Raw LLM response for ${questionId} (first 200 chars): ${responseText.substring(0, Math.min(responseText.length, 200))}...`);

          const jsonString = extractJsonFromMarkdown(responseText);
          const geminiOutput = JSON.parse(jsonString);

          marksAwarded = geminiOutput.score as (0 | 0.5 | 1);
          feedback = geminiOutput.feedback || 'No feedback provided by AI.';
          explanation = geminiOutput.correctAnswerExplanation || 'No detailed explanation provided by AI.';
          isCorrect = marksAwarded === 1;

          if (marksAwarded === 1) status = 'correct';
          else if (marksAwarded === 0.5) status = 'partially_correct';
          else status = 'wrong';

          console.log(`[${new Date().toISOString()}] LLM Evaluation complete for ${questionId}. Status: ${status}, Score: ${marksAwarded}`);

        } catch (llmError: any) {
          console.error(`[${new Date().toISOString()}] Error evaluating theoretical/coding question ${questionId} with Gemini:`, llmError);
          marksAwarded = 0;
          feedback = 'Evaluation failed for this question due to an AI error. Please try again later.';
          explanation = 'A detailed explanation could not be generated at this moment.';
          
        }
      }

      roundScores[questionType] = (roundScores[questionType] || 0) + marksAwarded;
      totalScore += marksAwarded;

      questionResults.push({
        questionId,
        questionText,
        questionType,
        userAnswer,
        correctAnswer: (questionType === 'multiple-choice' || questionType === 'general-aptitude') ? correctAnswer : undefined,
        options: options,
        isCorrect,
        marksAwarded,
        feedback,
        correctAnswerExplanation: explanation,
        status,
      });
    }

    // --- Phase 2: Overall Candidate Summary and Insights using Gemini ---
    let llmInsights: EvaluationReport['llmInsights'] = {
      areaForImprovement: [],
      whatsGood: [],
      readinessForRole: "Evaluation pending.",
      suggestions: [],
      motivationalQuote: "The only way to do great work is to love what you do.",
      summaryAboutCandidate: "Overall test summary pending.",
      skillProficiency: {},
      detailedStrengths: [],
      detailedWeaknesses: [],
      technicalConceptMisconceptions: [],
      performanceTrend: "No discernible trend.",
      personalizedLearningRecommendations: [],
      overallApproachAnalysis: "No specific approach analysis available."
    };

    const detailedQuestionContext = questionResults.map(qr => `
        - Question ID: ${qr.questionId} (Type: ${qr.questionType})
          Question Text: ${qr.questionText ? qr.questionText.substring(0, Math.min(qr.questionText.length, 150)) : 'N/A'}...
          User Answer Preview: ${qr.userAnswer ? qr.userAnswer.substring(0, Math.min(qr.userAnswer.length, 150)) : 'N/A'}...
          Marks Awarded: ${qr.marksAwarded}
          Status: ${qr.status}
          Feedback: ${qr.feedback ? qr.feedback.substring(0, Math.min(qr.feedback.length, 150)) : 'N/A'}...
          Correct Explanation: ${qr.correctAnswerExplanation ? qr.correctAnswerExplanation.substring(0, Math.min(qr.correctAnswerExplanation.length, 150)) : 'N/A'}...
        `).join('\n');

    const summaryPrompt = `
    You are an AI expert specializing in technical candidate assessment. Your role is to provide a comprehensive and nuanced analysis of a candidate's performance in a technical test.

    --- Test Context ---
    Test ID: ${testId}
    User ID: ${userId}
    Total Score: ${totalScore} out of ${questionsForEvaluation.length}

    --- Individual Question Results ---
    ${detailedQuestionContext}
    --- End of Individual Question Results ---

    Based on the above detailed performance data, provide a structured assessment in a JSON format. Be objective, insightful, and constructive.
    For arrays, provide specific examples if applicable. For skillProficiency, infer based on the questions.

    Ensure your output is a valid JSON object wrapped in a markdown code block (e.g., \`\`\`json{...}\`\`\`).
    Output Format (JSON):
    {
      "summaryAboutCandidate": "A brief, encouraging, and balanced overall summary (2-4 sentences) about the candidate's test performance. Avoid being overly harsh.",
      "readinessForRole": "A concise assessment (1-2 sentences) of how ready the candidate appears for a general software development/technical role based on their performance.",
      "whatsGood": [
        "Specific strength 1 based on performance (e.g., strong in algorithms)",
        "Specific strength 2 (e.g., clear explanations for theoretical questions)",
        "Specific strength 3 (e.g., good problem-solving approach)"
      ],
      "areaForImprovement": [
        "Specific area for improvement 1 (e.g., needs to practice array manipulation)",
        "Specific area for improvement 2 (e.g., fundamental understanding of OOPS concepts)",
        "Specific area for improvement 3 (e.g., optimizing time complexity)"
      ],
      "skillProficiency": {
        "Data Structures": "Intermediate | Beginner | Advanced | Expert",
        "Algorithms": "Intermediate | Beginner | Advanced | Expert",
        "Problem Solving": "Intermediate | Beginner | Advanced | Expert",
        "Code Syntax": "Intermediate | Beginner | Advanced | Expert",
        "Theoretical Knowledge": "Intermediate | Beginner | Advanced | Expert",
        "Logical Reasoning": "Intermediate | Beginner | Advanced | Expert"
      },
      "detailedStrengths": [
        "Detailed strength 1 based on actual answers/performance.",
        "Detailed strength 2."
      ],
      "detailedWeaknesses": [
        "Detailed weakness 1 based on actual answers/performance.",
        "Detailed weakness 2."
      ],
      "technicalConceptMisconceptions": [
        "Specific misconception 1 (e.g., 'Confusion between == and === in JavaScript')",
        "Specific misconception 2."
      ],
      "performanceTrend": "Overall performance trend across different question types or over time.",
      "suggestions": [
        "General suggestion 1 (e.g., 'Focus on improving understanding of core computer science fundamentals')",
        "General suggestion 2."
      ],
      "personalizedLearningRecommendations": [
        "Specific learning resource/topic 1 (e.g., 'For Data Structures & Algorithms: Study trees and graphs')",
        "Specific learning resource/topic 2."
      ],
      "overallApproachAnalysis": "Brief analysis of the candidate's general approach (e.g., rushed, systematic, over-thought)."
    }
    `;

    console.log(`[${new Date().toISOString()}] Calling LLM for overall summary and insights.`);
    totalLlmInputTokens += estimateTokens(summaryPrompt);

    try {
      // *** THE KEY CHANGE IS HERE: DO NOT WRAP `TestEvaluatorAgent.run` IN `step.run` ***
      const agentSummaryResult = await TestEvaluatorAgent.run(summaryPrompt);

      const summaryResponseText = (agentSummaryResult as any).output?.[0]?.content || agentSummaryResult;

      totalLlmOutputTokens += estimateTokens(summaryResponseText);
      console.log(`[${new Date().toISOString()}] Raw LLM summary response (first 200 chars): ${summaryResponseText.substring(0, Math.min(summaryResponseText.length, 200))}...`);

      const summaryJsonString = extractJsonFromMarkdown(summaryResponseText);
      const parsedInsights = JSON.parse(summaryJsonString);

      llmInsights = { ...llmInsights, ...parsedInsights };

      console.log(`[${new Date().toISOString()}] LLM Overall Summary and Insights generated successfully.`);

    } catch (llmError: any) {
      console.error(`[${new Date().toISOString()}] Error generating overall summary and insights with Gemini:`, llmError);
      llmInsights.summaryAboutCandidate = "An overall summary could not be generated at this time due to an AI error.";
      llmInsights.readinessForRole = "N/A";
      llmInsights.whatsGood = [];
      llmInsights.areaForImprovement = [];
      llmInsights.skillProficiency = {};
      llmInsights.detailedStrengths = [];
      llmInsights.detailedWeaknesses = [];
      llmInsights.technicalConceptMisconceptions = [];
      llmInsights.performanceTrend = "Could not be determined.";
      llmInsights.suggestions = [];
      llmInsights.personalizedLearningRecommendations = [];
      llmInsights.overallApproachAnalysis = "Could not be determined.";
    }

    const finalEvaluationReport: EvaluationReport = {
      testId,
      userId,
      submissionTimestamp: new Date(),
      totalScore,
      round1Score: roundScores['multiple-choice'] || 0,
      round2Score: roundScores['theoretical'] || 0,
      round3Score: roundScores['coding-challenge'] || 0,
      gaRoundScore: roundScores['general-aptitude'] || 0,
      questionResults,
      llmInsights,
      overallFeedback: llmInsights.summaryAboutCandidate,
    };

    console.log(`[${new Date().toISOString()}] Final Evaluation Report prepared. Review Session ID: ${reviewSessionId}`);
    console.log(`[${new Date().toISOString()}] Estimated Total LLM Input Tokens: ${totalLlmInputTokens}`);
    console.log(`[${new Date().toISOString()}] Estimated Total LLM Output Tokens: ${totalLlmOutputTokens}`);
    console.log(`[${new Date().toISOString()}] Estimated Total LLM Cost (approximate, consult API docs for exact pricing).`);

    // Store the final report in the database
    await step.run("SaveFinalEvaluationReport", async () => {
        // @ts-ignore - Drizzle insert might not perfectly match
        const result = await db.insert(HistoryTable).values({
            recordId: reviewSessionId, // Using reviewSessionId as recordId for this entry
            content: JSON.stringify(finalEvaluationReport), // Store the entire report as JSON string
            userEmail: userEmail,
            createdAt: new Date().toISOString(),
            aiAgentType: '/final-report', // A new type for this
            metadeta: `testId: ${testId}, userId: ${userId}`, // Optional metadata
        });
        console.log(`[${new Date().toISOString()}] Final Evaluation Report saved to DB. Result:`, result);
        return result;
    });

    const functionEndTime = Date.now();
    console.log(`[${new Date().toISOString()}] Inngest Function 'evaluate-test-submission' completed in ${functionEndTime - functionStartTime}ms.`);

    return {
      message: 'Test evaluation complete!',
      reviewSessionId,
      totalScore,
      finalEvaluationReport,
    };
  },
);