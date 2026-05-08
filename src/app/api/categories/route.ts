import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().lean();
    const serialized = categories.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
    }));
    return NextResponse.json(serialized);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    await connectDB();

    const category = await Category.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}