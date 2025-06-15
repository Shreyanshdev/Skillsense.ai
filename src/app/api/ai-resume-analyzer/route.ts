// src/app/api/ai-resume-analyzer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { inngest } from "@/inngest/client";
import axios from "axios";
import { getMongoUserEmailFromRequest } from '@/utils/auth';

export const config = { api: { bodyParser: false } };

export async function POST(request: NextRequest) {
  try {
    console.log("--- Start POST request ---");
    const userEmail = await getMongoUserEmailFromRequest(request);
    console.log("User email:", userEmail);

    const form = await request.formData();
    const resumeFile = form.get('resume');
    const recordId   = form.get('recordId');
    console.log("Got resumeFile & recordId:", resumeFile, recordId);

    // load text for PDF preview
    const loader = new WebPDFLoader(resumeFile as Blob);
    const docs   = await loader.load();
    console.log("Loaded PDF, text length:", docs[0]?.pageContent?.length);

    // base64 for the Inngest event data
    const buf    = Buffer.from(await (resumeFile as Blob).arrayBuffer());
    const b64    = buf.toString('base64');
    console.log("Converted to base64, length:", b64.length);

    // fire off your Inngest job
    const sent  = await inngest.send({
      name: "AiResumeAgent",
      data: {
        recordId,
        base64ResumeFile: b64,
        pdfText: docs[0].pageContent,
        userEmail,
      }
    });
    const runId = sent.ids?.[0];
    if (!runId) {
      console.error("⚠️ No runId from inngest.send:", sent);
      return NextResponse.json({ error: "No runId returned" }, { status: 500 });
    }
    console.log("Inngest runId:", runId);

    // poll for completion
    let runStatus: any;
    for (let i = 0; i < 300; i++) {
      runStatus = await getRuns(runId);
      const status = runStatus?.data?.[0]?.status;
      if (status === "Completed") {
        console.log(`Completed after ${i+1} polls.`);
        break;
      }
      await new Promise(r => setTimeout(r, 500));
    }

    // 1) Dump the whole thing so we can inspect it
    console.log("🏃 Full runStatus:", JSON.stringify(runStatus, null, 2));

    // Grab the entire `output` object
  const aiResponse = runStatus.data?.[0]?.output;

    if (!aiResponse) {
      console.warn("⚠️ No `output` object found on runStatus.data[0]");
      return NextResponse.json(
        { error: "AI workflow did not return any output object." },
        { status: 502 }
      );
    }

    // Return it directly
    return NextResponse.json({ success: true, result: aiResponse });
  } 
  catch (error) {
        console.error("❌ /api/ai-resume-analyzer error:", error);
        return NextResponse.json(
          { error: (error as Error).message || "Internal server error" },
          { status: 500 }
      );
    }
  }

async function getRuns(runId: string) {
  const url = `${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`;
  const resp = await axios.get(url, {
    headers: { Authorization: `Bearer ${process.env.INNGEST_API_KEY}` },
  });
  // resp.data should be your { data: [ ... ] }
  return resp.data;
}
