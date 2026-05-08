'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetLink, setResetLink] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResetLink('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Something went wrong')
        return
      }

      toast.success(data.message || 'Reset link generated')
      if (data.resetUrl) {
        setResetLink(data.resetUrl)
      }
    } catch (error) {
      toast.error('Failed to process request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#F97316] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email and we’ll generate a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F97316] hover:bg-[#ea6a0f] text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {resetLink && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Temporary reset link:
            </p>
            <a
              href={resetLink}
              className="text-sm text-blue-600 break-all underline"
            >
              {resetLink}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}