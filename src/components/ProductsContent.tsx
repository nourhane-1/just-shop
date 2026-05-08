"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { LayoutGrid, List, RotateCcw } from "lucide-react";
import ProductCard from "@/components/ProductCard";

interface CategoryType {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
}

interface ProductType {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  discountPrice?: number;
  images?: string[];
  image?: string;
  avgRating?: number;
  ratings?: {
    average?: number;
  };
  category?: {
    name?: string;
    slug?: string;
  } | string;
}

interface ProductsContentProps {
  products: ProductType[];
  categories: CategoryType[];
  total: number;
  pages: number;
  currentPage: number;
}

export default function ProductsContent({
  products,
  categories,
  total,
  pages,
  currentPage,
}: ProductsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const selectedCategory = searchParams.get("category") || "";
  const selectedSort = searchParams.get("sort") || "";
  const selectedMinPrice = searchParams.get("minPrice") || "";
  const selectedMaxPrice = searchParams.get("maxPrice") || "";

  const [minPrice, setMinPrice] = useState(selectedMinPrice || "0");
  const [maxPrice, setMaxPrice] = useState(selectedMaxPrice || "500");

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    
    params.delete("page");

    router.push(`/products?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    params.delete("page");

    router.push(`/products?${params.toString()}`);
  };

  const resetFilters = () => {
    setMinPrice("0");
    setMaxPrice("500");
    router.push("/products");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-8">
      {/* Sidebar */}
      <aside className="bg-white border border-gray-100 rounded-2xl p-5 h-fit shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          <button
            onClick={resetFilters}
            className="text-xs text-[#F97316] hover:underline flex items-center gap-1"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Categories
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => updateQuery("category", "")}
              className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                !selectedCategory
                  ? "bg-orange-50 text-[#F97316] font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Categories
            </button>

            {categories.map((category) => (
              <button
                key={category._id || category.id}
                onClick={() => updateQuery("category", category.slug)}
                className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                  selectedCategory === category.slug
                    ? "bg-orange-50 text-[#F97316] font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

      
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            Price Range
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Min Price</label>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full accent-[#F97316]"
              />
              <p className="text-sm text-gray-700 mt-1">${minPrice}</p>
            </div>

            <div>
              <label className="text-xs text-gray-500">Max Price</label>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full accent-[#F97316]"
              />
              <p className="text-sm text-gray-700 mt-1">${maxPrice}</p>
            </div>

            <button
              onClick={applyPriceFilter}
              className="w-full bg-[#1E3A5F] hover:bg-[#16304d] text-white text-sm py-2.5 rounded-lg font-medium transition"
            >
              Apply Price Filter
            </button>
          </div>
        </div>

      
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Sort By</h3>

          <div className="space-y-2">
            {[
              { label: "Newest", value: "" },
              { label: "Price: Low to High", value: "price_asc" },
              { label: "Price: High to Low", value: "price_desc" },
              { label: "Top Rated", value: "rating" },
              { label: "Name A-Z", value: "name" },
            ].map((sort) => (
              <button
                key={sort.label}
                onClick={() => updateQuery("sort", sort.value)}
                className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition ${
                  selectedSort === sort.value || (!selectedSort && sort.value === "")
                    ? "bg-orange-50 text-[#F97316] font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div>
       
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
            <p className="text-gray-500 text-sm mt-1">
              {search ? filteredProducts.length : total} product
              {(search ? filteredProducts.length : total) !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>

          
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-3 transition ${
                  viewMode === "grid"
                    ? "bg-[#F97316] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-3 transition ${
                  viewMode === "list"
                    ? "bg-[#F97316] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

       
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
            <p className="text-gray-500 text-lg">No products found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try changing your filters or searching with another keyword
            </p>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    id={String(product._id || product.id)}
                    name={product.name}
                    price={product.price}
                    discountPrice={product.discountPrice}
                    image={
                      product.images?.[0] ||
                      product.image ||
                      "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500"
                    }
                    rating={product.avgRating || product.ratings?.average || 0}
                    category={
                      typeof product.category === "object"
                        ? product.category?.name || "General"
                        : product.category || "General"
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product._id || product.id}
                    href={`/products/${product._id || product.id}`}
                    className="block bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-40 h-40 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={
                            product.images?.[0] ||
                            product.image ||
                            "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500"
                          }
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">
                          {typeof product.category === "object"
                            ? product.category?.name || "General"
                            : product.category || "General"}
                        </p>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">
                          High quality product with stylish design and premium feel.
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-[#1E3A5F]">
                            ${product.discountPrice || product.price}
                          </span>
                          {product.discountPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ${product.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

           
            {pages > 1 && !search && (
              <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                {Array.from({ length: pages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <Link
                      key={page}
                      href={`/products?page=${page}`}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                        currentPage === page
                          ? "bg-[#F97316] text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}