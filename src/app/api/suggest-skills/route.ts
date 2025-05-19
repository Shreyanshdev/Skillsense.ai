// This file creates a backend API endpoint at /api/suggest-skills

// We need these tools:
// GoogleGenerativeAI: To talk to the Gemini AI models
// NextResponse: To send back responses from our API endpoint
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Set up the AI model using your special key.
// This key is stored securely in your .env.local file, not in the code that goes to the user's browser.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Choose which Gemini model to use. 'flash' is fast and good for suggestions.
const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

/**
 * This function runs when your frontend sends a POST request to /api/suggest-skills
 * It suggests skills based on a given role and already selected skills using Google Gemini.
 */
export async function POST(request: Request) {
  console.log('API Route /api/suggest-skills hit'); // Log when the route is accessed

  // Get the data sent from the frontend (role and selected skills)
  const { role, selectedSkills: currentSelectedSkills } = await request.json();

  console.log('Received role:', role); // Log the received role
  console.log('Received current selected skills:', currentSelectedSkills); // Log the received skills

  // If no role is provided, we can't suggest skills, so return an empty list.
  if (!role) {
    console.log('No role received, returning empty suggestions');
    return NextResponse.json({ suggestions: [] }, { status: 400 }); // 400 means "Bad Request"
  }

  try {
    // --- Tell the AI what to do (the "Prompt") ---
    // We ask the AI to suggest skills related to the given role.
    // IMPORTANT: We tell it to AVOID suggesting skills already in the list.
    // We also tell it EXACTLY how to format the answer (a JSON list of words).

    let instructionsForAI = `Given the software development role "${role}", suggest up to 10 relevant skills.`;

    // If there are already selected skills, tell the AI to avoid them.
    if (currentSelectedSkills && currentSelectedSkills.length > 0) {
        // Join the skill names for the prompt
        const selectedSkillNames = currentSelectedSkills.map((skill: { name: string }) => skill.name).join(', ');
        instructionsForAI += ` Avoid suggesting skills that are already listed: ${selectedSkillNames}. Suggest additional related skills.`;
    }

    instructionsForAI += `\nProvide the response as a simple JSON array of strings. Example format: ["Skill One", "Skill Two"]. Be concise. Do not include any introductory or concluding text, just the JSON array.`;

    console.log('Sending prompt to AI:', instructionsForAI); // Log the prompt

    // Send our instructions to the Gemini AI and wait for its response
    const aiResult = await aiModel.generateContent(instructionsForAI);
    const aiResponse = await aiResult.response;
    const aiText = aiResponse.text(); // Get the AI's answer as text

    console.log('Raw AI response text:', aiText); // Log the raw AI response

    // --- Understand the AI's Answer (Parsing) ---
    // The AI should have sent back a JSON string (a list). We need to turn that string into a JavaScript list.
    let suggestedSkills: string[] = [];
    let jsonString = '';

    try {
        // Attempt to find the first '[' and the last ']'.
        const startIndex = aiText.indexOf('[');
        const endIndex = aiText.lastIndexOf(']');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
             // Extract the substring that should contain the JSON array.
             jsonString = aiText.substring(startIndex, endIndex + 1);
             console.log('Extracted JSON substring:', jsonString); // Log the extracted part

             // Try to turn the extracted text into a JavaScript list
             suggestedSkills = JSON.parse(jsonString);
             console.log('Parsed suggested skills:', suggestedSkills); // Log the parsed array

             // Safety check: make sure the parsed result is actually a list of text items
             if (!Array.isArray(suggestedSkills) || !suggestedSkills.every(item => typeof item === 'string')) {
                  console.error("Parsed result is not an array of strings:", suggestedSkills);
                  suggestedSkills = []; // Fallback
             }

        } else {
            console.error("AI response text does not contain a valid JSON array structure:", aiText);
            suggestedSkills = []; // Fallback if array structure not found
        }

    } catch (parseError) {
         // If JSON.parse fails, log the error and the text we tried to parse.
         console.error("Failed to parse extracted JSON string:", jsonString, parseError);
         suggestedSkills = []; // Fallback
    }

    // --- Final Filtering (Server-side safety check) ---
    // Even though we told the AI to avoid selected skills, let's double-check
    // and remove any that might have slipped through.
    const currentSelectedSkillIds = new Set(currentSelectedSkills.map((skill: { id: string }) => skill.id));
    const filteredSuggestions = suggestedSkills.filter(skillName =>
        !currentSelectedSkillIds.has(skillName.toLowerCase().replace(/[^a-z0-9]/g, '')) // Check against generated ID
    );
    console.log('Filtered suggestions (removed already selected):', filteredSuggestions);

    // Send the list of suggested skills back to the frontend
    console.log('Sending filtered suggestions to frontend:', filteredSuggestions); // Log the final output
    return NextResponse.json({ suggestions: filteredSuggestions });

  } catch (error) {
    // If anything goes wrong (like can't connect to AI), log the error
    console.error('Error when asking AI for skills:', error); // Log the error details
    // Tell the frontend there was a problem
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 }); // 500 means "Internal Server Error"
  }
}
