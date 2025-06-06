// app/api/analyze-answer/route.ts
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.GOOGLE_API_KEY;

// Define an interface for the incoming request body (what the frontend sends)
interface AnalyzeAnswerRequest {
  questionId: string;
  questionType: 'multiple-choice' | 'coding-challenge' | 'theoretical' | 'general-aptitude';
  questionText: string;
  userAnswer: string;
  correctAnswer: any; // This could be string, string[], or a more complex object for coding
  options?: string[]; // For MCQs
  testCases?: { input: string; output: string; passed?: boolean; userOutput?: string; errorMessage?: string }[]; // For coding challenges
  // Add any other relevant question metadata (e.g., difficulty, relatedSkills)
}

// Define an interface for the AI's expected analysis output
interface AIAnalysisResponse {
  assessmentResult: 'correct' | 'partially_correct' | 'wrong';
  aiExplanation: string;
  feedbackPoints?: string[]; // Optional bullet points for structured feedback
  scoreImpact?: number; // E.g., 1 for correct, 0.5 for partial, 0 for wrong
  // Add any other AI-specific analysis fields
}

export async function POST(request: NextRequest) {
  try {
    const {
      questionId,
      questionType,
      questionText,
      userAnswer,
      correctAnswer,
      options, // Only for MCQs
      testCases, // Only for coding
    }: AnalyzeAnswerRequest = await request.json(); // Use .json() for POST body

    if (!questionId || !questionType || !questionText || userAnswer === undefined || correctAnswer === undefined) {
      return NextResponse.json({ error: 'Missing required fields for answer analysis.' }, { status: 400 });
    }

    if (!apiKey) {
      throw new Error('Google API Key is not set. Please set the GOOGLE_API_KEY environment variable.');
    }

    // --- CONSTRUCT THE AI PROMPT FOR ANSWER ANALYSIS ---
    let analysisPrompt = `
You are an expert AI assistant tasked with analyzing a user's answer to a test question.
Your goal is to provide a precise assessment ('correct', 'partially_correct', or 'wrong') and a detailed, educational explanation.
Your ONLY output will be a **complete and valid JSON object**, as defined by the schema below.
DO NOT include any prose, explanations, markdown fences (like \`\`\`json), or conversational text before or after the JSON.

**Question Details:**
Question Type: ${questionType}
Question: "${questionText}"
`;

    // Add context based on question type
    if (questionType === 'multiple-choice') {
      analysisPrompt += `
Options: ${options ? options.map((opt, i) => `(${String.fromCharCode(65 + i)}) ${opt}`).join(', ') : 'N/A'}
Correct Answer: "${correctAnswer}" (option value)
User's Chosen Answer: "${userAnswer}" (option value)
`;
    } else if (questionType === 'theoretical' || questionType === 'general-aptitude') {
      analysisPrompt += `
Correct Answer (Reference): "${correctAnswer}"
User's Submitted Answer: "${userAnswer}"
`;
    } else if (questionType === 'coding-challenge') {
        // For coding, it's crucial to provide both the user's code and test case results
        analysisPrompt += `
User's Submitted Code:
\`\`\`
${userAnswer}
\`\`\`

Test Case Results:
`;
        if (testCases && testCases.length > 0) {
            testCases.forEach((tc, index) => {
                analysisPrompt += `
  Test Case ${index + 1}:
    Input: ${tc.input}
    Expected Output: ${tc.output}
    User's Actual Output: ${tc.userOutput || 'N/A'}
    Passed: ${tc.passed ? 'Yes' : 'No'}
    Error Message: ${tc.errorMessage || 'None'}
`;
            });
        } else {
            analysisPrompt += `No automated test case results provided. Analyze purely based on code structure and typical solution patterns for this problem.`;
        }
        analysisPrompt += `

Correct/Optimal Solution (Reference - for conceptual comparison only, do not directly show code):
\`\`\`
${correctAnswer}
\`\`\`
*(Analyze the user's code against this reference conceptually, considering correctness, efficiency, and edge cases.)*
`;
    }

    analysisPrompt += `
**Analysis Instructions:**
- Determine if the 'User\'s Submitted Answer' is 'correct', 'partially_correct', or 'wrong' compared to the 'Correct Answer'/'Correct Solution'.
- For 'correct': Explain why it's correct and reinforce the key concepts.
- For 'partially_correct': Clearly state what was correct and what was missing or inaccurate. Suggest improvements.
- For 'wrong': Explain why it's incorrect and then provide the correct concept/approach.
- Ensure 'aiExplanation' is detailed and educational.
- Provide 'feedbackPoints' as concise bullet points summarizing key strengths/weaknesses.
- Assign 'scoreImpact': 1.0 for 'correct', 0.5 for 'partially_correct', 0.0 for 'wrong'.

**JSON Schema for AI Analysis Response:**
{
  "assessmentResult": "correct" | "partially_correct" | "wrong",
  "aiExplanation": string,
  "feedbackPoints": string[],
  "scoreImpact": number
}
`.trim();

    const MODEL_NAME = 'gemini-1.5-flash'; // Keep using Flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: analysisPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2, // Lower temperature for more factual, less creative analysis
          maxOutputTokens: 2048, // A reasonable limit for analysis explanations. Adjust if needed.
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Gemini API Analysis Error] Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`Gemini API error during analysis ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    let aiRawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiRawResponse) {
      console.error('[Gemini API] Empty or malformed AI analysis response:', JSON.stringify(data, null, 2));
      throw new Error('Empty or malformed AI analysis response from Gemini.');
    }

    aiRawResponse = aiRawResponse.replace(/```json\n?|\n?```/g, '').trim();

    let aiAnalysisResult: AIAnalysisResponse;
    try {
      aiAnalysisResult = JSON.parse(aiRawResponse);
    } catch (e) {
      console.error('[JSON Parse Error] Failed to parse AI analysis JSON response:', (e as Error).message, 'Raw response causing error:\n', aiRawResponse);
      throw new Error('Failed to parse AI analysis JSON response. Check server logs.');
    }

    // Return the AI's analysis
    return NextResponse.json({
      questionId,
      assessment: aiAnalysisResult,
    });

  } catch (err: any) {
    console.error('[Analyze Answer API Error]:', err.message);
    return NextResponse.json({ error: err.message || 'An unknown error occurred during answer analysis.' }, { status: 500 });
  }
}