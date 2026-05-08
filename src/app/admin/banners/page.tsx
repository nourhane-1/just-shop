"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface BannerForm {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  isActive: boolean;
}

const emptyForm: BannerForm = {
  title: "",
  subtitle: "",
  buttonText: "",
  buttonLink: "/products",
  image: "",
  isActive: true,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<BannerForm>(emptyForm);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      const res = await fetch("/api/admin/banners", { credentials: "include" });
      const data = await res.json();
      setBanners(data.banners || []);
    } catch {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  }

  function openEditForm(banner: any) {
    setEditingId(banner._id);
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText || "",
      buttonLink: banner.buttonLink || "/products",
      image: banner.image || "",
      isActive: banner.isActive ?? true,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  }

  async function handleSave() {
    setSaving(true);

    try {
      const url = editingId
        ? `/api/admin/banners/${editingId}`
        : "/api/admin/banners";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await loadBanners();
        closeForm();
        toast.success(editingId ? "Banner updated successfully" : "Banner created successfully");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save banner");
      }
    } catch {
      toast.error("Failed to save banner");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this banner?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setBanners((prev) => prev.filter((banner) => banner._id !== id));
        toast.success("Banner deleted successfully");
      } else {
        toast.error("Failed to delete banner");
      }
    } catch {
      toast.error("Failed to delete banner");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage Banners</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 text-lg">
              {editingId ? "Edit Banner" : "Add New Banner"}
            </h2>
            <button
              onClick={closeForm}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Title *
              </label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Shop Smart, Shop Better"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Subtitle *
              </label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                rows={3}
                placeholder="Discover amazing products at unbeatable prices."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Button Text *
              </label>
              <input
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                placeholder="Shop Now"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Button Link *
              </label>
              <input
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                placeholder="/products"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Image URL *
              </label>
              <input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="active" className="text-sm text-gray-700">
                Active banner
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving || !formData.title || !formData.subtitle || !formData.image}
              className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              <Save size={16} />
              {saving ? "Saving..." : editingId ? "Update Banner" : "Create Banner"}
            </button>
            <button
              onClick={closeForm}
              className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : banners.length === 0 ? (
          <div className="p-16 text-center">
            <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-900 font-semibold mb-1">No banners yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Add your first homepage banner
            </p>
            <button
              onClick={openAddForm}
              className="bg-[#F97316] text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Add Banner
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="p-5 flex flex-col lg:flex-row lg:items-center gap-5"
              >
                <div className="w-full lg:w-48 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        banner.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{banner.subtitle}</p>
                  <p className="text-xs text-[#F97316] font-medium mt-2">
                    {banner.buttonText} → {banner.buttonLink}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditForm(banner)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}