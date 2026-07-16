import { Schema, model, Document, Types } from 'mongoose';

export interface IReply {
  senderId: Types.ObjectId;
  senderName: string;
  text: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  clientId: Types.ObjectId;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'closed';
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema = new Schema<IReply>({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const SupportTicketSchema = new Schema<ISupportTicket>({
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  priority: { 
    type: String, 
    required: true, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['open', 'in_progress', 'closed'], 
    default: 'open' 
  },
  replies: [ReplySchema]
}, { timestamps: true });

export const SupportTicket = model<ISupportTicket>('SupportTicket', SupportTicketSchema);
