"use client";

import { useState, useEffect } from "react";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const statusOptions = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
  { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-700" },
  { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-700" },
  { value: "delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-700" },
];

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderStatus: newStatus }),
    });

    if (res.ok) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      );
      toast.success("Order status updated successfully");
    } else {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <p className="text-center py-10">Loading orders...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
          <p className="text-gray-500 text-lg">No orders yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b text-xs uppercase text-gray-500">
                <th className="text-left px-6 py-4">Order ID</th>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Total</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-medium">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{order.userName || "Customer"}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 font-semibold">{formatPrice(order.finalPrice || 0)}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-offset-2 ${
                        statusOptions.find((s) => s.value === order.orderStatus)?.color ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {statusOptions.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}