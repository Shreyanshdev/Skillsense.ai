// This file creates a backend API endpoint at /api/generate-test
// This endpoint receives the evaluation form data, analyzes the resume,
// and uses AI to generate a tailored test.

// We need these tools:
// GoogleGenerativeAI: To talk to the Gemini AI models
// NextResponse: To send back responses from our API endpoint
// NextRequest: To handle incoming requests, especially FormData (for file uploads)
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server'; // Import NextRequest

// You will likely need to import file parsing libraries here based on what you install
// Make sure you have installed these: npm install pdf-parse mammoth buffer
// Import pdf-parse and Buffer if you are uncommenting the PDF parsing example
// import pdf from 'pdf-parse';
// import { Buffer } from 'buffer';

// Import mammoth if you are uncommenting the DOCX parsing example
// import mammoth from 'mammoth';


// Set up the AI model using your special key.
// This key is stored securely in your .env.local file.
// Ensure GOOGLE_API_KEY is set in your .env.local file.
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Choose a suitable Gemini model. 'gemini-1.5-pro-latest' is generally
// better for complex tasks like analyzing text and generating structured output (like test questions).
// If you are hitting quota issues with 'pro', consider trying 'gemini-1.5-flash-latest' here,
// although the quality might differ.
const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
// const aiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }); // Alternative model

/**
 * This function runs when your frontend sends a POST request to /api/generate-test.
 * It processes the form data, analyzes the resume (conceptually), and generates a test.
 */
