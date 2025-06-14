// src/utils/auth.ts (or src/lib/auth.ts)
import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';
import User from '@/models/User'; // Assuming your Mongoose User model is here
import { connectDB } from '@/lib/dbconnect'; // Assuming your MongoDB connection utility is here

interface UserAuthInfo {
    email: string;
    username: string; // Add username to the interface
}

export async function getMongoUserAuthInfoFromRequest(req: NextRequest): Promise<UserAuthInfo | null> {
    const token = req.cookies.get('token')?.value || ''; // Get token from httpOnly cookie

    if (!token) {
        console.warn("MongoDB Auth: No authentication token found in cookies.");
        return null;
    }

    try {
        // Verify the JWT token
        if (!process.env.JWT_SECRET) {
            console.error("MongoDB Auth: JWT_SECRET environment variable is not defined.");
            return null;
        }
        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);

        // The token payload contains { id: user._id }
        const userId = decodedToken.id;

        if (!userId) {
            console.warn("MongoDB Auth: JWT decoded but no userId found.");
            return null;
        }

        // Ensure MongoDB connection is established before querying
        await connectDB(); // Connect to MongoDB

        // Fetch the user from MongoDB using their ID to get email and username
        // IMPORTANT: Replace 'username' with the actual field name in your User model if different (e.g., 'name')
        const user = await User.findById(userId).select('email username'); // Select both email and username

        if (!user) {
            console.warn(`MongoDB Auth: User with ID ${userId} not found in DB.`);
            return null;
        }

        console.log(`MongoDB Auth: User email retrieved: ${user.email}, Username: ${user.username}`);

        // Return an object with both email and username
        return {
            email: user.email,
            username: user.username || 'User' // Provide a fallback if username is null/undefined
        };
    } catch (error) {
        console.error("MongoDB Auth: Error verifying JWT or fetching user:", error);
        return null;
    }
}

export async function getMongoUserEmailFromRequest(req: NextRequest): Promise<string | null> {
    const token = req.cookies.get('token')?.value || ''; // Get token from httpOnly cookie

    if (!token) {
        console.warn("MongoDB Auth: No authentication token found in cookies.");
        return null;
    }

    try {
        // Verify the JWT token using the secret key stored in environment variables
        if (!process.env.JWT_SECRET) {
            console.error("MongoDB Auth: JWT_SECRET environment variable is not defined.");
            return null;
        }
        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET);

        // The token payload contains { id: user._id }
        const userId = decodedToken.id;

        if (!userId) {
            console.warn("MongoDB Auth: JWT decoded but no userId found.");
            return null;
        }

        // Ensure MongoDB connection is established before querying
        await connectDB(); // Connect to MongoDB

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
        console.error("MongoDB Auth: Error verifying JWT or fetching user:", error);
        return null;
    }
}