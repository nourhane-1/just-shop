import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Order from "@/models/Order";


export async function GET(
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

    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

  
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (
      userRole !== "admin" &&
      order.user?.toString() !== userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      ...order,
      _id: (order as any)._id.toString(),
      user: (order as any).user?.toString?.() || null,
      createdAt: order.createdAt
        ? new Date(order.createdAt).toISOString()
        : null,
      updatedAt: order.updatedAt
        ? new Date(order.updatedAt).toISOString()
        : null,
    });
  } catch (error: any) {
    console.error("GET order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function PUT(
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
    const { orderStatus } = await req.json();

    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus },
      { returnDocument: "after" }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("PUT order error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}