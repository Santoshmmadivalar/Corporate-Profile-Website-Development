import { Schema, model, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  salaryRange?: string;
  status: 'open' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>({
  title: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: { type: [String], required: true },
  salaryRange: { type: String },
  status: { type: String, required: true, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

export const Job = model<IJob>('Job', JobSchema);
