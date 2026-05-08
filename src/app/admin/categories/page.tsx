"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "", image: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(
      (Array.isArray(data) ? data : data.categories ?? []).map((c: any) => ({
        ...c,
        _id: c._id?.toString?.() ?? c._id,
      }))
    );
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const slug =
      formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ...formData, slug }),
    });
    if (res.ok) {
      await loadCategories();
      setShowForm(false);
      setFormData({ name: "", slug: "", image: "" });
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c._id !== id));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">New Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Name *
              </label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Electronics"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Slug
              </label>
              <input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="electronics"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Image URL
              </label>
              <input
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              disabled={saving || !formData.name}
              className="bg-[#F97316] hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFormData({ name: "", slug: "", image: "" });
              }}
              className="border border-gray-200 text-gray-600 px-6 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse"
              >
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))
          : categories.map((cat) => (
              <div
                key={cat._id}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <FolderTree size={18} className="text-[#F97316]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-400">{cat.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
        {!loading && categories.length === 0 && (
          <div className="col-span-3 bg-white rounded-xl border p-8 text-center text-gray-400">
            No categories yet
          </div>
        )}
      </div>
    </div>
  );
}