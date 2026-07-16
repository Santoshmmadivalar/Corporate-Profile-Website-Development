'use client';

import React, { useEffect, useState } from 'react';
import { getJobs, applyForJob } from '../../services/api';
import { Briefcase, MapPin, IndianRupee, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const applicationSchema = z.object({
  candidateName: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  candidateEmail: z.string().email({ message: 'Enter a valid email address' }),
  resumeUrl: z.string().min(1, { message: 'Resume document link or file path is required' }),
  resumeText: z.string().min(20, { message: 'Please provide at least 20 characters of resume details/skills' }),
});

type ApplicationFields = z.infer<typeof applicationSchema>;

interface JobPosting {
  _id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  salaryRange?: string;
  status: string;
}

const fallbackJobs: JobPosting[] = [
  {
    _id: 'job1',
    title: 'Senior Frontend Engineer (React/Next.js)',
    department: 'Engineering',
    location: 'Kolkata, West Bengal (Hybrid)',
    description: 'We are looking for a Senior Frontend Engineer to build premium, high-performance web systems and Jamstack headless storefronts.',
    requirements: [
      '3+ years professional experience with React & Next.js',
      'Deep understanding of TypeScript & state management engines',
      'Experience building responsive, fluid user layouts with Tailwind CSS',
      'Familiarity with performance optimization tools (Lighthouse, Core Web Vitals)'
    ],
    salaryRange: '₹12,00,000 - ₹18,00,000 per annum',
    status: 'open'
  },
  {
    _id: 'job2',
    title: 'Backend Developer (Node.js/MongoDB)',
    department: 'Engineering',
    location: 'Remote, India',
    description: 'Join our backend engineering crew to construct high-throughput REST APIs, serverless cloud endpoints, and database architectures.',
    requirements: [
      'Proven experience with Node.js, Express, and Mongoose/MongoDB',
      'Good grip on building secure REST/GraphQL API systems',
      'Familiarity with Docker containers and CI/CD automation',
      'Knowledge of caching systems (Redis) is a plus'
    ],
    salaryRange: '₹8,0,000 - ₹14,0,000 per annum',
    status: 'open'
  }
];

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [activeApplyJob, setActiveApplyJob] = useState<JobPosting | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ApplicationFields>({
    resolver: zodResolver(applicationSchema)
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await getJobs();
      if (response.success && response.data.length > 0) {
        setJobs(response.data);
      } else {
        setJobs(fallbackJobs);
      }
    } catch (error) {
      console.warn('Failed to load active jobs. Loading fallbacks:', error);
      setJobs(fallbackJobs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (data: ApplicationFields) => {
    if (!activeApplyJob) return;
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      const response = await applyForJob(activeApplyJob._id, data);
      if (response.success) {
        setSubmitSuccess(true);
        reset();
        setTimeout(() => {
          setSubmitSuccess(false);
          setActiveApplyJob(null);
        }, 5000);
      } else {
        setSubmitError(response.message || 'Application submission failed');
      }
    } catch (error: any) {
      setSubmitError(error.message || 'An error occurred during submission');
    }
  };

  return (
    <div className="relative min-h-screen py-16 grid-glow">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
            Join Our Team
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Careers at <span className="text-gradient">Outpro.India</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Build premium digital infrastructures and brand systems with an agile engineering crew.
          </p>
        </div>

        {/* Apply Dialog Overlay */}
        <AnimatePresence>
          {activeApplyJob && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-lg glass-panel p-6 rounded-2xl shadow-2xl relative overflow-y-auto max-h-[90vh]"
              >
                <button 
                  onClick={() => setActiveApplyJob(null)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-lg font-bold"
                >
                  ✕
                </button>
                
                <h3 className="text-xl font-extrabold text-foreground mb-1">
                  Apply for {activeApplyJob.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-6">{activeApplyJob.department} • {activeApplyJob.location}</p>

                {submitSuccess ? (
                  <div className="text-center py-8 space-y-4 text-emerald-500">
                    <CheckCircle2 size={48} className="mx-auto" />
                    <h4 className="font-bold text-lg">Application Submitted!</h4>
                    <p className="text-sm text-muted-foreground">
                      Our AI-assisted screening has matches, and an HR representative will contact you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(handleApply)} className="space-y-4">
                    {submitError && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs flex items-center gap-2">
                        <AlertCircle size={14} />
                        <span>{submitError}</span>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase block">Your Full Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        {...register('candidateName')}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      {errors.candidateName && <p className="text-xs text-destructive">{errors.candidateName.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase block">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="john@example.com" 
                        {...register('candidateEmail')}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      {errors.candidateEmail && <p className="text-xs text-destructive">{errors.candidateEmail.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase block">Resume URL / Document Path</label>
                      <input 
                        type="text" 
                        placeholder="e.g. /resumes/john_doe_resume.pdf or drive link" 
                        {...register('resumeUrl')}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      {errors.resumeUrl && <p className="text-xs text-destructive">{errors.resumeUrl.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase block flex items-center gap-1">
                        <FileText size={12} />
                        <span>Resume text / Key skills summary (For AI screening match)</span>
                      </label>
                      <textarea 
                        rows={4}
                        placeholder="Paste your resume content, experience summary, and technical skills here..."
                        {...register('resumeText')}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      {errors.resumeText && <p className="text-xs text-destructive">{errors.resumeText.message}</p>}
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting with AI Check...' : 'Submit Application'}
                    </button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-medium animate-pulse">
              Querying active job opportunities...
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground font-medium">
              We currently have no open roles. Please check back later!
            </div>
          ) : (
            jobs.map((job) => {
              const isExpanded = expandedJobId === job._id;
              return (
                <motion.div
                  key={job._id}
                  layout
                  className="glass-panel rounded-2xl overflow-hidden shadow-sm transition-all duration-200 border border-border/40 hover:border-primary/20"
                >
                  {/* Job Accordion Header */}
                  <div 
                    onClick={() => setExpandedJobId(isExpanded ? null : job._id)}
                    className="p-6 cursor-pointer flex items-center justify-between gap-4 select-none hover:bg-secondary/10"
                  >
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-lg text-foreground group-hover:text-primary">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center"><Briefcase size={12} className="mr-1" /> {job.department}</span>
                        <span className="flex items-center"><MapPin size={12} className="mr-1" /> {job.location}</span>
                        {job.salaryRange && <span className="flex items-center"><IndianRupee size={12} className="mr-0.5" /> {job.salaryRange}</span>}
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-border/40 bg-secondary/10"
                      >
                        <div className="p-6 space-y-6">
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Role Overview</h4>
                            <p className="text-sm text-foreground leading-relaxed">{job.description}</p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Key Requirements</h4>
                            <ul className="space-y-1.5 text-sm text-foreground">
                              {job.requirements.map((req, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-4 flex justify-end">
                            <button
                              onClick={() => setActiveApplyJob(job)}
                              className="px-6 py-2.5 text-sm font-semibold text-primary-foreground bg-primary rounded-xl shadow-md hover:bg-primary/95 transition-all flex items-center"
                            >
                              Apply Now
                              <ArrowRight size={14} className="ml-2" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
