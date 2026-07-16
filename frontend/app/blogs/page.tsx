'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getBlogs } from '../../services/api';
import { Search, Calendar, User, Clock, ArrowRight, BookOpen, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface BlogComment {
  authorName: string;
  text: string;
  date: string;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  likes: number;
  views: number;
  comments: BlogComment[];
  createdAt: string;
}

const fallbackBlogs: BlogPost[] = [
  {
    _id: 'blog1',
    title: 'Migrating Legacy Monoliths to Next.js & Serverless Microservices',
    slug: 'migrating-monoliths-to-nextjs',
    summary: 'A step-by-step architectural breakdown of decanting complex legacy content hubs into performant serverless nodes.',
    content: 'Long form content goes here...',
    author: 'Aravind Swaminathan',
    category: 'Architecture',
    tags: ['NextJS', 'Cloud', 'Serverless'],
    image: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&w=800&q=80',
    likes: 24,
    views: 140,
    comments: [],
    createdAt: '2026-07-10T09:00:00.000Z'
  },
  {
    _id: 'blog2',
    title: 'The Rise of Headless Commerce in B2B Corporate Operations',
    slug: 'rise-of-headless-commerce-b2b',
    summary: 'How decoupled API-first architectures enable massive scale, secure checkouts, and premium user experience dashboards.',
    content: 'Long form content goes here...',
    author: 'Neha Roy',
    category: 'E-Commerce',
    tags: ['APIs', 'Headless', 'Decoupled'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    likes: 18,
    views: 95,
    comments: [],
    createdAt: '2026-07-12T10:00:00.000Z'
  }
];

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchBlogPosts = async () => {
    setLoading(true);
    try {
      const response = await getBlogs();
      if (response.success && response.data.length > 0) {
        setBlogs(response.data);
      } else {
        setBlogs(fallbackBlogs);
      }
    } catch (error) {
      console.warn('API connection failed. Loading fallback blogs:', error);
      setBlogs(fallbackBlogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category)))];

  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Corporate <span className="text-gradient">Insights & Blog</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Stay informed with regular architectural advice, DevOps breakdowns, and technical perspectives from Outpro.India
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        {/* Categories list */}
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

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array(2).fill(0).map((_, idx) => (
            <div key={idx} className="h-80 w-full glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-semibold">
          No articles match your search parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((post) => (
            <motion.article 
              key={post._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel overflow-hidden rounded-2xl shadow-md border border-border/40 flex flex-col group"
            >
              {/* Media image */}
              <div className="h-48 w-full overflow-hidden relative bg-muted">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground/45">
                    <BookOpen size={48} />
                  </div>
                )}
                <span className="absolute top-4 left-4 bg-primary/90 text-primary-foreground text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded">
                  {post.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-foreground leading-snug group-hover:text-primary transition-colors">
                    <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    {post.summary}
                  </p>
                </div>

                <div className="border-t border-border/30 pt-4 space-y-3">
                  {/* Meta */}
                  <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Link action */}
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="inline-flex items-center text-xs font-bold text-primary hover:opacity-90 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Article</span>
                    <ArrowRight size={14} className="ml-1.5" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
