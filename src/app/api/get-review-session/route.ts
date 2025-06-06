// src/app/api/get-review-session/route.ts (for App Router)
// Or src/pages/api/get-review-session.ts (for Pages Router)

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbconnect';
import ReviewSession from '@/models/ReviewSession';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const reviewSessionId = searchParams.get('id');
        const userId = searchParams.get('userId'); // Get userId from query params

        if (!reviewSessionId || !userId) {
            return NextResponse.json(
                { error: 'Missing required query parameters: id and userId.' },
                { status: 400 }
            );
        }

        // Find the review session by its _id and userId to ensure ownership
        const reviewSession = await ReviewSession.findOne({
            _id: new mongoose.Types.ObjectId(reviewSessionId),
            userId: userId,
        });

        if (!reviewSession) {
            return NextResponse.json({ error: 'Review session not found or unauthorized.' }, { status: 404 });
        }

        // Convert Mongoose document to a plain JavaScript object before sending
        return NextResponse.json(reviewSession.toObject(), { status: 200 });

    } catch (error: any) {
        console.error('Error fetching review session:', error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}