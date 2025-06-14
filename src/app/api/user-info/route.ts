// src/app/api/user-info/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMongoUserAuthInfoFromRequest } from '@/utils/auth'; // Adjust path if needed

export async function GET(req: NextRequest) {
    try {
        const userInfo = await getMongoUserAuthInfoFromRequest(req);

        if (!userInfo) {
            return NextResponse.json({ message: "Not authenticated or user not found" }, { status: 401 });
        }

        return NextResponse.json(userInfo, { status: 200 });
    } catch (error) {
        console.error("API /api/user-info error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}