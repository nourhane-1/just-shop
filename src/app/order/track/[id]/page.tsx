'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Truck, Package, Clock, MapPin, ArrowLeft } from 'lucide-react';
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

  useEffect(() => {
    if (!id) return;

    fetch(`/api/orders/${id}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading tracking information...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl">Order not found</p>
          <Link href="/profile/orders" className="text-blue-600 mt-4 inline-block">
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
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
            <p className="text-gray-500 mt-2">Order ID: <span className="font-mono font-semibold">#{id}</span></p>
          </div>

         
          <div className="relative h-2 bg-gray-100 rounded-full mb-12 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1E3A5F] to-[#F97316] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

         
          <div className="space-y-8 mb-12">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex gap-5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 ${
                    isCompleted ? 'bg-emerald-100 border-emerald-500' : 'bg-gray-100 border-gray-300'
                  }`}>
                    <Icon className={`w-5 h-5 ${isCompleted ? 'text-emerald-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 pt-2">
                    <p className={`font-semibold ${isCurrent ? 'text-[#F97316]' : isCompleted ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-gray-500 mt-1">
                        {order.orderStatus === 'shipped' ? 'Your order is on the way' : 'We are working on your order'}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-400 pt-3">
                    {isCompleted && '✓'}
                  </div>
                </div>
              );
            })}
          </div>

         
          <div className="border-t pt-8">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="text-[#1E3A5F]" /> Shipping Address
            </h3>
            <p className="text-gray-700">
              {order.shippingAddress?.street}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.country}
            </p>

            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="bg-gray-50 rounded-2xl p-5">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-bold">{formatPrice(order.finalPrice || 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Payment Method</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <Link
              href="/profile/orders"
              className="flex-1 border border-gray-300 py-4 rounded-2xl text-center font-semibold hover:bg-gray-50"
            >
              My Orders
            </Link>
            <Link
              href="/products"
              className="flex-1 bg-[#F97316] text-white py-4 rounded-2xl text-center font-semibold hover:bg-orange-600"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}