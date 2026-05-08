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
      orderStatus: { $nin: ["cancelled"] },
    }).lean();

    // Weekly revenue (last 7 days)
    const weeklyRevenue: { day: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const dayOrders = orders.filter((o: any) => {
        const d = new Date(o.createdAt);
        return d >= date && d <= end;
      });

      const rev = dayOrders.reduce((sum: number, order: any) => {
        const sellerItems = order.items.filter((item: any) =>
          productIds.some(
            (pid: any) => pid.toString() === item.product?.toString()
          )
        );
        return (
          sum +
          sellerItems.reduce(
            (s: number, item: any) => s + item.price * item.quantity,
            0
          )
        );
      }, 0);

      weeklyRevenue.push({
        day: date.toLocaleString("en", { weekday: "short" }),
        revenue: rev,
      });
    }

  
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth();
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 1);

      const monthOrders = orders.filter((o: any) => {
        const d = new Date(o.createdAt);
        return d >= start && d < end;
      });

      const rev = monthOrders.reduce((sum: number, order: any) => {
        const sellerItems = order.items.filter((item: any) =>
          productIds.some(
            (pid: any) => pid.toString() === item.product?.toString()
          )
        );
        return (
          sum +
          sellerItems.reduce(
            (s: number, item: any) => s + item.price * item.quantity,
            0
          )
        );
      }, 0);

      monthlyRevenue.push({
        month: start.toLocaleString("en", { month: "short" }),
        revenue: rev,
      });
    }

    const totalEarnings = monthlyRevenue.reduce(
      (sum, m) => sum + m.revenue,
      0
    );

  
    const payouts = [
      {
        id: "PAY-001",
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        amount: totalEarnings * 0.3,
        status: "completed",
        method: "Bank Transfer",
      },
      {
        id: "PAY-002",
        date: new Date(Date.now() - 30 * 86400000).toISOString(),
        amount: totalEarnings * 0.25,
        status: "completed",
        method: "Bank Transfer",
      },
      {
        id: "PAY-003",
        date: new Date().toISOString(),
        amount: totalEarnings * 0.45,
        status: "pending",
        method: "Bank Transfer",
      },
    ];

    return NextResponse.json({
      totalEarnings,
      weeklyRevenue,
      monthlyRevenue,
      payouts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}