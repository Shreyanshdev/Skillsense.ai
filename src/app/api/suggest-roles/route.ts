// This file creates a backend API endpoint at /api/suggest-roles

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
 * This function runs when your frontend sends a GET request to /api/suggest-roles
 * It suggests software development roles based on a user query using Google Gemini.
 */
export async function GET(request: Request) {
  console.log('API Route /api/suggest-roles hit'); // Log when the route is accessed

  // Get the search terms the user typed from the web address (URL)
  const { searchParams } = new URL(request.url);
  const userQuery = searchParams.get('query'); // The user's input, like "front" or "backend"

  console.log('Received query:', userQuery); // Log the received query

  // If the user didn't type anything, send back an empty list of suggestions
  if (!userQuery) {
    console.log('No query received, returning 400'); // Log if no query
    return NextResponse.json({ suggestions: [] }, { status: 400 }); // 400 means "Bad Request"
  }

  try {
    // --- Tell the AI what to do (the "Prompt") ---
    // We ask the AI to suggest job roles based on the user's input.
    // IMPORTANT: We tell it EXACTLY how to format the answer (a JSON list of words).
    // Added explicit instruction to ONLY return the JSON array.
    const instructionsForAI = `Suggest up to 7 software development roles related to the query "${userQuery}".
                               Provide the response as a JSON array of strings.
                               Example format: ["Role One", "Role Two", "Role Three"].
                               Only suggest roles commonly found in the tech industry.
                               Be concise.
                               ---
                               ONLY return the JSON array and nothing else.`; // Emphasize only JSON

    console.log('Sending prompt to AI:', instructionsForAI); // Log the prompt

    // Send our instructions to the Gemini AI and wait for its response
    const aiResult = await aiModel.generateContent(instructionsForAI);
    const aiResponse = await aiResult.response;
    const aiText = aiResponse.text(); // Get the AI's answer as text

    console.log('Raw AI response text:', aiText); // Log the raw AI response

    // --- Understand the AI's Answer (More Robust Parsing) ---
    // The AI should have sent back a JSON string (a list).
    // We will try to find the JSON array string within the response text.
    let suggestedRoles: string[] = [];
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
             suggestedRoles = JSON.parse(jsonString);
             console.log('Parsed suggested roles:', suggestedRoles); // Log the parsed array

             // Safety check: make sure the parsed result is actually an array of strings.
             if (!Array.isArray(suggestedRoles) || !suggestedRoles.every(item => typeof item === 'string')) {
                  console.error("Parsed result is not an array of strings:", suggestedRoles);
                  suggestedRoles = []; // Fallback
             }

        } else {
            console.error("AI response text does not contain a valid JSON array structure:", aiText);
            suggestedRoles = []; // Fallback if array structure not found
        }

    } catch (parseError) {
         // If JSON.parse fails, log the error and the text we tried to parse.
         console.error("Failed to parse extracted JSON string:", jsonString, parseError);
         suggestedRoles = []; // Fallback
    }

    // Send the list of suggested roles back to the frontend
    console.log('Sending suggestions to frontend:', suggestedRoles); // Log the final output
    return NextResponse.json({ suggestions: suggestedRoles });

  } catch (error) {
    // If anything goes wrong (like can't connect to AI), log the error
    console.error('Error when asking AI for roles:', error); // Log the error details
    // Tell the frontend there was a problem
    return NextResponse.json({ error: 'Failed to get suggestions' }, { status: 500 }); // 500 means "Internal Server Error"
  }
}
