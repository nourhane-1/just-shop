"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const kpis = [
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      iconBg: "bg-green-100",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
      iconBg: "bg-blue-100",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
      iconBg: "bg-purple-100",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-orange-50 text-orange-600",
      iconBg: "bg-orange-100",
    },
  ];


  const maxRevenue = Math.max(
    ...stats.monthlyRevenue.map((m: any) => m.revenue),
    1
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's your store overview.
          </p>
        </div>
      </div>

   
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">
                {kpi.label}
              </span>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconBg}`}
              >
                <kpi.icon size={20} className={kpi.color.split(" ")[1]} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">Revenue Overview</h2>
            <TrendingUp size={18} className="text-green-500" />
          </div>
          <div className="flex items-end gap-4 h-48">
            {stats.monthlyRevenue.map((m: any) => (
              <div key={m.month} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-[#F97316] rounded-t-lg transition-all hover:bg-orange-600"
                  style={{
                    height: `${(m.revenue / maxRevenue) * 100}%`,
                    minHeight: m.revenue > 0 ? "8px" : "2px",
                  }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{m.month}</span>
                <span className="text-xs font-medium text-gray-700">
                  ${Math.round(m.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

       
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Order Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.pendingOrders}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-blue-500" />
                <span className="text-sm text-gray-600">Total Orders</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.totalOrders}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-green-500" />
                <span className="text-sm text-gray-600">Avg. Order</span>
              </div>
              <span className="font-semibold text-gray-900">
                {stats.totalOrders > 0
                  ? formatPrice(stats.totalRevenue / stats.totalOrders)
                  : "$0"}
              </span>
            </div>
          </div>
        </div>
      </div>

   
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
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
              {stats.recentOrders.map((order: any) => {
                const s =
                  statusConfig[order.orderStatus] ?? statusConfig.pending;
                return (
                  <tr
                    key={order._id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {order.user?.name ?? "Unknown"}
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
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${s.color}`}
                      >
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}