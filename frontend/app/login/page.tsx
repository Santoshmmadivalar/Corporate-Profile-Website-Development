'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Lock, Mail, AlertCircle, Shield, Briefcase, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFields = z.infer<typeof loginSchema>;

import { verifyOTP, googleLoginAPI } from '../../services/api';

export default function LoginPage() {
  const { login, user, loading, loginWithToken } = useAuth();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ssoLoading, setSsoLoading] = useState(false);

  // OTP Verification states
  const [showOtpVerify, setShowOtpVerify] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const { register: registerField, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema)
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'employee') router.push('/employee/portal');
      else if (user.role === 'client') router.push('/client/portal');
      else router.push('/dashboard');
    }
  }, [user, router]);

  const handleGoogleSSO = async () => {
    setErrorMsg(null);
    setSsoLoading(true);
    try {
      const res = await googleLoginAPI({
        email: 'google.user@outpro.india',
        name: 'Google Federated User',
        googleId: 'g-sso-1029384756'
      });
      if (res.success && res.data) {
        const { token } = res.data;
        await loginWithToken(token);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Google SSO failed');
    } finally {
      setSsoLoading(false);
    }
  };

  const handleMicrosoftSSO = async () => {
    setErrorMsg(null);
    setSsoLoading(true);
    try {
      const res = await googleLoginAPI({
        email: 'ms.user@outpro.india',
        name: 'Microsoft Federated User',
        googleId: 'ms-sso-9876543210'
      });
      if (res.success && res.data) {
        const { token } = res.data;
        await loginWithToken(token);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Microsoft SSO failed');
    } finally {
      setSsoLoading(false);
    }
  };

  const onSubmit = async (data: LoginFields) => {
    setErrorMsg(null);
    const result = await login(data.email, data.password);
    if (!result.success) {
      if (result.requiresVerification) {
        setRegisteredEmail(result.email);
        setShowOtpVerify(true);
      } else {
        setErrorMsg(result.message || 'Invalid credentials');
      }
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

  const prefillCredentials = (email: string) => {
    setValue('email', email);
    setValue('password', 'password123');
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 grid-glow">
      {/* Background blobs */}
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg glass-panel p-8 rounded-2xl shadow-xl z-10"
      >
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            {showOtpVerify ? 'Verify Account' : 'Welcome Back'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {showOtpVerify ? `Enter the 6-digit OTP code sent to ${registeredEmail}` : 'Access your Outpro.India workspace and portals'}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...registerField('email')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerField('password')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
              )}
              <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading || ssoLoading}
              className="w-full flex items-center justify-center py-3.5 text-base font-semibold text-primary-foreground bg-primary rounded-xl shadow-lg hover:bg-primary/95 hover:shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 transition-all duration-200"
            >
              {isSubmitting || loading ? 'Logging in...' : 'Sign In'}
              <ArrowRight size={18} className="ml-2" />
            </button>
          </form>
        )}

        {!showOtpVerify && (
          <>
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 border-t border-border/40" />
              <span className="relative bg-card px-3 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Or Continue With</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={handleGoogleSSO}
                disabled={ssoLoading || loading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border/60 bg-background/50 hover:bg-secondary font-bold text-foreground transition-all duration-200 disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google SSO</span>
              </button>
              <button
                type="button"
                onClick={handleMicrosoftSSO}
                disabled={ssoLoading || loading}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border/60 bg-background/50 hover:bg-secondary font-bold text-foreground transition-all duration-200 disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M0 0h11v11H0z" />
                  <path fill="#80bb0a" d="M12 0h11v11H12z" />
                  <path fill="#00a4ef" d="M0 12h11v11H0z" />
                  <path fill="#ffb900" d="M12 12h11v11H12z" />
                </svg>
                <span>Microsoft SSO</span>
              </button>
            </div>
          </>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </p>

        {/* Demo Accounts Panel */}
        <div className="mt-8 pt-8 border-t border-border/40 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
            Demo Portal Credentials
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => prefillCredentials('admin@outpro.india')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border/40 hover:bg-primary/5 hover:text-primary transition-all duration-200 text-left"
            >
              <Shield size={12} />
              <span>Admin Portal</span>
            </button>
            <button
              onClick={() => prefillCredentials('employee@outpro.india')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border/40 hover:bg-primary/5 hover:text-primary transition-all duration-200 text-left"
            >
              <Briefcase size={12} />
              <span>Employee Portal</span>
            </button>
            <button
              onClick={() => prefillCredentials('client@outpro.india')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border/40 hover:bg-primary/5 hover:text-primary transition-all duration-200 text-left"
            >
              <UserIcon size={12} />
              <span>Client Portal</span>
            </button>
            <button
              onClick={() => prefillCredentials('candidate@outpro.india')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border/40 hover:bg-primary/5 hover:text-primary transition-all duration-200 text-left"
            >
              <UserIcon size={12} />
              <span>Candidate Portal</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
