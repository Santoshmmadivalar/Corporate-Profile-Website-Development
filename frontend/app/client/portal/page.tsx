'use client';

import React, { useEffect, useState } from 'react';
import { getClientProjects, getClientInvoices, payInvoice, getClientTickets, createSupportTicket, replyToTicket } from '../../../services/api';
import { LayoutDashboard, CheckSquare, Square, CreditCard, Ticket, AlertCircle, Plus, Send, RefreshCw, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const ticketSchema = z.object({
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  priority: z.enum(['low', 'medium', 'high']),
});

type TicketFields = z.infer<typeof ticketSchema>;

interface ClientProjectItem {
  _id: string;
  name: string;
  description: string;
  status: 'planning' | 'development' | 'testing' | 'completed';
  progress: number;
  milestones: Array<{ title: string; completed: boolean }>;
}

interface InvoiceItem {
  _id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  projectId: {
    _id: string;
    name: string;
  };
}

interface SupportTicketItem {
  _id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'closed';
  replies: Array<{
    senderName: string;
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
}

// Fallback Mockup Data
const fallbackProjects: ClientProjectItem[] = [
  {
    _id: 'proj1',
    name: 'Outpro Corporate Portal Customizer',
    description: 'Customized web portal development with client dashboard, invoice processing, and ticket system.',
    status: 'development',
    progress: 60,
    milestones: [
      { title: 'Database Design & JWT Setup', completed: true },
      { title: 'Admin & Employee Workspace UI', completed: true },
      { title: 'Client Portal Integrations', completed: false },
      { title: 'AI Assist & DeploymentBlueprints', completed: false },
    ]
  }
];

const fallbackInvoices: InvoiceItem[] = [
  {
    _id: 'inv1',
    invoiceNumber: 'INV-2026-001',
    amount: 150000,
    dueDate: '2026-08-15',
    status: 'unpaid',
    projectId: { _id: 'proj1', name: 'Outpro Corporate Portal Customizer' }
  }
];

const fallbackTickets: SupportTicketItem[] = [
  {
    _id: 'tick1',
    subject: 'Setup local development configurations',
    description: 'Encountering database connection errors while running seeding script on localhost.',
    priority: 'high',
    status: 'open',
    replies: [
      { senderName: 'Sarah Jenkins', text: 'Where can I access the local credentials?', createdAt: '2026-07-15T10:00:00.000Z' }
    ],
    createdAt: '2026-07-15T09:00:00.000Z'
  }
];

export default function ClientPortalDashboard() {
  const [activeTab, setActiveTab] = useState<'projects' | 'billing' | 'support'>('projects');
  const [projects, setProjects] = useState<ClientProjectItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupportTicketItem | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketFields>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { priority: 'medium' }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, invoicesRes, ticketsRes] = await Promise.all([
        getClientProjects(),
        getClientInvoices(),
        getClientTickets()
      ]);

      if (projectsRes.success) setProjects(projectsRes.data);
      else setProjects(fallbackProjects);

      if (invoicesRes.success) setInvoices(invoicesRes.data);
      else setInvoices(fallbackInvoices);

      if (ticketsRes.success) setTickets(ticketsRes.data);
      else setTickets(fallbackTickets);
    } catch (error) {
      console.warn('API connection failed. Loading fallback portal credentials:', error);
      setProjects(fallbackProjects);
      setInvoices(fallbackInvoices);
      setTickets(fallbackTickets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayInvoice = async (invoiceId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await payInvoice(invoiceId);
      if (response.success) {
        setSuccessMsg('Simulated checkout processing completed successfully! Invoice status is PAID.');
        fetchData();
      }
    } catch (error: any) {
      setErrorMsg('Payment gateway connection failed. Please retry.');
    }
  };

  const onSubmitTicket = async (data: TicketFields) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const response = await createSupportTicket(data);
      if (response.success) {
        setSuccessMsg('Support ticket logged successfully! Support representative will respond.');
        reset();
        setShowAddTicket(false);
        fetchData();
      }
    } catch (error: any) {
      setErrorMsg('Failed to raise ticket.');
    }
  };

  const handlePostReply = async () => {
    if (!activeTicket || replyText.trim() === '') return;
    setErrorMsg(null);
    try {
      const response = await replyToTicket(activeTicket._id, replyText);
      if (response.success) {
        setReplyText('');
        // Update active ticket view immediately
        setActiveTicket(response.data);
        fetchData();
      }
    } catch (error: any) {
      setErrorMsg('Failed to send reply.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Client Hub</h1>
          <p className="text-muted-foreground mt-1">Track implementation progress, approve billing clearances, or seek technical assistance</p>
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

      {/* Info Banners */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-sm font-semibold flex items-center justify-between"
          >
            <span>{successMsg}</span>
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
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-xs underline">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Details Chat Dialog */}
      <AnimatePresence>
        {activeTicket && (
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
              className="w-full max-w-2xl glass-panel p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-[70vh]"
            >
              <button 
                onClick={() => setActiveTicket(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>

              <div className="border-b border-border/40 pb-4 mb-4">
                <h3 className="text-lg font-extrabold text-foreground">{activeTicket.subject}</h3>
                <p className="text-xs text-muted-foreground mt-1">Ticket ID: {activeTicket._id} • Status: <span className="font-bold text-primary">{activeTicket.status}</span></p>
                <div className="p-3 bg-secondary/35 rounded-lg text-sm text-foreground mt-3 font-medium">
                  {activeTicket.description}
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {activeTicket.replies.map((reply, idx) => (
                  <div key={idx} className={`p-3 rounded-xl max-w-md ${
                    reply.senderName === 'Sarah Jenkins' 
                      ? 'bg-primary/10 border border-primary/20 text-foreground ml-auto' 
                      : 'bg-secondary border border-border/40 text-foreground'
                  }`}>
                    <p className="text-xs font-bold text-muted-foreground mb-1">{reply.senderName}</p>
                    <p className="text-sm">{reply.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat reply input */}
              <div className="flex gap-2 border-t border-border/40 pt-4">
                <input 
                  type="text"
                  placeholder="Type your response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostReply()}
                  className="flex-grow px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                />
                <button
                  onClick={handlePostReply}
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="border-b border-border/40 flex space-x-6 text-sm font-semibold select-none">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-4 border-b-2 transition-all ${
            activeTab === 'projects' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          My active projects
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-4 border-b-2 transition-all ${
            activeTab === 'billing' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Billing & Payments
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`pb-4 border-b-2 transition-all ${
            activeTab === 'support' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Technical Support
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="text-center py-6 text-muted-foreground animate-pulse">Loading active project boards...</div>
            ) : projects.map((proj) => (
              <div key={proj._id} className="glass-panel p-6 rounded-2xl border border-border/40 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-foreground">{proj.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase font-bold mt-1 tracking-wider">Status: {proj.status}</p>
                  <p className="text-sm text-muted-foreground mt-3 font-medium leading-relaxed">{proj.description}</p>
                </div>

                {/* Progress bar */}
                <div className="my-6">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1.5">
                    <span>Implementation progress</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>

                {/* Milestones checklist */}
                <div className="space-y-2 border-t border-border/40 pt-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Project Milestones</h4>
                  {proj.milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                      {m.completed ? (
                        <CheckSquare className="text-emerald-500 shrink-0" size={16} />
                      ) : (
                        <Square className="text-muted-foreground/60 shrink-0" size={16} />
                      )}
                      <span className={m.completed ? 'line-through text-muted-foreground font-medium' : 'font-medium'}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="glass-panel rounded-2xl overflow-hidden border border-border/40 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-6">Invoice details</th>
                    <th className="py-4 px-6">Project board</th>
                    <th className="py-4 px-6">Amount due</th>
                    <th className="py-4 px-6">Due Date</th>
                    <th className="py-4 px-6 text-right">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground animate-pulse">Loading billing files...</td>
                    </tr>
                  ) : invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-secondary/20 transition-all duration-150">
                      <td className="py-4 px-6 font-bold text-foreground">{inv.invoiceNumber}</td>
                      <td className="py-4 px-6 text-muted-foreground">{inv.projectId?.name || 'Portal Deployment'}</td>
                      <td className="py-4 px-6 font-mono font-bold text-foreground">₹{inv.amount.toLocaleString()}</td>
                      <td className="py-4 px-6 text-muted-foreground">{inv.dueDate.split('T')[0]}</td>
                      <td className="py-4 px-6 text-right">
                        {inv.status === 'paid' ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-xs">
                            Cleared
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePayInvoice(inv._id)}
                            className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 shadow"
                          >
                            Checkout Pay
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ticket submission */}
            <div className="glass-panel p-6 rounded-2xl border border-border/40 self-start">
              <h3 className="font-extrabold text-lg text-foreground mb-4">File Support Request</h3>
              <form onSubmit={handleSubmit(onSubmitTicket)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Problem Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. SMTP config verification"
                    {...register('subject')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                  />
                  {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Severity Priority</label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="low">Low Severity (Feature questions)</option>
                    <option value="medium">Medium Severity (Workflow blockages)</option>
                    <option value="high">High Severity (Server outages)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Problem Description</label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about the bug, including error messages..."
                    {...register('description')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Submit Ticket
                </button>
              </form>
            </div>

            {/* Tickets directory list */}
            <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden shadow-sm border border-border/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase">
                      <th className="py-4 px-6">Subject</th>
                      <th className="py-4 px-6">Priority</th>
                      <th className="py-4 px-6">Current Status</th>
                      <th className="py-4 px-6 text-right">Replies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-muted-foreground animate-pulse">Loading tickets...</td>
                      </tr>
                    ) : tickets.map((t) => (
                      <tr 
                        key={t._id}
                        onClick={() => setActiveTicket(t)}
                        className="hover:bg-secondary/20 transition-all duration-150 cursor-pointer"
                      >
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground">{t.subject}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{t.description}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            t.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                            t.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            t.status === 'closed' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-medium text-muted-foreground">
                          <div className="inline-flex items-center gap-1">
                            <MessageSquare size={12} />
                            <span>{t.replies.length} replies</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
