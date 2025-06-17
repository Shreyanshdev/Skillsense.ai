import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import {  AiResumeAgent, AiRoadmapAgent } from "@/inngest/functions";
import { evaluateTestFunction } from "@/inngest/test-evaluation";


// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    
    //AiCareerAgent,
    AiResumeAgent,
    evaluateTestFunction,
    AiRoadmapAgent
  ],
});

