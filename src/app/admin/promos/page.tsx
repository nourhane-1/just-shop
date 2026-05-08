"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Ticket } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    discount: 0,
    minOrder: 0,
    maxUses: 100,
    expiresAt: "",
  });

  useEffect(() => {
    loadPromos();
  }, []);

  async function loadPromos() {
    const res = await fetch("/api/admin/promos", { credentials: "include" });
    const data = await res.json();
    setPromos(
      (data.promos ?? []).map((p: any) => ({
        ...p,
        _id: p._id?.toString?.() ?? p._id,
      }))
    );
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/admin/promos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...formData,
        code: formData.code.toUpperCase(),
      }),
    });
    if (res.ok) {
      await loadPromos();
      setShowForm(false);
      setFormData({
        code: "",
        type: "percentage",
        discount: 0,
        minOrder: 0,
        maxUses: 100,
        expiresAt: "",
      });
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this promo code?")) return;
    const res = await fetch(`/api/admin/promos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setPromos((prev) => prev.filter((p) => p._id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Plus size={16} /> Add Promo
        </button>
      </div>

   
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">New Promo Code</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Code *
              </label>
              <input
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="SAVE20"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Discount
              </label>
              <input
                type="number"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Min Order ($)
              </label>
              <input
                type="number"
                value={formData.minOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minOrder: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Max Uses
              </label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxUses: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Expires At
              </label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !formData.code || !formData.discount}
              className="bg-[#F97316] hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Promo"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border border-gray-200 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4">Code</th>
                <th className="text-left px-6 py-4">Discount</th>
                <th className="text-left px-6 py-4">Min Order</th>
                <th className="text-left px-6 py-4">Used</th>
                <th className="text-left px-6 py-4">Expires</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr
                  key={promo._id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-mono font-bold text-[#1E3A5F]">
                    {promo.code}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {promo.type === "percentage"
                      ? `${promo.discount}%`
                      : `$${promo.discount}`}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    ${promo.minOrder}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {promo.usedCount ?? 0} / {promo.maxUses}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {promo.expiresAt
                      ? formatDate(promo.expiresAt)
                      : "No expiry"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        promo.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {promo.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(promo._id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No promo codes yet
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