import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Your Drizzle DB client
import { HistoryTable } from '@/lib/schema'; // Your Drizzle schema for HistoryTable
import { eq } from 'drizzle-orm'; // Import eq for equality comparisons
import { EvaluationReport } from '@/types/evaluation'; // Import your EvaluationReport type
// REMOVE: import { useParams } from 'next/navigation'; // This is a client-side hook, not for API routes

export async function GET(
  request: NextRequest,
  { params }: { params: { reviewSessionId: string } } // `params` already contains reviewSessionId
) {
  const startTime = Date.now();
  // Use params.reviewSessionId directly from the function arguments
  const { reviewSessionId } = params;

  console.log(`[${new Date().toISOString()}] API Call received: /api/evaluation-report/${reviewSessionId}`);

  if (!reviewSessionId) {
    console.error(`[${new Date().toISOString()}] Validation Error: reviewSessionId is missing.`);
    return NextResponse.json({ error: 'Review session ID is required.' }, { status: 400 });
  }

  try {
    const records = await db
      .select()
      .from(HistoryTable)
      .where(eq(HistoryTable.recordId, reviewSessionId))
      .limit(1);

    if (records.length === 0) {
      console.warn(`[${new Date().toISOString()}] No evaluation report found for reviewSessionId: ${reviewSessionId}`);
      return NextResponse.json({ error: 'Evaluation report not found.' }, { status: 404 });
    }

    const record = records[0];

    let evaluationReport: EvaluationReport;
    if (typeof record.content === 'string') {
      try {
        evaluationReport = JSON.parse(record.content) as EvaluationReport;
      } catch (jsonError: unknown) {
        if (jsonError instanceof Error) {
          console.error(`[${new Date().toISOString()}] Error parsing content for reviewSessionId ${reviewSessionId}:`, jsonError.message);
        } else {
          console.error(`[${new Date().toISOString()}] Error parsing content for reviewSessionId ${reviewSessionId}:`, jsonError);
        }
        console.error(`[${new Date().toISOString()}] Error parsing content for reviewSessionId ${reviewSessionId}:`, jsonError);
        return NextResponse.json({ error: 'Failed to parse stored evaluation report content.' }, { status: 500 });
      }
    } else {
        // This path will be taken if Drizzle automatically parses jsonb columns into objects
        evaluationReport = record.content as EvaluationReport;
    }

    console.log(`[${new Date().toISOString()}] Successfully fetched evaluation report for reviewSessionId: ${reviewSessionId}`);

    const endTime = Date.now();
    console.log(`[${new Date().toISOString()}] API Call completed in ${endTime - startTime}ms.`);

    return NextResponse.json(evaluationReport, { status: 200 });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Fatal API Error fetching evaluation report:`, error);
    return NextResponse.json({ error: 'An internal server error occurred while fetching the report.' }, { status: 500 });
  }
}