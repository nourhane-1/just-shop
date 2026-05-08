'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  rating: number;
  category: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  discountPrice,
  image,
  rating,
  category,
}) => {
  const router = useRouter();

  const [wishLoading, setWishLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

 
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


  const discount =
    discountPrice && price > discountPrice
      ? Math.round(((price - discountPrice) / price) * 100)
      : 0;

 
  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setWishLoading(true);

    try {
      const res = await fetch('/api/users/me/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId: id }),
      });

      if (res.status === 401) {
        toast.error("Please login first");
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
        toast.success("Added to wishlist");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      toast.error("Something went wrong while updating wishlist");
    } finally {
      setWishLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');

      const existingIndex = cart.findIndex(
        (item: any) => String(item.id) === String(id)
      );

      const finalPrice =
        discountPrice && discountPrice > 0 ? discountPrice : price;

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

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full overflow-hidden">
  
      <div className="relative h-64 w-full overflow-hidden rounded-t-2xl bg-gray-100">
        <Link href={`/products/${id}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            -{discount}%
          </span>
        )}

     
        <button
          onClick={toggleWishlist}
          disabled={wishLoading}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all duration-200 disabled:opacity-50
            ${
              inWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/80 backdrop-blur-sm text-slate-600 hover:text-red-500 hover:bg-white'
            }`}
        >
          <Heart
            size={18}
            fill={inWishlist ? 'currentColor' : 'none'}
            className={inWishlist ? 'text-white' : ''}
          />
        </button>
      </div>

   
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
          {category}
        </span>

        <Link href={`/products/${id}`}>
          <h3 className="text-slate-800 font-semibold text-base mb-2 line-clamp-2 hover:text-[#F97316] transition-colors cursor-pointer">
            {name}
          </h3>
        </Link>

     
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
                className={
                  i < Math.floor(rating)
                    ? 'text-yellow-400'
                    : 'text-slate-300'
                }
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 ml-2">({rating})</span>
        </div>

       
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {discountPrice && discountPrice > 0 ? (
              <>
                <span className="text-lg font-bold text-slate-900">
                  ${discountPrice}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  ${price}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-slate-900">
                ${price}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center p-2.5 bg-[#F97316] text-white rounded-xl hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-100"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;