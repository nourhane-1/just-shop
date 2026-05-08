import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
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

    const sellerProducts = await Product.find({ seller: sellerId })
      .select("_id")
      .lean();
    const productIds = sellerProducts.map((p: any) => p._id);

    const orders = await Order.find({
      "items.product": { $in: productIds },
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const serialized = orders.map((o: any) => ({
      _id: o._id.toString(),
      userName: o.user?.name ?? "Unknown",
      orderStatus: o.orderStatus,
      paymentMethod: o.paymentMethod,
      finalPrice: o.finalPrice ?? 0,
      items: o.items?.length ?? 0,
      createdAt: o.createdAt
        ? new Date(o.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({ orders: serialized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}