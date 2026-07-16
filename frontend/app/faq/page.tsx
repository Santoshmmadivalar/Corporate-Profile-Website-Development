'use client';

import React, { useEffect, useState } from 'react';
import { getFAQs } from '../../services/api';
import { Search, Accordion, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

const fallbackFAQs: FAQItem[] = [
  {
    _id: 'faq1',
    question: 'What types of development methodologies do you support?',
    answer: 'We operate strictly under bi-weekly Agile sprints. We configure project boards on our Client Portal so you can track implementation progress, clear milestones, and review staging environments in real time.',
    category: 'Process'
  },
  {
    _id: 'faq2',
    question: 'How do you ensure enterprise-level application security?',
    answer: 'We secure operations by enforcing strict Role-Based Access Control (RBAC), implementing rate limiters, using Helmet protection headers, hashing secrets, and recording administrative audit logs for compliance checks.',
    category: 'Security'
  },
  {
    _id: 'faq3',
    question: 'Can we hire Outpro developers for direct staff augmentation?',
    answer: 'Yes! We offer flexible custom software contracts where our experienced React/Node developers and cloud architects work directly as integrated extensions of your internal software divisions.',
    category: 'Billing'
  }
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const fetchFAQsList = async () => {
    setLoading(true);
    try {
      const response = await getFAQs();
      if (response.success && response.data.length > 0) {
        setFaqs(response.data);
      } else {
        setFaqs(fallbackFAQs);
      }
    } catch (error) {
      console.warn('API connection failed. Loading fallback FAQ index:', error);
      setFaqs(fallbackFAQs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQsList();
  }, []);

  const categories = ['All', ...Array.from(new Set(faqs.map(f => f.category)))];

  const filteredFAQs = faqs.filter(f => {
    const matchesSearch = f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Frequently Asked <span className="text-gradient">Questions</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed font-semibold">
          Find answers to common questions about our corporate services, security, workflows, and billing models
        </p>
      </div>

      {/* Filter Category selectors and search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-secondary border border-border/40 hover:bg-accent text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs checklist */}
      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, idx) => (
            <div key={idx} className="h-16 w-full bg-secondary animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredFAQs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-semibold">
          No FAQs match your search parameters.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFAQs.map((faq) => {
            const isOpen = openIndex === faq._id;
            return (
              <div 
                key={faq._id} 
                className="glass-panel overflow-hidden rounded-2xl border border-border/40 shadow-sm"
              >
                {/* Header */}
                <button
                  onClick={() => setOpenIndex(isOpen ? null : faq._id)}
                  className="w-full p-5 flex items-center justify-between text-left text-foreground hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="font-extrabold text-base flex items-center gap-3">
                    <HelpCircle size={18} className="text-primary shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <span className="text-xl font-bold font-mono ml-4 select-none shrink-0">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {/* Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-border/20 bg-secondary/10"
                    >
                      <p className="p-5 text-sm text-muted-foreground font-medium leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
