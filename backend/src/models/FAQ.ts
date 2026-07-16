import { Schema, model, Document } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true },
  category: { type: String, required: true, trim: true, default: 'general' }
}, { timestamps: true });

export const FAQ = model<IFAQ>('FAQ', FAQSchema);
