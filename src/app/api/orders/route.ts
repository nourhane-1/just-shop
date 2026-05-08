import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import Order from "@/models/Order";
import PromoCode from "@/models/PromoCode";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { items, shippingAddress, paymentMethod, promoCode } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

   
    let totalPrice = items.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );
    let discount = 0;

    if (promoCode) {
      const promo = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
      });
      if (
        promo &&
        promo.usedCount < promo.maxUses &&
        new Date() < promo.expiresAt
      ) {
        discount =
          promo.type === "percentage"
            ? (totalPrice * promo.discount) / 100
            : promo.discount;
        await PromoCode.findByIdAndUpdate(promo._id, {
          $inc: { usedCount: 1 },
        });
      }
    }

    const finalPrice = totalPrice - discount;

    const order = await Order.create({
      user: (session.user as any).id,
      items,
      shippingAddress,
      paymentMethod,
      totalPrice,
      discount,
      finalPrice,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      orderStatus: "pending",
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = (session.user as any).id;

    const orders = await Order.find({ user: userId })
      .populate("items.product", "name images price")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (err: any) {
    console.error("Orders fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}