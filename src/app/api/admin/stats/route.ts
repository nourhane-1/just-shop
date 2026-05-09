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

    const [orders, users, products] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).lean(),
      User.find().lean(),
      Product.find().populate("category", "name").lean(),
    ]);

    const totalRevenue = orders.reduce(
      (sum: number, order: any) => sum + (order.finalPrice || 0),
      0
    );

    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalProducts = products.length;

    const recentOrders = orders.slice(0, 5).map((order: any) => ({
      _id: order._id.toString(),
      createdAt: order.createdAt,
      finalPrice: order.finalPrice || 0,
      orderStatus: order.orderStatus || "pending",
      paymentMethod: order.paymentMethod || "cod",
      user: {
        name: "Customer",
      },
    }));

    // categories stats
    const categoryMap: Record<string, number> = {};

    products.forEach((product: any) => {
      const name = product.category?.name || "General";
      categoryMap[name] = (categoryMap[name] || 0) + 1;
    });

    const topCategories = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
    }));

    // monthly revenue mock from existing orders
    const monthlyRevenue = [
      { month: "Jan", revenue: 1200 },
      { month: "Feb", revenue: 1800 },
      { month: "Mar", revenue: 1500 },
      { month: "Apr", revenue: 2200 },
      { month: "May", revenue: 2600 },
      { month: "Jun", revenue: 3000 },
    ];

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders,
      topCategories,
      monthlyRevenue,
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      {
        error: error.message || "Server error",
        totalRevenue: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        recentOrders: [],
        topCategories: [],
        monthlyRevenue: [],
      },
      { status: 500 }
    );
  }
}