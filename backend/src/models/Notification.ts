import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  type: 'leave' | 'payroll' | 'invoice' | 'ticket' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['leave', 'payroll', 'invoice', 'ticket', 'system'],
    default: 'system'
  },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  read: { type: Boolean, required: true, default: false }
}, { timestamps: true });

export const Notification = model<INotification>('Notification', NotificationSchema);
