import ProductCard from './ProductCard'
import { ArrowRight } from 'lucide-react'

interface RelatedProductsProps {
  products: any[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
        <button className="text-[#F97316] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <ProductCard
            key={product._id}
            id={product._id}
            name={product.name}
            price={product.price}
            discountPrice={product.discountPrice}
            image={product.images?.[0] || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500'}
            rating={product.avgRating || 0}
            category="Related"
          />
        ))}
      </div>
    </div>
  )
}