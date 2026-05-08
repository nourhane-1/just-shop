"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export default function SellerEarningsPage() {
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
        <h1 className="text-2xl font-bold text-[#111827] mb-8">Earnings</h1>
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
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

  const completedPayouts = (stats.payouts ?? []).filter(
    (p: any) => p.status === "completed"
  );
  const pendingPayouts = (stats.payouts ?? []).filter(
    (p: any) => p.status === "pending"
  );
  const totalPaid = completedPayouts.reduce(
    (sum: number, p: any) => sum + p.amount,
    0
  );
  const totalPending = pendingPayouts.reduce(
    (sum: number, p: any) => sum + p.amount,
    0
  );

  const maxRevenue = Math.max(
    ...stats.monthlyRevenue.map((m: any) => m.revenue),
    1
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-8">Earnings</h1>

     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#6B7280]">
              Total Earnings
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
              <DollarSign size={20} className="text-[#10B981]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111827]">
            {formatPrice(stats.totalEarnings)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#6B7280]">
              Total Paid
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <CheckCircle size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111827]">
            {formatPrice(totalPaid)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-[#6B7280]">
              Pending Payout
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
              <Clock size={20} className="text-[#F59E0B]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#111827]">
            {formatPrice(totalPending)}
          </p>
        </div>
      </div>

     
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-[#111827]">Monthly Revenue</h2>
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

     
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="p-6 border-b border-[#E5E7EB]">
          <h2 className="font-semibold text-[#111827]">Payout History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-[#6B7280] text-xs uppercase tracking-wider">
              <th className="text-left px-6 py-4">Payout ID</th>
              <th className="text-left px-6 py-4">Date</th>
              <th className="text-left px-6 py-4">Amount</th>
              <th className="text-left px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {(stats.payouts ?? []).map((payout: any) => (
              <tr
                key={payout.id}
                className="border-b border-gray-50 hover:bg-[#F9FAFB]"
              >
                <td className="px-6 py-4 font-mono font-medium text-[#111827]">
                  {payout.id}
                </td>
                <td className="px-6 py-4 text-[#6B7280]">
                  {formatDate(payout.date)}
                </td>
                <td className="px-6 py-4 font-semibold text-[#111827]">
                  {formatPrice(payout.amount)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      payout.status === "completed"
                        ? "bg-[#10B981]/10 text-[#10B981]"
                        : "bg-[#F59E0B]/10 text-[#F59E0B]"
                    }`}
                  >
                    {payout.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}