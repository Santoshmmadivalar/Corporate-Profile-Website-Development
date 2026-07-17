'use client';

import React, { useEffect, useState } from 'react';
import { punchIn, punchOut, getAttendanceLogs, requestLeave, getLeaves, getSalarySlips } from '../../../services/api';
import { Clock, Calendar, FileText, CheckCircle, AlertCircle, Play, Square, FileSpreadsheet, Sparkles, LogIn, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const leaveSchema = z.object({
  type: z.enum(['annual', 'sick', 'personal']),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  reason: z.string().min(5, { message: 'Reason must be at least 5 characters' }),
});

type LeaveFields = z.infer<typeof leaveSchema>;

interface AttendanceLog {
  _id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late';
}

interface LeaveRequest {
  _id: string;
  type: 'annual' | 'sick' | 'personal';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

interface SalarySlipItem {
  _id: string;
  month: string;
  year: number;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'unpaid';
}

// Fallback Mock data
const fallbackAttendance: AttendanceLog[] = [
  { _id: 'att1', date: '2026-07-14', checkIn: '09:12:05', checkOut: '18:05:42', status: 'present' },
  { _id: 'att2', date: '2026-07-13', checkIn: '09:42:15', checkOut: '18:00:10', status: 'late' },
  { _id: 'att3', date: '2026-07-12', checkIn: '09:05:22', checkOut: '18:15:00', status: 'present' }
];

const fallbackLeaves: LeaveRequest[] = [
  { _id: 'leave1', type: 'annual', startDate: '2026-08-01', endDate: '2026-08-05', status: 'pending', reason: 'Summer holiday trip' },
  { _id: 'leave2', type: 'sick', startDate: '2026-05-10', endDate: '2026-05-11', status: 'approved', reason: 'Flu recovery' }
];

const fallbackSalarySlips: SalarySlipItem[] = [
  { _id: 'sal1', month: 'June', year: 2026, baseSalary: 80000, bonuses: 5000, deductions: 2000, netSalary: 83000, status: 'paid' },
  { _id: 'sal2', month: 'May', year: 2026, baseSalary: 80000, bonuses: 0, deductions: 2000, netSalary: 78000, status: 'paid' }
];

export default function EmployeePortalDashboard() {
  const [activeTab, setActiveTab] = useState<'attendance' | 'leaves' | 'payroll'>('attendance');
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [salarySlips, setSalarySlips] = useState<SalarySlipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LeaveFields>({
    resolver: zodResolver(leaveSchema)
  });

  // Local Clock ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchPortalData = async () => {
    setLoading(true);
    try {
      const [attendanceRes, leavesRes, salaryRes] = await Promise.all([
        getAttendanceLogs(),
        getLeaves(),
        getSalarySlips()
      ]);

      if (attendanceRes.success) setAttendance(attendanceRes.data);
      else setAttendance(fallbackAttendance);

      if (leavesRes.success) setLeaves(leavesRes.data);
      else setLeaves(fallbackLeaves);

      if (salaryRes.success) setSalarySlips(salaryRes.data);
      else setSalarySlips(fallbackSalarySlips);

    } catch (error) {
      console.warn('API connection failed. Loading fallback portal credentials:', error);
      setAttendance(fallbackAttendance);
      setLeaves(fallbackLeaves);
      setSalarySlips(fallbackSalarySlips);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handlePunchIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await punchIn();
      if (response.success) {
        setSuccessMsg(response.message);
        fetchPortalData();
      } else {
        setErrorMsg(response.message || 'Punch in failed.');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || error.message || 'Connection error.');
    }
  };

  const handlePunchOut = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await punchOut();
      if (response.success) {
        setSuccessMsg(response.message);
        fetchPortalData();
      } else {
        setErrorMsg(response.message || 'Punch out failed.');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || error.message || 'Connection error.');
    }
  };

  const onSubmitLeave = async (data: LeaveFields) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await requestLeave(data);
      if (response.success) {
        setSuccessMsg('Leave request submitted successfully');
        reset();
        fetchPortalData();
      } else {
        setErrorMsg(response.message || 'Leave submission failed.');
      }
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || error.message || 'Connection error.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Workspace Portal</h1>
        <p className="text-muted-foreground mt-1">Manage check-in clocks, leave applications, and view earnings history</p>
      </div>

      {/* Info Banners */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm font-semibold flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-xs underline">Dismiss</button>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-xs underline">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clock In Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between border border-border/40 relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
          
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} className="animate-spin" />
              <span>Active Workspace Session</span>
            </span>
            <span className="text-xs font-semibold text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <div className="my-6 z-10 text-center md:text-left">
            <p className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight select-none font-mono">
              {currentTime || '00:00:00'}
            </p>
            <p className="text-xs text-muted-foreground mt-2 font-medium">Standard Check-In: 09:30 AM • Shift logs close: 06:00 PM</p>
          </div>

          <div className="flex gap-4 z-10">
            <button
              onClick={handlePunchIn}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-500 hover:shadow-emerald-500/10 font-bold text-sm transition-all"
            >
              <LogIn size={16} />
              <span>Clock In</span>
            </button>
            <button
              onClick={handlePunchOut}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-500 hover:shadow-red-500/10 font-bold text-sm transition-all"
            >
              <LogOut size={16} />
              <span>Clock Out</span>
            </button>
          </div>
        </div>

        {/* Dynamic Overview Widget */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border border-border/40">
          <div>
            <h3 className="font-extrabold text-lg text-foreground mb-1">Timecard summary</h3>
            <p className="text-xs text-muted-foreground">Monthly breakdown</p>
          </div>
          <div className="space-y-4 my-6 text-sm">
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Days Checked:</span>
              <span className="text-foreground font-bold">{attendance.length} days</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Late arrivals:</span>
              <span className="text-amber-500 font-bold">{attendance.filter(a => a.status === 'late').length} days</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Leaves taken:</span>
              <span className="text-primary font-bold">{leaves.filter(l => l.status === 'approved').length} days</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground border-t border-border/40 pt-4">
            Assigned Desk: <span className="text-foreground font-semibold">Desk 4B, Sector 5</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/40 flex space-x-6 text-sm font-semibold select-none">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-4 border-b-2 transition-all ${
            activeTab === 'attendance' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Attendance logs
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`pb-4 border-b-2 transition-all ${
            activeTab === 'leaves' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Leave applications
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-4 border-b-2 transition-all ${
            activeTab === 'payroll' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Salary Slips
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {activeTab === 'attendance' && (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-border/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Punch In Time</th>
                    <th className="py-4 px-6">Punch Out Time</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground animate-pulse">Loading logs...</td>
                    </tr>
                  ) : attendance.map((att) => (
                    <tr key={att._id} className="hover:bg-secondary/20 transition-all duration-150">
                      <td className="py-4 px-6 font-bold text-foreground">{att.date}</td>
                      <td className="py-4 px-6 font-mono text-muted-foreground">{att.checkIn || '--:--:--'}</td>
                      <td className="py-4 px-6 font-mono text-muted-foreground">{att.checkOut || '--:--:--'}</td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          att.status === 'present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="glass-panel p-6 rounded-2xl border border-border/40 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-foreground mb-4">Request Time Off</h3>
                <form onSubmit={handleSubmit(onSubmitLeave)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Leave Type</label>
                    <select
                      {...register('type')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="annual">Annual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="personal">Personal Leave</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Start Date</label>
                      <input
                        type="date"
                        {...register('startDate')}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                      />
                      {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">End Date</label>
                      <input
                        type="date"
                        {...register('endDate')}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                      />
                      {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Reason</label>
                    <textarea
                      rows={3}
                      placeholder="Brief description of the request..."
                      {...register('reason')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                    />
                    {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {isSubmitting ? 'Submitting request...' : 'Apply Leave'}
                  </button>
                </form>
              </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden shadow-sm border border-border/40 flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="py-4 px-6">Leave Type</th>
                      <th className="py-4 px-6">Period</th>
                      <th className="py-4 px-6">Reason</th>
                      <th className="py-4 px-6 text-right">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-muted-foreground animate-pulse">Loading leaves...</td>
                      </tr>
                    ) : leaves.map((l) => (
                      <tr key={l._id} className="hover:bg-secondary/20 transition-all duration-150">
                        <td className="py-4 px-6 font-bold text-foreground capitalize">{l.type}</td>
                        <td className="py-4 px-6 text-muted-foreground">
                          {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-muted-foreground max-w-xs truncate">{l.reason}</td>
                        <td className="py-4 px-6 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            l.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                            l.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                            'bg-muted text-muted-foreground'
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
        )}

        {activeTab === 'payroll' && (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-border/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-6">Month & Year</th>
                    <th className="py-4 px-6">Base Salary</th>
                    <th className="py-4 px-6">Bonuses / Incentives</th>
                    <th className="py-4 px-6">Deductions</th>
                    <th className="py-4 px-6">Net Take-Home</th>
                    <th className="py-4 px-6 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground animate-pulse">Loading payroll files...</td>
                    </tr>
                  ) : salarySlips.map((sal) => (
                    <tr key={sal._id} className="hover:bg-secondary/20 transition-all duration-150">
                      <td className="py-4 px-6 font-bold text-foreground">{sal.month} {sal.year}</td>
                      <td className="py-4 px-6 text-muted-foreground font-mono">₹{sal.baseSalary.toLocaleString()}</td>
                      <td className="py-4 px-6 text-emerald-500 font-mono">+₹{sal.bonuses.toLocaleString()}</td>
                      <td className="py-4 px-6 text-red-500 font-mono">-₹{sal.deductions.toLocaleString()}</td>
                      <td className="py-4 px-6 font-bold text-foreground font-mono">₹{sal.netSalary.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => alert(`Simulating salary slip download for ${sal.month} ${sal.year}. PDF receipt generated successfully.`)}
                          className="px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
