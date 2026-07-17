'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Quote, Sparkles } from 'lucide-react';
import { getTestimonials } from '../../services/api';
import { Testimonial } from '../../types';
import { fallbackTestimonials } from '../../constants/fallbackData';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await getTestimonials();
        if (res.success && res.data.length > 0) {
          setTestimonials(res.data);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } catch (error) {
        console.warn('Failed to load testimonials from API. Loading fallback testimonials.', error);
        setTestimonials(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const metrics = [
    { label: 'Average Client Net Promoter Score (NPS)', value: '76' },
    { label: 'On-Time Project Sprints Met', value: '98.5%' },
    { label: 'Long-Term Corporate Partners (2+ Years)', value: '82%' }
  ];

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-[-5%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <Breadcrumbs />

      {/* Page Header */}
      <section className="text-center max-w-3xl mx-auto space-y-6 mb-20">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
          <Sparkles size={12} />
          <span>Client Reviews & Feedback</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Enterprise Trust Formed Through Executed Results
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Read reviews from chief product officers, founders, and VP architects who trust Outpro.India to engineer high-throughput web applications and maintain server reliability.
        </p>
      </section>

      {/* Key Client Metrics Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 px-6 border border-border/40 bg-secondary/15 rounded-3xl mb-20 text-center glass-panel">
        {metrics.map((m, idx) => (
          <div key={idx} className="space-y-2">
            <p className="text-4xl font-extrabold text-primary">{m.value}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider max-w-[240px] mx-auto">
              {m.label}
            </p>
          </div>
        ))}
      </section>

      {/* Testimonials Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {loading
          ? ['sk-testimonial-1', 'sk-testimonial-2', 'sk-testimonial-3'].map((skeletonId) => (
                <div key={skeletonId} className="animate-pulse bg-secondary/50 rounded-2xl h-64 border border-border/20" />
              ))
          : testimonials.map((t) => (
              <div
                key={t._id}
                className="group p-8 bg-card border border-border/40 rounded-2xl relative space-y-6 flex flex-col justify-between hover:border-primary/40 transition-all duration-300 hover:shadow-xl glass-panel"
              >
                <Quote className="absolute right-6 top-6 text-primary/10 group-hover:text-primary/20 transition-colors" size={40} />
                
                <div className="space-y-4 relative z-10">
                  <div className="flex space-x-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={`testimonial-${t._id}-star-${i + 1}`} size={14} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm italic text-foreground leading-relaxed">
                    "{t.text}"
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 pt-6 border-t border-border/20 relative z-10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.clientName}
                    className="h-11 w-11 rounded-full object-cover shrink-0 border border-border/40 shadow-sm"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-foreground leading-tight">{t.clientName}</h4>
                    <p className="text-[11px] text-muted-foreground">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
      </section>
    </div>
  );
}
