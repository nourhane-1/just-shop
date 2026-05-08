import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const serialized = users.map((u: any) => ({
      _id: u._id.toString(),
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      isBlocked: u.isBlocked,
      isVerified: u.isVerified,
      createdAt: u.createdAt
        ? new Date(u.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({ users: serialized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}