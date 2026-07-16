import { Schema, model, Document } from 'mongoose';

export interface IComment {
  authorName: string;
  text: string;
  date: Date;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  summary: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  likes: number;
  views: number;
  comments: IComment[];
  featured: boolean;
  seoTitle?: string;
  seoDesc?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  authorName: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const BlogSchema = new Schema<IBlog>({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  content: { type: String, required: true },
  summary: { type: String, required: true },
  author: { type: String, default: 'Outpro.India Systems' },
  category: { type: String, required: true, trim: true },
  tags: [{ type: String, trim: true }],
  image: { type: String },
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  comments: [CommentSchema],
  featured: { type: Boolean, default: false },
  seoTitle: { type: String, trim: true },
  seoDesc: { type: String, trim: true }
}, { timestamps: true });

export const Blog = model<IBlog>('Blog', BlogSchema);
