import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const reviews = await Review.find({ product: id })
      .populate("user", "name image")
      .sort({ createdAt: -1 })
      .lean();

    const serialized = reviews.map((review: any) => ({
      _id: review._id.toString(),
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        name: review.user?.name || "Anonymous",
        image: review.user?.image || null,
      },
    }));

    return NextResponse.json(serialized);
  } catch (error: any) {
    console.error("GET product reviews error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}