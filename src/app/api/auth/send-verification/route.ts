import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.verificationToken = token;
    user.verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 30); // 30 min
    await user.save();

    const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  
    console.log("Email verification URL:", verifyUrl);

    return NextResponse.json({
      message: "Verification link generated successfully",
      verifyUrl,
    });
  } catch (error: any) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}