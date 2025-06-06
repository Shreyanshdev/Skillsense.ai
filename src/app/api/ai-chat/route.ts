// src/app/api/ai-chat/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  console.log(" /api/ai-chat hit"); // <— debug line
  const { userInput } = await req.json();

  if (!userInput || typeof userInput !== "string") {
    return NextResponse.json({ error: "Missing userInput" }, { status: 400 });
  }

  // Dispatch to Inngest
  const resultIds = await inngest.send({
    name: "AiCareerAgent",
    data: { userInput },
  });

  const runId = resultIds?.ids?.[0];
  if (!runId) {
    return NextResponse.json({ error: "No runId returned from Inngest" }, { status: 500 });
  }

  // Poll for completion (with timeout)
  let runStatus: any;
  let attempts = 0;
  const maxAttempts = 30; // ~15 seconds

  while (attempts < maxAttempts) {
    runStatus = await getRuns(runId);
    if (Array.isArray(runStatus?.data) && runStatus.data[0]?.status === "Completed") {
      break;
    }
    attempts++;
    await new Promise((r) => setTimeout(r, 500));
  }

  if (attempts >= maxAttempts) {
    return NextResponse.json(
      { error: "Timeout waiting for Inngest to complete" },
      { status: 504 }
    );
  }

  return NextResponse.json(runStatus.data?.[0].output?.output[0]);
}

async function getRuns(runId: string) {
  const url = `${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`;
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${process.env.INNGEST_API_KEY}` },
  });
  return resp.data;
}
