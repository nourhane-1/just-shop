import mongoose, { Schema, Document } from 'mongoose'

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId
  items: {
    product: mongoose.Types.ObjectId
    quantity: number
    price: number
  }[]
  totalPrice: number
  discount: number
  finalPrice: number
  promoCode?: string
  paymentMethod: 'card' | 'paypal' | 'cod' | 'wallet'
  paymentStatus: 'pending' | 'paid' | 'failed'
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: {
    street: string
    city: string
    country: string
  }
  stripePaymentId?: string
}

const OrderSchema = new Schema<IOrder>({
  user:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:  { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    price:    { type: Number, required: true },
  }],
  totalPrice:     { type: Number, required: true },
  discount:       { type: Number, default: 0 },
  finalPrice:     { type: Number, required: true },
  promoCode:      { type: String },
  paymentMethod:  { type: String, enum: ['card', 'paypal', 'cod', 'wallet'], required: true },
  paymentStatus:  { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus:    { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    country: { type: String, required: true },
  },
  stripePaymentId: { type: String },
}, { timestamps: true })

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)