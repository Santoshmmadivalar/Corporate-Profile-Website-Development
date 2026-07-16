import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  actorName: string;
  action: string;
  details: string;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String, required: true, trim: true },
  action: { type: String, required: true, trim: true },
  details: { type: String, required: true },
  ipAddress: { type: String, trim: true }
}, { timestamps: true });

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
