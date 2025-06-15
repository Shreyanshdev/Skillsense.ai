// src/app/api/auth/reset-password/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import User from "@/models/User";
import OTP from "@/models/OTP";
import bcrypt from 'bcrypt'; // Import bcryptjs

connectDB();

export async function POST(request: NextRequest) {
    try {
        const { userId, newPassword } = await request.json();

        if (!userId || !newPassword) {
            return NextResponse.json({ success: false, message: "User ID and new password are required." }, { status: 400 });
        }

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
        }

        // Hash the new password directly in the route
        const salt = await bcrypt.genSalt(10); // Generate salt
        const hashedPassword = await bcrypt.hash(newPassword, salt); // Hash password

        user.password = hashedPassword; // Assign the hashed password

        await user.save(); // Save the user with the hashed password

        // Clean up used OTP records for this email
        await OTP.deleteMany({ email: user.email });

        return NextResponse.json({ success: true, message: "Password reset successfully." }, { status: 200 });

    } catch (error) {
        console.error("Reset password API error:", error);

        // Handle Mongoose validation errors (e.g., password minlength if defined in schema)
        if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ValidationError') {
             const messages = Object.values((error as unknown as { errors: Record<string, { message: string }> }).errors).map((val) => val.message);
             return NextResponse.json({ success: false, message: messages.join(', ') }, { status: 400 });
        }

        // Handle other potential errors
        return NextResponse.json({ success: false, message: "An error occurred during password reset." }, { status: 500 });
    }
}