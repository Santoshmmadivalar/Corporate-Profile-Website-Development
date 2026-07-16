import { Schema, model, Document } from 'mongoose';

export interface IMeeting extends Document {
  userId?: Schema.Types.ObjectId | string;
  userName: string;
  userEmail: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  googleMeetLink: string;
  status: 'scheduled' | 'rescheduled' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  googleMeetLink: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'rescheduled', 'cancelled'], 
    default: 'scheduled' 
  }
}, { timestamps: true });

export const Meeting = model<IMeeting>('Meeting', MeetingSchema);
