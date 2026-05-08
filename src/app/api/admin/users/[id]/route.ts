import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const updateData: any = {};

    if (body.isBlocked !== undefined) {
      updateData.isBlocked = body.isBlocked;
    }

    if (body.role) {
      if (!["customer", "seller", "admin"].includes(body.role)) {
        return NextResponse.json(
          { error: "Invalid role value" },
          { status: 400 }
        );
      }
      updateData.role = body.role;
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      returnDocument: "after",
    }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}