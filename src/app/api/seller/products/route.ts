import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sellerId = (session.user as any).id;
    await connectDB();

    const products = await Product.find({ seller: sellerId })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    const serialized = products.map((p: any) => ({
      _id: p._id.toString(),
      name: p.name,
      price: p.price,
      discountPrice: p.discountPrice,
      stock: p.stock,
      images: p.images,
      isActive: p.isActive ?? true,
      category: p.category ? { name: p.category.name } : null,
      avgRating: p.avgRating ?? p.ratings?.average ?? 0,
      sold: p.sold ?? 0,
      createdAt: p.createdAt
        ? new Date(p.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({ products: serialized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}