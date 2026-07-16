import { Schema, model, Document, Types } from 'mongoose';

export interface IInvoice extends Document {
  clientId: Types.ObjectId;
  projectId: Types.ObjectId;
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  status: 'paid' | 'unpaid' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'ClientProject', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['paid', 'unpaid', 'overdue'], 
    default: 'unpaid' 
  }
}, { timestamps: true });

export const Invoice = model<IInvoice>('Invoice', InvoiceSchema);
