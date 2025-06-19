// src/utils/auth.ts (or src/lib/auth.ts)
import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';
// IMPORTANT: Removed User model import and connectDB import.
// import User from '@/models/User';
// import { connectDB } from '@/lib/dbconnect';

// Define the shape of your Access Token payload
interface AccessTokenPayload extends jwt.JwtPayload {
    id: string; // The user's MongoDB _id
    email: string;
    username: string; // Ensure this matches the field in your User model
}

/**
 * Extracts user authentication information (email, username, id) directly from the JWT in the request cookies.
 * Does NOT perform a database lookup for user details, relying solely on the JWT payload.
 *
 * @param req The NextRequest object.
 * @returns An object containing user id, email, and username, or null if token is invalid/missing data.
 */
export async function getMongoUserAuthInfoFromRequest(req: NextRequest): Promise<AccessTokenPayload | null> {
    const token = req.cookies.get('token')?.value || ''; // Get token from httpOnly cookie

    if (!token) {
        // In a real application, you might want to return a specific error type
        // or re-direct to login if called in a protected route handler.
        return null;
    }

    try {
        if (!process.env.JWT_SECRET) {
            // This is a critical configuration error, should be caught at app startup or deployment.
            // For a serverless function, it's safer to throw or return null.
            return null;
        }

        // Verify the JWT token and cast it to our custom payload interface.
        // This will throw if the token is invalid or expired.
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as AccessTokenPayload;

        // Check if essential data is present in the decoded token.
        // This ensures the token was correctly structured by your backend.
        if (!decodedToken.id || !decodedToken.email || !decodedToken.username) {
            // Token is valid but missing expected payload fields.
            return null;
        }

        // Return the essential user info directly from the token.
        return {
            id: decodedToken.id,
            email: decodedToken.email,
            username: decodedToken.username
        };
    } catch (error) {
        // JWT verification failed (e.g., TokenExpiredError, JsonWebTokenError, etc.).
        // In a real application, this would typically lead to a re-authentication flow
        // (e.g., redirect to login, trigger refresh token if client-side).
        // Since we are strictly removing console logs, we just return null.
        return null;
    }
}

/**
 * Extracts user email directly from the JWT in the request cookies.
 * This function is a convenience wrapper around getMongoUserAuthInfoFromRequest.
 *
 * @param req The NextRequest object.
 * @returns The user's email, or null if token is invalid/missing email.
 */
export async function getMongoUserEmailFromRequest(req: NextRequest): Promise<string | null> {
    const userInfo = await getMongoUserAuthInfoFromRequest(req);
    // If userInfo is null, or email is missing, return null.
    return userInfo?.email || null;
}