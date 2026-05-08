'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react'

interface Banner {
  _id: string
  title: string
  subtitle: string
  buttonText: string
  buttonLink: string
  image: string
  isActive: boolean
}

interface HeroSliderProps {
  banners: Banner[]
}

export default function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!banners || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [banners])

  if (!banners || banners.length === 0) {
    return (
      <section className="relative overflow-hidden bg-[#1E3A5F] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-[#F97316]/20 text-[#FDBA74] px-4 py-1.5 rounded-full text-sm font-medium">
              🛍️ Welcome to Just Shop
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Shop Smart,
              <br />
              <span className="text-[#F97316]">Shop Better</span>
            </h1>

            <p className="text-lg text-blue-100 max-w-xl">
              Discover amazing products at unbeatable prices. From fashion to essentials,
              Just Shop gives you the best shopping experience.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="bg-[#F97316] hover:bg-[#ea6a0f] px-8 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-orange-500/30"
              >
                Shop Now <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1200"
              alt="Hero"
              className="w-full h-[420px] object-cover rounded-3xl shadow-xl"
            />
          </div>
        </div>
      </section>
    )
  }

  const banner = banners[current]

  return (
    <section className="relative overflow-hidden bg-[#1E3A5F] text-white py-20 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_30%)]" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
       
        <div className="space-y-6">
          <div className="inline-block bg-[#F97316]/20 text-[#FDBA74] px-4 py-1.5 rounded-full text-sm font-medium">
            🛍️ Featured Banner
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight transition-all duration-500">
            {banner.title}
          </h1>

          <p className="text-lg text-blue-100 max-w-xl transition-all duration-500">
            {banner.subtitle}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href={banner.buttonLink || "/products"}
              className="bg-[#F97316] hover:bg-[#ea6a0f] px-8 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-orange-500/30"
            >
              {banner.buttonText || "Shop Now"} <ArrowRight className="h-5 w-5" />
            </Link>

            <Link
              href="/products"
              className="border border-white/40 hover:border-white hover:bg-white/10 px-8 py-3 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
            >
              Explore More
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 pt-3 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#F97316]" />
              Free Shipping
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#F97316]" />
              Secure Checkout
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-[#F97316]" />
              Easy Returns
            </div>
          </div>

       
          {banners.length > 1 && (
            <div className="flex items-center gap-2 pt-4">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    current === index
                      ? 'w-8 bg-[#F97316]'
                      : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-[420px] object-cover rounded-3xl shadow-xl transition-all duration-500"
          />
        </div>
      </div>
    </section>
  )
}