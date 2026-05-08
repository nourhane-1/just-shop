import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const [totalOrders, totalUsers, totalProducts, orders] = await Promise.all(
      [
        Order.countDocuments(),
        User.countDocuments(),
        Product.countDocuments(),
        Order.find().lean(),
      ]
    );

    const totalRevenue = orders.reduce(
      (sum: number, o: any) => sum + (o.finalPrice ?? 0),
      0
    );
    const pendingOrders = orders.filter(
      (o: any) => o.orderStatus === "pending"
    ).length;

  
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .lean();

    const serializedOrders = recentOrders.map((o: any) => ({
      _id: o._id.toString(),
      user: o.user
        ? { name: o.user.name, email: o.user.email }
        : { name: "Unknown", email: "" },
      finalPrice: o.finalPrice ?? 0,
      orderStatus: o.orderStatus,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt
        ? new Date(o.createdAt).toISOString()
        : new Date().toISOString(),
      items: o.items?.length ?? 0,
    }));

    
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

      const rev = monthOrders.reduce(
        (sum: number, o: any) => sum + (o.finalPrice ?? 0),
        0
      );

      monthlyRevenue.push({
        month: start.toLocaleString("en", { month: "short" }),
        revenue: rev,
      });
    }

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalUsers,
      totalProducts,
      recentOrders: serializedOrders,
      monthlyRevenue,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}