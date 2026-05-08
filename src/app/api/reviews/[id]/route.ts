import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Product from "@/models/Product";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    const isOwner = review.user.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    const productId = review.product.toString();

    await Review.findByIdAndDelete(id);

   
    const remainingReviews = await Review.find({ product: productId });

    const avgRating =
      remainingReviews.length > 0
        ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) /
          remainingReviews.length
        : 0;

    await Product.findByIdAndUpdate(productId, {
      avgRating: Math.round(avgRating * 10) / 10,
    });

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error: any) {
    console.error("DELETE review error:", error);
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}