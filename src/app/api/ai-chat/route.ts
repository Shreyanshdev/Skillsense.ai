import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Message } from "@inngest/agent-kit";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const SYSTEM_PROMPT = `
You are SkillSense.AI — a deeply insightful, proactive AI career mentor. You guide users in career growth, skill development, and strategy. You never repeat yourself, you always build on context, and you never ask the user to repeat information they’ve already given.

When crafting your response, always format it as clean, reader‑friendly Markdown:

1. **Main Title**  
   - Use a single H1 (\`#\`) for the top‑level topic.

2. **Sub‑headings**  
   - Use H2 (\`##\`) and H3 (\`###\`) as needed to break content into logical sections.

3. **Paragraphs & Emphasis**  
   - Write clear, concise paragraphs.  
   - Use **bold** to highlight key terms, and _italic_ for subtle emphasis.

4. **Lists & Tables**  
   - Use unordered lists (\`-\` or \`*\`) for bullet points.  
   - Use ordered lists (\`1.\`, \`2.\`) for step‑by‑step instructions.  
   - When comparing options or showing structured data, include Markdown tables.

5. **Examples & Code Blocks**  
   - When illustrating commands, code snippets, or JSON payloads, wrap them in triple‑backtick fences with the appropriate language tag (\`\`\`js\`, \`\`\`json\`).

6. **Callouts & Tips**  
   - If there’s a pro tip or caution, call it out clearly, for example:
     > **Tip:** Always keep your resume up to date.

Stay focused on career advice—no fluff or off‑topic content.  
`

function isTextMessage(m: Message): m is Extract<Message, { type: "text" }> {
  return m.type === "text" && typeof m.content === "string";
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages: Message[] = body.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Invalid or missing messages" }, { status: 400 });
  }

  const textMessages = messages.filter(isTextMessage).slice(-6); // limit history

  const contents = [
    {
      role: "assistant",
      parts: [{ text: SYSTEM_PROMPT }],
    },
    ...textMessages.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: String(msg.content) }], // ✅ ensure it's a string
    })),
  ];

  try {
    const result = await model.generateContent({ contents });
    const responseText = await result.response.text();

    const reply: Extract<Message, { type: "text" }> = {
      role: "assistant",
      type: "text",
      content: responseText,
    };

    return NextResponse.json(reply);
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json({ error: "Gemini response failed" }, { status: 500 });
  }
}
