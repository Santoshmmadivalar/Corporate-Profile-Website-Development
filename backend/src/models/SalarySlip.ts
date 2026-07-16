import { Schema, model, Document, Types } from 'mongoose';

export interface ISalarySlip extends Document {
  employeeId: Types.ObjectId;
  month: string; // e.g. "January" or "01"
  year: number;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'unpaid';
  createdAt: Date;
  updatedAt: Date;
}

const SalarySlipSchema = new Schema<ISalarySlip>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  baseSalary: { type: Number, required: true },
  bonuses: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['paid', 'unpaid'], 
    default: 'paid' 
  }
}, { timestamps: true });

export const SalarySlip = model<ISalarySlip>('SalarySlip', SalarySlipSchema);
