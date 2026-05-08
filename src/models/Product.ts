import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  price: number
  discountPrice?: number
  images: string[]
  category: mongoose.Types.ObjectId
  seller: mongoose.Types.ObjectId
  stock: number
  ratings: { user: mongoose.Types.ObjectId; rating: number; review: string }[]
  avgRating: number
  isActive: boolean
}

const ProductSchema = new Schema<IProduct>({
  name:          { type: String, required: true },
  slug:          { type: String, required: true, unique: true },
  description:   { type: String, required: true },
  price:         { type: Number, required: true },
  discountPrice: { type: Number },
  images:        [{ type: String }],
  category:      { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  seller:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stock:         { type: Number, default: 0 },
  ratings: [{
    user:   { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
  }],
  avgRating: { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)