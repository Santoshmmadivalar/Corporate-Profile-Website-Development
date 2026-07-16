import { Schema, model, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  candidateName: string;
  candidateEmail: string;
  resumeUrl: string;
  status: 'applied' | 'reviewing' | 'shortlisted' | 'rejected';
  screeningScore?: number;
  screeningNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateName: { type: String, required: true, trim: true },
  candidateEmail: { type: String, required: true, lowercase: true, trim: true },
  resumeUrl: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['applied', 'reviewing', 'shortlisted', 'rejected'], 
    default: 'applied' 
  },
  screeningScore: { type: Number, default: 0 },
  screeningNotes: { type: String }
}, { timestamps: true });

export const Application = model<IApplication>('Application', ApplicationSchema);
