"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export default function SellerDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/stats", { credentials: "include" })
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
        <h1 className="text-2xl font-bold text-[#111827] mb-8">
          Seller Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-[#E5E7EB] animate-pulse"
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
      label: "Total Earnings",
      value: formatPrice(stats.totalEarnings),
      icon: DollarSign,
      iconBg: "bg-[#10B981]/10",
      iconColor: "text-[#10B981]",
    },
    {
      label: "Orders Today",
      value: stats.todayOrders,
      icon: ShoppingCart,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "My Products",
      value: stats.totalProducts,
      icon: Package,
      iconBg: "bg-[#F97316]/10",
      iconColor: "text-[#F97316]",
    },
    {
      label: "Avg. Rating",
      value: stats.avgRating > 0 ? `${stats.avgRating} ★` : "N/A",
      icon: Star,
      iconBg: "bg-[#F59E0B]/10",
      iconColor: "text-[#F59E0B]",
    },
  ];

  const maxRevenue = Math.max(
    ...stats.monthlyRevenue.map((m: any) => m.revenue),
    1
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Seller Dashboard</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Track your sales, products, and earnings.
        </p>
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#6B7280]">
                {kpi.label}
              </span>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconBg}`}
              >
                <kpi.icon size={20} className={kpi.iconColor} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#111827]">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-[#111827]">Revenue Growth</h2>
            <TrendingUp size={18} className="text-[#10B981]" />
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
                <span className="text-xs text-[#6B7280] mt-2">{m.month}</span>
                <span className="text-xs font-medium text-[#111827]">
                  ${Math.round(m.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

       
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
          <h2 className="font-semibold text-[#111827] mb-4">Payout History</h2>
          <div className="space-y-4">
            {stats.payouts.map((payout: any) => (
              <div
                key={payout.id}
                className="flex items-center justify-between py-3 border-b border-[#E5E7EB] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      payout.status === "completed"
                        ? "bg-[#10B981]/10"
                        : "bg-[#F59E0B]/10"
                    }`}
                  >
                    {payout.status === "completed" ? (
                      <CheckCircle size={16} className="text-[#10B981]" />
                    ) : (
                      <Clock size={16} className="text-[#F59E0B]" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111827]">
                      {payout.id}
                    </p>
                    <p className="text-xs text-[#6B7280]">
                      {formatDate(payout.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#111827]">
                    {formatPrice(payout.amount)}
                  </p>
                  <p
                    className={`text-xs capitalize ${
                      payout.status === "completed"
                        ? "text-[#10B981]"
                        : "text-[#F59E0B]"
                    }`}
                  >
                    {payout.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}