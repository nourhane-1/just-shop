import { Suspense } from 'react'
import ProductsContent from '@/components/ProductsContent'
import { connectDB } from '@/lib/mongodb'
import Product from '@/models/Product'
import Category from '@/models/Category'


async function getProducts(searchParamsObj: any) {
  try {
    await connectDB()
    
    const page = parseInt(searchParamsObj.page || '1')
    const limit = 12
    const skip = (page - 1) * limit

    const query: any = { isActive: true }
    
    if (searchParamsObj.search) {
      query.name = { $regex: searchParamsObj.search, $options: 'i' }
    }
    
    if (searchParamsObj.category) {
      const category = await Category.findOne({ slug: searchParamsObj.category })
      if (category) query.category = category._id
    }
    
    if (searchParamsObj.minPrice || searchParamsObj.maxPrice) {
      query.price = {}
      if (searchParamsObj.minPrice) query.price.$gte = parseFloat(searchParamsObj.minPrice)
      if (searchParamsObj.maxPrice) query.price.$lte = parseFloat(searchParamsObj.maxPrice)
    }
    
    let sort: any = { createdAt: -1 }
    if (searchParamsObj.sort === 'price_asc') sort = { price: 1 }
    if (searchParamsObj.sort === 'price_desc') sort = { price: -1 }
    if (searchParamsObj.sort === 'rating') sort = { avgRating: -1 }
    if (searchParamsObj.sort === 'name') sort = { name: 1 }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ])

    return {
      products: JSON.parse(JSON.stringify(products)),
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], total: 0, pages: 0, currentPage: 1 }
  }
}


async function getCategories() {
  try {
    await connectDB()
    const categories = await Category.find().lean()
    return JSON.parse(JSON.stringify(categories))
  } catch (error) {
    return []
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {

  const searchParamsObj = await searchParams

  const [productsData, categories] = await Promise.all([
    getProducts(searchParamsObj),
    getCategories()
  ])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-500">
            {productsData.total} {productsData.total === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <ProductsContent
            products={productsData.products}
            categories={categories}
            total={productsData.total}
            pages={productsData.pages}
            currentPage={productsData.currentPage}
          />
        </Suspense>
      </div>
    </div>
  )
}