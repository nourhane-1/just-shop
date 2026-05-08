import {connectDB} from "@/lib/mongodb";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700", icon: Package },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) {
    return <p>Please login to view your orders.</p>;
  }

  await connectDB();

  const orders = await Order.find({ user: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  const totalOrders = orders.length;
  const pending = orders.filter((o: any) => o.orderStatus === "pending").length;
  const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.finalPrice || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
          <p className="text-xs text-gray-500 mt-1">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-amber-600">{pending}</p>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <p className="text-3xl font-bold text-emerald-600">{formatPrice(totalSpent)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Spent</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <Link
            href="/products"
            className="mt-4 inline-block bg-[#F97316] text-white px-6 py-2.5 rounded-lg text-sm font-medium"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4">Order ID</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Items</th>
                <th className="text-left px-6 py-4">Total</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => {
                const s = statusConfig[order.orderStatus] || statusConfig.pending;
                const Icon = s.icon;

                return (
                  <tr key={order._id.toString()} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                      #{order._id.toString().slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatPrice(order.finalPrice || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${s.color}`}>
                        <Icon size={14} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/order/track/${order._id}`}
                        className="text-[#F97316] hover:underline font-medium flex items-center gap-1"
                      >
                        Track Order →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}