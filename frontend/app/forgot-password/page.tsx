'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { forgotPassword } from '../../services/api';
import { Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setSuccessMsg(res.message || 'OTP code dispatched to your email.');
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Failed to dispatch recovery code.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Could not connect to the auth server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 grid-glow">
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg glass-panel p-8 rounded-2xl shadow-xl z-10"
      >
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Forgot Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your registered email to receive a password reset OTP code
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-semibold">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex items-center space-x-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-sm font-semibold">
            <CheckIcon />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 text-base font-semibold text-primary-foreground bg-primary rounded-xl shadow-lg hover:bg-primary/95 hover:shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 transition-all duration-200"
          >
            {loading ? 'Sending code...' : 'Request Reset OTP'}
            <ArrowRight size={18} className="ml-2" />
          </button>
        </form>

        <div className="mt-6 flex justify-between items-center text-sm">
          <Link href="/login" className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-semibold">
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
