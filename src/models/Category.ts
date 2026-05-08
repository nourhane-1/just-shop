import mongoose, { Schema, Document } from 'mongoose'

export interface ICategory extends Document {
  name: string
  slug: string
  image?: string
  parent?: mongoose.Types.ObjectId
}

const CategorySchema = new Schema<ICategory>({
  name:   { type: String, required: true },
  slug:   { type: String, required: true, unique: true },
  image:  { type: String },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: true })

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)