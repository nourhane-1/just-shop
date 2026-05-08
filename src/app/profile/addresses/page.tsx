"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false,
  });

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        setAddresses(d.addresses ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    const updated = [...addresses, form];
    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: updated }),
    });
    if (res.ok) {
      setAddresses(updated);
      setShowForm(false);
      setForm({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        isDefault: false,
      });
    }
    setSaving(false);
  }

  async function handleDelete(index: number) {
    const updated = addresses.filter((_, i) => i !== index);
    await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses: updated }),
    });
    setAddresses(updated);
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Addresses</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Addresses</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

     
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {addresses.length === 0 && !showForm && (
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-900 font-semibold text-lg mb-1">
              No saved addresses
            </p>
            <p className="text-gray-500 text-sm">
              Add an address for faster checkout.
            </p>
          </div>
        )}

        {addresses.map((addr, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm relative group"
          >
            {addr.isDefault && (
              <span className="absolute top-3 right-3 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Default
              </span>
            )}
            <MapPin size={18} className="text-[#F97316] mb-3" />
            <p className="text-sm font-medium text-gray-900">{addr.street}</p>
            <p className="text-sm text-gray-500">
              {addr.city}, {addr.state} {addr.zipCode}
            </p>
            <p className="text-sm text-gray-500">{addr.country}</p>
            <button
              onClick={() => handleDelete(i)}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={12} /> Remove
            </button>
          </div>
        ))}
      </div>

   
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">New Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Street Address
              </label>
              <input
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                placeholder="123 Main Street"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">City</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="New York"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">State</label>
              <input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="NY"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">ZIP Code</label>
              <input
                value={form.zipCode}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                placeholder="10001"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="United States"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="defaultAddr"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="accent-[#F97316] w-4 h-4"
            />
            <label htmlFor="defaultAddr" className="text-sm text-gray-600">
              Set as default address
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving || !form.street || !form.city || !form.country}
              className="bg-[#F97316] hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Address"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setForm({
                  street: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  country: "",
                  isDefault: false,
                });
              }}
              className="border border-gray-200 text-gray-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}