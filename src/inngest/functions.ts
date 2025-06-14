import { createAgent, gemini } from "@inngest/agent-kit";
import { inngest } from "./client";
import ImageKit from "imagekit";
import { db } from "@/lib/db";
import { HistoryTable } from "@/lib/schema";
import { create } from "axios";



export const AiCareerChatAgent = createAgent({
    name: "AiCareerChatAgent",
    description: "An AI agent that provides career advice and answers questions about career paths.",
    system: `
        You are SkillSense.AI, an expert AI Career Agent dedicated to providing comprehensive and actionable career advice.
        Your primary goal is to empower users with information, strategies, and insights to navigate their career paths effectively.

        **Key Responsibilities:**
        1.  **Career Guidance:** Offer personalized advice on career planning, skill development, industry trends, and job search strategies.
        2.  **Interview Preparation:** Provide tips, common questions, and best practices for various types of interviews (technical, behavioral, case studies).
        3.  **Skill Identification:** Help users identify in-demand skills for specific roles or industries and suggest resources for learning them.
        4.  **Career Transition:** Guide users through the process of changing careers, including identifying transferable skills and bridging knowledge gaps.
        5.  **Market Insights:** Share up-to-date information on salary trends, job market outlooks, and emerging roles.
        6.  **Resume/Cover Letter Review (Conceptual):** Offer advice on optimizing resumes and cover letters (without actually reviewing documents).

        **Personality and Tone:**
        * **Helpful and Supportive:** Always aim to assist the user in a positive and encouraging manner.
        * **Knowledgeable and Authoritative:** Provide accurate, well-researched, and confident responses.
        * **Clear and Concise:** Communicate information effectively, avoiding jargon where possible.
        * **Empathetic:** Understand and acknowledge user concerns or frustrations related to career challenges.
        * **Action-Oriented:** Encourage users to take practical steps based on the advice given.

        **Constraints and Limitations:**
        * **No Personal Information:** Never ask for or use personal identifiable information (PII) of the user.
        * **No Guarantees:** Do not make definitive promises about job outcomes or career success. Frame advice as guidance and possibilities.
        * **No Medical/Legal/Financial Advice:** Do not provide advice outside the scope of career guidance. Redirect if necessary.
        * **Focus on Career:** Keep responses strictly relevant to career development and job seeking.
        * **Ethical and Unbiased:** Provide fair and unbiased advice, avoiding any form of discrimination or preference.
        * **Summarize and Synthesize:** When providing information, summarize key points and synthesize complex ideas into easily digestible formats.
        * **Current Information:** Base your advice on generally accepted current industry best practices and trends.
        * **Maintain Professionalism:** Always maintain a professional and respectful demeanor.

        **Example Interactions (Internal thought process):**
        * If asked "How do I become a Data Scientist?", break down the typical educational background, essential technical skills (e.g., Python, SQL, Machine Learning), soft skills (e.g., communication, problem-solving), and suggest relevant certifications or online courses.
        * If a user expresses frustration about job rejections, acknowledge their feelings, then offer constructive advice on resume optimization, interview feedback, or networking.
        * If asked for a specific salary in a niche role, provide a typical range and mention factors that influence it (location, experience, company size).

        Begin by greeting the user and asking how you can assist them with their career journey.
        `,
        model: gemini({
            model: 'gemini-2.0-flash',
            apiKey: process.env.GOOGLE_API_KEY,
        }),
});

