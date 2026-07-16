'use client';

import React, { useEffect, useState } from 'react';
import { getApplications, updateApplicationStatus, createJob } from '../../../services/api';
import { Briefcase, AlertCircle, FileText, Check, Plus, RefreshCw, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const jobSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  department: z.string().min(2, { message: 'Department is required' }),
  location: z.string().min(2, { message: 'Location is required' }),
  description: z.string().min(10, { message: 'Description must be at least 10' }),
  requirementsString: z.string().min(5, { message: 'Please add requirements separated by commas' }),
  salaryRange: z.string().optional(),
});

type JobFields = z.infer<typeof jobSchema>;

interface ApplicationItem {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  resumeUrl: string;
  screeningScore?: number;
  screeningNotes?: string;
  status: 'applied' | 'reviewing' | 'shortlisted' | 'rejected';
  jobId: {
    _id: string;
    title: string;
    department: string;
    location: string;
  };
  createdAt: string;
}

export default function AdminHRPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddJob, setShowAddJob] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scoreFilter, setScoreFilter] = useState<string>('all');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<JobFields>({
    resolver: zodResolver(jobSchema)
  });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await getApplications();
      if (response.success) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch career applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const response = await updateApplicationStatus(appId, newStatus);
      if (response.success) {
        setSuccessMsg(`Status updated successfully to ${newStatus}`);
        fetchApplications();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to update application status');
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handleCreateJob = async (data: JobFields) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const requirements = data.requirementsString.split(',').map(r => r.trim()).filter(Boolean);
      const response = await createJob({
        title: data.title,
        department: data.department,
        location: data.location,
        description: data.description,
        requirements,
        salaryRange: data.salaryRange
      });

      if (response.success) {
        setSuccessMsg('New job posting created successfully!');
        reset();
        setShowAddJob(false);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(response.message || 'Failed to create job posting');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Server error occurred while creating job');
    }
  };

  const filteredApplications = applications.filter(app => {
    const score = app.screeningScore || 0;
    if (scoreFilter === 'high') return score >= 80;
    if (scoreFilter === 'medium') return score >= 50 && score < 80;
    if (scoreFilter === 'low') return score < 50;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <span>HR Careers & Recruitment</span>
            <Sparkles className="text-primary animate-pulse" size={24} />
          </h1>
          <p className="text-muted-foreground mt-1">
            Post new engineering jobs, audit applicants, and inspect AI resume matching indices
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddJob(!showAddJob)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg transition-all"
          >
            <Plus size={16} />
            <span>Post New Job</span>
          </button>
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="inline-flex items-center justify-center p-2.5 bg-secondary border border-border/40 rounded-xl hover:bg-accent text-foreground"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Success/Error Banners */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm font-medium"
          >
            {successMsg}
          </motion.div>
        )}
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-medium"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Job Collapsible Section */}
      <AnimatePresence>
        {showAddJob && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-6 rounded-2xl border border-border/40 overflow-hidden shadow-lg"
          >
            <h3 className="font-extrabold text-lg text-foreground mb-4">Post a New Job Opening</h3>
            <form onSubmit={handleSubmit(handleCreateJob)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Cloud Architect"
                    {...register('title')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering, Sales, HR"
                    {...register('department')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Kolkata, India (On-site)"
                    {...register('location')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Salary Range (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹10L - ₹15L"
                    {...register('salaryRange')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                <textarea
                  rows={3}
                  placeholder="Outline the responsibilities and scope of the job..."
                  {...register('description')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Job Requirements (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. 3+ yrs React experience, TypeScript, Docker, AWS"
                  {...register('requirementsString')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                />
                {errors.requirementsString && <p className="text-xs text-destructive">{errors.requirementsString.message}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddJob(false)}
                  className="px-4 py-2 text-xs font-semibold bg-secondary rounded-lg border border-border/40 hover:bg-accent text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  Create Posting
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Bar */}
      <div className="flex items-center space-x-3 p-4 bg-secondary/30 border border-border/40 rounded-xl">
        <Filter size={16} className="text-muted-foreground" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Screen Filtering:</span>
        <div className="flex gap-2">
          {['all', 'high', 'medium', 'low'].map((f) => (
            <button
              key={f}
              onClick={() => setScoreFilter(f)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                scoreFilter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-secondary border-border/40 text-muted-foreground'
              }`}
            >
              {f === 'all' && 'All Matches'}
              {f === 'high' && 'High Match (>=80%)'}
              {f === 'medium' && 'Mid Match (50-79%)'}
              {f === 'low' && 'Low Match (<50%)'}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-lg border border-border/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-4 px-6">Candidate</th>
                <th className="py-4 px-6">Position</th>
                <th className="py-4 px-6">AI Match Score</th>
                <th className="py-4 px-6">Screening Analysis</th>
                <th className="py-4 px-6 text-right">Recruitment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground animate-pulse font-medium">
                    Fetching applicant listings...
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground font-medium">
                    No job applications match this filter
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const score = app.screeningScore || 0;
                  const scoreColor = 
                    score >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    score >= 50 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20';

                  return (
                    <tr key={app._id} className="hover:bg-secondary/20 transition-all duration-150">
                      <td className="py-4 px-6">
                        <p className="font-bold text-foreground">{app.candidateName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{app.candidateEmail}</p>
                        <a 
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-xs text-primary font-semibold mt-1 hover:underline gap-1"
                        >
                          <FileText size={10} />
                          <span>View Resume</span>
                        </a>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-foreground">{app.jobId?.title || 'Deleted Role'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{app.jobId?.department}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold ${scoreColor}`}>
                          {score}% Match
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-muted-foreground max-w-xs leading-relaxed">
                        {app.screeningNotes || 'No notes available.'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                          className={`py-1 px-2.5 text-xs font-bold rounded-lg border focus:outline-none appearance-none cursor-pointer ${
                            app.status === 'shortlisted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' :
                            app.status === 'reviewing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/25' :
                            app.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/25' :
                            'bg-muted border-border/40 text-muted-foreground'
                          }`}
                        >
                          <option value="applied">Applied</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
