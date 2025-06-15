// src/app/api/ai-chat/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { inngest } from "@/inngest/client";

// Define a type for the expected structure of a run status object from Inngest
// This helps eliminate 'any' and provides better type checking.
interface InngestRunStatus {
  status: "Completed" | "Running" | "Failed" | string; // Define possible statuses
  output?: {
    output: ArrayBuffer[]; // Assuming output can be an array of any type based on runStatus.data?.[0].output?.output[0]
  };
}

export async function POST(req: Request) {
  const { userInput } = await req.json();
  if (!userInput || typeof userInput !== "string") {
    return NextResponse.json({ error: "Missing userInput" }, { status: 400 });
  }

  const resultIds = await inngest.send({
    name: "AiCareerAgent",
    data: { userInput },
  });

  const runId = resultIds?.ids?.[0];
  if (!runId) {
    return NextResponse.json({ error: "No runId returned from Inngest" }, { status: 500 });
  }

  let runStatus: { data: InngestRunStatus[] } | undefined; 
  let attempts = 0;
  const maxAttempts = 100; // Maximum number of polling attempts, roughly 15 seconds (30 * 500ms)

  while (attempts < maxAttempts) {

    runStatus = await getRuns(runId);

    if (Array.isArray(runStatus?.data) && runStatus.data[0]?.status === "Completed") {
      break; 
    }
    attempts++; // Increment attempt counter.
   
    await new Promise((r) => setTimeout(r, 1000));
  }

  // If the loop completes without the run status being "Completed", it means a timeout occurred.
  if (attempts >= maxAttempts) {
    return NextResponse.json(
      { error: "Timeout waiting for Inngest to complete" },
      { status: 504 } 
    );
  }

  return NextResponse.json(runStatus?.data?.[0]?.output?.output?.[0]);
}

/**
 * Fetches the status of a specific Inngest run.
 *
 * @param runId The ID of the Inngest run to fetch.
 * @returns The data returned from the Inngest runs API.
 */
async function getRuns(runId: string): Promise<{ data: InngestRunStatus[] }> {
  // Construct the URL for the Inngest runs API.
  const url = `${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`;
  // Make an authenticated GET request to the Inngest API.
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${process.env.INNGEST_API_KEY}` },
  });
  // Return the response data, casting it to the expected type for better type safety.
  return resp.data as { data: InngestRunStatus[] };
}
