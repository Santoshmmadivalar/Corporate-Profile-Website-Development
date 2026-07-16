import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'employee' | 'client' | 'candidate' | 'user';
  phone?: string;
  title?: string;
  department?: string;
  companyName?: string;
  avatar?: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  bio?: string;
  address?: string;
  skills?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['admin', 'employee', 'client', 'candidate', 'user'], 
    default: 'user' 
  },
  phone: { type: String },
  title: { type: String },
  department: { type: String },
  companyName: { type: String },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  bio: { type: String, default: '' },
  address: { type: String, default: '' },
  skills: { type: [String], default: [] },
  socialLinks: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    twitter: { type: String, default: '' }
  }
}, { timestamps: true });

export const User = model<IUser>('User', UserSchema);
