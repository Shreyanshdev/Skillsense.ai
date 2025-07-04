// src/app/api/resumeApi/generate-project-bullets/route.ts
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

    const { projectName, existingBulletPoints, githubLink, liveLink } = await req.json();

    if (!projectName) {
      return NextResponse.json(
        { error: "Missing 'projectName' in request body." },
        { status: 400 }
      );
    }

    // Initialize GoogleGenerativeAI with clientOptions to specify the region
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Or "gemini-1.5-flash"

    // Craft a detailed prompt for project bullet points
    let prompt = `You are an expert resume writer. Generate 3-5 concise, action-oriented, and quantifiable bullet points for a resume's project section.`;
    prompt += `\nProject Name: ${projectName}`;
    
    if (githubLink) {
        prompt += `\nGitHub Link: ${githubLink}`;
    }
    if (liveLink) {
        prompt += `\nLive Demo Link: ${liveLink}`;
    }

    if (existingBulletPoints) {
      prompt += `\n\nExisting project details (expand on these or generate new ones in a similar style, ensuring no duplicates if possible): \n${existingBulletPoints}`;
    }

    prompt += `\n\nEnsure each bullet point starts with a strong action verb. Focus on technologies used, accomplishments, and impact. If no specific numbers are given, use phrases like "improved performance," "enhanced user experience," or "streamlined development." Provide ONLY the bullet points, each on a new line, without any introductory or concluding text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedProjectBullets = response.text().trim(); // This will be a multi-line string of bullet points

    return NextResponse.json({ enhancedProjectBullets });
  } catch (error) {
    console.error("Error generating project bullets:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Failed to generate project bullets", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}