// app/api/analyze-resume/route.ts
// This API route handles resume uploads using NextRequest.formData(),
// extracts text from PDF/DOCX, and uses the Gemini API to extract skills.
// This is the recommended approach for file uploads in Next.js App Router.

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises'; // For file system operations (e.g., writing temp files)
import path from 'path';
import os from 'os'; // For os.tmpdir()

// --- IMPORTS FOR RESUME PARSING ---
import PDFParser from 'pdf2json'; // For parsing PDF files
import mammoth from 'mammoth'; // For parsing DOCX files

// Export a named POST function for the App Router
export async function POST(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 }); // Only allow POST requests
  }

  let resumeFile: File | undefined;
  try {
    const formData = await request.formData();
    // Get the file from the 'resume' field in the FormData
    const fileEntry = formData.get('resume');

    if (fileEntry instanceof File) {
      resumeFile = fileEntry;
    } else {
      return NextResponse.json({ error: 'No resume file uploaded or invalid file type.' }, { status: 400 });
    }

    // Basic file size validation (matches frontend 5MB limit)
    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit.' }, { status: 413 });
    }

  } catch (error) {
    console.error('Error parsing FormData:', error);
    return NextResponse.json({ error: 'Failed to process file upload.' }, { status: 500 });
  }

  let resumeText = '';
  let tempFilePath: string | undefined;

  try {
    // Convert the File object to a Buffer
    const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());

    // Create a temporary file to save the buffer, as pdf2json and mammoth need a file path
    tempFilePath = path.join(os.tmpdir(), `${Date.now()}-${resumeFile.name}`);
    await fs.writeFile(tempFilePath, fileBuffer);
    console.log(`Temporary file saved to: ${tempFilePath}`);


    // --- ACTUAL RESUME TEXT EXTRACTION LOGIC ---
    if (resumeFile.type === 'application/pdf') {
      // Parse PDF using pdf2json
      const pdfParser = new PDFParser(); // Pass null for context
      let pdfText = '';

      await new Promise<void>((resolve, reject) => {
        interface PdfParserError {
          parserError: string;
        }

        pdfParser.on('pdfParser_dataError', (errData: PdfParserError) => {
          console.error('pdf2json data error:', errData.parserError);
          reject(new Error(`PDF parsing error: ${errData.parserError}`));
        });
        pdfParser.on('pdfParser_dataReady', (pdfData: unknown) => {
          const pdfPages = (pdfData as { Pages: unknown[] }).Pages;
          pdfPages.forEach((page) => {
            (page as { Texts: { R: { T: string }[] }[] }).Texts.forEach((text) => {
              const textObj = text as { R: { T: string }[] };
              pdfText += decodeURIComponent(textObj.R[0].T) + ' ';
            });
            pdfText += '\n\n';
          });
          resumeText = pdfText;
          console.log(`Successfully parsed PDF with pdf2json: ${resumeFile.name}`);
          resolve();
        });

        if (tempFilePath) {
          pdfParser.loadPDF(tempFilePath);
        } else {
          throw new Error('Temporary file path is undefined.');
        }
      });

    } else if (
      resumeFile.type === 'application/msword' || // .doc
      resumeFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ) {
      const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
      const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      resumeText = result.value;
      console.log(`Successfully parsed DOCX with mammoth: ${resumeFile.name}`);
    } else {
      // Fallback for plain text files or unsupported types
      console.warn(`Unsupported MIME type for resume parsing: ${resumeFile.type}. Attempting to read as plain text.`);
      resumeText = fileBuffer.toString('utf8');
    }

    if (!resumeText.trim()) {
      console.warn(`Extracted no text from ${resumeFile.name}. Mimetype: ${resumeFile.type}`);
      return NextResponse.json({ error: 'Could not extract readable text from resume. Please ensure it is a valid document with text content.' }, { status: 400 });
    }

  } catch (parseError) {
    console.error('Error parsing resume file:', parseError);
    return NextResponse.json({ error: `Failed to parse resume file: ${(parseError as Error).message}` }, { status: 500 });
  } finally {
    // Clean up the temporary file if it was created
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(err => console.error('Error deleting temp file:', err));
    }
  }

  try {
    // Prepare the prompt for the Gemini model
    const prompt = `Analyze the following resume text and extract a comprehensive list of key skills.
    Focus on technical skills, soft skills, tools, technologies, and methodologies.
    Return the skills as a JSON array of strings. Do not include any other text or formatting.

    Resume Text:
    """
    ${resumeText}
    """
    `;

    // Gemini API call configuration
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            skills: {
              type: 'ARRAY',
              items: {
                type: 'STRING',
              },
            },
          },
          required: ['skills'],
        },
      },
    };

    const apiKey = process.env.GOOGLE_API_KEY || ''; // Leave empty, Canvas will provide it at runtime
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
      const jsonString = result.candidates[0].content.parts[0].text;
      const parsedResult = JSON.parse(jsonString);

      if (parsedResult && Array.isArray(parsedResult.skills)) {
        return NextResponse.json({ skills: parsedResult.skills }, { status: 200 });
      } else {
        console.warn('Gemini response did not contain a valid skills array:', parsedResult);
        return NextResponse.json({ error: 'Failed to extract skills in expected format from AI.' }, { status: 500 });
      }
    } else {
      console.warn('Gemini response structure unexpected:', result);
      return NextResponse.json({ error: 'AI did not return a valid response for skills extraction.' }, { status: 500 });
    }
  } catch (apiError ) {
    console.error('Error during Gemini API call:', apiError);
    return NextResponse.json({ error: (apiError as Error).message || 'An error occurred during skill extraction.' }, { status: 500 });
  }
}
