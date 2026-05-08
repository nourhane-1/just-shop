'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  stock?: number
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoMessage, setPromoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(savedCart)
    setIsLoading(false)
  }, [])


  const saveCart = (updatedCart: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    setCart(updatedCart)
    window.dispatchEvent(new Event('storage'))
  }

  
  const updateQuantity = (id: string, newQty: number) => {
    const updated = cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, newQty) } : item
    )
    saveCart(updated)
  }

 
  const removeItem = (id: string) => {
    const updated = cart.filter(item => item.id !== id)
    saveCart(updated)
  }

  
  const clearCart = () => {
    localStorage.removeItem('cart')
    setCart([])
    window.dispatchEvent(new Event('storage'))
  }


  const applyPromoCode = () => {
    const codes: Record<string, number> = {
      SAVE10: 10,
      SAVE20: 20,
      JUSTSHOP: 15,
    }

    const discountValue = codes[promoCode.toUpperCase()]
    if (discountValue) {
      setDiscount(discountValue)
      setPromoMessage(`✅ Promo code applied! ${discountValue}% off`)
    } else {
      setDiscount(0)
      setPromoMessage('❌ Invalid promo code')
    }
  }

  
  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  )

  const discountAmount = (subtotal * discount) / 100
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal - discountAmount + shipping

  const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A5F]"></div>
      </div>
    )
  }


  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-16 w-16 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
          <Link
            href="/products"
            className="bg-[#F97316] hover:bg-[#ea6a0f] text-white px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2 transition"
          >
            Start Shopping <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

      
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-500 mt-1">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
          </div>
          <button
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 transition"
          >
            <Trash2 className="h-4 w-4" />
            Clear Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

     
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const itemPrice = Number(item.price) || 0
              const itemQty = Number(item.quantity) || 0
              const maxStock = item.stock ?? 99 

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4"
                >
                
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                 
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.id}`}
                        className="font-semibold text-gray-900 hover:text-[#F97316] transition line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <p className="text-[#1E3A5F] font-bold text-lg mt-1">
                      ${itemPrice.toFixed(2)}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                    
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, itemQty - 1))}
                          disabled={itemQty <= 1}
                          className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 transition"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-1.5 font-semibold border-x border-gray-200 min-w-[40px] text-center">
                          {itemQty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, Math.min(maxStock, itemQty + 1))}
                          disabled={itemQty >= maxStock}
                          className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40 transition"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                    
                      <p className="font-bold text-gray-900">
                        ${(itemPrice * itemQty).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}

          
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-[#1E3A5F] hover:text-[#F97316] font-medium transition mt-2"
            >
              ← Continue Shopping
            </Link>
          </div>

       
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

             
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                {shipping > 0 && subtotal < 50 && (
                  <p className="text-xs text-gray-400">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}

                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[#1E3A5F]">${total.toFixed(2)}</span>
                </div>
              </div>

        
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="inline h-4 w-4 mr-1" />
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="px-4 py-2 bg-[#1E3A5F] text-white rounded-lg text-sm font-medium hover:bg-[#16304d] transition"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className="text-xs mt-2 text-gray-600">{promoMessage}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Try: SAVE10, SAVE20, JUSTSHOP
                </p>
              </div>

            
              <Link
                href="/checkout"
                className="w-full bg-[#F97316] hover:bg-[#ea6a0f] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-orange-100"
              >
                Proceed to Checkout <ArrowRight className="h-5 w-5" />
              </Link>

             
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400 mb-2">Secure payment powered by</p>
                <div className="flex justify-center gap-3 text-gray-400 text-xs font-semibold">
                  <span className="border px-2 py-1 rounded">VISA</span>
                  <span className="border px-2 py-1 rounded">Mastercard</span>
                  <span className="border px-2 py-1 rounded">PayPal</span>
                  <span className="border px-2 py-1 rounded">Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}