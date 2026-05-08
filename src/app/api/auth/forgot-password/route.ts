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

    // لأسباب أمنية نرجع نفس الرسالة سواء الإيميل موجود أو لا
    if (!user) {
      return NextResponse.json({
        message: "If this email exists, a reset link has been generated.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30); 
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    
    console.log("Reset Password URL:", resetUrl);

    return NextResponse.json({
      message: "If this email exists, a reset link has been generated.",
      resetUrl, 
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}