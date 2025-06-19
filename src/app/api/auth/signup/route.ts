import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import User, { IRefreshToken } from "@/models/User";
import OTP from "@/models/OTP";
import bcrypt from "bcrypt";
import { mailSender } from "@/utils/nodemailer";
// dotenv.config() removed, as Next.js handles environment variables automatically.
import { db } from '@/lib/db';
import { usersTable as pgUsersTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { generateAccessToken, generateRefreshToken } from '@/utils/authTokens';

export async function POST(request: NextRequest) {
  try {
    // Ensure DB connection is established per request, good for serverless.
    await connectDB(); 

    const { username, email, password } = await request.json();
    if (!username || !email || !password) {
      // All fields are required.
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // If an OTP record exists, it implies an OTP was sent earlier and needs verification.
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (otpRecord) {
      // User must verify OTP from a prior request before proceeding with signup here.
      return NextResponse.json({ success: false, message: "Please verify OTP before signup" }, { status: 400 });
    }

    // Check if user already exists.
    if (await User.findOne({ email })) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: true, // Assuming this means account is verified at signup (review with OTP flow).
    });

    // Generate refresh token.
    const { token: refreshToken, jti, expiresAt } = generateRefreshToken(newUser._id.toString());

    // Store refresh token details in MongoDB.
    const newRefreshTokenEntry: IRefreshToken = {
      jti: jti,
      createdAt: new Date(),
      expiresAt: expiresAt,
      invalidated: false,
    };

    newUser.refreshTokens.push(newRefreshTokenEntry); // Add to user's refreshTokens array.
    await newUser.save(); // Save new user document.

    // Delete any pending OTPs for this email after successful signup.
    await OTP.deleteMany({ email });

    // Send welcome email after signup.
    await mailSender({ email, emailType: "WELCOME", userId: newUser._id.toString() });

    // Generate access token.
    const accessToken = generateAccessToken(newUser);

    // Prepare success response with user data.
    const response = NextResponse.json({
      success: true,
      message: "Signup successful",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    }, { status: 201 });

    // Set Access Token cookie.
    response.cookies.set("token", accessToken, {
      httpOnly: true, // Prevents client-side JS access.
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production.
      path: "/", // Valid for all paths.
      maxAge: 15 * 60, // Access token expiry (15 mins).
      sameSite: "strict", // CSRF protection.
    });

    // Set Refresh Token cookie.
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true, // Prevents client-side JS access.
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production.
      path: "/", // Valid for all paths.
      maxAge: 7 * 24 * 60 * 60, // Refresh token expiry (7 days).
      sameSite: "strict", // CSRF protection.
    });

    // PostgreSQL Sync: Check and update/insert user in Drizzle DB.
    try {
      const pgUser = await db.select().from(pgUsersTable).where(eq(pgUsersTable.email, newUser.email)).limit(1);

      if (pgUser.length === 0) {
        // User not in PostgreSQL, insert new entry.
        await db.insert(pgUsersTable).values({
          name: newUser.username || newUser.email.split('@')[0],
          email: newUser.email,
        });
      } else {
        // User found in PostgreSQL, update name if necessary.
        await db.update(pgUsersTable).set({ name: newUser.username }).where(eq(pgUsersTable.email, newUser.email));
      }
    } catch (pgSyncError) {
      // For backend routes, consider a dedicated logging service for such errors.
      // E.g., logger.error('PostgreSQL user synchronization error:', pgSyncError);
      // Do not block signup success for this non-critical sync.
    }

    return response;
  } catch (error) {
    // For backend routes, consider a dedicated logging service for such errors.
    // E.g., logger.error('Signup processing error:', error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}