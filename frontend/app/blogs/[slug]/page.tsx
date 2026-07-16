'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { getBlogBySlug, addBlogComment, likeBlog } from '../../../services/api';
import { ArrowLeft, User, Calendar, Eye, ThumbsUp, Send, MessageSquare, ShieldAlert } from 'lucide-react';
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

const fallbackBlogs: Record<string, BlogPost> = {
  'migrating-monoliths-to-nextjs': {
    _id: 'blog1',
    title: 'Migrating Legacy Monoliths to Next.js & Serverless Microservices',
    slug: 'migrating-monoliths-to-nextjs',
    summary: 'A step-by-step architectural breakdown of decanting complex legacy content hubs into performant serverless nodes.',
    content: `Decoupling a monolithic architecture requires structured phase decants. At Outpro.India, we analyze the data flow before breaking any services apart.
    
    1. **Identify the Boundaries**: Group models and controllers by domain contexts.
    2. **API-First Decoupling**: Wrap the monolithic controllers in REST interfaces.
    3. **Deploy Next.js Incremental Ingestion**: Direct static routes to Next.js static generation pipelines.
    4. **Continuous Synchronization**: Build pub-sub triggers using queue systems to verify consistency.`,
    author: 'Aravind Swaminathan',
    category: 'Architecture',
    tags: ['NextJS', 'Cloud', 'Serverless'],
    image: 'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&w=800&q=80',
    likes: 24,
    views: 140,
    comments: [
      { authorName: 'Sanjay Deshmukh', text: 'This was extremely helpful for our cloud migration plan.', date: '2026-07-11T12:00:00.000Z' }
    ],
    createdAt: '2026-07-10T09:00:00.000Z'
  },
  'rise-of-headless-commerce-b2b': {
    _id: 'blog2',
    title: 'The Rise of Headless Commerce in B2B Corporate Operations',
    slug: 'rise-of-headless-commerce-b2b',
    summary: 'How decoupled API-first architectures enable massive scale, secure checkouts, and premium user experience dashboards.',
    content: `Headless B2B Commerce provides substantial conversion increments by separating the shopping interface from order management backend logs.
    
    Why transition to decoupled storefronts?
    - **Speed**: Optimized edge delivery translates to instant page loads.
    - **Omnichannel flexibility**: Deploy the same API interfaces to iOS, web portals, and IoT checkouts.
    - **Security**: Database nodes remain hidden behind edge caching endpoints, preventing query injection attempts.`,
    author: 'Neha Roy',
    category: 'E-Commerce',
    tags: ['APIs', 'Headless', 'Decoupled'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    likes: 18,
    views: 95,
    comments: [],
    createdAt: '2026-07-12T10:00:00.000Z'
  }
};

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Comment form fields
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await getBlogBySlug(slug);
      if (response.success && response.data) {
        setPost(response.data);
        setLikes(response.data.likes);
      } else {
        const fallback = fallbackBlogs[slug] || null;
        setPost(fallback);
        if (fallback) setLikes(fallback.likes);
      }
    } catch (error) {
      console.warn('API connection failed. Loading fallback blog post:', error);
      const fallback = fallbackBlogs[slug] || null;
      setPost(fallback);
      if (fallback) setLikes(fallback.likes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const handleLike = async () => {
    if (!post || hasLiked) return;
    try {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      await likeBlog(post._id);
    } catch (error) {
      console.warn('Could not post like update to backend');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);
    if (!post || !commentName.trim() || !commentText.trim()) return;

    try {
      const response = await addBlogComment(post._id, {
        authorName: commentName,
        text: commentText
      });

      if (response.success) {
        setCommentName('');
        setCommentText('');
        setPost(response.data);
      }
    } catch (error) {
      setCommentError('Database connection error. Could not post comment.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 max-w-3xl mx-auto px-4 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-secondary rounded" />
        <div className="h-10 w-full bg-secondary rounded" />
        <div className="h-48 w-full bg-secondary rounded-2xl" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-secondary rounded" />
          <div className="h-4 w-full bg-secondary rounded" />
          <div className="h-4 w-2/3 bg-secondary rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <ShieldAlert size={48} className="text-destructive" />
        <h2 className="text-xl font-bold text-foreground">Blog Post Not Found</h2>
        <Link href="/blogs" className="text-primary hover:underline text-sm font-semibold flex items-center gap-1.5">
          <ArrowLeft size={16} /> Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <Link href="/blogs" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        <span>Back to Insights</span>
      </Link>

      {/* Header Info */}
      <div className="space-y-4">
        <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-widest rounded">
          {post.category}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          {post.title}
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed font-semibold italic">
          {post.summary}
        </p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-muted-foreground border-y border-border/30 py-3.5">
          <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1.5"><Eye size={14} /> {post.views} views</span>
          <button 
            onClick={handleLike}
            disabled={hasLiked}
            className={`flex items-center gap-1.5 transition-all ${
              hasLiked ? 'text-emerald-500 font-bold' : 'hover:text-primary'
            }`}
          >
            <ThumbsUp size={14} />
            <span>{likes} Likes</span>
          </button>
        </div>
      </div>

      {/* Cover Image */}
      {post.image && (
        <div className="h-64 sm:h-96 w-full rounded-2xl overflow-hidden shadow-lg border border-border/40 relative">
          <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      {/* Article Content */}
      <div className="prose dark:prose-invert max-w-none text-foreground text-base leading-relaxed font-medium space-y-6 whitespace-pre-line">
        {post.content}
      </div>

      {/* Tags section */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
        {post.tags.map((tag) => (
          <span key={tag} className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
            #{tag}
          </span>
        ))}
      </div>

      {/* Comment timeline section */}
      <div className="space-y-6 pt-8 border-t border-border/40">
        <h3 className="font-extrabold text-xl text-foreground flex items-center gap-2">
          <MessageSquare size={20} />
          <span>Comments ({post.comments.length})</span>
        </h3>

        {/* Comment list */}
        <div className="space-y-4">
          {post.comments.length === 0 ? (
            <p className="text-xs text-muted-foreground italic font-medium">No comments posted. Be the first to share your feedback!</p>
          ) : (
            post.comments.map((comment, idx) => (
              <div key={idx} className="p-4 bg-secondary/35 border border-border/40 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
                  <span className="text-primary font-bold">{comment.authorName}</span>
                  <span>{new Date(comment.date).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-foreground font-medium leading-relaxed">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Comment submit form */}
        <form onSubmit={handleCommentSubmit} className="glass-panel p-6 rounded-2xl border border-border/40 space-y-4 shadow-sm">
          <h4 className="font-extrabold text-sm text-foreground uppercase tracking-widest">Post Comment</h4>
          {commentError && <p className="text-xs text-destructive font-semibold">{commentError}</p>}
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Your Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Comment Message</label>
              <textarea
                rows={3}
                placeholder="Write your constructive thoughts..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:opacity-90 flex items-center justify-center gap-1.5 shadow"
          >
            <Send size={12} />
            <span>Submit Comment</span>
          </button>
        </form>
      </div>
    </div>
  );
}
