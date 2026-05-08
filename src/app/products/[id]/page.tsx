import { notFound } from 'next/navigation'
import Link from 'next/link'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import ProductActions from '@/components/ProductActions'
import ProductImageGallery from '@/components/ProductImageGallery'
import ProductReviews from '@/components/ProductReviews'
import { Star, Package, ShieldCheck, RefreshCw } from 'lucide-react'

async function getProduct(id: string) {
  try {
    await connectDB()
    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('seller', 'name')
      .lean()
    if (!product) return null
    return JSON.parse(JSON.stringify(product))
  } catch (error) {
    return null
  }
}

async function getRelatedProducts(categoryId: string, currentId: string) {
  try {
    await connectDB()
    const products = await Product.find({
      category: categoryId,
      _id: { $ne: currentId },
      isActive: true,
    }).limit(4).lean()
    return JSON.parse(JSON.stringify(products))
  } catch {
    return []
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const relatedProducts = product.category?._id
    ? await getRelatedProducts(product.category._id, product._id)
    : []

  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">

       
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#F97316]">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#F97316]">Products</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>

       
        <div className="grid lg:grid-cols-2 gap-8 mb-12">

          
          <ProductImageGallery images={product.images} productName={product.name} />

      
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">

           
            {product.category && (
              <Link
                href={`/products?category=${product.category.slug}`}
                className="inline-block text-xs font-semibold text-[#F97316] bg-orange-50 px-3 py-1 rounded-full mb-3"
              >
                {product.category.name}
              </Link>
            )}

         
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(product.avgRating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600 text-sm">
                {(product.avgRating || 0).toFixed(1)} ({product.ratings?.length || 0} reviews)
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-4xl font-bold text-[#1E3A5F]">
                  ${product.discountPrice || product.price}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">${product.price}</span>
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-sm font-semibold">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-400">Tax included. Free shipping over $50</p>
            </div>

           
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-sm">In Stock ({product.stock} available)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium text-sm">Out of Stock</span>
                </div>
              )}
            </div>

           
            <ProductActions
              id={product._id.toString()}
              name={product.name}
              price={product.price}
              discountPrice={product.discountPrice}
              image={product.images?.[0] || ''}
            />

            
            <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
              {[
                { icon: <Package className="h-4 w-4" />, text: 'Free shipping on orders over $50' },
                { icon: <ShieldCheck className="h-4 w-4" />, text: '1 year warranty included' },
                { icon: <RefreshCw className="h-4 w-4" />, text: '30-day return policy' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-[#1E3A5F]">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
          </div>
        </div>

       
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>

       
        <ProductReviews productId={product._id.toString()} />
    
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p: any) => (
                <Link key={p._id} href={`/products/${p._id}`}>
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden">
                    <div className="h-40 bg-gray-100 overflow-hidden">
                      <img
                        src={p.images?.[0]}
                        alt={p.name}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm line-clamp-1">{p.name}</p>
                      <p className="text-[#1E3A5F] font-bold">${p.discountPrice || p.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}