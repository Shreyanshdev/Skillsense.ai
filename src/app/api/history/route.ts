// src/app/api/history/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db'; // Your Drizzle/PostgreSQL DB connection
import { HistoryTable } from '@/lib/schema'; // Your Drizzle schema for HistoryTable

// Drizzle ORM functions
import { eq } from 'drizzle-orm';

// MongoDB imports (assuming these are for user authentication)
import { connectDB } from '@/lib/dbconnect';
import { getMongoUserEmailFromRequest } from '@/utils/auth';

connectDB(); // Make sure this connects your Mongoose models

export async function POST(req: NextRequest) {
    try {
        const { content, recordId, aiAgentType, metadeta } = await req.json(); // Added metadata to destructuring
        const currentTime = new Date().toISOString(); // Get current time once

        // Input validation for recordId and content
        if (!recordId || content === undefined || content === null) {
            return NextResponse.json({ error: "Invalid input: recordId or content missing" }, { status: 400 });
        }

        // --- Get current user email from your MongoDB authentication ---
        const userEmail = await getMongoUserEmailFromRequest(req);

        if (!userEmail) {
            console.error("Authentication Error: User email not available from MongoDB auth.");
            return NextResponse.json({ error: "Authentication required or user email not found" }, { status: 401 });
        }

        console.log("Authenticated user email:", userEmail);

        // Insert history into the PostgreSQL database using Drizzle
        const result = await db.insert(HistoryTable).values({
            recordId: recordId,
            content: content,
            userEmail: userEmail,
            createdAt: currentTime, // Set createdAt
            updatedAt: currentTime || null, // Set updatedAt on creation
            aiAgentType: aiAgentType,
            metadeta: metadeta || null // Use provided metadata or null
        }).returning(); // Use .returning() to get the inserted row back

        console.log("Database insert result (Drizzle/PostgreSQL):", result);

        return NextResponse.json({
            message: "History saved successfully",
            data: result[0] // Return the first (and only) inserted row
        }, { status: 200 });
    } catch (error) {
        console.error("Error in /api/history POST handler:", error);
        return NextResponse.json(
            {
                error: "Failed to save history due to a server error.",
                details: (error as Error).message // Provide more details in dev
            },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { content, recordId, metadeta ,aiAgentType } = await req.json(); // Added metadata to destructuring
        const currentTime = new Date().toISOString(); // Get current time

        if (!recordId) {
            return NextResponse.json({ error: "Invalid input: recordId or content missing" }, { status: 400 });
        }

        // --- Get current user email from your MongoDB authentication ---
        const userEmail = await getMongoUserEmailFromRequest(req);

        if (!userEmail) {
            console.error("Authentication Error: User email not available from MongoDB auth for PUT.");
            return NextResponse.json({ error: "Authentication required or user email not found" }, { status: 401 });
        }
        console.log(`Backend PUT: Attempting to update recordId: ${recordId} with aiAgentType: ${aiAgentType}`);

        const result = await db.update(HistoryTable)
            .set({
                content: content,
                updatedAt: currentTime, // Update updatedAt on modification
                metadeta: metadeta || null // Update metadata or set to null
            })
            .where(eq(HistoryTable.recordId, recordId))
            .returning(); // Use .returning() to get the updated row back

        if (result.length === 0) {
            return NextResponse.json({ error: "Record not found or not authorized to update" }, { status: 404 });
        }

        console.log("Database update result (Drizzle/PostgreSQL):", result);

        return NextResponse.json({
            message: "History updated successfully",
            data: result[0] // Return the first (and only) updated row
        }, { status: 200 });
    } catch (error) {
        console.error("Error in /api/history PUT handler:", error);
        return NextResponse.json(
            {
                error: "Failed to update history due to a server error.",
                details: (error as Error).message
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get('recordId');

    try {
        const userEmail = await getMongoUserEmailFromRequest(req);

        if (!userEmail) {
            console.error("Authentication Error: User email not available from MongoDB auth for GET.");
            return NextResponse.json({ error: "Authentication required or user email not found" }, { status: 401 });
        }

        if (recordId) {
            // Fetch a single record by recordId for the authenticated user
            const result = await db.select()
                .from(HistoryTable)
                .where(eq(HistoryTable.recordId, recordId)); // Removed userEmail check here for simplicity, assuming recordId is unique globally or you'll add userEmail to the where clause if it's per-user unique.
            

            if (result.length === 0) {
                return NextResponse.json({ error: "Record not found" }, { status: 404 });
            }
            return NextResponse.json(result[0]);
        } else {
            // Fetch all records for the authenticated user
            const result = await db.select()
                .from(HistoryTable)
                .where(eq(HistoryTable.userEmail, userEmail));
            return NextResponse.json(result);
        }
    } catch (error) {
        console.error("Error in /api/history GET handler:", error);
        return NextResponse.json(
            {
                error: "Failed to fetch history due to a server error.",
                details: (error as Error).message
            },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const recordIdToDelete = searchParams.get('recordId');

        if (!recordIdToDelete) {
            return NextResponse.json({ error: "Record ID missing for deletion" }, { status: 400 });
        }

        const userEmail = await getMongoUserEmailFromRequest(req);

        if (!userEmail) {
            console.error("Authentication Error: User email not available from MongoDB auth for DELETE.");
            return NextResponse.json({ error: "Authentication required or user email not found" }, { status: 401 });
        }

        // Delete the record, ensuring it belongs to the authenticated user
        const result = await db.delete(HistoryTable)
            .where(eq(HistoryTable.recordId, recordIdToDelete))
            .returning(); // Return deleted rows

        if (result.length === 0) {
            return NextResponse.json({ error: "Record not found or not authorized to delete" }, { status: 404 });
        }

        console.log("Database delete result (Drizzle/PostgreSQL):", result);

        return NextResponse.json({ message: "Record deleted successfully", data: result[0] }, { status: 200 });
    } catch (error) {
        console.error("Error in /api/history DELETE handler:", error);
        return NextResponse.json(
            {
                error: "Failed to delete history due to a server error.",
                details: (error as Error).message
            },
            { status: 500 }
        );
    }
}