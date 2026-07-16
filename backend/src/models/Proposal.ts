import { Schema, model, Document } from 'mongoose';

export interface IProposal extends Document {
  userId?: Schema.Types.ObjectId | string;
  businessType: string;
  projectType: string;
  budget: number;
  timeline: string;
  requirements: string;
  proposalText: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProposalSchema = new Schema<IProposal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  businessType: { type: String, required: true },
  projectType: { type: String, required: true },
  budget: { type: Number, required: true },
  timeline: { type: String, required: true },
  requirements: { type: String, required: true },
  proposalText: { type: String, required: true }
}, { timestamps: true });

export const Proposal = model<IProposal>('Proposal', ProposalSchema);
