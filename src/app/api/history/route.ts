// src/app/api/history/route.ts
import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest for cookie access
import { db } from '@/lib/db'; // Your Drizzle/PostgreSQL DB connection
import { HistoryTable } from '@/lib/schema'; // Your Drizzle schema for HistoryTable

// MongoDB imports
import { connectDB } from '@/lib/dbconnect'; // Your MongoDB connection utility
import { eq } from 'drizzle-orm';
import { getMongoUserEmailFromRequest } from '@/utils/auth';

// Ensure MongoDB connection is established for this API route
connectDB(); // Make sure this connects your Mongoose models


export async function POST(req : NextRequest) { // Changed 'req : Request' to 'req : NextRequest' for cookie access
    try {
        const {content ,recordId , aiAgentType} = await req.json();
        // Log received data for debugging
        console.log("Received recordId:", recordId);
        console.log("Received content:", content);

        // Input validation for recordId and content
        if (!recordId || content === undefined || content === null) { // Check for content explicitly
            console.error("Validation Error: Missing recordId or content.");
            return NextResponse.json({error: "Invalid input: recordId or content missing"}, {status: 400});
        }

        // --- Get current user email from your MongoDB authentication ---
        const userEmail = await getMongoUserEmailFromRequest(req); // Pass NextRequest object

        if (!userEmail) {
            console.error("Authentication Error: User email not available from MongoDB auth.");
            // Return 401 Unauthorized if authentication is mandatory for this endpoint
            return NextResponse.json({ error: "Authentication required or user email not found" }, { status: 401 });
        }

        console.log("Authenticated user email:", userEmail);
        

        // Insert history into the PostgreSQL database using Drizzle
        const result = await db.insert(HistoryTable).values({
            recordId: recordId,
            content: content, // The content comes from the frontend request
            userEmail: userEmail, // Email obtained from your MongoDB auth
            createdAt: new Date().toISOString(), // ISO string for createdAt
            aiAgentType: aiAgentType // AI agent type from the request
        });

        console.log("Database insert result (Drizzle/PostgreSQL):", result);

        return NextResponse.json({
            message: "History saved successfully",
            data: result
        }, {status: 200});
    }
    catch(error){
        // Comprehensive error logging
        console.error("Error in /api/history POST handler:", error);
        console.error("Error message:", (error as Error).message);

        // Return a more informative error response during development
        return NextResponse.json(
            {
                error: "Failed to save history due to a server error.",
            },
            {status: 500}
        );
    }
}

export async function PUT(req: NextRequest) {

    try{
        const {content ,recordId} = await req.json();
        const result = await db.update(HistoryTable).set({
            recordId: recordId,
            content: content, // The content comes from the frontend request
        }).where(eq(HistoryTable.recordId, recordId)); 
        return NextResponse.json(result);
    }catch(e){
        console.error("Error in /api/history PUT handler:", e);
        return NextResponse.json({ error: "Failed to update history" }, { status: 500 });
    }
    
}

export async function GET(req: NextRequest) {
    const{searchParams} = new URL(req.url);
    const recordId =searchParams.get('recordId') ;
    const userEmail = await getMongoUserEmailFromRequest(req);
    try{
        if(recordId){
            const result=await db.select().from(HistoryTable).where(eq(HistoryTable.recordId,recordId));
            return NextResponse.json(result[0]);
        }
        else{
            if (!userEmail) {
                console.error("Validation Error: User email is null or undefined.");
                return NextResponse.json({ error: "User email not found" }, { status: 400 });
            }

            const result = await db.select().from(HistoryTable).where(eq(HistoryTable.userEmail, userEmail));
            return NextResponse.json(result);
        }
        return NextResponse.json({})
    }catch(e){
        console.error("Error in /api/history GET handler:", e);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}
