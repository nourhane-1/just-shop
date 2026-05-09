"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Star,
  TrendingUp,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export default function SellerDashboard() {
  const [stats, setStats] = useState<any>({
    totalEarnings: 0,
    todayOrders: 0,
    totalProducts: 0,
    avgRating: 0,
    totalOrders: 0,
    monthlyRevenue: [],
    payouts: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/stats", { credentials: "include" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          console.error("Seller stats API error:", data);
          return {
            totalEarnings: 0,
            todayOrders: 0,
            totalProducts: 0,
            avgRating: 0,
            totalOrders: 0,
            monthlyRevenue: [],
            payouts: [],
          };
        }
        return data;
      })
      .then((data) => {
        setStats({
          totalEarnings: data?.totalEarnings || 0,
          todayOrders: data?.todayOrders || 0,
          totalProducts: data?.totalProducts || 0,
          avgRating: data?.avgRating || 0,
          totalOrders: data?.totalOrders || 0,
          monthlyRevenue: Array.isArray(data?.monthlyRevenue)
            ? data.monthlyRevenue
            : [],
          payouts: Array.isArray(data?.payouts) ? data.payouts : [],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Seller stats fetch failed:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse h-28"
            />
          ))}
        </div>
      </div>
    );
  }

  const monthlyRevenue = Array.isArray(stats.monthlyRevenue)
    ? stats.monthlyRevenue
    : [];

  const payouts = Array.isArray(stats.payouts) ? stats.payouts : [];

  const maxRev =
    monthlyRevenue.length > 0
      ? Math.max(...monthlyRevenue.map((m: any) => Number(m.revenue) || 0), 1)
      : 1;

  const kpis = [
    {
      label: "Total Earnings",
      value: formatPrice(stats.totalEarnings || 0),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Orders Today",
      value: stats.todayOrders || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "My Products",
      value: stats.totalProducts || 0,
      icon: Package,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Avg. Rating",
      value: `${Number(stats.avgRating || 0).toFixed(1)} ★`,
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's your performance overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpis.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {item.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${item.bg}`}>
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg text-gray-900">Revenue Growth</h2>
            <TrendingUp className="text-emerald-500" />
          </div>

          {monthlyRevenue.length === 0 ? (
            <p className="text-sm text-gray-400">No revenue data yet</p>
          ) : (
            <div className="h-64 flex items-end gap-3">
              {monthlyRevenue.map((item: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-[#F97316] to-orange-400 rounded-t-xl transition-all hover:brightness-110"
                    style={{
                      height: `${((Number(item.revenue) || 0) / maxRev) * 85 + 15}%`,
                    }}
                  />
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700">{item.month}</p>
                    <p className="text-xs text-emerald-600 font-semibold">
                      ${(Number(item.revenue) || 0).toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payouts */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-lg text-gray-900 mb-5">Recent Payouts</h2>

          {payouts.length === 0 ? (
            <p className="text-sm text-gray-400">No payouts yet</p>
          ) : (
            <div className="space-y-4">
              {payouts.map((p: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b border-gray-100 pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{p.id}</p>
                    <p className="text-xs text-gray-500">{formatDate(p.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {formatPrice(Number(p.amount) || 0)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Package className="text-[#F97316]" />
            <h3 className="font-semibold text-gray-900">Inventory Summary</h3>
          </div>
          <p className="text-gray-600 text-sm">
            You currently have{" "}
            <span className="font-semibold">{stats.totalProducts || 0}</span>{" "}
            active products in your store.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="text-[#1E3A5F]" />
            <h3 className="font-semibold text-gray-900">Order Summary</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Total seller-related orders:{" "}
            <span className="font-semibold">{stats.totalOrders || 0}</span>
          </p>
        </div>
      </div>
    </div>
  );
}