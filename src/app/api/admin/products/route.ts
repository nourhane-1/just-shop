import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Product from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const products = await Product.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    const serialized = products.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      category: p.category
        ? { ...p.category, _id: p.category._id.toString() }
        : null,
      seller: p.seller?.toString?.() ?? null,
    }));

    return NextResponse.json(serialized);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  
    const productData = {
      ...body,
      slug: slug + "-" + Date.now(),
      seller: (session.user as any).id,
    };

    const product = await Product.create(productData);

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}