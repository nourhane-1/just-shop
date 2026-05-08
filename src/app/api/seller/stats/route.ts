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

   
    const products = await Product.find({ seller: sellerId }).lean();
    const productIds = products.map((p: any) => p._id);

   
    const orders = await Order.find({
      "items.product": { $in: productIds },
    }).lean();

  
    const totalEarnings = orders.reduce((sum: number, order: any) => {
      const sellerItems = order.items.filter((item: any) =>
        productIds.some(
          (pid: any) => pid.toString() === item.product?.toString()
        )
      );
      const orderTotal = sellerItems.reduce(
        (s: number, item: any) => s + item.price * item.quantity,
        0
      );
      return sum + orderTotal;
    }, 0);


    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(
      (o: any) => new Date(o.createdAt) >= today
    ).length;

    
    const avgRating =
      products.length > 0
        ? products.reduce(
            (sum: number, p: any) => sum + (p.avgRating ?? p.ratings?.average ?? 0),
            0
          ) / products.length
        : 0;

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

  
    const payouts = [
      {
        id: "PAY-001",
        date: new Date(Date.now() - 7 * 86400000).toISOString(),
        amount: totalEarnings * 0.3,
        status: "completed",
      },
      {
        id: "PAY-002",
        date: new Date(Date.now() - 30 * 86400000).toISOString(),
        amount: totalEarnings * 0.25,
        status: "completed",
      },
      {
        id: "PAY-003",
        date: new Date().toISOString(),
        amount: totalEarnings * 0.45,
        status: "pending",
      },
    ];

    return NextResponse.json({
      totalEarnings,
      todayOrders,
      totalProducts: products.length,
      avgRating: Math.round(avgRating * 10) / 10,
      totalOrders: orders.length,
      monthlyRevenue,
      payouts,
    });
  } catch (error: any) {
    console.error("Seller stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}