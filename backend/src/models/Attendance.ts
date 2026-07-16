import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: Types.ObjectId;
  date: string; // Format: YYYY-MM-DD
  checkIn?: string; // Format: HH:MM:SS
  checkOut?: string; // Format: HH:MM:SS
  status: 'present' | 'absent' | 'late';
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  checkIn: { type: String },
  checkOut: { type: String },
  status: { 
    type: String, 
    required: true, 
    enum: ['present', 'absent', 'late'], 
    default: 'present' 
  }
}, { timestamps: true });

// Prevent duplicate attendance logs for same user on same day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance = model<IAttendance>('Attendance', AttendanceSchema);
