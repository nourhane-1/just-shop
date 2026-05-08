import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IBanner extends Document {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    buttonText: {
      type: String,
      required: true,
      trim: true,
    },
    buttonLink: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default models.Banner || model<IBanner>("Banner", BannerSchema);