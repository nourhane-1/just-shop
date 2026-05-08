import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'

import { Toaster } from "sonner";
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Just Shop - Your Trusted E-Commerce Store',
  description: 'Shop the best products at amazing prices',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster richColors position="top-right" />
        <Providers>
          <Navbar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <footer className="bg-[#1E3A5F] text-white py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p>&copy; 2026Just Shop. All rights reserved.</p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}