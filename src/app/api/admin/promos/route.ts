import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import PromoCode from "@/models/PromoCode";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const promos = await PromoCode.find().sort({ createdAt: -1 }).lean();

    const serialized = promos.map((p: any) => ({
      _id: p._id.toString(),
      code: p.code,
      type: p.type,
      discount: p.discount,
      minOrder: p.minOrder ?? 0,
      maxUses: p.maxUses,
      usedCount: p.usedCount ?? 0,
      expiresAt: p.expiresAt
        ? new Date(p.expiresAt).toISOString()
        : null,
      isActive: p.isActive,
    }));

    return NextResponse.json({ promos: serialized });
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

    const promo = await PromoCode.create({
      code: body.code.toUpperCase(),
      type: body.type,
      discount: body.discount,
      minOrder: body.minOrder ?? 0,
      maxUses: body.maxUses ?? 100,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      isActive: true,
      usedCount: 0,
    });

    return NextResponse.json(promo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}