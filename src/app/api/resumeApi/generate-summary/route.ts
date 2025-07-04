// src/app/api/resumeApi/generate-summary/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("GOOGLE_API_KEY is not set in environment variables.");
}

export async function POST(req: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: API key missing." },
        { status: 500 }
      );
    }

    // Destructure the context data sent from the frontend
    const { personalInfo, skills, experienceSummary, projectSummary, currentSummary } = await req.json();

    // Initialize GoogleGenerativeAI with regional endpoint
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Ensure this model is available

    let prompt = `You are an expert resume writer. Generate a concise, impactful 3-5 sentence professional summary for a resume. Focus on the user's top skills, experience, and key achievements. Prioritize action verbs and quantifiable results where applicable.`;

    if (personalInfo?.name) {
        prompt += `\n\nApplicant Name: ${personalInfo.name}`;
    }
    // Use personalInfo.jobTitle from your provided structure
    if (personalInfo?.jobTitle) {
        prompt += `\nTarget Role/Current Role: ${personalInfo.jobTitle}`;
    }
    // Skills are now a comma-separated string of names
    if (skills) {
        prompt += `\n\nKey Skills: ${skills}`;
    }
    if (experienceSummary) {
        prompt += `\n\nExperience Highlights:\n${experienceSummary}`;
    }
    if (projectSummary) {
        prompt += `\n\nProject Highlights:\n${projectSummary}`;
    }
    if (currentSummary) {
      prompt += `\n\nExisting Summary (if any, use as a base or refine):\n${currentSummary}`;
    }

    prompt += `\n\nProvide ONLY the summary text, without any introductory or concluding remarks. The summary should be directly usable as a resume summary.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedSummary = response.text().trim();

    return NextResponse.json({ summary: generatedSummary });
  } catch (error) {
    console.error("Error generating summary:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to generate summary", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}