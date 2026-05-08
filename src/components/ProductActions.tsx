'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface ProductActionsProps {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
}

export default function ProductActions({
  id,
  name,
  price,
  discountPrice,
  image,
}: ProductActionsProps) {
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        const res = await fetch('/api/users/me/wishlist', {
          credentials: 'include',
        });

        if (!res.ok) return;

        const data = await res.json();
        const wishlist = data?.wishlist || [];

        const exists = wishlist.some((item: any) => {
          const itemId = item._id || item.id;
          return String(itemId) === String(id);
        });

        setInWishlist(exists);
      } catch (error) {
        console.error('Wishlist check error:', error);
      }
    };

    checkWishlist();
  }, [id]);

  const toggleWishlist = async () => {
    setWishLoading(true);

    try {
      const res = await fetch('/api/users/me/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: id }),
      });

      if (res.status === 401) {
        toast.error('Please login first');
        router.push('/login');
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        toast.error(data?.error || 'Failed to update wishlist');
        return;
      }

      setInWishlist(data.added);

      if (data.added) {
        toast.success('Added to wishlist');
      } else {
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      toast.error('Something went wrong while updating wishlist');
    } finally {
      setWishLoading(false);
    }
  };

  const addToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIndex = cart.findIndex((item: any) => String(item.id) === String(id));

      const finalPrice = discountPrice && discountPrice > 0 ? discountPrice : price;

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          id,
          name,
          price: finalPrice,
          image,
          quantity: 1,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));

      toast.success('Product added to cart');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleBuyNow = () => {
    addToCart();
    toast.success('Redirecting to checkout...');
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      <button
        onClick={addToCart}
        className="flex-1 bg-[#F97316] hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
      >
        <ShoppingCart size={18} />
        Add to Cart
      </button>

      <button
        onClick={handleBuyNow}
        className="flex-1 bg-[#1E3A5F] hover:bg-[#16304d] text-white px-6 py-3 rounded-xl font-semibold transition"
      >
        Buy Now
      </button>

      <button
        onClick={toggleWishlist}
        disabled={wishLoading}
        className={`w-full sm:w-[56px] h-[50px] rounded-xl border transition flex items-center justify-center
          ${
            inWishlist
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-white border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200'
          }`}
      >
        <Heart
          size={20}
          fill={inWishlist ? 'currentColor' : 'none'}
        />
      </button>
    </div>
  );
}