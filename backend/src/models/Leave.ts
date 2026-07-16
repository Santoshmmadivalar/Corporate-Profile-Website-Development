import { Schema, model, Document, Types } from 'mongoose';

export interface ILeave extends Document {
  employeeId: Types.ObjectId;
  type: 'annual' | 'sick' | 'personal';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['annual', 'sick', 'personal'] 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  reason: { type: String, required: true }
}, { timestamps: true });

export const Leave = model<ILeave>('Leave', LeaveSchema);
