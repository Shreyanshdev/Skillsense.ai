import { inngest } from "@/inngest/client";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getMongoUserEmailFromRequest } from '@/utils/auth';


export async function POST(req: NextRequest) {
    const {roadmapId , userInput , timeDuration} = await req.json();
    console.log(" /api/ai-chat hit"); // <— debug line
    const user = await getMongoUserEmailFromRequest(req);
    
    // Dispatch to Inngest
    const resultIds = await inngest.send({
        name: "AiRoadmapAgent",
        data: {
             userInput: userInput,
             roadmapId: roadmapId,
            userEmail:user,
            timeDuration: timeDuration || "4_months", // Include time duration if provided
        },
    });

    const runId = resultIds?.ids?.[0];
    if (!runId) {
        return NextResponse.json({ error: "No runId returned from Inngest" }, { status: 500 });
    }

    // Poll for completion (with timeout)
    let runStatus: any;
    let attempts = 0;
    const maxAttempts = 100; // ~15 seconds

    while (attempts < maxAttempts) {
        runStatus = await getRuns(runId);
        if (Array.isArray(runStatus?.data) && runStatus.data[0]?.status === "Completed") {
        break;
        }
        attempts++;
        await new Promise((r) => setTimeout(r, 5000));
    }

    if (attempts >= maxAttempts) {
        return NextResponse.json(
        { error: "Timeout waiting for Inngest to complete" },
        { status: 504 }
        );
    }

    return NextResponse.json(runStatus.data?.[0]?.output);
    }

    async function getRuns(runId: string) {
    const url = `${process.env.INNGEST_SERVER_HOST}/v1/events/${runId}/runs`;
    const resp = await axios.get(url, {
        headers: { Authorization: `Bearer ${process.env.INNGEST_API_KEY}` },
    });
    return resp.data;
    }
