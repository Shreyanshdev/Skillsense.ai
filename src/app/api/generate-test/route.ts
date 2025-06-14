// app/api/generate-test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto'; // <-- ADD THIS IMPORT

const apiKey = process.env.GOOGLE_API_KEY;

// Define types for better readability and type safety
type QuestionType = 'multiple-choice' | 'coding-challenge' | 'theoretical' | 'general-aptitude';

type Question = {
  id: string;
  type: QuestionType;
  questionText: string;
  options: string[] | null;
  correctAnswer: string | number | string[] | null; // For MCQs, this can be a string or an array of strings; for coding challenges, it can be a number or null
  difficulty: 'easy' | 'medium' | 'hard';
  relatedSkills: string[];
  testCases: { input: string; output: string }[] | null;
  documentation: string | null;
};

type Round = {
  id: string;
  name: string;
  type: QuestionType;
  questions: Question[];
};

/**
 * Calculates the distribution of difficulties (easy, medium, hard) for a given total number of questions.
 * Attempts to provide a reasonable mix, especially for smaller totals.
 * @param total The total number of questions.
 * @returns An object containing the counts for easy, medium, and hard questions.
 */
function getMixedDifficultyDistribution(total: number): { easy: number; medium: number; hard: number } {
  let easy = 0;
  let medium = 0;
  let hard = 0;

  if (total <= 0) {
    return { easy: 0, medium: 0, hard: 0 };
  }

  if (total === 1) {
    medium = 1;
  } else if (total === 2) {
    medium = 1;
    hard = 1;
  } else if (total === 3) {
    medium = 2;
    hard = 1;
  } else if (total === 4) {
    easy = 1;
    medium = 1;
    hard = 2;
  } else if (total === 5) {
    easy = 1;
    medium = 2;
    hard = 2;
  } else {
    easy = Math.floor(total * 0.2);
    medium = Math.floor(total * 0.4);
    hard = total - easy - medium;

    if (easy === 0 && total >= 3) easy = 1;
    if (medium === 0 && total >= 2) medium = 1;
    if (hard === 0 && total >= 1) hard = 1;

    hard = total - easy - medium; // Recalculate hard after potential adjustments

    if (hard < 0) {
      medium += hard; // Reduce medium to compensate negative hard
      if (medium < 0) {
        easy += medium; // Reduce easy if medium becomes negative
        medium = 0;
      }
      hard = 0; // Set hard to 0 if it was negative
    }

    const currentSum = easy + medium + hard;
    if (currentSum !== total) {
      hard += (total - currentSum); // Adjust hard to meet total sum
    }
  }

  return { easy, medium, hard: Math.max(0, hard) }; // Ensure hard is not negative
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Parse form data with appropriate defaults and type assertions
    const isResumeOnlyAssessment = formData.get('isResumeOnlyAssessment') === 'true';
    const selectedExperience = String(formData.get('selectedExperience') || '');
    const selectedRole = String(formData.get('selectedRole') || 'Not Specified');
    const userPrompt = String(formData.get('userPrompt') || 'No custom goals provided.');

    const skillsJson = formData.get('selectedSkills') as string | null;
    const selectedSkills: Array<{ name: string; level: string }> = skillsJson ? JSON.parse(skillsJson) : [];

    const testType = (formData.get('testType') as 'general' | 'specialized') || 'general';
    const isGARoundSelected = formData.get('isGARoundSelected') === 'true';
    const codingDifficulty = String(formData.get('codingDifficulty') || 'medium');

    const generalTestCountsStr = formData.get('generalTestCounts') as string;
    const specializedRoundCountsStr = formData.get('specializedRoundCounts') as string;

    const generalTestCounts = generalTestCountsStr ? JSON.parse(generalTestCountsStr) : { mcq: 0, theory: 0, coding: 0 };
    const specializedRoundCounts = specializedRoundCountsStr ? JSON.parse(specializedRoundCountsStr) : { mcq: 0, theory: 0, coding: 0 };

    const mcqCount = testType === 'general' ? generalTestCounts.mcq : specializedRoundCounts.mcq;
    const theoryCount = testType === 'general' ? generalTestCounts.theory : specializedRoundCounts.theory;
    const codingCount = testType === 'general' ? generalTestCounts.coding : specializedRoundCounts.coding;
    const gaCount = isGARoundSelected ? 10 : 0;

    let skillsList = selectedSkills.map(s => `${s.name} (${s.level})`).join(', ');
    if (!skillsList && selectedRole !== 'Not Specified') {
      skillsList = `Role-based inference: ${selectedRole}`;
    } else if (!skillsList) {
      skillsList = 'None provided';
    }

    let codingDifficultyDetails = codingDifficulty;
    if (codingDifficulty === 'mixed' && codingCount > 0) {
      const d = getMixedDifficultyDistribution(codingCount);
      codingDifficultyDetails = `Mixed (Distribution: ${d.easy} Easy, ${d.medium} Medium, ${d.hard} Hard)`;
    }

    // --- CONSOLIDATED SYSTEM PROMPT ---
    const systemPrompt = `
You are a highly intelligent and accurate technical assessment test generator.
Your task is to create a structured JSON response containing inferred candidate information and a tailored set of test questions.
Adhere strictly to the provided JSON schema.
**OUTPUT ONLY THE JSON OBJECT AND NOTHING ELSE. NO PROSE, NO EXPLANATIONS, NO MARKDOWN FENCES, NO CONVERSATIONAL TEXT.**

**Instructions for Test Generation:**
- **Tailoring:** Generate questions highly relevant to the candidate's 'selectedRole', 'selectedSkills', and 'userPrompt'.
- **Question Types & Counts:**
  - Multiple Choice Questions (MCQ): Generate exactly ${mcqCount} questions. Base them on core concepts related to the role/skills.
  - Theoretical Questions: Generate exactly ${theoryCount} questions. These should require short, concise answers demonstrating understanding.
  - Coding Challenges: Generate exactly ${codingCount} questions. These should involve writing code.
    - Coding Difficulty: ${codingDifficultyDetails}. Ensure the difficulty matches the specified level.
    - Coding Content: Prioritize questions commonly asked by product-based companies or those considered fundamental/important. Include a mix of Data Structures & Algorithms (DSA) and practical application problems relevant to the role/skills.
    - For 'coding-challenge' questions, generate 2-3 diverse test cases (input/output pairs) to validate the solution. These should cover typical, edge, and potentially large inputs.
    ${isGARoundSelected ? `
      - General Aptitude (GA) Questions: Include exactly 10 questions.
        - Type: "general-aptitude" (multiple-choice questions).
        - Difficulty: medium or hard mixup (Gate-level question).
        - Content: cover logical reasoning, quantitative aptitude, verbal ability.
        - Options: For each GA question, provide exactly 4 distinct string options in the "options" field.
        - Correct Answer: For each GA question, supply a single correct answer string in the "correctAnswer" field.
      ` : ''}
- **extractedInfo:** Infer a suitable 'inferredRole', 'inferredExperienceYears', and 'extractedSkills' (a comprehensive list from all inputs) for the candidate. Provide a concise 'summary'.
- **totalDurationMinutes:** Calculate the total estimated test duration based on:
  - MCQ: 1 minute per question
  - Theoretical: 2 minutes per question
  - Coding: Easy (20 min), Medium (30 min), Hard (45 min) per question. For 'mixed', use the weighted average based on the distribution.
  - General Aptitude: 1 minute per question.
- **Output Format:** Strictly adhere to the JSON schema. Ensure 'options' and 'correctAnswer' are null for non-multiple-choice questions.

**Question Generation Guidelines (Detailed breakdown for quality):**

1.  **Coding Challenges (if requested):**
    * For skills-based coding questions, ensure they are practical and relate directly to the provided 'Selected Skills'.
    * **70% of coding questions should be problem-solving focused, testing Data Structures and Algorithms (DSA) concepts.** Prioritize common DSA topics (e.g., arrays, linked lists, trees, graphs, dynamic programming, sorting, searching).
    * **Design coding challenges to mimic questions asked by product-based companies** during technical interviews. Include clear problem statements, example inputs/outputs, and constraints.
    * Ensure a mix of difficulty levels as specified by 'Coding Difficulty'.

2.  **Multiple Choice Questions (MCQs):**
    * Generate questions that assess foundational knowledge, conceptual understanding, and problem-solving abilities relevant to the 'Selected Skills' and 'Role'.
    * **Vary difficulty levels including a significant number of hard MCQs.**
    * Each MCQ must have 4 distinct options, with only one correct answer.
    * Ensure distractors are plausible and not obviously wrong.

3.  **Theoretical Questions:**
    * Focus on in-depth understanding, design principles, trade-offs, and critical thinking related to the 'Selected Skills' and 'Role'.
    * **Include challenging theoretical questions** that require more than rote memorization.
    * Vary difficulty levels.

4.  **General Aptitude Questions (if requested):
    * Generate a mix of quantitative aptitude, logical reasoning, and verbal ability questions.
    * **Ensure a high level of difficulty, often including hard aptitude questions** that require analytical thinking and complex problem-solving.
    * For quantitative aptitude, cover topics like algebra, arithmetic, geometry, probability.
    * Each GA must have 4 distinct options, with only one correct answer.
    * For logical reasoning, include patterns, series, coding-decoding, blood relations, puzzles.
    * For verbal ability, include reading comprehension, sentence correction, vocabulary.

Schema:
{
  "extractedInfo": {
    "inferredRole": string | null,
    "inferredExperienceYears": number | null,
    "extractedSkills": string[],
    "summary": string
  },
  "testQuestions": [
    {
      "id": string,
      "type": "multiple-choice" | "coding-challenge" | "theoretical" | "general-aptitude",
      "questionText": string,
      "options": string[] | null,
      "correctAnswer": string[],
      "difficulty": "easy" | "medium" | "hard",
      "relatedSkills": string[],
      "testCases": { "input": string, "output": string }[] | null,
      "documentation": string | null
    }
  ],
  "totalDurationMinutes": number
}
`.trim();

    // User prompt contains only dynamic data specific to the request
    const userPromptText = `
Candidate Profile:
- Role: ${selectedRole}
- Experience Level: ${selectedExperience}
- Selected Skills: ${skillsList}
- Custom Goals: ${userPrompt}
${isResumeOnlyAssessment ? '- Resume Only: true' : ''}

Test Configuration:
- Test Type: ${testType}
- Number of MCQs: ${mcqCount}
- Number of Theoretical Questions: ${theoryCount}
- Number of Coding Challenges: ${codingCount} (Difficulty: ${codingDifficultyDetails})
- Number of General Aptitude Questions: ${gaCount} (Only if included)

**Return data strictly in the JSON format specified above.**
`.trim();

    // Combine system and user prompts for the Gemini API call
    const combinedPrompt = `${systemPrompt}\n\n${userPromptText}`;

    // Ensure apiKey is available before making the API call
    if (!apiKey) {
      throw new Error('Google API Key is not set. Please set the GOOGLE_API_KEY environment variable.');
    }

    // Model selection: 'gemini-1.0-pro' is generally more robust for complex JSON.
    // 'gemini-1.5-flash' is faster. Choose based on your needs and available models.
    const MODEL_NAME = 'gemini-1.5-flash'; // Changed to Flash as requested

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: combinedPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
           // Keep this high to allow 
           maxOutputTokens: 8192, 
        },
      }),
    });

    // Handle non-OK HTTP responses from Gemini API
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Gemini API Error] Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Extract content from Gemini's response structure
    let aiRawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiRawResponse) {
      console.error('[Gemini API] Empty or malformed AI response:', JSON.stringify(data, null, 2));
      throw new Error('Empty or malformed AI response from Gemini.');
    }

    // --- CRITICAL FOR JSON PARSING: Strip markdown fences and trim whitespace ---
    aiRawResponse = aiRawResponse.replace(/```json\n?|\n?```/g, '').trim();

    // Log the processed response for debugging before attempting JSON parsing
    console.log('[Gemini Processed Response (before JSON.parse)]:\n', aiRawResponse.substring(0, Math.min(aiRawResponse.length, 500)) + (aiRawResponse.length > 500 ? '...' : ''));

    let result: {
      extractedInfo: { inferredRole: string | null; inferredExperienceYears: number | null; extractedSkills: string[]; summary: string };
      testQuestions: Question[];
      totalDurationMinutes: number; // This will be overwritten by our calculation
    };

    // Attempt to parse the JSON response from Gemini
    try {
      result = JSON.parse(aiRawResponse);
    } catch (e) {
      console.error('[JSON Parse Error] Failed to parse Gemini JSON response:', (e as Error).message, 'Raw response causing error:\n', aiRawResponse);
      throw new Error('Failed to parse Gemini JSON response. It might not be valid JSON. Check server logs for raw response.');
    }

    // --- Recalculate totalDurationMinutes based on the generated questions ---
    // This provides a robust and accurate duration calculation, independent of LLM calculation.
    let calculatedDurationMinutes = 0;
    result.testQuestions.forEach((q: Question) => {
      switch (q.type) {
        case 'multiple-choice':
          calculatedDurationMinutes += 1; // 1 minute per MCQ
          break;
        case 'theoretical':
          calculatedDurationMinutes += 2; // 2 minutes per theoretical
          break;
        case 'coding-challenge':
          if (q.difficulty === 'easy') {
            calculatedDurationMinutes += 20;
          } else if (q.difficulty === 'medium') {
            calculatedDurationMinutes += 30;
          } else if (q.difficulty === 'hard') {
            calculatedDurationMinutes += 45;
          } else {
            // Fallback for unexpected difficulty, default to medium
            console.warn(`[Duration Calculation] Unknown difficulty '${q.difficulty}' for coding question ID: ${q.id}. Defaulting to medium (30 min).`);
            calculatedDurationMinutes += 30;
          }
          break;
        case 'general-aptitude':
          calculatedDurationMinutes += 1; // 1 minute per GA question
          break;
        default:
          console.warn(`[Duration Calculation] Unknown question type: ${q.type}. Not adding to duration.`);
          break;
      }
    });
    result.totalDurationMinutes = calculatedDurationMinutes; // Update the result with the calculated duration

    // Initialize rounds arrays to categorize questions for the final response structure
    const rounds: Round[] = [];
    const mcqRound: Round = { id: 'mcq-round', name: 'Multiple Choice Questions', type: 'multiple-choice', questions: [] };
    const theoryRound: Round = { id: 'theory-round', name: 'Theoretical Questions', type: 'theoretical', questions: [] };
    const codingRound: Round = { id: 'coding-round', name: 'Coding Challenges', type: 'coding-challenge', questions: [] };
    const gaRoundTyped: Round = { id: 'ga-round', name: 'General Aptitude', type: 'general-aptitude', questions: [] };

    // Distribute generated questions into their respective rounds
    result.testQuestions.forEach((q: Question) => {
      // Ensure question has an ID, assign if missing
      if (!q.id) {
        q.id = crypto.randomUUID(); // Assign UUID if question ID is missing
      }

      // Categorize based on question type
      switch (q.type) {
        case 'multiple-choice':
          mcqRound.questions.push(q);
          break;
        case 'theoretical':
          theoryRound.questions.push(q);
          break;
        case 'coding-challenge':
          codingRound.questions.push(q);
          break;
        case 'general-aptitude':
          gaRoundTyped.questions.push(q);
          break;
        default:
          console.warn(`[Question Categorization] Unknown question type: ${q.type}. Question ID: ${q.id}`);
          break;
      }
    });

    // Add rounds to the final response array only if they contain questions
    if (mcqRound.questions.length > 0) rounds.push(mcqRound);
    if (theoryRound.questions.length > 0) rounds.push(theoryRound);
    if (codingRound.questions.length > 0) rounds.push(codingRound);
    if (gaRoundTyped.questions.length > 0) rounds.push(gaRoundTyped);

    // --- ADDED: Declare testId using crypto.randomUUID() ---
    const testId = crypto.randomUUID();

    // Return the structured response
    return NextResponse.json({
      extractedInfo: result.extractedInfo,
      rounds,
      totalDurationMinutes: result.totalDurationMinutes,
      id: testId, // <-- Now 'testId' is correctly defined
    });

  } catch (err: any) {
    // Centralized error logging and response for API issues
    console.error('[Generate Test API Error]:', err.message);
    return NextResponse.json({ error: err.message || 'An unknown error occurred during test generation.' }, { status: 500 });
  }
}