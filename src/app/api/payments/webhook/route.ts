import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await connectDB();

      const rawItems = session.metadata?.items
        ? JSON.parse(session.metadata.items)
        : [];

      const items = rawItems.map((item: any) => ({
        product: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || "",
      }));

      const existingOrder = await Order.findOne({
        stripePaymentId: session.id,
      });

      if (!existingOrder) {
        await Order.create({
          user: session.metadata?.userId,
          items,
          shippingAddress: {
            street: session.metadata?.address || "",
            city: session.metadata?.city || "",
            country: session.metadata?.country || "",
          },
          paymentMethod: "card",
          paymentStatus: "paid",
          orderStatus: "processing",
          totalPrice: (session.amount_total || 0) / 100,
          discount: 0,
          finalPrice: (session.amount_total || 0) / 100,
          stripePaymentId: session.id,
        });

        console.log("✅ Stripe order saved successfully");
      }
    } catch (error) {
      console.error("Error saving Stripe order:", error);
    }
  }

  return NextResponse.json({ received: true });
}