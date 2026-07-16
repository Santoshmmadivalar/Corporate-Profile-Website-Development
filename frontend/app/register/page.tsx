'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { verifyOTP } from '../../services/api';
import { ArrowRight, Lock, Mail, User as UserIcon, Phone, Shield, Building2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  phone: z.string().optional(),
  role: z.enum(['employee', 'client', 'candidate', 'user']),
  companyName: z.string().optional(),
}).refine(data => {
  if (data.role === 'client' && !data.companyName) {
    return false;
  }
  return true;
}, {
  message: 'Company Name is required for client registrations',
  path: ['companyName']
});

type RegisterFields = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, user, loading, loginWithToken } = useAuth();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP states
  const [showOtpVerify, setShowOtpVerify] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const { register: registerField, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'user'
    }
  });

  const selectedRole = watch('role');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'employee') router.push('/employee/portal');
      else if (user.role === 'client') router.push('/client/portal');
      else router.push('/');
    }
  }, [user, router]);

  const onSubmit = async (data: RegisterFields) => {
    setErrorMsg(null);
    const result = await registerUser(data);
    if (result.success) {
      setRegisteredEmail(data.email);
      setShowOtpVerify(true);
    } else {
      setErrorMsg(result.message || 'Registration failed');
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setVerifyingOtp(true);
    try {
      const response = await verifyOTP(registeredEmail, otpCode);
      if (response.success && response.data) {
        const { token } = response.data;
        await loginWithToken(token);
      } else {
        setErrorMsg(response.message || 'OTP verification failed');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Verification call failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 grid-glow">
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg glass-panel p-8 rounded-2xl shadow-xl z-10 my-8"
      >
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {showOtpVerify ? 'Verify Account' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {showOtpVerify ? `Enter the 6-digit OTP code sent to ${registeredEmail}` : 'Join the Outpro.India ecosystem'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {showOtpVerify ? (
          <form onSubmit={handleOtpVerify} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                6-Digit Verification Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 text-center font-mono font-bold tracking-widest text-lg"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifyingOtp}
              className="w-full flex items-center justify-center py-3 text-base font-semibold text-primary-foreground bg-primary rounded-xl shadow-lg hover:bg-primary/95 hover:shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 transition-all duration-200"
            >
              {verifyingOtp ? 'Verifying...' : 'Verify & Continue'}
              <ArrowRight size={18} className="ml-2" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
              <input
                type="text"
                placeholder="John Doe"
                {...registerField('name')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
              <input
                type="email"
                placeholder="john@example.com"
                {...registerField('email')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerField('password')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  {...registerField('phone')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Portal Account Type
            </label>
            <div className="relative">
              <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
              <select
                {...registerField('role')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 appearance-none"
              >
                <option value="user">Regular User (Public Access)</option>
                <option value="candidate">Candidate (Career Board/Jobs)</option>
                <option value="client">Client Portal (Projects & Billing)</option>
                <option value="employee">Employee Portal (Attendance & Leaves)</option>
              </select>
            </div>
          </div>

          {selectedRole === 'client' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1"
            >
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Company / Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <input
                  type="text"
                  placeholder="Vanguard Realty Inc."
                  {...registerField('companyName')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>
              {errors.companyName && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.companyName.message}</p>
              )}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full flex items-center justify-center py-3 text-base font-semibold text-primary-foreground bg-primary rounded-xl shadow-lg hover:bg-primary/95 hover:shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 transition-all duration-200"
          >
            {isSubmitting || loading ? 'Creating Account...' : 'Register'}
            <ArrowRight size={18} className="ml-2" />
          </button>
        </form>
      )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
