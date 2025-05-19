import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import OTP from "@/models/OTP";
import crypto from "crypto";

// Ensure DB connection
connectDB();

// Rate limiting: max 5 OTPs per hour per email
const RATE_LIMIT = 5;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Count recent OTPs in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await OTP.countDocuments({ email, createdAt: { $gte: oneHourAgo } });
    if (recentCount >= RATE_LIMIT) {
      return NextResponse.json({ message: "Too many OTP requests. Please try again later." }, { status: 429 });
    }

    // Generate 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();

    // Save OTP document; pre-save hook will hash and email the OTP
    const otpDoc = new OTP({ email, otp: rawOtp });
    await otpDoc.save();

    return NextResponse.json({ success: true, message: "OTP sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

