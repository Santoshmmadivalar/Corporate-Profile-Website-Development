import { Schema, model, Document, Types } from 'mongoose';

export interface IMilestone {
  title: string;
  completed: boolean;
}

export interface IClientProject extends Document {
  clientId: Types.ObjectId;
  name: string;
  description: string;
  status: 'planning' | 'development' | 'testing' | 'completed';
  progress: number; // 0 to 100
  milestones: IMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>({
  title: { type: String, required: true },
  completed: { type: Boolean, required: true, default: false }
});

const ClientProjectSchema = new Schema<IClientProject>({
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['planning', 'development', 'testing', 'completed'], 
    default: 'planning' 
  },
  progress: { type: Number, required: true, min: 0, max: 100, default: 0 },
  milestones: [MilestoneSchema]
}, { timestamps: true });

export const ClientProject = model<IClientProject>('ClientProject', ClientProjectSchema);
