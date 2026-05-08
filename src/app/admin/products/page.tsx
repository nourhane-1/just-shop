"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, X, Save } from "lucide-react";
import { formatPrice } from "@/lib/utils";

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

export default function AdminProductsPage() {
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
    const res = await fetch("/api/products");
    const d = await res.json();
    const list = Array.isArray(d) ? d : d.products ?? [];
    setProducts(
      list.map((p: any) => ({
        ...p,
        _id: p._id?.toString?.() ?? p._id,
        category: p.category
          ? typeof p.category === "object"
            ? p.category
            : { _id: p.category, name: "" }
          : null,
      }))
    );
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
      category:
        typeof product.category === "object"
          ? product.category?._id ?? ""
          : product.category ?? "",
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

      const body = {
        ...formData,
        images: formData.images.filter((img) => img.trim() !== ""),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await loadProducts();
        closeForm();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save product");
      }
    } catch (err) {
      alert("Failed to save product");
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
    }
  }

  function addImageField() {
    setFormData({ ...formData, images: [...formData.images, ""] });
  }

  function updateImage(index: number, value: string) {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  }

  function removeImage(index: number) {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages.length ? newImages : [""] });
  }

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

  
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900 text-lg">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <button
              onClick={closeForm}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Product Name *
              </label>
              <input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Premium Wireless Headphones"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Product description..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] resize-none"
              />
            </div>

         
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Price ($) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
              />
            </div>

        
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
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
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
              />
            </div>

      
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Stock *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
              />
            </div>

         
            <div>
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
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
              <label className="text-xs text-gray-600 mb-1 block font-medium">
                Image URLs
              </label>
              {formData.images.map((img, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    value={img}
                    onChange={(e) => updateImage(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
                  />
                  {formData.images.length > 1 && (
                    <button
                      onClick={() => removeImage(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addImageField}
                className="text-sm text-[#F97316] hover:underline font-medium mt-1"
              >
                + Add another image
              </button>
            </div>
          </div>

    
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.price}
              className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              <Save size={16} />
              {saving
                ? "Saving..."
                : editingId
                ? "Update Product"
                : "Create Product"}
            </button>
            <button
              onClick={closeForm}
              className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full max-w-md pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F97316]"
        />
      </div>

  
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="text-left px-6 py-4">Product</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-left px-6 py-4">Price</th>
                <th className="text-left px-6 py-4">Stock</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-gray-50 hover:bg-gray-50"
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
                      <span className="font-medium text-gray-900 line-clamp-1">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {product.category?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(
                          product.discountPrice || product.price
                        )}
                      </span>
                      {product.discountPrice > 0 &&
                        product.discountPrice < product.price && (
                          <span className="text-xs text-gray-400 line-through ml-1">
                            {formatPrice(product.price)}
                          </span>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-medium ${
                        product.stock <= 5
                          ? "text-red-600"
                          : product.stock <= 20
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.isActive !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(product)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No products found
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