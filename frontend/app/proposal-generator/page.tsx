'use client';

import React, { useState } from 'react';
import { generateProposal } from '../../services/api';
import { Sparkles, FileText, Download, Send, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProposalGeneratorPage() {
  const [formData, setFormData] = useState({
    businessType: 'E-Commerce Retail',
    projectType: 'B2B Procurement App',
    budget: 1500000,
    timeline: '3 Months',
    requirements: 'Robust JWT role permissions, integration with Stripe payment clearing gates, real-time notification alerts.',
    emailTo: ''
  });

  const [proposal, setProposal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setProposal(null);

    try {
      const res = await generateProposal(formData);
      if (res.success && res.data) {
        setProposal(res.data.proposalText);
        setSuccessMsg(res.message || 'Proposal compiled successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Basic custom markdown formatter to render bold, headers, and bullet points
  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let content = line;
      content = content.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/`([^`]+)`/g, '<code class="bg-secondary px-1 py-0.5 rounded font-mono text-xs text-primary">$1</code>');

      if (line.startsWith('### ')) {
        return <h4 key={lineIdx} className="text-base font-extrabold text-foreground mt-4 mb-2" dangerouslySetInnerHTML={{ __html: content.substring(4) }} />;
      }
      if (line.startsWith('## ')) {
        return <h3 key={lineIdx} className="text-lg font-extrabold text-foreground mt-5 mb-2 border-b border-border/40 pb-1" dangerouslySetInnerHTML={{ __html: content.substring(3) }} />;
      }
      if (line.startsWith('# ')) {
        return <h2 key={lineIdx} className="text-2xl font-extrabold text-primary mt-6 mb-3" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />;
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return <li key={lineIdx} className="ml-4 list-disc text-sm text-foreground/90 my-1" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />;
      }
      return <p key={lineIdx} className="text-sm leading-relaxed text-foreground/90 my-2" dangerouslySetInnerHTML={{ __html: content }} />;
    });
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-8 print:p-0 print:m-0">
      <div className="absolute top-[5%] right-[-5%] w-[350px] h-[350px] bg-primary/10 rounded-full blur-[120px] pointer-events-none print:hidden" />

      {/* Page Header */}
      <section className="flex justify-between items-center border-b border-border/40 pb-6 print:hidden">
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Sparkles className="text-primary" size={26} />
              <span>AI Proposal Generator</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              Provide scope criteria to draft instant B2B proposals in line with corporate standards.
            </p>
          </div>
        </div>
      </section>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm font-semibold flex items-center justify-between print:hidden">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Parameters Form */}
        <section className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-6 self-start print:hidden">
          <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
            <FileText size={18} className="text-primary" />
            <span>Scope Parameters</span>
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Business Industry</label>
              <input
                type="text"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Project Category</label>
              <input
                type="text"
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Target Budget (INR)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Timeline Window</label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Scope Requirements</label>
              <textarea
                rows={4}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1 border-t border-border/40 pt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Email Proposal To (Optional)</label>
              <input
                type="email"
                placeholder="client@company.com"
                value={formData.emailTo}
                onChange={(e) => setFormData({ ...formData, emailTo: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Drafting Proposal...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Compile Proposal</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Generated Proposal View */}
        <section className="lg:col-span-3 glass-panel p-8 rounded-3xl min-h-[500px] flex flex-col justify-between print:border-none print:bg-transparent print:p-0">
          {proposal ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border/40 pb-4 print:hidden">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Output Document</span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-secondary text-foreground hover:bg-accent border border-border/40 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Print/Save PDF</span>
                  </button>
                </div>
              </div>

              {/* Proposal text render block */}
              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground font-medium print:text-black">
                {formatMarkdown(proposal)}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 space-y-4 print:hidden">
              <div className="h-16 w-16 bg-secondary/50 rounded-full flex items-center justify-center text-muted-foreground">
                <FileText size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-foreground text-lg">No proposal compiled yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm">Provide scope parameters on the left and click compile to draft the document.</p>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
