import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY in .env.local" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, shipping } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No valid items provided" },
        { status: 400 }
      );
    }

    const line_items = items.map((item: any) => {
      if (!item.name || !item.price || !item.quantity) {
        throw new Error("Invalid item data");
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: String(item.name),

          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: Number(item.quantity),
      };
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${process.env.NEXTAUTH_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
      customer_email: shipping?.email || session.user.email || undefined,
      metadata: {
        userId: String((session.user as any).id),
        firstName: String(shipping?.firstName || ""),
        lastName: String(shipping?.lastName || ""),
        email: String(shipping?.email || ""),
        phone: String(shipping?.phone || ""),
        address: String(shipping?.address || ""),
        city: String(shipping?.city || ""),
        country: String(shipping?.country || ""),
        zipCode: String(shipping?.zipCode || ""),
        items: JSON.stringify(items),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe create session error FULL:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to create Stripe session",
        details: String(error),
      },
      { status: 500 }
    );
  }
}