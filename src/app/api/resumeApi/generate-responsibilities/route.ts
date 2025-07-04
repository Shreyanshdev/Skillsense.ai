// app/api/generate-responsibilities/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_API_KEY;

export async function POST(req: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: API key missing." },
        { status: 500 }
      );
    }

    const { jobTitle, company, existingResponsibilities } = await req.json();

    if (!jobTitle || !company) {
      return NextResponse.json(
        { error: "Missing 'jobTitle' or 'company' in request body." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Consider "gemini-1.5-flash" for speed

    // Craft a detailed prompt for experience responsibilities
    let prompt = `You are an expert resume writer. Generate 3-5 concise, action-oriented, and quantifiable bullet points for a resume's work experience section.`;
    prompt += `\nRole: ${jobTitle}`;
    prompt += `\nCompany: ${company}`;

    if (existingResponsibilities) {
      prompt += `\n\nExisting responsibilities (expand on these or generate new ones in a similar style, ensuring no duplicates if possible): \n${existingResponsibilities}`;
    }

    prompt += `\n\nEnsure each bullet point starts with a strong action verb. Focus on accomplishments and impact. If no specific numbers are given, use phrases like "improved efficiency," "streamlined processes," or "increased user satisfaction." Provide ONLY the bullet points, each on a new line, without any introductory or concluding text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedResponsibilities = response.text().trim(); // This will be a multi-line string of bullet points

    return NextResponse.json({ enhancedResponsibilities });
  } catch (error) {
    console.error("Error generating responsibilities:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to generate responsibilities", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}