'use client';

import React, { useEffect, useState } from 'react';
import { getCRMEnquiries, updateCRMStatus, addCRMFollowUp } from '../../../services/api';
import { Search, Plus, Calendar, Clock, MessageSquare, Phone, Building2, UserCircle, ArrowRight, Download, Send, Filter, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FollowUpItem {
  note: string;
  date: string;
}

interface CRMLead {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  followUps: FollowUpItem[];
  createdAt: string;
}

const fallbackCRM: CRMLead[] = [
  {
    _id: 'lead1',
    name: 'Sarah Jenkins',
    email: 'sarah@vanguard.com',
    company: 'Vanguard Realty',
    phone: '+1 555 102 304',
    subject: 'Enterprise Headless CMS Implementation',
    message: 'We are seeking a premium Next.js Jamstack developer team to decouple our listing nodes from a legacy Drupal setup.',
    status: 'new',
    followUps: [],
    createdAt: '2026-07-15T09:00:00.000Z'
  },
  {
    _id: 'lead2',
    name: 'Vikram Mehta',
    email: 'vikram@edukite.in',
    company: 'EduKite Learning',
    phone: '+91 98300 12345',
    subject: 'B2B Sales Portal Upgrade',
    message: 'Need a dashboard with robust role allocations, invoice payouts, and ticketing features for our clients.',
    status: 'contacted',
    followUps: [
      { note: 'Introductory call conducted. Client requested dashboard blueprint wireframes.', date: '2026-07-15T10:00:00.000Z' }
    ],
    createdAt: '2026-07-14T08:00:00.000Z'
  }
];

export default function AdminCRMPage() {
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeLead, setActiveLead] = useState<CRMLead | null>(null);
  const [followUpNote, setFollowUpNote] = useState('');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCRM = async () => {
    setLoading(true);
    try {
      const response = await getCRMEnquiries();
      if (response.success && response.data.length > 0) {
        setLeads(response.data);
      } else {
        setLeads(fallbackCRM);
      }
    } catch (error) {
      console.warn('API connection failed. Loading fallback CRM dataset:', error);
      setLeads(fallbackCRM);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRM();
  }, []);

  const handleStatusTransition = async (leadId: string, status: 'new' | 'contacted' | 'qualified' | 'closed') => {
    setErrorMsg(null);
    try {
      const response = await updateCRMStatus(leadId, status);
      if (response.success) {
        setSuccessMsg(`Lead stage set to ${status}`);
        fetchCRM();
        if (activeLead && activeLead._id === leadId) {
          setActiveLead({ ...activeLead, status });
        }
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (error: any) {
      setErrorMsg('Failed to transition lead stage.');
    }
  };

  const handleAddFollowUp = async () => {
    if (!activeLead || followUpNote.trim() === '') return;
    setErrorMsg(null);
    try {
      const response = await addCRMFollowUp(activeLead._id, followUpNote);
      if (response.success) {
        setFollowUpNote('');
        setActiveLead(response.data);
        fetchCRM();
      }
    } catch (error: any) {
      setErrorMsg('Failed to log follow-up note.');
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Email,Company,Phone,Subject,Status,Follow-up Count,Created At\n';
    const csvRows = filteredLeads.map(l => 
      `"${l._id}","${l.name}","${l.email}","${l.company || ''}","${l.phone || ''}","${l.subject}","${l.status}","${l.followUps.length}","${l.createdAt}"`
    ).join('\n');

    const blob = new Blob([headers + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'outpro_crm_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.company && l.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    l.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLeadsByStatus = (status: 'new' | 'contacted' | 'qualified' | 'closed') => {
    return filteredLeads.filter(l => l.status === status);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">CRM Sales Pipeline</h1>
          <p className="text-muted-foreground mt-1">Audit customer enquiries, follow-up interactions, and close corporate deals</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground hover:opacity-90 rounded-xl shadow-lg transition-all"
        >
          <Download size={16} />
          <span>Export CRM Leads</span>
        </button>
      </div>

      {/* Info Banners */}
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

      {/* Lead details Modal */}
      <AnimatePresence>
        {activeLead && (
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
              className="w-full max-w-2xl glass-panel p-6 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col h-[75vh]"
            >
              <button 
                onClick={() => setActiveLead(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-lg font-bold"
              >
                ✕
              </button>

              <div className="border-b border-border/40 pb-4 mb-4">
                <h3 className="text-xl font-extrabold text-foreground">{activeLead.subject}</h3>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><UserCircle size={14} /> {activeLead.name}</span>
                  <span className="flex items-center gap-1"><Building2 size={14} /> {activeLead.company || 'N/A'}</span>
                  <span className="flex items-center gap-1"><Phone size={14} /> {activeLead.phone || 'N/A'}</span>
                </div>
                <div className="p-3 bg-secondary/35 rounded-lg text-sm text-foreground mt-4 leading-relaxed font-medium">
                  {activeLead.message}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Pipeline Stage:</span>
                  <select
                    value={activeLead.status}
                    onChange={(e: any) => handleStatusTransition(activeLead._id, e.target.value)}
                    className="py-1 px-2.5 text-xs font-bold border rounded bg-background capitalize"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified Partner</option>
                    <option value="closed">Closed Deal</option>
                  </select>
                </div>
              </div>

              {/* Follow-up Timeline */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Follow-Up History</h4>
                {activeLead.followUps.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No interactions logged yet.</p>
                ) : (
                  <div className="space-y-4 border-l border-border/40 ml-2 pl-4">
                    {activeLead.followUps.map((f, idx) => (
                      <div key={idx} className="relative space-y-1">
                        <div className="absolute top-1.5 left-[-21px] w-2.5 h-2.5 rounded-full bg-primary" />
                        <p className="text-xs text-muted-foreground font-semibold">
                          {new Date(f.date).toLocaleDateString()} • {new Date(f.date).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-foreground font-medium">{f.note}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add follow up note */}
              <div className="flex gap-2 border-t border-border/40 pt-4">
                <input 
                  type="text"
                  placeholder="Log follow-up call, email, or meeting note..."
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFollowUp()}
                  className="flex-grow px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                />
                <button
                  onClick={handleAddFollowUp}
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 flex items-center gap-1.5"
                >
                  <Send size={14} />
                  <span>Log Note</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Filter bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
        <input
          type="text"
          placeholder="Search pipeline by contact name, company name, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/60 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200"
        />
      </div>

      {/* Kanban Board columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Columns mapping */}
        {(['new', 'contacted', 'qualified', 'closed'] as const).map((stage) => {
          const list = getLeadsByStatus(stage);
          const stageColors = 
            stage === 'new' ? 'border-t-blue-500 bg-blue-500/5' :
            stage === 'contacted' ? 'border-t-amber-500 bg-amber-500/5' :
            stage === 'qualified' ? 'border-t-violet-500 bg-violet-500/5' :
            'border-t-emerald-500 bg-emerald-500/5';

          return (
            <div key={stage} className={`glass-panel border-t-4 rounded-2xl p-4 flex flex-col space-y-4 ${stageColors}`}>
              <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-1">
                <span className="text-xs font-bold text-foreground capitalize tracking-wider flex items-center gap-1.5">
                  {stage === 'new' && 'New Enquiry'}
                  {stage === 'contacted' && 'Contacted'}
                  {stage === 'qualified' && 'Qualified Partner'}
                  {stage === 'closed' && 'Closed Deal'}
                  <span className="px-2 py-0.5 text-[10px] bg-secondary text-foreground rounded-full">{list.length}</span>
                </span>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {list.map((lead) => (
                  <motion.div
                    key={lead._id}
                    layoutId={lead._id}
                    onClick={() => setActiveLead(lead)}
                    className="p-4 bg-background border border-border/50 rounded-xl hover:border-primary/20 hover:shadow-md cursor-pointer transition-all duration-150 space-y-2 relative group"
                  >
                    <h4 className="font-extrabold text-sm text-foreground group-hover:text-primary leading-tight transition-colors">
                      {lead.subject}
                    </h4>
                    <p className="text-xs text-muted-foreground font-semibold">{lead.company || lead.name}</p>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground border-t border-border/40 pt-2 mt-2">
                      <span className="flex items-center gap-1"><MessageSquare size={10} /> {lead.followUps.length} Touchpoints</span>
                      <span>{lead.createdAt.split('T')[0]}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
