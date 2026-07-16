import { Schema, model, Document } from 'mongoose';

export interface IKnowledgeBase extends Document {
  title: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'pptx' | 'url';
  fileUrl?: string;
  content: string;
  chunks: string[];
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeBaseSchema = new Schema<IKnowledgeBase>({
  title: { type: String, required: true },
  fileType: { 
    type: String, 
    required: true, 
    enum: ['pdf', 'docx', 'txt', 'pptx', 'url'] 
  },
  fileUrl: { type: String },
  content: { type: String, required: true },
  chunks: { type: [String], default: [] }
}, { timestamps: true });

export const KnowledgeBase = model<IKnowledgeBase>('KnowledgeBase', KnowledgeBaseSchema);