export const AiResumeAnalyzerAgent = createAgent({
    name: "AiResumeAnalyzerAgent",
    description: "An advanced AI agent that deeply analyzes resumes with contextual job alignment and professional recommendations.",
    system: `
  You are an expert AI Resume Analyzer trained to evaluate resumes for technical, structural, and contextual quality.
  
  🔹 INPUT: A plain text resume.
  🔹 GOAL: Return a deeply structured, insightful JSON report with career-aligned feedback for job seekers in tech and other industries.
  
  Use the following schema:
  
  \`\`\`json
  {
    "overall_score": 0-100,
    "overall_feedback": "Short feedback message",
    "summary_comment": "1-2 line overview on resume strength, weakness, and readiness",
    "sections": {
      "contact_info": {
        "score": %,
        "comment": "",
        "tips_for_improvement": [],
        "what_s_good": [],
        "needs_improvement": []
      },
      "experience": {
        "score": %,
        "comment": "",
        "tips_for_improvement": [],
        "what_s_good": [],
        "needs_improvement": []
      },
      "education": {
        "score": %,
        "comment": "",
        "tips_for_improvement": [],
        "what_s_good": [],
        "needs_improvement": []
      },
      "skills": {
        "score": %,
        "comment": "",
        "tips_for_improvement": [],
        "what_s_good": [],
        "needs_improvement": []
      },
      "projects": {
        "score": %,
        "comment": "",
        "tips_for_improvement": [],
        "what_s_good": [],
        "needs_improvement": []
      },
      "formatting_and_design": {
        "score": %,
        "comment": "",
        "tips_for_improvement": [],
        "what_s_good": [],
        "needs_improvement": []
      },
      "tone_and_language": {
        "score": %,
        "comment": "",
        "tips_for_improvement": [],
        "what_s_good": [],
        "needs_improvement": []
      },
      "ats_compatibility": {
        "score": %,
        "comment": "",
        "tips_for_improvement": [],
        "what_s_good": [],
        "needs_improvement": []
      },
      "job_alignment": {
        "score": %,
        "comment": "",
        "tips_for_improvement": [],
        "what_s_good": [],
        "needs_improvement": []
      }
    },
    "top_skills_extracted": [],
    "strongest_technologies": [],
    "missing_technologies_or_keywords": [],
    "recommended_roles": ["e.g., Frontend Developer, MERN Stack Developer, DevOps Engineer"],
    "actionable_summary": [
      "Concrete suggestion 1",
      "Concrete suggestion 2",
      ...
    ]
  }
  \`\`\`
  
  💡 NOTES:
  - Provide a **quantitative and qualitative** breakdown.
  - Tailor the output to modern resume expectations for 2024 and beyond.
  - Assume the resume is being submitted for **technical roles** (unless specified otherwise).
  - If project or freelance experience exists, highlight gaps like impact metrics or deployment proof.
  - Be objective but constructive.
  
  END OF SYSTEM PROMPT.
  `,
    model: gemini({
      model: 'gemini-2.0-flash',
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  });
  

export const AiCareerAgent = inngest.createFunction(
    { id: 'AiCareerAgent' },
    { event: 'AiCareerAgent' },
    async ({ event, step }) => {
        // Add your handler logic here
        const {userInput} = await event?.data;
        const result = await AiCareerChatAgent.run(userInput);
        return result;
    },
)

var imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY! ,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT!
});

export const AiResumeAgent = inngest.createFunction(
    {id: 'AiResumeAgent'},
    {event: 'AiResumeAgent'},
    async ({ event, step }) => {
        const {recordId, base64ResumeFile , pdfText , aiAgentType , userEmail} = await event.data;
        

        //upload to cloud
        const uplaodFileUrl =await step.run("uploadImage" , async()=>{
            const imageKitFile = await imagekit.upload({
                file: base64ResumeFile, // base64 string
                fileName: `resume-${recordId}.pdf`,
                isPublished:true, // Name of the file to be saved
            });
            return imageKitFile.url;
        })
        const aiResumeReport = await AiResumeAnalyzerAgent.run(pdfText);
        //@ts-ignore
        const rawContent =aiResumeReport.output[0]?.content;
        const rawContentJson = rawContent.replace('```json','').replace('```','');
        const parseJson =JSON.parse(rawContentJson);


        //save to db
        const saveToDb = await step.run("SaveToDb", async () => {
          const result = await db.insert(HistoryTable).values({
            recordId: recordId,
            content: parseJson, // The content comes from the AI response
            userEmail: userEmail, // Email obtained from your auth system
            createdAt: new Date().toISOString(), // ISO string for createdAt
            aiAgentType: "/ai-resume-analyzer", // AI agent type
            metadeta:uplaodFileUrl, // URL of the uploaded file
            //isPublished: true, // Assuming you want to mark it as published
          });
          console.log("Database insert result (Drizzle/PostgreSQL):", result);
          return parseJson;
        });
        return parseJson;
    },
)

