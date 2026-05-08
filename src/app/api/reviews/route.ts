import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { error: "Product, rating and comment are required" },
        { status: 400 }
      );
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    await Review.create({
      user: (session.user as any).id,
      product: productId,
      rating: Number(rating),
      comment,
    });


    const reviews = await Review.find({ product: productId });

    const avgRating =
      reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
      reviews.length;

    await Product.findByIdAndUpdate(productId, {
      avgRating: Math.round(avgRating * 10) / 10,
    });

    return NextResponse.json(
      { message: "Review added successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST review error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "You already reviewed this product" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}