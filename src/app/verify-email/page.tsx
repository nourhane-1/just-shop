'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setSuccess(false)
        setMessage('Invalid verification link')
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (!res.ok) {
          setSuccess(false)
          setMessage(data.error || 'Verification failed')
        } else {
          setSuccess(true)
          setMessage(data.message || 'Email verified successfully')
        }
      } catch (error) {
        setSuccess(false)
        setMessage('Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {loading ? (
          <>
            <Loader2 className="h-14 w-14 text-[#1E3A5F] animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email...</h1>
            <p className="text-gray-500">Please wait while we verify your email.</p>
          </>
        ) : success ? (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-[#F97316] hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              Go to Login
            </Link>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
            <p className="text-gray-500 mb-6">{message}</p>
            <Link
              href="/register"
              className="inline-block bg-[#1E3A5F] hover:bg-[#16304d] text-white px-6 py-3 rounded-xl font-medium transition"
            >
              Back to Register
            </Link>
          </>
        )}
      </div>
    </div>
  )
}