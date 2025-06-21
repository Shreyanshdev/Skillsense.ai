// src/utils/auth.ts (or src/lib/auth.ts)
import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

// Define the shape of your Access Token payloadt
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
        return null;
    }

    try {
        if (!process.env.JWT_SECRET) {
            return null;
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as AccessTokenPayload;

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
    return userInfo?.email || null;
}