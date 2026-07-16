'use client';

import React, { useEffect, useState } from 'react';
import { getAdminProjects, createClientProject, updateProjectMilestone, getAdminInvoices, createInvoice, getAdminTickets, updateTicketStatus, replyToTicket, getAdminUsers } from '../../../services/api';
import { User } from '../../../types';
import { LayoutDashboard, CheckSquare, Square, CreditCard, Ticket, AlertCircle, Plus, Send, RefreshCw, MessageSquare, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const projectFormSchema = z.object({
  clientId: z.string().min(1, { message: 'Client is required' }),
  name: z.string().min(2, { message: 'Project name must be at least 2 characters' }),
  description: z.string().min(5, { message: 'Description is required' }),
  milestonesString: z.string().min(5, { message: 'Add milestones separated by commas' }),
});

const invoiceFormSchema = z.object({
  clientId: z.string().min(1, { message: 'Client is required' }),
  projectId: z.string().min(1, { message: 'Project board is required' }),
  invoiceNumber: z.string().min(2, { message: 'Invoice number is required' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  dueDate: z.string().min(1, { message: 'Due date is required' }),
});

type ProjectFields = z.infer<typeof projectFormSchema>;
type InvoiceFields = z.infer<typeof invoiceFormSchema>;

interface AdminProject {
  _id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  milestones: Array<{ title: string; completed: boolean }>;
  clientId: {
    _id: string;
    name: string;
    companyName?: string;
  };
}

interface AdminInvoice {
  _id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  clientId: {
    _id: string;
    name: string;
    companyName?: string;
  };
  projectId: {
    _id: string;
    name: string;
  };
}

interface AdminTicket {
  _id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  clientId: {
    _id: string;
    name: string;
    companyName?: string;
  };
  replies: Array<{
    senderName: string;
    text: string;
    createdAt: string;
  }>;
}

export default function AdminProjectManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'projects' | 'billing' | 'tickets'>('projects');
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [activeTicket, setActiveTicket] = useState<AdminTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { register: regProject, handleSubmit: subProject, reset: resProject, formState: { errors: errProject } } = useForm<ProjectFields>({
    resolver: zodResolver(projectFormSchema)
  });

  const { register: regInvoice, handleSubmit: subInvoice, reset: resInvoice, formState: { errors: errInvoice } } = useForm<InvoiceFields>({
    resolver: zodResolver(invoiceFormSchema)
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, invoicesRes, ticketsRes, usersRes] = await Promise.all([
        getAdminProjects(),
        getAdminInvoices(),
        getAdminTickets(),
        getAdminUsers()
      ]);

      if (projectsRes.success) setProjects(projectsRes.data);
      if (invoicesRes.success) setInvoices(invoicesRes.data);
      if (ticketsRes.success) setTickets(ticketsRes.data);
      if (usersRes.success) {
        setClients(usersRes.data.filter((u: User) => u.role === 'client'));
      }
    } catch (error) {
      console.error('Failed to load project database:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleMilestone = async (projectId: string, milestoneIndex: number, currentCompleted: boolean) => {
    try {
      const response = await updateProjectMilestone(projectId, milestoneIndex, !currentCompleted);
      if (response.success) {
        setSuccessMsg('Project board milestone updated');
        fetchData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (error: any) {
      setErrorMsg('Failed to update milestone.');
    }
  };

  const handleCreateProject = async (data: ProjectFields) => {
    setErrorMsg(null);
    try {
      const milestones = data.milestonesString.split(',').map(m => ({ title: m.trim(), completed: false })).filter(m => m.title);
      const response = await createClientProject({
        clientId: data.clientId,
        name: data.name,
        description: data.description,
        milestones
      });

      if (response.success) {
        setSuccessMsg('Project board initialized successfully!');
        resProject();
        setShowAddProject(false);
        fetchData();
      }
    } catch (error: any) {
      setErrorMsg('Failed to initialize project.');
    }
  };

  const handleCreateInvoice = async (data: InvoiceFields) => {
    setErrorMsg(null);
    try {
      const response = await createInvoice(data);
      if (response.success) {
        setSuccessMsg('Invoice dispatched successfully!');
        resInvoice();
        setShowAddInvoice(false);
        fetchData();
      }
    } catch (error: any) {
      setErrorMsg('Failed to dispatch invoice.');
    }
  };

  const handleTicketStatusChange = async (ticketId: string, status: string) => {
    try {
      const response = await updateTicketStatus(ticketId, status);
      if (response.success) {
        setSuccessMsg(`Ticket status set to ${status}`);
        fetchData();
        if (activeTicket && activeTicket._id === ticketId) {
          setActiveTicket({ ...activeTicket, status });
        }
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (error: any) {
      setErrorMsg('Failed to update status.');
    }
  };

  const handlePostReply = async () => {
    if (!activeTicket || replyText.trim() === '') return;
    try {
      const response = await replyToTicket(activeTicket._id, replyText);
      if (response.success) {
        setReplyText('');
        // Cast returned schema to AdminTicket type
        setActiveTicket(response.data as unknown as AdminTicket);
        fetchData();
      }
    } catch (error: any) {
      setErrorMsg('Failed to send response.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Projects & Operations Hub</h1>
          <p className="text-muted-foreground mt-1">Audit development sprints, issue invoices, and manage service tickets</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {activeTab === 'projects' && (
            <button
              onClick={() => setShowAddProject(!showAddProject)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg transition-all"
            >
              <Plus size={16} />
              <span>New Project</span>
            </button>
          )}
          {activeTab === 'billing' && (
            <button
              onClick={() => setShowAddInvoice(!showAddInvoice)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg transition-all"
            >
              <Plus size={16} />
              <span>Create Invoice</span>
            </button>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center justify-center p-2.5 bg-secondary border border-border/40 rounded-xl hover:bg-accent text-foreground animate-none"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
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

      {/* Active Ticket Drawer Dialog */}
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
                <p className="text-xs text-muted-foreground mt-1">Client: {activeTicket.clientId?.name} ({activeTicket.clientId?.companyName})</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs font-semibold text-muted-foreground">Status:</span>
                  <select
                    value={activeTicket.status}
                    onChange={(e) => handleTicketStatusChange(activeTicket._id, e.target.value)}
                    className="py-1 px-2.5 text-xs font-semibold border rounded bg-background"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                <div className="p-3 bg-secondary/50 rounded-xl border border-border/40 text-sm text-foreground">
                  <p className="text-xs font-bold text-muted-foreground mb-1">{activeTicket.clientId?.name}</p>
                  <p>{activeTicket.description}</p>
                </div>
                {activeTicket.replies.map((reply, idx) => (
                  <div key={idx} className={`p-3 rounded-xl max-w-md ${
                    reply.senderName === activeTicket.clientId?.name 
                      ? 'bg-secondary border border-border/40 text-foreground' 
                      : 'bg-primary/10 border border-primary/20 text-foreground ml-auto'
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
                  placeholder="Type support response..."
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

      {/* Add Project Form Collapsible */}
      <AnimatePresence>
        {showAddProject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-6 rounded-2xl border border-border/40 overflow-hidden shadow-lg"
          >
            <h3 className="font-extrabold text-lg text-foreground mb-4">Initialize Client Project Board</h3>
            <form onSubmit={subProject(handleCreateProject)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Assign Client</label>
                  <select
                    {...regProject('clientId')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.companyName || 'No Company'})</option>
                    ))}
                  </select>
                  {errProject.clientId && <p className="text-xs text-destructive">{errProject.clientId.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Project Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Outpro B2B E-Commerce Setup"
                    {...regProject('name')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errProject.name && <p className="text-xs text-destructive">{errProject.name.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Project Description</label>
                <textarea
                  rows={2}
                  placeholder="Outline the client project deliverables..."
                  {...regProject('description')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                />
                {errProject.description && <p className="text-xs text-destructive">{errProject.description.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Initial Milestones (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Design Wireframes, Setup Server, Beta Testing, Production Launch"
                  {...regProject('milestonesString')}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                />
                {errProject.milestonesString && <p className="text-xs text-destructive">{errProject.milestonesString.message}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 text-xs font-semibold bg-secondary rounded-lg border hover:bg-accent text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  Create Board
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Invoice Form Collapsible */}
      <AnimatePresence>
        {showAddInvoice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-6 rounded-2xl border border-border/40 overflow-hidden shadow-lg"
          >
            <h3 className="font-extrabold text-lg text-foreground mb-4">Generate Project Invoice</h3>
            <form onSubmit={subInvoice(handleCreateInvoice)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Select Client</label>
                  <select
                    {...regInvoice('clientId')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.companyName || 'No Company'})</option>
                    ))}
                  </select>
                  {errInvoice.clientId && <p className="text-xs text-destructive">{errInvoice.clientId.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Select Project</label>
                  <select
                    {...regInvoice('projectId')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  >
                    <option value="">-- Choose Project Board --</option>
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                  {errInvoice.projectId && <p className="text-xs text-destructive">{errInvoice.projectId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Invoice Bill No.</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-003"
                    {...regInvoice('invoiceNumber')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errInvoice.invoiceNumber && <p className="text-xs text-destructive">{errInvoice.invoiceNumber.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Amount due (INR)</label>
                  <input
                    type="number"
                    placeholder="120000"
                    {...regInvoice('amount')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errInvoice.amount && <p className="text-xs text-destructive">{errInvoice.amount.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Due Date</label>
                  <input
                    type="date"
                    {...regInvoice('dueDate')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errInvoice.dueDate && <p className="text-xs text-destructive">{errInvoice.dueDate.message}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddInvoice(false)}
                  className="px-4 py-2 text-xs font-semibold bg-secondary rounded-lg border hover:bg-accent text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  Dispatch Invoice
                </button>
              </div>
            </form>
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
          Project Milestones
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-4 border-b-2 transition-all ${
            activeTab === 'billing' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Invoices & Billing
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-4 border-b-2 transition-all ${
            activeTab === 'tickets' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Support Helpdesk
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="text-center py-6 text-muted-foreground animate-pulse">Loading project boards...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm font-semibold">No project boards found</div>
            ) : (
              projects.map((proj) => (
                <div key={proj._id} className="glass-panel p-6 rounded-2xl border border-border/40 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-extrabold text-lg text-foreground">{proj.name}</h3>
                        <p className="text-xs text-primary font-bold mt-0.5">Client: {proj.clientId?.name} ({proj.clientId?.companyName})</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-secondary text-foreground rounded font-bold uppercase">{proj.status}</span>
                    </div>
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

                  {/* Milestones toggles checklist for admin */}
                  <div className="space-y-2 border-t border-border/40 pt-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Audit Milestones</h4>
                    {proj.milestones.map((m, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => handleToggleMilestone(proj._id, idx, m.completed)}
                        className="flex items-center gap-2 text-sm text-foreground cursor-pointer hover:bg-secondary/40 p-1.5 rounded-lg select-none"
                      >
                        {m.completed ? (
                          <CheckSquare className="text-emerald-500 shrink-0" size={16} />
                        ) : (
                          <Square className="text-muted-foreground/60 shrink-0" size={16} />
                        )}
                        <span className={m.completed ? 'line-through text-muted-foreground font-semibold' : 'font-semibold'}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="glass-panel rounded-2xl overflow-hidden border border-border/40 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-6">Bill No</th>
                    <th className="py-4 px-6">Client Info</th>
                    <th className="py-4 px-6">Project Board</th>
                    <th className="py-4 px-6">Amount Due</th>
                    <th className="py-4 px-6">Due Date</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground animate-pulse">Loading billing logs...</td>
                    </tr>
                  ) : invoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">No invoices registered</td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv._id}>
                        <td className="py-4 px-6 font-bold text-foreground">{inv.invoiceNumber}</td>
                        <td className="py-4 px-6 text-muted-foreground">
                          <p className="font-semibold">{inv.clientId?.name || 'Client'}</p>
                          <p className="text-xs text-muted-foreground">{inv.clientId?.companyName}</p>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground">{inv.projectId?.name || 'Web Portal'}</td>
                        <td className="py-4 px-6 font-mono font-bold text-foreground">₹{inv.amount.toLocaleString()}</td>
                        <td className="py-4 px-6 text-muted-foreground">{inv.dueDate.split('T')[0]}</td>
                        <td className="py-4 px-6 text-right">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-border/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase">
                    <th className="py-4 px-6">Problem Subject</th>
                    <th className="py-4 px-6">Corporate Client</th>
                    <th className="py-4 px-6">Priority</th>
                    <th className="py-4 px-6">Current Status</th>
                    <th className="py-4 px-6 text-right">Action / Thread</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground animate-pulse">Loading helpdesk tickets...</td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">No tickets in system</td>
                    </tr>
                  ) : (
                    tickets.map((t) => (
                      <tr 
                        key={t._id}
                        className="hover:bg-secondary/20 transition-all duration-150 cursor-pointer"
                        onClick={() => setActiveTicket(t)}
                      >
                        <td className="py-4 px-6">
                          <p className="font-bold text-foreground">{t.subject}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{t.description}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-foreground">{t.clientId?.name || 'Client'}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.clientId?.companyName}</p>
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
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
