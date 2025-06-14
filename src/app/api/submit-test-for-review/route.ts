// src/app/api/submit-test-for-review/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client'; // Assuming your inngest client is here
import { getMongoUserEmailFromRequest } from '@/utils/auth'; // Assuming this utility exists for user email

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] API Call received: /api/submit-test-for-review`);

  try {
    const userEmail = await getMongoUserEmailFromRequest(request); // Get user email if needed for Inngest event

    const { testId, userId, questionsForEvaluation } = await request.json();

    if (!testId || !userId || !Array.isArray(questionsForEvaluation)) {
      console.error(`[${new Date().toISOString()}] Validation Error: Missing testId, userId, or questionsForEvaluation.`);
      return NextResponse.json({ error: 'Invalid submission data. Required fields missing.' }, { status: 400 });
    }

    console.log(`[${new Date().toISOString()}] Test submission received for Test ID: ${testId}, User ID: ${userId}. Triggering Inngest event.`);

    // --- Trigger the Inngest function ---
    const sent = await inngest.send({
      name: "test.evaluation.requested", // A descriptive event name
      data: {
        testId,
        userId,
        userEmail, // Pass user email to the Inngest function
        questionsForEvaluation,
      },
    });

    const runId = sent.ids?.[0]; // Get the run ID if available
    if (!runId) {
      console.error(`[${new Date().toISOString()}] ⚠️ No runId from inngest.send:`, sent);
      return NextResponse.json({ error: "Failed to queue test evaluation." }, { status: 500 });
    }

    console.log(`[${new Date().toISOString()}] Inngest event 'test.evaluation.requested' sent with runId: ${runId}`);

    const endTime = Date.now();
    console.log(`[${new Date().toISOString()}] API Call completed in ${endTime - startTime}ms. (Inngest event queued)`);

    return NextResponse.json({
      message: 'Test evaluation queued successfully! You will receive a detailed report soon.',
      evaluationRunId: runId, // Return the Inngest runId for tracking
      testId, // Return testId for client-side reference
      userId, // Return userId for client-side reference
    }, { status: 202 }); // 202 Accepted status indicates processing will occur later

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal API Error during test submission:`, error);
    return NextResponse.json({ error: 'An internal server error occurred during test submission.' }, { status: 500 });
  }
}