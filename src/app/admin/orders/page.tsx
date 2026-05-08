"use client";

import { useState, useEffect } from "react";
import { formatPrice, formatDate } from "@/lib/utils";

const statuses = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/admin/orders", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function updateStatus(orderId: string, newStatus: string) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderStatus: newStatus }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );
    }
  }

  const filtered =
    filter === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition whitespace-nowrap ${
              filter === s
                ? "bg-[#1E3A5F] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s === "all" ? "All Orders" : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4">Order</th>
                <th className="text-left px-6 py-4">Customer</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Total</th>
                <th className="text-left px-6 py-4">Payment</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-mono font-medium text-gray-900">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {order.userName ?? "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {formatPrice(order.finalPrice)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 capitalize">
                    {order.paymentMethod}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        updateStatus(order._id, e.target.value)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer ${
                        statusColors[order.orderStatus] ??
                        statusColors.pending
                      }`}
                    >
                      {statuses
                        .filter((s) => s !== "all")
                        .map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}