export async function POST(request: NextRequest) {
  console.log('API Route /api/generate-test hit'); // Log when the route is accessed

  try {
    // Get all the data sent from the frontend form (including the file)
    // request.formData() is used because the frontend sent a FormData object
    const formData = await request.formData();
    console.log('Received FormData'); // Log that form data was received

    // Extract the individual fields from the form data
    // We use .get() to get the value by the field name from the frontend form
    const isResumeOnlyAssessment = formData.get('isResumeOnlyAssessment') === 'true';
    const selectedExperience = formData.get('selectedExperience') as string;
    const selectedDuration = formData.get('selectedDuration') as string;
    // Get the uploaded file object using the field name 'resume'
    const resumeFile = formData.get('resume') as File;

    // These fields are only sent if not in resume-only mode
    const selectedRole = formData.get('selectedRole') as string | null;
    const userPrompt = formData.get('userPrompt') as string | null;
    // selectedSkills comes as a JSON string from the frontend, so we parse it back into an array
    const selectedSkillsString = formData.get('selectedSkills') as string | null;
    // Parse the JSON string; if it's null, default to an empty array
    const selectedSkills = selectedSkillsString ? JSON.parse(selectedSkillsString) : [];

    console.log('Extracted form data:', {
        isResumeOnlyAssessment,
        selectedExperience,
        selectedDuration,
        resumeFileName: resumeFile?.name, // Log file name, not the file content itself
        selectedRole,
        userPrompt,
        selectedSkills,
    });

    // --- Resume Analysis (Conceptual Placeholder) ---
    // This is the part where you need to read the content of the uploaded file.
    // You get the file as a 'File' object from request.formData().
    // You NEED to install and use specific libraries to extract text
    // from PDF, DOC, DOCX files based on the file type (resumeFile.type).
    // Make sure you have installed these: npm install pdf-parse mammoth buffer
    // And potentially 'buffer' if your parsing library requires it.

    let resumeTextContent = ''; // This variable will hold the text extracted from the resume

    if (resumeFile) {
        console.log(`Processing resume file: ${resumeFile.name} (Type: ${resumeFile.type})`);

        // --- >>> YOUR FILE READING CODE GOES HERE <<< ---
        // You need to read the content from the 'resumeFile' object.
        // Use resumeFile.arrayBuffer() to get the file content as binary data.
        // Then, pass this binary data to your chosen file parsing library.

        // Example for PDF using pdf-parse:
        // Make sure you have 'pdf-parse' and 'buffer' installed and imported above.
        if (resumeFile.type === 'application/pdf') {
            try {
                console.log('Attempting to parse PDF...');
                const arrayBuffer = await resumeFile.arrayBuffer(); // Get file content as ArrayBuffer
                // Need to dynamically import pdf-parse and Buffer in the serverless environment
                // This helps prevent issues with these Node.js modules in the build
                const { default: pdf } = await import('pdf-parse');
                const { Buffer } = await import('buffer'); // Import Buffer explicitly
                const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Node.js Buffer (pdf-parse needs Buffer)
                const data = await pdf(buffer); // Use pdf-parse to extract text
                resumeTextContent = data.text;
                console.log('Text extracted from PDF successfully.');
            } catch (pdfError) {
                console.error('Error parsing PDF:', pdfError);
                // Handle the error (e.g., set resumeTextContent to empty or return an error response)
                // Depending on your error handling strategy, you might want to
                // return NextResponse.json({ error: 'Failed to parse PDF.' }, { status: 400 });
                console.warn('PDF parsing failed, using dummy content:', pdfError);
                 // Fallback to dummy content if parsing fails
                 resumeTextContent = `[Dummy Content due to PDF parse error]`;
            }
        }
        // Example for DOCX using mammoth:
        // Make sure you have 'mammoth' installed and imported above.
        else if (resumeFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            try {
                 console.log('Attempting to parse DOCX...');
                const arrayBuffer = await resumeFile.arrayBuffer(); // Get file content as ArrayBuffer
                 // Need to dynamically import mammoth in the serverless environment
                 const { default: mammoth } = await import('mammoth');
                // mammoth.extractRawText works with ArrayBuffer directly
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                resumeTextContent = result.value; // The extracted text is in result.value
                console.log('Text extracted from DOCX successfully.');
            } catch (docxError) {
                 console.error('Error parsing DOCX:', docxError);
                 // Handle the error
                 console.warn('DOCX parsing failed, using dummy content:', docxError);
                 // Fallback to dummy content if parsing fails
                 resumeTextContent = `[Dummy Content due to DOCX parse error]`;
            }
        }
        // Add more conditions for other file types you want to support (e.g., text/plain)
        // For older .doc files, you might need different libraries or approaches.
        else if (resumeFile.type === 'text/plain') {
             try {
                 console.log('Attempting to read plain text file...');
                 resumeTextContent = await resumeFile.text(); // File object has a .text() method for plain text
                 console.log('Text extracted from plain text file successfully.');
             } catch (textError) {
                 console.error('Error reading plain text file:', textError);
                 console.warn('Plain text reading failed, using dummy content:', textError);
                 resumeTextContent = `[Dummy Content due to plain text read error]`;
             }
        }
        else {
            console.warn(`Unsupported file type for parsing: ${resumeFile.type}. Using dummy content.`);
            resumeTextContent = `[Dummy Content due to unsupported file type]`;
            // Optionally return an error if unsupported file types are not allowed
            // return NextResponse.json({ error: `Unsupported file type: ${resumeFile.name}` }, { status: 400 });
        }
        // --- >>> END OF FILE READING PLACEHOLDER <<< ---

        // --- For Demonstration: Using Dummy Text as a FINAL Fallback ---
        // Only use this dummy text if NO text was extracted by the logic above.
         if (resumeTextContent.trim() === '' || resumeTextContent.includes('[Dummy Content')) {
             console.warn('Resume text content is empty or dummy after parsing attempts. Using default dummy content.');
             resumeTextContent = `
                [Default Simulated Resume Content for AI Analysis]
                Summary: Software Developer with relevant skills and experience.
                Skills: Programming Languages, Frameworks, Tools.
                Experience: Worked on software projects.
                Education: Relevant Degree.
             `;
         }
        // --- End Dummy Text ---


    } else {
        // If resume is required but not uploaded, frontend validation should ideally catch this,
        // but this is a server-side safety check.
         console.warn('No resume file uploaded.');
         return NextResponse.json({ error: 'Resume file is required.' }, { status: 400 });
    }

     console.log('Final resume text content for AI:', resumeTextContent.substring(0, 200) + '...'); // Log first 200 chars


    // --- AI Interaction: Analyze Resume and Generate Test ---
    // We'll create a single prompt asking Gemini to analyze the resume text
    // and generate test questions based on ALL the provided information.

    let aiPrompt = `Analyze the following resume text and the user's provided information.
                    Infer the user's likely role and key skills from the resume text provided.
                    Then, generate a technical assessment test based on ALL the input provided (resume analysis, user specified role, skills, experience, prompt, duration).

Resume Text:
"${resumeTextContent}"

User Provided Information:
- Target Role (User Specified): ${selectedRole || 'Not specified'}
- Experience Level (User Specified): ${selectedExperience}
- User Prompt/Goals (User Specified): ${userPrompt || 'None'}
- Selected Key Skills (User Specified): ${selectedSkills.map((s: { name: string, level: string | null }) => `${s.name} (${s.level || 'Proficiency not specified'})`).join(', ') || 'None specified'}
- Desired Duration: ${selectedDuration}
- Resume Only Assessment: ${isResumeOnlyAssessment ? 'Yes' : 'No'}

Based on ALL the above information (including inferred details from the resume text and explicit user input), generate a technical assessment test.
The test should be tailored to the user's background, skills, and goals.
Include a mix of question types (e.g., multiple-choice, coding challenges, theoretical questions).
The difficulty and number of questions should be appropriate for the desired duration.
Ensure coding challenges are clearly described.

Provide the response as a JSON object with two main keys:
1.  \`extractedInfo\`: An object summarizing key info inferred from the resume text and input.
    * Expected structure: \`{ inferredRole: string | null, inferredExperienceYears: number | null, extractedSkills: string[], summary: string }\`
2.  \`testQuestions\`: An array of question objects.
    * Expected structure: \`[{ id: string, type: "multiple-choice" | "coding-challenge" | "theoretical", questionText: string, options: string[] | null, correctAnswer: any, difficulty: "easy" | "medium" | "hard", relatedSkills: string[] }, ...]\`
    * Ensure \`id\` is unique for each question.

---
ONLY return the JSON object and nothing else. Do not include markdown code block wrappers json or any extra text.`;

    console.log('Sending test generation prompt to AI.'); // Log the prompt start (full prompt can be long)

    // Send the prompt to the AI and wait for the response
    const aiResult = await aiModel.generateContent(aiPrompt);
    const aiResponse = await aiResult.response;
    // Await the text() promise to get the actual string
    const aiText = await aiResponse.text();

    console.log('Raw AI response text for test generation:', aiText); // Log the raw AI response

    // --- Understand the AI's Answer (Parsing) ---
    // The AI should have sent back a JSON object string.
    let generatedTestData: any = null;
    let jsonString = '';

    try {
        // Attempt to find the first '{' and the last '}'. This is a robust way
        // to extract the JSON object string even if there's surrounding text.
        const startIndex = aiText.indexOf('{');
        const endIndex = aiText.lastIndexOf('}');

        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
             // Extract the substring that should contain the JSON object.
             jsonString = aiText.substring(startIndex, endIndex + 1);
             console.log('Extracted JSON substring for test data:', jsonString); // Log the extracted part

             // Try to turn the extracted text into a JavaScript object
             generatedTestData = JSON.parse(jsonString);
             console.log('Parsed generated test data:', generatedTestData); // Log the parsed object

             // Optional: Add validation to check if the parsed object has the expected top-level keys and structure
             if (
                 !generatedTestData ||
                 typeof generatedTestData !== 'object' ||
                 !generatedTestData.extractedInfo || // Check for extractedInfo object
                 !Array.isArray(generatedTestData.testQuestions) // Check for testQuestions array
             ) {
                  console.error("Parsed result does not have the expected test data structure (missing extractedInfo or testQuestions array):", generatedTestData);
                  generatedTestData = null; // Fallback if structure is wrong
             } else {
                 // Further validate testQuestions array items structure if needed
                 const isValidQuestionsArray = generatedTestData.testQuestions.every((q: any) =>
                     q.id && typeof q.questionText === 'string' && ['multiple-choice', 'coding-challenge', 'theoretical'].includes(q.type)
                     // Add more checks for options, correctAnswer, etc. as needed
                 );
                 if (!isValidQuestionsArray) {
                      console.error("TestQuestions array items do not match expected structure:", generatedTestData.testQuestions);
                      generatedTestData = null; // Fallback if array items are malformed
                 }
             }

        } else {
            console.error("AI response text does not contain a valid JSON object structure for test data:", aiText);
            generatedTestData = null; // Fallback if object structure not found
        }

    } catch (parseError) {
         // If JSON.parse fails, log the error and the text we tried to parse.
         console.error("Failed to parse extracted JSON string for test data:", jsonString, parseError);
         generatedTestData = null; // Fallback
    }

    // Check if test data was successfully generated and parsed with questions
    if (!generatedTestData || !generatedTestData.testQuestions || generatedTestData.testQuestions.length === 0) {
         console.error("Test generation failed or returned empty testQuestions array.");
         // Provide a more specific error if possible, e.g., based on AI response content
         return NextResponse.json({ error: 'Failed to generate test questions. The AI response was not in the expected format or was empty. Please try again or adjust your input.' }, { status: 500 });
    }


    // --- Success ---
    // Send the generated test data (extracted info and questions) back to the frontend
    console.log('Test generation successful. Sending data to frontend.');
    return NextResponse.json(generatedTestData); // Send the parsed test data object

  } catch (error) {
    // If anything goes wrong during the entire process, log the error
    console.error('Error during test generation:', error); // Log the error details
    // Tell the frontend there was a problem
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `An internal error occurred during test generation: ${errorMessage}` }, { status: 500 }); // Include error message for debugging
  }
}

// In Next.js App Router, you don't export default for API routes.
// You just export the function for the HTTP method (POST).
