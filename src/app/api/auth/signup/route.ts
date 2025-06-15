import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import User from "@/models/User";
import OTP from "@/models/OTP";
import bcrypt from "bcrypt";
import { mailSender } from "@/utils/nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { db } from '@/lib/db';
import { usersTable as pgUsersTable } from '@/lib/schema'; // Your Drizzle schema for usersTable
import { eq } from 'drizzle-orm'; // For Drizzle queries (e.g., eq for equality)

dotenv.config();
connectDB();

const generateJWT = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();
    if (!username || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Ensure email was verified
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (otpRecord) {
      return NextResponse.json({ success: false, message: "Please verify OTP before signup" }, { status: 400 });
    }

    // Check existing user
    if (await User.findOne({ email })) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // Hash password and save user
    const hashed = await bcrypt.hash(password, 10);
    
     // Generate token and expiry
     const token = generateJWT(email); // or use newUser._id after saving if preferred
     const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
 
     // Create and save user
     const newUser = await new User({
       username,
       email,
       password: hashed,
       isVerified: true,
       token,
       tokenExpiry :tokenExpiry,
     }).save();

     console.log("New user created:", newUser);
 
     // Cleanup OTPs
     await OTP.deleteMany({ email });
 
     // Send welcome email
     await mailSender({ email, emailType: "WELCOME", userId: newUser._id.toString() });
 
     // Set token in cookies
     const response = NextResponse.json({
       success: true,
       message: "Signup successful",
       user: {
         id: newUser._id,
         username,
         email,
         token,
         expiresAt: tokenExpiry,
       },
     }, { status: 201 });
 
     response.cookies.set("token", token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       path: "/",
       maxAge: 7 * 24 * 60 * 60,
       sameSite: "strict",
     });

     try {
      const pgUser = await db.select().from(pgUsersTable).where(eq(pgUsersTable.email, newUser.email)).limit(1);

      if (pgUser.length === 0) {
        // User does not exist in PostgreSQL usersTable, insert them
        await db.insert(pgUsersTable).values({
          name: newUser.username || newUser.email.split('@')[0], // Use username from Mongo or derive from email
          email: newUser.email,
        });
        console.log(`User ${newUser.email} synchronized to PostgreSQL usersTable.`);
      } else {
        console.log(`User ${newUser.email} already exists in PostgreSQL usersTable.`);
        // Optional: Update user details in pgUsersTable if they can change in MongoDB
        await db.update(pgUsersTable).set({ name: newUser.username }).where(eq(pgUsersTable.email, newUser.email));
      }
    } catch (pgSyncError) {
      console.error('PostgreSQL user synchronization error:', pgSyncError);
    }
     return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
