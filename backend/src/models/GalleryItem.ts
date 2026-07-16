import { Schema, model, Document } from 'mongoose';

export interface IGalleryItem extends Document {
  title: string;
  url: string;
  type: 'image' | 'video';
  category: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema<IGalleryItem>({
  title: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ['image', 'video'], default: 'image' },
  category: { type: String, required: true, trim: true },
  description: { type: String, trim: true }
}, { timestamps: true });

export const GalleryItem = model<IGalleryItem>('GalleryItem', GalleryItemSchema);
