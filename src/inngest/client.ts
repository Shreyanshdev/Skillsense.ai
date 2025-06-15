import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "skillsense.ai",
    signingKey: process.env.INNGEST_SIGNING_KEY, 
 });
