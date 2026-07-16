import { Schema, model, Document } from 'mongoose';

export interface IChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface IChatHistory extends Document {
  userId?: Schema.Types.ObjectId | string;
  sessionId: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatHistorySchema = new Schema<IChatHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true, unique: true },
  messages: [ChatMessageSchema]
}, { timestamps: true });

export const ChatHistory = model<IChatHistory>('ChatHistory', ChatHistorySchema);
