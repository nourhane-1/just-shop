'use client'
import { useState } from 'react'
import { ShoppingCart, Minus, Plus, Heart, Check } from 'lucide-react'

interface AddToCartButtonProps {
  product: any
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleAddToCart = () => {
  
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]')

  
    const existingItem = existingCart.find((item: any) => item.id === product._id)

    if (existingItem) {
    
      existingItem.quantity += quantity
    } else {
      
      existingCart.push({
        id: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.images?.[0],
        quantity,
        stock: product.stock,
      })
    }

  
    localStorage.setItem('cart', JSON.stringify(existingCart))

   
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <div className="space-y-3">
 
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-5 py-2 font-semibold border-x border-gray-200">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
              disabled={quantity >= product.stock}
              className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40 transition"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm text-gray-500">{product.stock} in stock</span>
        </div>
      </div>

      
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all ${
            isAdded
              ? 'bg-green-500 text-white'
              : 'bg-[#F97316] hover:bg-[#ea6a0f] text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isAdded ? (
            <>
              <Check className="h-5 w-5" />
              Added to Cart!
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </>
          )}
        </button>

        <button
          onClick={() => setIsWishlisted(w => !w)}
          className={`p-3 rounded-xl border-2 transition-all ${
            isWishlisted
              ? 'border-red-300 bg-red-50 text-red-500'
              : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
          }`}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>

     
      <button
        disabled={product.stock === 0}
        className="w-full bg-[#1E3A5F] hover:bg-[#16304d] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
      >
        Buy Now
      </button>

    
      {isAdded && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm text-center">
          ✅ {quantity} item(s) added to cart successfully!
        </div>
      )}
    </div>
  )
}