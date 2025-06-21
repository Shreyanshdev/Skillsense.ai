// app/api/debug/run-roadmap/route.ts
import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function GET() {
  try {
    await inngest.send({
      name: "AiRoadmapAgent",
      data: {
        roadmapId: "debug-123",
        userInput: "Learn DSA via smoke test",
        timeDuration: "4_6_months",
        userEmail: "smoke@example.com",
      },
    });
    return NextResponse.json({ ok: true, message: "Inngest event sent successfully." });
  } catch (err) {
    console.error("Smoke test error:", err);
    return NextResponse.json({ ok: false, error: (err as any).message }, { status: 500 });
  }
}
