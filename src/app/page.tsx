import Link from 'next/link'
import {
  ArrowRight,
  ShoppingCart,
  Package,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Flame,
} from 'lucide-react'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Category from '@/models/Category'
import Banner from '@/models/Banner'
import CategoryCard from '@/components/CategoryCard'
import ProductCard from '@/components/ProductCard'
import HeroSlider from '@/components/HeroSlider'


async function getFeaturedProducts() {
  try {
    await connectDB()
    const products = await Product.find({ isActive: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean()

    return JSON.parse(JSON.stringify(products))
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}


async function getCategories() {
  try {
    await connectDB()
    const categories = await Category.find().lean()
    return JSON.parse(JSON.stringify(categories))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}


async function getActiveBanners() {
  try {
    await connectDB()
    const banners = await Banner.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean()

    return JSON.parse(JSON.stringify(banners))
  } catch (error) {
    console.error('Error fetching banners:', error)
    return []
  }
}


const staticCategories = [
  { name: 'Phones', slug: 'phones' },
  { name: 'Laptops', slug: 'laptops' },
  { name: 'Watches', slug: 'watches' },
  { name: 'Headphones', slug: 'headphones' },
  { name: 'Cameras', slug: 'cameras' },
  { name: 'Gaming', slug: 'gaming' },
]

export default async function HomePage() {
  const [products, categories, activeBanners] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getActiveBanners(),
  ])

  const flashSaleProducts = products.slice(0, 4)

  return (
    <div className="min-h-screen bg-gray-50">
      
      <HeroSlider banners={activeBanners} />

     
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Shop by Category
          </h2>
          <p className="text-gray-500">
            Browse through our wide range of categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.length > 0
            ? categories.map((cat: any) => (
                <CategoryCard
                  key={cat._id}
                  name={cat.name}
                  slug={cat.slug}
                />
              ))
            : staticCategories.map((cat) => (
                <CategoryCard
                  key={cat.slug}
                  name={cat.name}
                  slug={cat.slug}
                />
              ))}
        </div>
      </section>

    
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Featured Products
              </h2>
              <p className="text-gray-500">Picked directly from your database</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-2 bg-[#1E3A5F] text-white px-5 py-2.5 rounded-lg hover:bg-[#F97316] transition font-medium"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product: any) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  discountPrice={product.discountPrice}
                  image={
                    product.images?.[0] ||
                    'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500'
                  }
                  rating={product.avgRating || product.ratings?.average || 0}
                  category={product.category?.name || 'General'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">
                No Products Yet
              </h3>
              <p className="text-gray-400 text-sm">
                Add products from MongoDB and they will appear here automatically
              </p>
            </div>
          )}

          <div className="sm:hidden text-center mt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-[#F97316] font-semibold"
            >
              View All Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

     
      <section className="bg-[#1E3A5F] py-16 px-4 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#F97316]/20 text-[#FDBA74] px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Flame className="h-4 w-4" />
                Flash Sale
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Limited Time Deals
              </h2>
              <p className="text-blue-100">
                Grab your favorite products before the offer ends.
              </p>
            </div>

            <div className="flex gap-3">
              {['12', '34', '56'].map((num, i) => (
                <div
                  key={i}
                  className="bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-center min-w-[80px]"
                >
                  <p className="text-2xl font-bold">{num}</p>
                  <p className="text-xs text-blue-100">
                    {i === 0 ? 'Hours' : i === 1 ? 'Minutes' : 'Seconds'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {flashSaleProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSaleProducts.map((product: any) => (
                <div
                  key={product._id}
                  className="bg-white text-gray-900 rounded-2xl p-4 shadow-sm"
                >
                  <img
                    src={
                      product.images?.[0] ||
                      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500'
                    }
                    alt={product.name}
                    className="w-full h-56 object-cover rounded-xl mb-4"
                  />
                  <p className="text-sm text-gray-500 mb-1">
                    {product.category?.name || 'General'}
                  </p>
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-[#F97316]">
                      ${product.discountPrice || product.price}
                    </span>
                    {product.discountPrice > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        ${product.price}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/products/${product._id}`}
                    className="block text-center bg-[#F97316] hover:bg-orange-600 text-white py-2.5 rounded-xl font-medium transition"
                  >
                    Shop Deal
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why Choose Just Shop?
            </h2>
            <p className="text-gray-500">
              Trusted shopping experience with quality service
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Package className="h-8 w-8 text-white" />,
                title: 'Free Shipping',
                desc: 'On all orders over $50',
              },
              {
                icon: <ShieldCheck className="h-8 w-8 text-white" />,
                title: 'Secure Payment',
                desc: '100% secure transactions',
              },
              {
                icon: <RefreshCw className="h-8 w-8 text-white" />,
                title: 'Easy Returns',
                desc: '30-day return policy',
              },
              {
                icon: <Headphones className="h-8 w-8 text-white" />,
                title: '24/7 Support',
                desc: 'Always here to help you',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 shadow-sm text-center hover:shadow-md transition"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#1E3A5F] to-[#2d5a8f] rounded-full flex items-center justify-center mx-auto mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1E3A5F] rounded-[32px] px-6 py-12 sm:px-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">
              Get updates on new arrivals, exclusive discounts, and special offers.
            </p>

            <form className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3.5 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
              <button
                type="submit"
                className="bg-[#F97316] hover:bg-orange-600 px-6 py-3.5 rounded-xl font-semibold transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

     
      <footer className="bg-[#111827] text-white pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Just<span className="text-[#F97316]">Shop</span>
              </h3>
              <p className="text-gray-400 leading-7 text-sm">
                Your trusted destination for modern shopping, fashion, accessories,
                and more. Shop smarter with Just Shop.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/products" className="hover:text-white transition">All Products</Link></li>
                <li><Link href="/products" className="hover:text-white transition">New Arrivals</Link></li>
                <li><Link href="/products" className="hover:text-white transition">Best Sellers</Link></li>
                <li><Link href="/products" className="hover:text-white transition">Flash Sale</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/profile/orders" className="hover:text-white transition">My Orders</Link></li>
                <li><Link href="/cart" className="hover:text-white transition">Shopping Cart</Link></li>
                <li><Link href="/checkout" className="hover:text-white transition">Checkout</Link></li>
                <li><Link href="/profile/settings" className="hover:text-white transition">Account Settings</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>Email: support@justshop.com</li>
                <li>Phone: +20 100 123 4567</li>
                <li>Address: Cairo, Egypt</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>© 2026 Just Shop. All rights reserved.</p>
     
          </div>
        </div>
      </footer>
    </div>
  )
}