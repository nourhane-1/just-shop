import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  phone?: string
  image?: string
  role: 'customer' | 'seller' | 'admin'
  isVerified: boolean
  isBlocked: boolean
  addresses: {
    street: string
    city: string
    country: string
    isDefault: boolean
  }[]
  wishlist: mongoose.Types.ObjectId[]
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  verificationToken?: string
  verificationTokenExpires?: Date
  createdAt: Date
}
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    phone: { type: String },
    image: { type: String },
    role: {
      type: String,
      enum: ['customer', 'seller', 'admin'],
      default: 'customer',
    },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    addresses: [
      {
        street: { type: String },
        city: { type: String },
        country: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    resetPasswordToken: { type: String },
     resetPasswordExpires: { type: Date },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)