import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { AiCareerAgent } from "@/inngest/functions";
import { createAgent, anthropic } from '@inngest/agent-kit';
import { openai } from "inngest";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    AiCareerAgent,
  ],
});

