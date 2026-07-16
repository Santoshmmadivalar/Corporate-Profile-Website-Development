import { Schema, model, Document } from 'mongoose';

export interface IFollowUp {
  note: string;
  date: Date;
}

export interface ICRMEnquiry extends Document {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  followUps: IFollowUp[];
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>({
  note: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now }
});

const CRMEnquirySchema = new Schema<ICRMEnquiry>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  company: { type: String, trim: true },
  phone: { type: String, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['new', 'contacted', 'qualified', 'closed'], 
    default: 'new' 
  },
  followUps: [FollowUpSchema]
}, { timestamps: true });

export const CRMEnquiry = model<ICRMEnquiry>('CRMEnquiry', CRMEnquirySchema);
