// src/app/api/ai-cover-letter/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

// Initialize Gemini
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables.");
  // In a production app, you might want to throw an error or handle this more gracefully
  // before the server starts to indicate a misconfiguration.
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || ''); // Provide an empty string as fallback for TS, but it should be checked above.

// Choose a model that suits your needs. 'gemini-pro' is a good general-purpose model.
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: NextRequest) {
  try {
    const { jobRole, yourName, description } = await req.json();

    if (!jobRole || !yourName) {
      return NextResponse.json({ error: 'Job role and your name are required.' }, { status: 400 });
    }

    // Construct a detailed prompt for Gemini
    const prompt = `
        Write a comprehensive and professional cover letter.

        Here are the details:
        - Applicant's Name: ${yourName}
        - Target Job Role: ${jobRole}
        ${description ? `- Additional Information to include: ${description}` : ''}

        Structure the cover letter with:
        1. An opening paragraph expressing enthusiasm and stating the position applied for.
        2. One or two body paragraphs highlighting relevant skills, experiences, and achievements that align with the job role.
        3. A paragraph explaining why the applicant is interested in this specific company.
        4. A concluding paragraph expressing eagerness for an interview and thanking the reader.

        Ensure the tone is professional, confident, and persuasive.
        Generate the output as a single block of **HTML content only**, using <p> for paragraphs, <strong> for bolding, <em> for italics, and <u> for underlines where appropriate.
        DO NOT include any surrounding text like "Here is your cover letter:" or " \`\`\`html".
        DO NOT include a salutation (e.g., "Dear [Recipient]") or closing (e.g., "Sincerely, [Your Name]").
        The entire output must be valid HTML paragraphs.
        `;


    const result = await model.generateContent(prompt);
    const response = result.response;

    // Access the generated text. This will be the cover letter content.
    const generatedText = response.text();

    if (!generatedText || generatedText.trim().length < 20 || generatedText.includes('blocked')) {
        console.warn("Gemini returned invalid or empty response.");
        return NextResponse.json({ error: 'AI could not generate sufficient content. Please rephrase and try again.' }, { status: 500 });
      }

    // You might want to do some basic sanitization or formatting here
    // For example, if Gemini returns markdown, you'd convert it to HTML.
    // Given the prompt, it should try to return HTML paragraphs directly.
    let cleanedHtml = generatedText.trim();

    if (!cleanedHtml.startsWith('<p>') && !cleanedHtml.startsWith('<div')) {
        // If it looks like plain text with newlines, convert to paragraphs
        cleanedHtml = cleanedHtml
            .split('\n\n') // Split by double newlines
            .map(para => `<p>${para.trim()}</p>`) // Wrap each segment in a paragraph
            .join('');
    }

    // Ensure no extra newlines sneak into attributes or the very start/end
    cleanedHtml = cleanedHtml.replace(/\s+/g, ' '); // Replace all whitespace sequences with single spaces
    // Re-introduce newlines specifically for readability between block elements if you prefer,
    // but the key is not to have them *within* a DOMTokenList context.
    // For Tiptap's setContent, it's generally best to feed it clean HTML.
    // For now, let's just focus on trimming and ensuring valid HTML structures.

    return NextResponse.json({ coverLetter: cleanedHtml }, { status: 200 });

  } catch (error: any) {
    console.error('Gemini API Error:', error);

    let errorMessage = 'Internal server error. Failed to generate cover letter.';
    if (error.message.includes('API key not valid')) {
      errorMessage = 'Invalid Gemini API key. Please check your .env.local file.';
    } else if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('rate limit')) {
      errorMessage = 'AI service is busy or daily limit reached. Please try again later.';
    } else if (error.message.includes('Content generation failed') || error.message.includes('safety')) {
      errorMessage = 'AI could not generate content due to safety concerns or other issues. Please rephrase your input.';
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}