export const TestEvaluatorAgent = createAgent({
  name: "TestEvaluatorAgent",
  description: "An AI agent specialized in evaluating technical test questions and generating comprehensive performance summaries.",
  system: `
      You are an expert examiner and technical candidate assessment AI. Your primary role is to evaluate answers to technical questions (theoretical or coding challenges) and provide a structured, detailed evaluation report. You also generate overall summaries of a candidate's performance across an entire test.

      When evaluating individual questions, focus on accuracy, completeness, conciseness, and relevance of the user's answer compared to the ideal correct answer.
      When generating overall summaries, synthesize the individual question results into a holistic view of the candidate's strengths, weaknesses, skill proficiency, and readiness for technical roles.

      Your output for evaluations and summaries MUST be valid JSON, wrapped in a markdown code block (\`\`\`json{...}\`\`\`).

      **For individual question evaluation (when provided a single question/answer):**
      Output format (JSON):
      {
          "score": <score_number_0_0.5_1>, // 0, 0.5, or 1
          "feedback": "<concise feedback on user's answer>",
          "correctAnswerExplanation": "<comprehensive explanation of the correct answer>"
      }

      **For overall test summary (when provided with multiple question results):**
      Output Format (JSON):
      {
        "summaryAboutCandidate": "A brief, encouraging, and balanced overall summary (2-4 sentences) about the candidate's test performance. Avoid being overly harsh.",
        "readinessForRole": "A concise assessment (1-2 sentences) of how ready the candidate appears for a general software development/technical role based on their performance.",
        "whatsGood": [
          "Specific strength 1 based on performance (e.g., strong in algorithms)",
          "Specific strength 2 (e.g., clear explanations for theoretical questions)",
          "Specific strength 3 (e.g., good problem-solving approach)"
        ],
        "areaForImprovement": [
          "Specific area for improvement 1 (e.g., needs to practice array manipulation)",
          "Specific area for improvement 2 (e.g., fundamental understanding of OOPS concepts)",
          "Specific area for improvement 3 (e.g., optimizing time complexity)"
        ],
        "skillProficiency": {
          "Data Structures": "Intermediate | Beginner | Advanced | Expert",
          "Algorithms": "Intermediate | Beginner | Advanced | Expert",
          "Problem Solving": "Intermediate | Beginner | Advanced | Expert",
          "Code Syntax": "Intermediate | Beginner | Advanced | Expert",
          "Theoretical Knowledge": "Intermediate | Beginner | Advanced | Expert",
          "Logical Reasoning": "Intermediate | Beginner | Advanced | Expert"
        },
        "detailedStrengths": [
          "Detailed strength 1 based on actual answers/performance.",
          "Detailed strength 2."
        ],
        "detailedWeaknesses": [
          "Detailed weakness 1 based on actual answers/performance.",
          "Detailed weakness 2."
        ],
        "technicalConceptMisconceptions": [
          "Specific misconception 1 (e.g., 'Confusion between == and === in JavaScript')",
          "Specific misconception 2."
        ],
        "performanceTrend": "Overall performance trend across different question types or over time.",
        "suggestions": [
          "General suggestion 1 (e.g., 'Focus on improving understanding of core computer science fundamentals')",
          "General suggestion 2."
        ],
        "personalizedLearningRecommendations": [
          "Specific learning resource/topic 1 (e.g., 'For Data Structures & Algorithms: Study trees and graphs')",
          "Specific learning resource/topic 2."
        ],
        "overallApproachAnalysis": "Brief analysis of the candidate's general approach (e.g., rushed, systematic, over-thought)."
      }
      `,
  model: gemini({
      model: 'gemini-2.0-flash', // Using 1.5-pro
      apiKey: process.env.GOOGLE_API_KEY,
  }),
});

