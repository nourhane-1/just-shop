import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const reviews = await Review.find()
      .populate("user", "name email image")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .lean();

    const serialized = reviews.map((review: any) => ({
      _id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        _id: review.user?._id?.toString?.() || null,
        name: review.user?.name || "Unknown",
        email: review.user?.email || "",
        image: review.user?.image || null,
      },
      product: {
        _id: review.product?._id?.toString?.() || null,
        name: review.product?.name || "Unknown Product",
      },
    }));

    return NextResponse.json({ reviews: serialized });
  } catch (error: any) {
    console.error("Admin reviews GET error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}