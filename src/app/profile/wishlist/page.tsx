import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import { Heart } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default async function WishlistPage() {
  let wishlist: any[] = [];
  let error = "";

  try {
    const session = await auth();

    if (!session?.user) {
      return (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-gray-500">Please login to view wishlist</p>
          <Link
            href="/login"
            className="mt-4 inline-block bg-[#F97316] text-white px-6 py-2.5 rounded-lg text-sm font-medium"
          >
            Login
          </Link>
        </div>
      );
    }

    await connectDB();

    const userId = (session.user as any).id;

    const user = await User.findById(userId)
      .populate({
        path: "wishlist",
        populate: {
          path: "category",
          select: "name",
        },
      })
      .lean();

    const rawWishlist = (user as any)?.wishlist ?? [];

   
    wishlist = rawWishlist.map((product: any) => ({
      id: product._id.toString(),
      name: product.name ?? "Unknown",
      price: product.price ?? 0,
      discountPrice: product.discountPrice ?? undefined,
      image: product.images?.[0] ?? "/placeholder.png",
      rating: product.ratings?.average ?? product.avgRating ?? 0,
      category: product.category?.name ?? "General",
    }));
  } catch (e: any) {
    console.error("Wishlist page error:", e);
    error = e.message;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        My Wishlist
        <span className="text-sm font-normal text-gray-500 ml-2">
          ({wishlist.length} items)
        </span>
      </h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
          Error: {error}
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-900 font-semibold text-lg mb-1">
            Your wishlist is empty
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Save items you love and come back to them later.
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#F97316] hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              discountPrice={product.discountPrice}
              image={product.image}
              rating={product.rating}
              category={product.category}
            />
          ))}
        </div>
      )}
    </div>
  );
}