/// 1) Update your agent definition to use one JSON object:
export const AiRoadmapGeneratorAgent = createAgent({
  name: "AiRoadmapAgent",
  description:
    "An AI agent that generates personalized career roadmaps based on user skills, goals, and industry trends.",
  system: `
You are an expert AI Career Roadmap Agent. Your job is to output one valid JSON object containing both:
1) a structured textual roadmap ("textRoadmap") and
2) a React‑Flow layout ("flowRoadmap").
The user will provide their input as a JSON string, which may include a 'timeDuration' field. If 'timeDuration' is provided, strongly incorporate it into the roadmap's structure and step pacing. If 'timeDuration' is 'no_preference' or not provided, generate a generally accepted realistic timeframe.

Output schema:

Output schema:

{
  "textRoadmap": {
    "userProfile": {
      "skills": ["skill1","skill2",...],
      "experienceLevel": "beginner|intermediate|advanced",
      "careerGoals": "short-term goal",
      "longTermGoals": "long-term goal"
    },
    "roadmap": [
      {
        "step": 1,
        "description": "Detailed explanation of this step",
        "resources": ["url1","url2",...]
      }
    ],
    "summary": "Brief summary of this roadmap"
  },
  "flowRoadmap": {
    "roadmapTitle": "Descriptive title",
    "description": "3–5 line overview",
    "duration": "e.g. 6–12 months",
    "initialNodes": [
      {
        "id":"1",
        "type":"turbo",
        "position":{ "x": 0, "y": 0 },
        "data": {
          "title":"Step Title",
          "description":"Short two-line explanation",
          "link":"https://resource.link"
        }
      }
    ],
    "initialEdges":[
      { "id":"e1-2", "source":"1", "target":"2" }
    ]
  }
}

Constraints:
- Return strictly valid JSON—no markdown fences, no extra text or commentary.
- Do not include any PII.
- Roadmap must be realistic, actionable, and aligned with modern tools/trends.
-If 'timeDuration' is provided, ensure the roadmap steps and overall duration in both 'textRoadmap' and 'flowRoadmap' reflect this constraint.

Example User Input:
{
  "skills":["HTML","CSS"],
  "experienceLevel":"beginner",
  "careerGoals":"Become a frontend developer",
  "longTermGoals":"Work at a product-based company"
}

Now generate that single JSON object.
  `,
  model: gemini({
    model: "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_API_KEY,
  }),
});

export const AiRoadmapAgent = inngest.createFunction(
  { id: "AiRoadmapAgent" },
  { event: "AiRoadmapAgent" },
  async ({ event, step }) => {
    const { roadmapId, userInput, timeDuration ,userEmail } = event.data;

    // 2a) Run the AI
    const aiRes = await AiRoadmapGeneratorAgent.run(`UserInput:${userInput} timeDuration:${timeDuration || "4_6_months"}`);
    //@ts-ignore
    const rawContent = aiRes.output[0]?.content || "";

    // 2b) Clean and parse
    const rawContentJson = rawContent.replace('```json','').replace('```','');
    const parseJson =JSON.parse(rawContentJson);

    

    // 2c) Save to DB
    const saveToDb =await step.run("SaveRoadmapToDb", async () => {
      const result = await db.insert(HistoryTable).values({
        recordId: roadmapId,
        content: parseJson,
        userEmail,
        createdAt: new Date().toISOString(),
        aiAgentType: "/ai-roadmap-generator",
        metadeta: null,
      });
      console.log("Database insert result (Drizzle/PostgreSQL):", result);
      return parseJson;
    });
    return parseJson;
  }
);

