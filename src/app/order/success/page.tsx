'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, ArrowRight, Home } from 'lucide-react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden">
        
       
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 py-12 px-8 text-center text-white">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-14 h-14 text-emerald-500" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-emerald-100">
            Thank you for shopping with Just Shop
          </p>
        </div>

        
        <div className="p-8 text-center">
          {sessionId ? (
            <>
              <p className="text-gray-700 text-lg font-medium mb-2">
                Your payment was completed successfully via Stripe.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Session ID: <span className="font-mono">{sessionId}</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-700 text-lg font-medium mb-2">
                Your order has been received successfully.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You can now track your order from your profile page.
              </p>
            </>
          )}

          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8">
            <p className="text-sm text-gray-600">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/profile/orders"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1E3A5F] hover:bg-[#16304d] text-white py-4 rounded-2xl font-semibold transition"
            >
              Track My Order
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/products"
              className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 py-4 rounded-2xl font-semibold transition"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 py-2 text-sm font-medium transition"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}