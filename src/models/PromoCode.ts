import mongoose, { Schema, Document } from 'mongoose'

export interface IPromoCode extends Document {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  maxUses: number
  usedCount: number
  expiresAt: Date
  isActive: boolean
}

const PromoCodeSchema = new Schema<IPromoCode>({
  code:      { type: String, required: true, unique: true, uppercase: true },
  discount:  { type: Number, required: true },
  type:      { type: String, enum: ['percentage', 'fixed'], required: true },
  maxUses:   { type: Number, default: 100 },
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.models.PromoCode || mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema)