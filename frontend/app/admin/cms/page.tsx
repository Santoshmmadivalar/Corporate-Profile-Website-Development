'use client';

import React, { useEffect, useState } from 'react';
import { 
  getBlogs, createBlog, deleteBlog, 
  getGalleryItems, createGalleryItem, deleteGalleryItem, 
  getFAQs, createFAQ, deleteFAQ, 
  getAuditLogs 
} from '../../../services/api';
import { 
  FileText, Image as ImageIcon, HelpCircle, ShieldAlert, Plus, Trash2, Calendar, 
  Eye, ThumbsUp, RefreshCw, Send, Lock, Globe 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const blogSchema = z.object({
  title: z.string().min(3, { message: 'Title is required' }),
  slug: z.string().min(3, { message: 'Slug is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  summary: z.string().min(5, { message: 'Summary is required' }),
  content: z.string().min(10, { message: 'Content is required' }),
  image: z.string().url().optional().or(z.literal('')),
  tagsString: z.string().optional()
});

const mediaSchema = z.object({
  title: z.string().min(2, { message: 'Title is required' }),
  url: z.string().url({ message: 'Valid media URL is required' }),
  type: z.enum(['image', 'video']),
  category: z.string().min(1, { message: 'Category is required' }),
  description: z.string().optional()
});

const faqSchema = z.object({
  question: z.string().min(5, { message: 'Question is required' }),
  answer: z.string().min(5, { message: 'Answer is required' }),
  category: z.string().min(1, { message: 'Category is required' })
});

type BlogFields = z.infer<typeof blogSchema>;
type MediaFields = z.infer<typeof mediaSchema>;
type FAQFields = z.infer<typeof faqSchema>;

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<'blogs' | 'gallery' | 'faqs' | 'audit'>('blogs');
  
  // Data lists
  const [blogs, setBlogs] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Success / Error banners
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forms
  const { register: regBlog, handleSubmit: subBlog, reset: resBlog, formState: { errors: errBlog } } = useForm<BlogFields>({
    resolver: zodResolver(blogSchema)
  });
  
  const { register: regMedia, handleSubmit: subMedia, reset: resMedia, formState: { errors: errMedia } } = useForm<MediaFields>({
    resolver: zodResolver(mediaSchema)
  });

  const { register: regFAQ, handleSubmit: subFAQ, reset: resFAQ, formState: { errors: errFAQ } } = useForm<FAQFields>({
    resolver: zodResolver(faqSchema)
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [blogsRes, galleryRes, faqsRes, auditRes] = await Promise.all([
        getBlogs(),
        getGalleryItems(),
        getFAQs(),
        getAuditLogs()
      ]);

      if (blogsRes.success) setBlogs(blogsRes.data);
      if (galleryRes.success) setGallery(galleryRes.data);
      if (faqsRes.success) setFaqs(faqsRes.data);
      if (auditRes.success) setAuditLogs(auditRes.data);
    } catch (error) {
      console.warn('API connection failed. Loading empty CMS grids:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handlePublishBlog = async (data: BlogFields) => {
    setErrorMsg(null);
    try {
      const tags = data.tagsString ? data.tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];
      const payload = { ...data, tags };
      const res = await createBlog(payload);
      if (res.success) {
        setSuccessMsg('Blog published successfully');
        resBlog();
        loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg('Failed to publish blog article.');
    }
  };

  const handleAddMedia = async (data: MediaFields) => {
    setErrorMsg(null);
    try {
      const res = await createGalleryItem(data);
      if (res.success) {
        setSuccessMsg('Media uploaded to gallery');
        resMedia();
        loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg('Failed to upload media node.');
    }
  };

  const handleAddFAQ = async (data: FAQFields) => {
    setErrorMsg(null);
    try {
      const res = await createFAQ(data);
      if (res.success) {
        setSuccessMsg('FAQ created successfully');
        resFAQ();
        loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg('Failed to create FAQ entry.');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    try {
      const res = await deleteBlog(id);
      if (res.success) {
        setSuccessMsg('Blog post removed');
        loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg('Failed to remove blog.');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      const res = await deleteGalleryItem(id);
      if (res.success) {
        setSuccessMsg('Media item removed');
        loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg('Failed to remove media.');
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    try {
      const res = await deleteFAQ(id);
      if (res.success) {
        setSuccessMsg('FAQ entry removed');
        loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err: any) {
      setErrorMsg('Failed to remove FAQ.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">CMS & Audit Center</h1>
          <p className="text-muted-foreground mt-1">Manage corporate insights, lightbox gallery, FAQs, and view system logs</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2.5 bg-secondary border border-border/40 rounded-xl hover:bg-accent text-foreground"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
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

      {/* Tabs */}
      <div className="border-b border-border/40 flex space-x-6 text-sm font-semibold select-none">
        <button
          onClick={() => setActiveTab('blogs')}
          className={`pb-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'blogs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText size={16} />
          <span>Blogs Editor</span>
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`pb-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <ImageIcon size={16} />
          <span>Media Gallery</span>
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`pb-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'faqs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <HelpCircle size={16} />
          <span>FAQs Manager</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Lock size={16} />
          <span>Security Logs</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {activeTab === 'blogs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Publisher form */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-border/40 space-y-4">
              <h3 className="font-extrabold text-base text-foreground uppercase tracking-widest">Publish New Blog</h3>
              <form onSubmit={subBlog(handlePublishBlog)} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Title</label>
                  <input
                    type="text"
                    placeholder="Article title"
                    {...regBlog('title')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errBlog.title && <p className="text-[10px] text-destructive font-semibold">{errBlog.title.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Slug (URL identifier)</label>
                  <input
                    type="text"
                    placeholder="migrating-monoliths-to-nextjs"
                    {...regBlog('slug')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errBlog.slug && <p className="text-[10px] text-destructive font-semibold">{errBlog.slug.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Design"
                      {...regBlog('category')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                    />
                    {errBlog.category && <p className="text-[10px] text-destructive font-semibold">{errBlog.category.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Tags (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="NextJS, Cloud"
                      {...regBlog('tagsString')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    {...regBlog('image')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Short Summary</label>
                  <input
                    type="text"
                    placeholder="Brief description preview..."
                    {...regBlog('summary')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errBlog.summary && <p className="text-[10px] text-destructive font-semibold">{errBlog.summary.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Content</label>
                  <textarea
                    rows={4}
                    placeholder="Full article content text..."
                    {...regBlog('content')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errBlog.content && <p className="text-[10px] text-destructive font-semibold">{errBlog.content.message}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:opacity-90 shadow"
                >
                  Publish Article
                </button>
              </form>
            </div>

            {/* Blogs list */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-base text-foreground uppercase tracking-widest">Published Articles</h3>
              {blogs.length === 0 ? (
                <div className="p-6 bg-secondary/20 rounded-2xl text-center text-xs text-muted-foreground italic font-semibold">No published posts found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blogs.map((b) => (
                    <div key={b._id} className="glass-panel p-4 rounded-xl border border-border/40 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-bold text-sm text-foreground truncate max-w-xs">{b.title}</h4>
                          <button 
                            onClick={() => handleDeleteBlog(b._id)}
                            className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{b.summary}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground border-t border-border/20 pt-3 mt-3">
                        <span className="bg-secondary px-2 py-0.5 rounded text-foreground uppercase">{b.category}</span>
                        <span>{b.createdAt.split('T')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Uploader form */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-border/40 space-y-4">
              <h3 className="font-extrabold text-base text-foreground uppercase tracking-widest">Add Media File</h3>
              <form onSubmit={subMedia(handleAddMedia)} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Title</label>
                  <input
                    type="text"
                    placeholder="Workspace picture description"
                    {...regMedia('title')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errMedia.title && <p className="text-[10px] text-destructive font-semibold">{errMedia.title.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Media File URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/... or video .mp4 link"
                    {...regMedia('url')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errMedia.url && <p className="text-[10px] text-destructive font-semibold">{errMedia.url.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Type</label>
                    <select
                      {...regMedia('type')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                    >
                      <option value="image">Image File</option>
                      <option value="video">Video Embed</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Workspace"
                      {...regMedia('category')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                    />
                    {errMedia.category && <p className="text-[10px] text-destructive font-semibold">{errMedia.category.message}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Optionally outline where this was taken..."
                    {...regMedia('description')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:opacity-90 shadow"
                >
                  Upload Media
                </button>
              </form>
            </div>

            {/* Media list */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-base text-foreground uppercase tracking-widest">Gallery Media Assets</h3>
              {gallery.length === 0 ? (
                <div className="p-6 bg-secondary/20 rounded-2xl text-center text-xs text-muted-foreground italic font-semibold">No media assets found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gallery.map((item) => (
                    <div key={item._id} className="glass-panel p-4 rounded-xl border border-border/40 flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-secondary rounded text-primary">
                          {item.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                        </span>
                        <div className="max-w-[200px]">
                          <h4 className="font-bold text-sm text-foreground truncate">{item.title}</h4>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{item.category}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteMedia(item._id)}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'faqs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* FAQ form */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-border/40 space-y-4">
              <h3 className="font-extrabold text-base text-foreground uppercase tracking-widest">Create FAQ</h3>
              <form onSubmit={subFAQ(handleAddFAQ)} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Question</label>
                  <input
                    type="text"
                    placeholder="e.g. What is the SLA response time?"
                    {...regFAQ('question')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errFAQ.question && <p className="text-[10px] text-destructive font-semibold">{errFAQ.question.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">FAQ Category</label>
                  <input
                    type="text"
                    placeholder="e.g. SLA"
                    {...regFAQ('category')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errFAQ.category && <p className="text-[10px] text-destructive font-semibold">{errFAQ.category.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Answer Response Text</label>
                  <textarea
                    rows={4}
                    placeholder="State the detailed answer response..."
                    {...regFAQ('answer')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground"
                  />
                  {errFAQ.answer && <p className="text-[10px] text-destructive font-semibold">{errFAQ.answer.message}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:opacity-90 shadow"
                >
                  Create FAQ Entry
                </button>
              </form>
            </div>

            {/* FAQs List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-extrabold text-base text-foreground uppercase tracking-widest">Configured FAQs</h3>
              {faqs.length === 0 ? (
                <div className="p-6 bg-secondary/20 rounded-2xl text-center text-xs text-muted-foreground italic font-semibold">No FAQs registered.</div>
              ) : (
                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div key={faq._id} className="glass-panel p-4 rounded-xl border border-border/40 flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{faq.question}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed font-medium">{faq.answer}</p>
                        <span className="inline-block mt-2 text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">{faq.category}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteFAQ(faq._id)}
                        className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="glass-panel rounded-2xl overflow-hidden border border-border/40 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Actor / User</th>
                    <th className="py-4 px-6">Action Event</th>
                    <th className="py-4 px-6">Activity Logs</th>
                    <th className="py-4 px-6 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground italic font-semibold">No security audit logs recorded</td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td className="py-4 px-6 text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 px-6 font-semibold text-foreground">{log.actorName}</td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 bg-secondary text-foreground text-[10px] font-bold uppercase rounded">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-muted-foreground font-medium">{log.details}</td>
                        <td className="py-4 px-6 text-right font-mono text-xs text-muted-foreground">{log.ipAddress || '127.0.0.1'}</td>
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
