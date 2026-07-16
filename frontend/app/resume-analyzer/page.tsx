'use client';

import React, { useState } from 'react';
import { analyzeResume } from '../../services/api';
import { Sparkles, FileText, CheckCircle, AlertTriangle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState('');
  const [candidateName, setCandidateName] = useState('John Doe');
  const [candidateEmail, setCandidateEmail] = useState('john@example.com');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await analyzeResume({
        resumeText,
        candidateName,
        candidateEmail
      });

      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setErrorMsg('Failed to process resume analysis.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not establish connection to the scanning engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-8">
      <div className="absolute top-[10%] left-[-5%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Page Header */}
      <section className="flex justify-between items-center border-b border-border/40 pb-6">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Sparkles className="text-primary" size={26} />
              <span>AI Resume Screening</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Scan candidate resume text for keyword optimization, skill matching, and ATS alignment.
            </p>
          </div>
        </div>
      </section>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm font-semibold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Input Details */}
        <section className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-6 self-start">
          <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            <span>Candidate Resume Text</span>
          </h3>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Candidate Full Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Contact Email</label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Paste Resume / CV Details</label>
              <textarea
                rows={10}
                placeholder="Paste the full text from your resume here (experience, skills, projects, contact info)..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !resumeText.trim()}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Scanning ATS Score...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Analyze Resume</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Results Visualizer */}
        <section className="lg:col-span-3 glass-panel p-8 rounded-3xl min-h-[500px]">
          {result ? (
            <div className="space-y-8">
              
              {/* ATS Score & Gauge */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-secondary/20 p-6 rounded-2xl border border-border/40 gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-xl font-extrabold text-foreground">ATS Compliance Score</h4>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    This score measures keyword density, structural layouts, and skill relevance compared to enterprise-tier specifications.
                  </p>
                </div>
                
                {/* Radial Gauge */}
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="absolute transform -rotate-90" width="100" height="100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" className="text-border/40" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="currentColor" 
                      className="text-primary" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 - (251.2 * result.atsScore) / 100} 
                    />
                  </svg>
                  <span className="text-2xl font-extrabold text-foreground">{result.atsScore}%</span>
                </div>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Skill Gaps */}
                <div className="space-y-3">
                  <h5 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="text-amber-500" size={16} />
                    <span>Identified Skill Gaps</span>
                  </h5>
                  <ul className="space-y-2">
                    {result.skillGapAnalysis.map((s: string, idx: number) => (
                      <li key={idx} className="p-3 bg-secondary/30 border border-border/20 rounded-xl text-xs font-semibold text-foreground/90">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Keyword Suggestions */}
                <div className="space-y-3">
                  <h5 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertCircle className="text-primary" size={16} />
                    <span>Keyword Enhancements</span>
                  </h5>
                  <ul className="space-y-2">
                    {result.keywordSuggestions.map((s: string, idx: number) => (
                      <li key={idx} className="p-3 bg-secondary/30 border border-border/20 rounded-xl text-xs font-semibold text-foreground/90">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvement Recommendations */}
                <div className="space-y-3">
                  <h5 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <CheckCircle className="text-emerald-500" size={16} />
                    <span>Layout Revisions</span>
                  </h5>
                  <ul className="space-y-2">
                    {result.improvementSuggestions.map((s: string, idx: number) => (
                      <li key={idx} className="p-3 bg-secondary/30 border border-border/20 rounded-xl text-xs font-semibold text-foreground/90">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Interview Prep Questions */}
                <div className="space-y-3">
                  <h5 className="font-extrabold text-sm text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="text-violet-500" size={16} />
                    <span>Custom Prep Questions</span>
                  </h5>
                  <ul className="space-y-2">
                    {result.interviewQuestions.map((s: string, idx: number) => (
                      <li key={idx} className="p-3 bg-secondary/30 border border-border/20 rounded-xl text-xs font-semibold text-foreground/90">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 space-y-4">
              <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground">
                <FileText size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-foreground text-lg">Scan resume text details</h4>
                <p className="text-xs text-muted-foreground max-w-sm">Provide candidate credentials and paste CV text on the left to begin.</p>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
