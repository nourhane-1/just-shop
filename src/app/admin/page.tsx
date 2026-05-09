"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

const statusConfig: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
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
      .catch(() => {
        setStats({
          totalRevenue: 0,
          totalOrders: 0,
          totalUsers: 0,
          totalProducts: 0,
          recentOrders: [],
          topCategories: [],
          monthlyRevenue: [],
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading dashboard...</div>;
  }

  const monthlyRevenue = Array.isArray(stats?.monthlyRevenue)
    ? stats.monthlyRevenue
    : [];

  const recentOrders = Array.isArray(stats?.recentOrders)
    ? stats.recentOrders
    : [];

  const topCategories = Array.isArray(stats?.topCategories)
    ? stats.topCategories
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatPrice(stats?.totalRevenue || 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <DollarSign className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.totalOrders || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShoppingCart className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.totalProducts || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <Package className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="grid lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-[#F97316]" />
            <h2 className="text-xl font-bold text-gray-900">Revenue Overview</h2>
          </div>

          <div className="grid grid-cols-6 gap-4 h-48 items-end">
            {monthlyRevenue.map((item: any, index: number) => (
              <div key={index} className="text-center">
                <div
                  className="bg-[#F97316] rounded-t-xl w-full"
                  style={{
                    height: `${Math.max((item.revenue / 3000) * 160, 10)}px`,
                  }}
                ></div>
                <p className="text-xs text-gray-500 mt-2">{item.month}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Categories</h2>
          <div className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-sm text-gray-400">No category data yet</p>
            ) : (
              topCategories.map((cat: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="text-gray-500">{cat.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1E3A5F]"
                      style={{
                        width: `${Math.min(cat.count * 20, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No recent orders</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <th className="px-6 py-4">Order</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order: any) => (
                <tr key={order._id} className="border-t border-gray-100">
                  <td className="px-6 py-4 font-mono text-gray-900">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {formatPrice(order.finalPrice || 0)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 capitalize">
                    {order.paymentMethod}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusConfig[order.orderStatus] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}