import Link from 'next/link'
import {
  Smartphone, Laptop, Watch,
  Headphones, Camera, Gamepad, Package
} from 'lucide-react'

interface CategoryCardProps {
  name: string
  slug: string
  count?: number
}


function CategoryIcon({ slug }: { slug: string }) {
  const icons: Record<string, React.ReactNode> = {
    phones: <Smartphone className="h-7 w-7 text-white" />,
    laptops: <Laptop className="h-7 w-7 text-white" />,
    watches: <Watch className="h-7 w-7 text-white" />,
    headphones: <Headphones className="h-7 w-7 text-white" />,
    cameras: <Camera className="h-7 w-7 text-white" />,
    gaming: <Gamepad className="h-7 w-7 text-white" />,
  }
  return <>{icons[slug] || <Package className="h-7 w-7 text-white" />}</>
}

export default function CategoryCard({ name, slug, count }: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${slug}`}
      className="bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group text-center border border-gray-100"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A5F] to-[#2d5a8f] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:from-[#F97316] group-hover:to-[#ea6a0f] transition-all duration-300">
        <CategoryIcon slug={slug} />
      </div>
      <p className="font-semibold text-gray-800 text-sm">{name}</p>
      {count !== undefined && (
        <p className="text-xs text-gray-400 mt-1">{count} Products</p>
      )}
    </Link>
  )
}