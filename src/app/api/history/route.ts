// src/app/api/history/route.ts
import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest for cookie access
import { db } from '@/lib/db'; // Your Drizzle/PostgreSQL DB connection
import { HistoryTable } from '@/lib/schema'; // Your Drizzle schema for HistoryTable

// MongoDB imports
import { connectDB } from '@/lib/dbconnect'; // Your MongoDB connection utility
import User from '@/models/User'; // Your Mongoose User model
import jwt from 'jsonwebtoken'; // For JWT verification

// Ensure MongoDB connection is established for this API route
connectDB(); // Make sure this connects your Mongoose models

// --- Custom function to get user email from your MongoDB authentication ---
// This function will:
// 1. Read the 'token' cookie from the incoming request.
// 2. Verify the JWT from the cookie.
// 3. Extract the user ID from the JWT payload.
// 4. Fetch the user's document from MongoDB using the ID to get their email.
async function getMongoUserEmailFromRequest(req: NextRequest): Promise<string | null> {
    const token = req.cookies.get('token')?.value || ''; // Get token from httpOnly cookie

    if (!token) {
        console.warn("MongoDB Auth: No authentication token found in cookies.");
        return null;
    }

    try {
        // Verify the JWT token
        // Use your JWT_SECRET from environment variables
        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET!);

        // The token payload contains { id: user._id }
        const userId = decodedToken.id;

        if (!userId) {
            console.warn("MongoDB Auth: JWT decoded but no userId found.");
            return null;
        }

        // Fetch the user from MongoDB using their ID to get the email
        // We do not select password here, as it's not needed.
        const user = await User.findById(userId).select('email');

        if (!user) {
            console.warn(`MongoDB Auth: User with ID ${userId} not found in DB.`);
            return null;
        }

        console.log(`MongoDB Auth: User email retrieved: ${user.email}`);
        return user.email;

    } catch (error) {
        console.error("MongoDB Auth Error: Failed to verify token or retrieve user:", error);
        // Specifically catch common JWT errors for better logging
        if (error instanceof jwt.JsonWebTokenError) {
            console.error("JWT Error:", error.message);
        } else if (error instanceof jwt.TokenExpiredError) {
            console.error("JWT Expired Error:", error.message);
        }
        return null;
    }
}


export async function POST(req : NextRequest) { // Changed 'req : Request' to 'req : NextRequest' for cookie access
    try {
        const {content ,recordId} = await req.json();

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
            createdAt: new Date().toISOString() // ISO string for createdAt
        });

        console.log("Database insert result (Drizzle/PostgreSQL):", result);

        return NextResponse.json({
            message: "History saved successfully",
            data: result
        }, {status: 200});
    }
    catch(e : any){
        // Comprehensive error logging
        console.error("Error in /api/history POST handler:", e);
        console.error("Error message:", e.message);
        if (e.stack) {
            console.error("Error stack:", e.stack);
        }

        // Return a more informative error response during development
        return NextResponse.json(
            {
                error: "Failed to save history due to a server error.",
                details: process.env.NODE_ENV === 'development' ? e.message : undefined // Show details only in dev
            },
            {status: 500}
        );
    }
}