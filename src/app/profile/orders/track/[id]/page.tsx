'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Truck, Package, Clock, MapPin, ArrowLeft, Home } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock, color: 'text-amber-500' },
  { key: 'processing', label: 'Processing', icon: Package, color: 'text-blue-500' },
  { key: 'shipped', label: 'Shipped', icon: Truck, color: 'text-purple-500' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'text-emerald-500' },
];

export default function TrackOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      router.push('/profile/orders');
      return;
    }

    fetch(`/api/orders/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Order not found</p>
          <Link href="/profile/orders" className="text-blue-600 underline">
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.orderStatus);
  const progress = ((currentStepIndex + 1) / statusSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900">Track Your Order</h1>
            <p className="text-gray-500 mt-3">
              Order ID: <span className="font-mono font-semibold text-lg">#{id}</span>
            </p>
          </div>

          
          <div className="relative h-3 bg-gray-100 rounded-full mb-12 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1E3A5F] via-[#F97316] to-emerald-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          
          <div className="space-y-10 mb-12">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex gap-6 items-start">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 flex-shrink-0 transition-all ${
                    isCompleted 
                      ? 'bg-emerald-100 border-emerald-500' 
                      : isCurrent 
                      ? 'bg-orange-100 border-[#F97316] animate-pulse' 
                      : 'bg-gray-100 border-gray-300'
                  }`}>
                    <Icon className={`w-6 h-6 ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-[#F97316]' : 'text-gray-400'}`} />
                  </div>

                  <div className="flex-1 pt-2">
                    <p className={`font-semibold text-lg ${isCurrent ? 'text-[#F97316]' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-gray-500 mt-1">
                        {order.orderStatus === 'shipped' 
                          ? 'Your order has been shipped and is on the way.' 
                          : 'We are currently processing your order.'}
                      </p>
                    )}
                    {isCompleted && index < currentStepIndex && (
                      <p className="text-xs text-emerald-600 mt-1">Completed • {formatDate(order.updatedAt || order.createdAt)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        
          <div className="grid md:grid-cols-2 gap-8 border-t pt-8">
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <MapPin className="text-[#1E3A5F]" /> Shipping Address
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.country}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold text-lg">{formatPrice(order.finalPrice || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="capitalize font-medium">{order.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-12">
            <Link
              href="/profile/orders"
              className="flex-1 border border-gray-300 py-4 rounded-2xl text-center font-semibold hover:bg-gray-50 transition"
            >
              My Orders
            </Link>
            <Link
              href="/products"
              className="flex-1 bg-[#F97316] text-white py-4 rounded-2xl text-center font-semibold hover:bg-orange-600 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}