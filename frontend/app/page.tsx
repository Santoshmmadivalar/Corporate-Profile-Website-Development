'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Code, Globe, Framer, Cloud, Shield, Database, Cpu, Mail, Star, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { getServices, getPortfolio, getTestimonials } from '../services/api';
import { Service, Project, Testimonial } from '../types';
import { fallbackServices, fallbackProjects, fallbackTestimonials } from '../constants/fallbackData';
import { StatsCounter } from '../components/ui/StatsCounter';
import { Accordion } from '../components/ui/Accordion';
import { IconRenderer } from '../components/ui/IconRenderer';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, portfolioRes, testimonialsRes] = await Promise.all([
          getServices(),
          getPortfolio(),
          getTestimonials(),
        ]);
        
        if (servicesRes.success && servicesRes.data.length > 0) {
          setServices(servicesRes.data);
        } else {
          setServices(fallbackServices);
        }

        if (portfolioRes.success && portfolioRes.data.length > 0) {
          setProjects(portfolioRes.data.slice(0, 3));
        } else {
          setProjects(fallbackProjects.slice(0, 3));
        }

        if (testimonialsRes.success && testimonialsRes.data.length > 0) {
          setTestimonials(testimonialsRes.data);
        } else {
          setTestimonials(fallbackTestimonials);
        }
      } catch (error) {
        console.warn('API connection failed. Loading fallback content:', error);
        setServices(fallbackServices);
        setProjects(fallbackProjects.slice(0, 3));
        setTestimonials(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const highlights = [
    { value: 12, suffix: '+', label: 'Years of Innovation' },
    { value: 150, suffix: '+', label: 'Enterprise Projects' },
    { value: 98, suffix: '%', label: 'Client Retention Rate' },
    { value: 40, suffix: '%', label: 'Cloud Cost Reductions' },
  ];

  const valueProps = [
    {
      icon: <Shield className="text-primary" size={24} />,
      title: 'Security-Obsessed Architecture',
      desc: 'Security is baked into our development lifecycle from day one, conforming to OWASP Top 10 guidelines.',
    },
    {
      icon: <Cpu className="text-primary" size={24} />,
      title: 'Sub-2 Second Performance',
      desc: 'We engineer ultra-fast server architectures and optimized rendering structures to elevate search rank and conversions.',
    },
    {
      icon: <Database className="text-primary" size={24} />,
      title: 'Complete IP Ownership',
      desc: 'You retain full ownership of the custom code repositories, system deployment blueprints, and assets.',
    },
  ];

  const faqs = [
    {
      question: 'What types of companies does Outpro.India partner with?',
      answer: 'We collaborate with Fortune 500 corporations, mid-sized enterprises, and funded technology startups looking to deploy custom web software, headless commerce pipelines, and modern cloud infrastructures.',
    },
    {
      question: 'How do you structure project timelines and sprints?',
      answer: 'We utilize bi-weekly Agile sprints. You receive access to a staging environment where you can review updates in real time, along with weekly progress metrics and architectural reports.',
    },
    {
      question: 'Do you offer post-deployment maintenance plans?',
      answer: 'Yes, we provide scalable service-level agreements (SLAs) offering 24/7 server monitoring, performance audits, database maintenance, and security patch updates.',
    },
    {
      question: 'Can you work with our in-house engineering and design teams?',
      answer: 'Absolutely. We regularly operate as an extension of client engineering teams, assisting with core architectural decisions, cloud migrations, and design system creation.',
    },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background glow animations */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid-glow">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold"
          >
            <span>Enterprise-Grade Digital Systems</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-foreground"
          >
            AI-Powered Enterprise <span className="text-gradient">Business Management Platform</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            An all-in-one corporate suite with secure JWT authentication, real-time CRM lead flows, schedule assistants, custom RAG document search engines, HR payroll portals, and interactive analytics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-primary-foreground bg-primary rounded-xl shadow-lg hover:bg-primary/95 hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              Access Platform Workspace
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link
              href="/ai-assistant"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-foreground bg-secondary hover:bg-accent border border-border/40 rounded-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Try AI Assistant
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Highlights / Stats */}
      <section className="border-y border-border/40 py-12 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {highlights.map((h) => (
              <div key={h.label} className="space-y-1">
                <p className="text-3xl sm:text-5xl font-extrabold text-primary">
                  <StatsCounter end={h.value} suffix={h.suffix} />
                </p>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{h.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-xl space-y-4">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Our Capabilities</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Elite Engineering Services Engineered for Scale
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 mt-4 md:mt-0 transition-colors"
          >
            View All Services
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading
            ? Array(4)
                .fill(0)
                .map((_, idx) => <CardSkeleton key={idx} />)
            : services.slice(0, 4).map((service) => (
                <div
                  key={service._id}
                  className="group flex flex-col justify-between p-8 rounded-2xl border border-border/40 bg-card hover:bg-accent/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 glass-panel"
                >
                  <div className="space-y-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <IconRenderer name={service.icon} size={22} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {service.shortDesc}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center text-xs font-bold text-primary group-hover:underline mt-8"
                  >
                    Learn More
                    <ArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
              ))}
        </div>
      </section>

      {/* Why Choose Outpro */}
      <section className="py-24 bg-secondary/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Why Partner With Us</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                Architecting Trust, Quality, and Premium User Experiences
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
              At Outpro.India, we dismiss standard template sites. We write bespoke, robust digital frameworks from the ground up, designed to load in milliseconds, scale effortlessly, and build complete customer credibility.
            </p>
            <div className="space-y-6">
              {valueProps.map((item) => (
                <div key={item.title} className="flex space-x-4">
                  <div className="p-3 h-11 w-11 rounded-lg bg-card border border-border/40 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Visual Container */}
          <div className="relative aspect-square md:aspect-video lg:aspect-square bg-gradient-to-tr from-primary/10 to-accent/10 rounded-3xl border border-border/40 p-1 flex items-center justify-center overflow-hidden group glass-panel">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
            <motion.div 
              className="text-center z-10 space-y-3 p-8 bg-card/60 backdrop-blur-md rounded-2xl border border-border/40 shadow-2xl max-w-sm"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="text-lg font-bold text-foreground">Next-Gen Delivery Standard</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every project is launched following security standard evaluations, static code checks, and performance optimization stages.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Portfolio */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-xl space-y-4">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Case Studies</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Selected Digital Architecture Outcomes
            </p>
          </div>
          <Link
            href="/portfolio"
            className="inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 mt-4 md:mt-0 transition-colors"
          >
            All Case Studies
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project._id}
              className="group rounded-2xl border border-border/40 bg-card overflow-hidden transition-all duration-300 hover:shadow-2xl glass-panel"
            >
              <div className="relative h-60 overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.images[0]}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md">
                  {project.category.name}
                </span>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                </div>
                
                {/* KPIs */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/40">
                  {project.kpis.slice(0, 3).map((kpi, index) => (
                    <div key={index} className="text-center">
                      <p className="text-lg font-bold text-primary">{kpi.value}</p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{kpi.label}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/portfolio/${project.slug}`}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-foreground bg-secondary hover:bg-accent border border-border/40 rounded-lg transition-colors mt-4"
                >
                  View Case Study Details
                  <ExternalLink size={12} className="ml-1.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-secondary/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-4">
            <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Client Success</h2>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">What Industry Leaders Say</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t._id}
                className="p-8 bg-card border border-border/40 rounded-2xl relative space-y-6 flex flex-col justify-between glass-panel"
              >
                <div className="space-y-4">
                  <div className="flex space-x-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={`${t._id}-star-${i + 1}`} size={14} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm italic text-foreground leading-relaxed">
                    "{t.text}"
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 pt-4 border-t border-border/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.avatar}
                    alt={t.clientName}
                    className="h-10 w-10 rounded-full object-cover shrink-0 border border-border/40"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{t.clientName}</h4>
                    <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Support FAQ</h2>
          <h3 className="text-3xl font-extrabold text-foreground tracking-tight">Frequently Asked Questions</h3>
        </div>
        <div className="bg-card/40 border border-border/40 rounded-2xl p-6 md:p-8 glass-panel">
          <Accordion items={faqs} />
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-gradient-to-tr from-primary via-indigo-900 to-slate-900 rounded-3xl p-8 md:p-16 text-center space-y-8 relative overflow-hidden shadow-2xl border border-white/10 text-white">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Accelerate Your Digital Transformation?
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              Consult with our engineering architects today. We will evaluate your current workflow structures and build a technical implementation proposal.
            </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold bg-white text-indigo-950 hover:bg-white/95 rounded-xl shadow-lg hover:shadow-white/20 transition-all duration-200"
            >
              Get Custom Consultation
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all duration-200"
            >
              Learn Our Culture
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
