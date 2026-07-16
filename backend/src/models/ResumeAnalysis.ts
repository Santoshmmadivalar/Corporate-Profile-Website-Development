import { Schema, model, Document } from 'mongoose';

export interface IResumeAnalysis extends Document {
  candidateId?: Schema.Types.ObjectId | string;
  candidateName: string;
  candidateEmail: string;
  atsScore: number;
  skillGapAnalysis: string[];
  keywordSuggestions: string[];
  interviewQuestions: string[];
  improvementSuggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResumeAnalysisSchema = new Schema<IResumeAnalysis>({
  candidateId: { type: Schema.Types.ObjectId, ref: 'User' },
  candidateName: { type: String, required: true },
  candidateEmail: { type: String, required: true },
  atsScore: { type: Number, required: true },
  skillGapAnalysis: { type: [String], default: [] },
  keywordSuggestions: { type: [String], default: [] },
  interviewQuestions: { type: [String], default: [] },
  improvementSuggestions: { type: [String], default: [] }
}, { timestamps: true });

export const ResumeAnalysis = model<IResumeAnalysis>('ResumeAnalysis', ResumeAnalysisSchema);
