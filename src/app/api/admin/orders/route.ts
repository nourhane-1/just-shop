import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .lean();

    const serialized = orders.map((o: any) => ({
      _id: o._id.toString(),
      userName: o.user?.name ?? "Unknown",
      userEmail: o.user?.email ?? "",
      finalPrice: o.finalPrice ?? 0,
      orderStatus: o.orderStatus,
      paymentMethod: o.paymentMethod,
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