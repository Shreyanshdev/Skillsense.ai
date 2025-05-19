import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import User from "@/models/User";
import OTP from "@/models/OTP";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
    }

    // Fetch latest OTP record
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return NextResponse.json({ success: false, message: "No OTP found" }, { status: 400 });
    }

    // Explicit expiry check (5 minutes)
    const ageSec = (Date.now() - otpRecord.createdAt.getTime()) / 1000;
    if (ageSec > 5 * 60) {
      return NextResponse.json({ success: false, message: "OTP expired" }, { status: 400 });
    }

    // Validate OTP
    const valid = await otpRecord.compareOTP(otp);
    if (!valid) {
      return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
    }

    // Mark email verified flag on a temporary store or directly on user if exists
    const user = await User.findOne({ email });
    if (user) {
      user.isVerified = true;
      await user.save();
    }

    // Clean up OTP records
    await OTP.deleteMany({ email });

    return NextResponse.json({ success: true, message: "Email verified successfully" ,userId: user._id }, { status: 200 });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}