import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Product from "@/models/Product";


export async function GET() {
  try {
    await connectDB();
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    const serialized = products.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      seller: p.seller?.toString() || null,
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

    if (!body.name || !body.price || !body.category) {
      return NextResponse.json({ error: "Name, price and category are required" }, { status: 400 });
    }

   
    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-6);

    const productData = {
      ...body,
      slug,
      seller: (session.user as any).id,   
      isActive: true,
    };

    const product = await Product.create(productData);

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Create Product Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}