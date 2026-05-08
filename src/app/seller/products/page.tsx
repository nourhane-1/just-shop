"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Save,
  Package,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
interface ProductForm {
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  stock: number;
  category: string;
  images: string[];
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: 0,
  discountPrice: 0,
  stock: 0,
  category: "",
  images: [""],
};

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProductForm>(emptyForm);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    const res = await fetch("/api/seller/products", { credentials: "include" });
    const d = await res.json();
    setProducts(d.products ?? []);
    setLoading(false);
  }

  async function loadCategories() {
    const res = await fetch("/api/categories");
    const d = await res.json();
    setCategories(
      (Array.isArray(d) ? d : d.categories ?? []).map((c: any) => ({
        ...c,
        _id: c._id?.toString?.() ?? c._id,
      }))
    );
  }

  function openAddForm() {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  }

  function openEditForm(product: any) {
    setEditingId(product._id);
    setFormData({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price ?? 0,
      discountPrice: product.discountPrice ?? 0,
      stock: product.stock ?? 0,
      category: product.category?._id ?? product.category ?? "",
      images: product.images?.length ? product.images : [""],
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
      ? `/api/products/${editingId}`
      : "/api/products";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...formData,
        images: formData.images.filter((img) => img.trim() !== ""),
      }),
    });

    if (res.ok) {
      await loadProducts();
      closeForm();
      toast.success(editingId ? "Product updated successfully" : "Product created successfully");
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to save product");
    }
  } catch {
    toast.error("Failed to save product");
  }
  setSaving(false);
}

 async function handleDelete(id: string) {
  if (!confirm("Delete this product?")) return;

  const res = await fetch(`/api/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (res.ok) {
    setProducts((prev) => prev.filter((p) => p._id !== id));
    toast.success("Product deleted successfully");
  } else {
    toast.error("Failed to delete product");
  }
}

  function getStockStatus(stock: number) {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "bg-[#EF4444]/10 text-[#EF4444]",
      };
    if (stock <= 10)
      return { label: "Low Stock", color: "bg-[#F59E0B]/10 text-[#F59E0B]" };
    return { label: "Active", color: "bg-[#10B981]/10 text-[#10B981]" };
  }

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">My Products</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-[#111827] text-lg">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <button
              onClick={closeForm}
              className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-[#6B7280] mb-1 block font-medium">
                Product Name *
              </label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Product name"
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-[#6B7280] mb-1 block font-medium">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] resize-none"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B7280] mb-1 block font-medium">
                Price ($) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B7280] mb-1 block font-medium">
                Discount Price ($)
              </label>
              <input
                type="number"
                value={formData.discountPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPrice: Number(e.target.value),
                  })
                }
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B7280] mb-1 block font-medium">
                Stock *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
              />
            </div>
            <div>
              <label className="text-xs text-[#6B7280] mb-1 block font-medium">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-[#6B7280] mb-1 block font-medium">
                Image URLs
              </label>
              {formData.images.map((img, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    value={img}
                    onChange={(e) => {
                      const imgs = [...formData.images];
                      imgs[i] = e.target.value;
                      setFormData({ ...formData, images: imgs });
                    }}
                    placeholder="https://..."
                    className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    images: [...formData.images, ""],
                  })
                }
                className="text-sm text-[#F97316] hover:underline font-medium"
              >
                + Add image
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-[#E5E7EB]">
            <button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.price}
              className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              <Save size={16} />
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={closeForm}
              className="border border-[#E5E7EB] text-[#6B7280] px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-2.5 text-[#6B7280]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search my products..."
          className="w-full max-w-md pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#F97316]"
        />
      </div>

   
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-[#6B7280]">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-[#111827] font-semibold mb-1">
              No products yet
            </p>
            <p className="text-sm text-[#6B7280] mb-4">
              Add your first product to start selling
            </p>
            <button
              onClick={openAddForm}
              className="bg-[#F97316] text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              Add Product
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB] text-[#6B7280] text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Price</th>
                <th className="text-left px-6 py-4">Stock</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr
                    key={product._id}
                    className="border-b border-gray-50 hover:bg-[#F9FAFB]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt=""
                              className="w-10 h-10 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#111827] line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {product.category?.name ?? "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#111827]">
                      {formatPrice(product.discountPrice || product.price)}
                    </td>
                    <td className="px-6 py-4 font-medium">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}
                      >
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditForm(product)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 text-[#EF4444] hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}