import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    console.log("WISHLIST GET - session:", JSON.stringify(session));

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    console.log("WISHLIST GET - userId:", userId);

    const user = await User.findById(userId)
      .populate({
        path: "wishlist",
        select: "name price discountPrice images ratings category",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      wishlist: (user as any).wishlist ?? [],
    });
  } catch (error: any) {
    console.error("WISHLIST GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    console.log("WISHLIST POST - session:", JSON.stringify(session));

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required" },
        { status: 400 }
      );
    }

    await connectDB();
    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    
    const wishlistStrings = user.wishlist.map((id: any) => id.toString());
    const index = wishlistStrings.indexOf(productId);

    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();

    return NextResponse.json({
      wishlist: user.wishlist,
      added: index === -1,
      message: index === -1 ? "Added to wishlist" : "Removed from wishlist",
    });
  } catch (error: any) {
    console.error("WISHLIST POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}