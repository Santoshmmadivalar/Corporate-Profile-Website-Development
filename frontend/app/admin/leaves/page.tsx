'use client';

import React, { useEffect, useState } from 'react';
import { getAdminLeaves, updateLeaveStatus, getAdminUsers, createSalarySlip } from '../../../services/api';
import { User } from '../../../types';
import { Calendar, CheckCircle2, XCircle, Users, CreditCard, RefreshCw, AlertCircle, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const payrollSchema = z.object({
  employeeId: z.string().min(1, { message: 'Please select an employee' }),
  month: z.string().min(1, { message: 'Month is required' }),
  year: z.coerce.number().min(2020, { message: 'Valid year is required' }),
  baseSalary: z.coerce.number().positive({ message: 'Base salary must be positive' }),
  bonuses: z.coerce.number().nonnegative().default(0),
  deductions: z.coerce.number().nonnegative().default(0),
});

type PayrollFields = z.infer<typeof payrollSchema>;

interface LeaveRequestItem {
  _id: string;
  type: 'annual' | 'sick' | 'personal';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
    title?: string;
    department?: string;
  };
  createdAt: string;
}

export default function AdminLeavesAndPayrollPage() {
  const [leaves, setLeaves] = useState<LeaveRequestItem[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PayrollFields>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      year: new Date().getFullYear(),
      bonuses: 0,
      deductions: 0
    }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leavesRes, usersRes] = await Promise.all([
        getAdminLeaves(),
        getAdminUsers()
      ]);

      if (leavesRes.success) {
        setLeaves(leavesRes.data);
      }
      if (usersRes.success) {
        // Filter users who are staff/employees
        const staff = usersRes.data.filter((u: User) => u.role === 'employee' || u.role === 'admin');
        setEmployees(staff);
      }
    } catch (error) {
      console.error('Failed to load leaves & payroll parameters:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveLeave = async (leaveId: string) => {
    try {
      const response = await updateLeaveStatus(leaveId, 'approved');
      if (response.success) {
        setSuccessMsg('Leave request approved successfully.');
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Leave status update failed.');
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      const response = await updateLeaveStatus(leaveId, 'rejected');
      if (response.success) {
        setSuccessMsg('Leave request rejected successfully.');
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Leave status update failed.');
    }
  };

  const onSubmitPayroll = async (data: PayrollFields) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await createSalarySlip(data);
      if (response.success) {
        setSuccessMsg('Salary slip generated and processed successfully!');
        reset({
          year: new Date().getFullYear(),
          bonuses: 0,
          deductions: 0
        });
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(response.message || 'Failed to generate salary slip.');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Server error generating payroll slips.');
    }
  };

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const pastLeaves = leaves.filter(l => l.status !== 'pending');

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Leaves & Payroll Management</h1>
          <p className="text-muted-foreground mt-1">Review employee leave applications and dispatch monthly salary slips</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-secondary text-foreground hover:bg-accent border border-border/40 rounded-xl transition-all duration-200"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Message Notifications */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm font-semibold"
          >
            {successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaves section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending requests */}
          <div className="glass-panel p-6 rounded-2xl border border-border/40">
            <h3 className="font-extrabold text-lg text-foreground mb-4 flex items-center gap-2">
              <Calendar className="text-primary" size={20} />
              <span>Pending Leave Requests ({pendingLeaves.length})</span>
            </h3>

            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-6 text-muted-foreground animate-pulse">Loading leave applications...</div>
              ) : pendingLeaves.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">No pending leave requests.</div>
              ) : (
                pendingLeaves.map((l) => (
                  <div key={l._id} className="p-4 bg-secondary/50 border border-border/40 rounded-xl flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{l.employeeId?.name || 'Staff Member'}</span>
                        <span className="text-xs text-muted-foreground">({l.employeeId?.department})</span>
                      </div>
                      <p className="text-xs text-primary font-semibold capitalize">{l.type} Leave</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(l.startDate).toLocaleDateString()} to {new Date(l.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-foreground mt-2 italic font-medium">&quot;{l.reason}&quot;</p>
                    </div>
                    <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveLeave(l._id)}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        <CheckCircle2 size={12} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleRejectLeave(l._id)}
                        className="flex items-center gap-1.5 py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        <XCircle size={12} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past/Reviewed requests */}
          <div className="glass-panel p-6 rounded-2xl border border-border/40">
            <h3 className="font-extrabold text-lg text-foreground mb-4">Past Applications</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-xs font-bold text-muted-foreground uppercase">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {pastLeaves.map((l) => (
                    <tr key={l._id}>
                      <td className="py-3 px-4">
                        <p className="font-bold text-foreground">{l.employeeId?.name || 'Staff'}</p>
                        <p className="text-xs text-muted-foreground">{l.employeeId?.title}</p>
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold text-muted-foreground">{l.type}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payroll creation form */}
        <div className="glass-panel p-6 rounded-2xl border border-border/40 flex flex-col justify-between self-start">
          <div>
            <h3 className="font-extrabold text-lg text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="text-primary" size={20} />
              <span>Issue Salary Slip</span>
            </h3>

            <form onSubmit={handleSubmit(onSubmitPayroll)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Select Employee</label>
                <select
                  {...register('employeeId')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.department || 'Staff'})</option>
                  ))}
                </select>
                {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Month</label>
                  <select
                    {...register('month')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Year</label>
                  <input
                    type="number"
                    {...register('year')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Base Salary (INR)</label>
                <input
                  type="number"
                  placeholder="80000"
                  {...register('baseSalary')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                />
                {errors.baseSalary && <p className="text-xs text-destructive">{errors.baseSalary.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Bonuses</label>
                  <input
                    type="number"
                    placeholder="0"
                    {...register('bonuses')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Deductions</label>
                  <input
                    type="number"
                    placeholder="0"
                    {...register('deductions')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSubmitting ? 'Processing payout...' : 'Issue Salary'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
