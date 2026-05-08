'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ShoppingBag, CreditCard, Truck, Check,
  ChevronRight, Lock, MapPin, User, Mail, Phone
} from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

const STEPS = ['Cart', 'Shipping', 'Payment', 'Confirm']

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const [shipping, setShipping] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Egypt',
    zipCode: '',
  })

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'cod' | 'wallet'>('card')
  const [cardDetails, setCardDetails] = useState({
    number: '', name: '', expiry: '', cvv: '',
  })

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]')
    if (savedCart.length === 0) router.push('/cart')
    setCart(savedCart)
  }, [router])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = subtotal > 50 ? 0 : 9.99
  const total = subtotal + shippingCost

  const isShippingValid = shipping.firstName && shipping.lastName &&
    shipping.email && shipping.phone && shipping.address && shipping.city

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true)

    try {
   
      if (paymentMethod === 'card') {
        const stripeRes = await fetch('/api/payments/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            items: cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
            shipping,
          }),
        })

        const stripeData = await stripeRes.json()

        if (!stripeRes.ok) {
          toast.error(stripeData.error || 'Failed to start payment')
          return
        }

        if (stripeData.url) {
          toast.success('Redirecting to secure payment...')
          window.location.href = stripeData.url
          return
        }
      }

 
      const orderData = {
        items: cart.map(item => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress: {
          street: shipping.address,
          city: shipping.city,
          country: shipping.country,
        },
        paymentMethod,
        userEmail: shipping.email,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData),
      })

      if (res.ok) {
        localStorage.removeItem('cart')
        window.dispatchEvent(new Event('storage'))
        toast.success('Order placed successfully')
        router.push('/order/success')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to place order')
      }
    } catch (err) {
      toast.error('Error occurred while placing order')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

       
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <div className="flex items-center justify-center gap-2">
            <Lock className="h-4 w-4 text-green-500" />
            <span className="text-sm text-gray-500">Secure & Encrypted Checkout</span>
          </div>
        </div>

     
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  index < currentStep ? 'bg-green-500 text-white'
                  : index === currentStep ? 'bg-[#1E3A5F] text-white'
                  : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  index === currentStep ? 'text-[#1E3A5F]' : 'text-gray-400'
                }`}>
                  {step}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-16 sm:w-24 h-1 mx-2 rounded transition-all ${
                  index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

        
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Shipping Information</h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={shipping.firstName}
                        onChange={e => setShipping({ ...shipping, firstName: e.target.value })}
                        placeholder="John"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={shipping.lastName}
                        onChange={e => setShipping({ ...shipping, lastName: e.target.value })}
                        placeholder="Doe"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={shipping.email}
                        onChange={e => setShipping({ ...shipping, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={shipping.phone}
                        onChange={e => setShipping({ ...shipping, phone: e.target.value })}
                        placeholder="+20 1234567890"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input
                      type="text"
                      value={shipping.address}
                      onChange={e => setShipping({ ...shipping, address: e.target.value })}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={e => setShipping({ ...shipping, city: e.target.value })}
                      placeholder="Cairo"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      value={shipping.country}
                      onChange={e => setShipping({ ...shipping, country: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                    >
                      <option>Egypt</option>
                      <option>Saudi Arabia</option>
                      <option>UAE</option>
                      <option>USA</option>
                      <option>UK</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!isShippingValid}
                  className="mt-6 w-full bg-[#1E3A5F] hover:bg-[#16304d] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

           
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#1E3A5F] rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { id: 'card', label: 'Credit Card', icon: '💳' },
                    { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                    { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
                    { id: 'wallet', label: 'Wallet', icon: '👛' },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`p-3 rounded-xl border-2 text-center transition ${
                        paymentMethod === method.id
                          ? 'border-[#F97316] bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{method.icon}</div>
                      <p className="text-xs font-medium text-gray-700">{method.label}</p>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F97316] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F97316] bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F97316] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          placeholder="•••"
                          maxLength={3}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#F97316] bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                    💵 You will pay <strong>${total.toFixed(2)}</strong> cash when your order arrives.
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-[#1E3A5F] hover:bg-[#16304d] text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    Review Order <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

        
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-[#1E3A5F]" />
                      Shipping To
                    </h3>
                    <button onClick={() => setCurrentStep(1)} className="text-sm text-[#F97316] hover:underline">Edit</button>
                  </div>
                  <p className="text-gray-700 font-medium">{shipping.firstName} {shipping.lastName}</p>
                  <p className="text-gray-500 text-sm">{shipping.address}, {shipping.city}, {shipping.country}</p>
                  <p className="text-gray-500 text-sm">{shipping.email} | {shipping.phone}</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-[#1E3A5F]" />
                      Payment
                    </h3>
                    <button onClick={() => setCurrentStep(2)} className="text-sm text-[#F97316] hover:underline">Edit</button>
                  </div>
                  <p className="text-gray-700 capitalize">
                    {paymentMethod === 'card' && '💳 Credit Card'}
                    {paymentMethod === 'paypal' && '🅿️ PayPal'}
                    {paymentMethod === 'cod' && '💵 Cash on Delivery'}
                    {paymentMethod === 'wallet' && '👛 Wallet'}
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-[#1E3A5F]" />
                    Items ({cart.length})
                  </h3>
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="flex-1 bg-[#F97316] hover:bg-[#ea6a0f] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70"
                  >
                    {isPlacingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Place Order ${total.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

         
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 bg-[#1E3A5F] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    </div>
                    <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span className="text-[#1E3A5F]">${total.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-4 bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-500 flex-shrink-0" />
                <p className="text-xs text-gray-500">Your payment info is safe and encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}