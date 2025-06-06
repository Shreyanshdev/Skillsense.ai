// app/_lib/geminiAnalysis.ts (Create this new file and folder)
import { TestQuestion, AIAnalysisResult } from '../../types/index'; // Adjust path based on the actual file structure
; // Adjust path

const apiKey = process.env.GOOGLE_API_KEY;

interface AnalysisPayload {
  questionId: string;
  questionType: TestQuestion['type'];
  questionText: string;
  userAnswer: string;
  correctAnswer: any;
  options?: string[];
  testCases?: { input: string; output: string; passed?: boolean; userOutput?: string; errorMessage?: string }[];
}

export async function runGeminiAnalysis(payload: AnalysisPayload): Promise<AIAnalysisResult> {
  const { questionId, questionType, questionText, userAnswer, correctAnswer, options, testCases } = payload;

  if (!apiKey) {
    throw new Error('Google API Key is not set.');
  }

  let analysisPrompt = `
You are an expert AI assistant tasked with analyzing a user's answer to a test question.
Your goal is to provide a precise assessment ('correct', 'partially_correct', or 'wrong') and a detailed, educational explanation.
Your ONLY output will be a **complete and valid JSON object**, as defined by the schema below.
DO NOT include any prose, explanations, markdown fences (like \`\`\`json), or conversational text before or after the JSON.

**Question Details:**
Question Type: ${questionType}
Question: "${questionText}"
`;

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
    analysisPrompt += `
User's Submitted Code:
\`\`\`
${userAnswer}
\`\`\`

Test Case Results (if provided, crucial for correctness):
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

  const MODEL_NAME = 'gemini-1.5-flash';
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
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Gemini API Analysis Error for Q ${questionId}] Status: ${response.status}, Body: ${errorText}`);
    throw new Error(`Gemini API error during analysis for question ${questionId}: ${errorText}`);
  }

  const data = await response.json();
  let aiRawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!aiRawResponse) {
    console.error(`[Gemini API] Empty or malformed AI analysis response for Q ${questionId}:`, JSON.stringify(data, null, 2));
    throw new Error(`Empty or malformed AI analysis response for question ${questionId}.`);
  }

  aiRawResponse = aiRawResponse.replace(/```json\n?|\n?```/g, '').trim();

  try {
    return JSON.parse(aiRawResponse);
  } catch (e) {
    console.error(`[JSON Parse Error] Failed to parse AI analysis JSON for Q ${questionId}:`, (e as Error).message, 'Raw response causing error:\n', aiRawResponse);
    throw new Error(`Failed to parse AI analysis JSON for question ${questionId}.`);
  }
}