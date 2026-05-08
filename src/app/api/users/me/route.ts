import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const userId = (session.user as any).id;
    const allowedFields = ["name", "phone", "avatar", "addresses"];
    const updateData: any = {};

    for (const key of allowedFields) {
      if (body[key] !== undefined) updateData[key] = body[key];
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("PUT /api/users/me error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}