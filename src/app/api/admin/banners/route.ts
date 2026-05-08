import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Banner from "@/models/Banner";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const banners = await Banner.find().sort({ createdAt: -1 }).lean();

    const serialized = banners.map((banner: any) => ({
      ...banner,
      _id: banner._id.toString(),
    }));

    return NextResponse.json({ banners: serialized });
  } catch (error: any) {
    console.error("Get banners error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    await connectDB();

    const banner = await Banner.create(body);

    return NextResponse.json(banner, { status: 201 });
  } catch (error: any) {
    console.error("Create banner error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}