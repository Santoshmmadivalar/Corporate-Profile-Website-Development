'use client';

import React, { useEffect, useState } from 'react';
import { getGalleryItems } from '../../services/api';
import { Image as ImageIcon, Video, Play, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryMedia {
  _id: string;
  title: string;
  url: string;
  type: 'image' | 'video';
  category: string;
  description?: string;
  createdAt: string;
}

// Inline self-contained SVG placeholders that work 100% offline
const workspaceSVG = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnMSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzFlMjkzYiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBmMTcyYSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2cxKSIvPjxjaXJjbGUgY3g9IjQwMCIgY3k9IjMwMCIgcj0iMTIwIiBmaWxsPSIjMzhiZGY4IiBvcGFjaXR5PSIwLjEiLz48cGF0aCBkPSJNIDMwMCAyNTAgTCA1MDAgMjUwIEwgNDAwIDQ1MCBaIiBmaWxsPSIjMzhiZGY4IiBvcGFjaXR5PSIwLjIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZjhmYWZjIj5PdXRwcm8gSW5kaWEgV29ya3NwYWNlPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNTclIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY0NzQ4YiI+U2VjdG9yIFYsIFNhbHQgTGFrZSwgS29sa2F0YTwvdGV4dD48L3N2Zz4=`;

const sprintsSVG = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImcyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzBmMTcyYSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxZTFiNGIiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2cyKSIvPgogIDxjaXJjbGUgY3g9IjQwMCIgY3k9IjMwMCIgcj0iMTQwIiBmaWxsPSIjYTg1NWY3IiBvcGFjaXR5PSIwLjEiLz4KICA8cmVjdCB4PSIyNTAiIHk9IjIwMCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIHJ4PSIxNSIgZmlsbD0iI2E4NTVmNyIgb3BhY2l0eT0iMC4xNSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmOGZhZmMiPkIyQiBTdHJhdGVneSBTcHJpbnQ8L3RleHQ+CiAgPHRleHQgeD0iNTAlIiB5PSI1NyUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjODE4Y2Y4Ij5Qcm9kdWN0IFdoaXRlYm9hcmQgJmFtcDsgRGVjb3VwbGVkIFNjaGVtYXM8L3RleHQ+Cjwvc3ZnPg==`;

const engineeringSVG = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnMyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAyMDYxNyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBmMTcyYSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2czKSIvPjxjaXJjbGUgY3g9IjQwMCIgY3k9IjMwMCIgcj0iMTAwIiBmaWxsPSIjMTBiOTgxIiBvcGFjaXR5PSIwLjEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZjhmYWZjIj5QbGF0Zm9ybSBBcmNoaXRlY3R1cmFsIEJyaWVmaW5nPC90ZXh0Pjx0ZXh0IHg9IjUwJSIgeT0iNTclIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM0ZDM5OSI+RG9ja2VyIGNvbmZpZ3VyYXRpb25zICYgcGlwZWxpbmVzIGJyaWVmaW5nPC90ZXh0Pjwvc3ZnPg==`;

const fallbackGallery: GalleryMedia[] = [
  {
    _id: 'media1',
    title: 'Outpro India Kolkata Office Workspace',
    url: workspaceSVG,
    type: 'image',
    category: 'Workspace',
    description: 'Our open layout collaborative engineering center in Sector V, Salt Lake, Kolkata.',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'media2',
    title: 'B2B Client Strategy Sprint Session',
    url: sprintsSVG,
    type: 'image',
    category: 'Sprints',
    description: 'Product managers and software architects whiteboard decoupled headless schemas.',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'media3',
    title: 'Outpro Platform Architectural Briefing',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    type: 'video',
    category: 'Engineering',
    description: 'A walk-through showing Docker configurations and modular folder pipelines.',
    createdAt: new Date().toISOString()
  }
];

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await getGalleryItems();
      if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
        setItems(response.data);
      } else {
        setItems(fallbackGallery);
      }
    } catch (error) {
      console.warn('API connection failed. Loading fallback gallery items:', error);
      setItems(fallbackGallery);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];

  const filteredItems = items.filter(item => {
    return activeCategory === 'All' || item.category === activeCategory;
  });

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev === 0 ? filteredItems.length - 1 : prev! - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev === filteredItems.length - 1 ? 0 : prev! + 1));
  };

  const activeMedia = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <div className="min-h-screen py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Corporate <span className="text-gradient">Media Gallery</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed font-semibold">
          Check out our office operations, sprint reviews, team meetups, and platform video walkthroughs
        </p>
      </div>

      {/* Filter Categories */}
      <div className="flex gap-2 flex-wrap items-center justify-center">
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

      {/* Lightbox Modal overlay */}
      <AnimatePresence>
        {activeMedia && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <button 
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X size={24} />
            </button>

            {/* Navigation buttons */}
            <button 
              onClick={handlePrev}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              <ChevronRight size={24} />
            </button>

            {/* Media Container */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full flex flex-col space-y-4 items-center justify-center"
            >
              <div className="max-h-[70vh] max-w-full overflow-hidden rounded-xl border border-white/10 bg-black relative flex items-center justify-center">
                {activeMedia.type === 'image' || activeMedia.url.startsWith('data:') ? (
                  <img 
                    src={activeMedia.url} 
                    alt={activeMedia.title}
                    className="max-h-[70vh] object-contain max-w-full"
                  />
                ) : (
                  <video 
                    src={activeMedia.url} 
                    controls 
                    autoPlay
                    className="max-h-[70vh] object-contain max-w-full"
                  />
                )}
              </div>
              <div className="text-center text-white space-y-1 select-none max-w-2xl">
                <h3 className="font-extrabold text-lg">{activeMedia.title}</h3>
                {activeMedia.description && (
                  <p className="text-sm text-gray-400 font-medium">{activeMedia.description}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid gallery */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(3).fill(0).map((_, idx) => (
            <div key={idx} className="h-64 w-full glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground font-semibold">
          No media nodes match this category filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item._id}
              layoutId={item._id}
              onClick={() => setLightboxIndex(idx)}
              className="glass-panel overflow-hidden rounded-2xl border border-border/40 shadow-sm relative group cursor-pointer h-64"
            >
              {/* Overlay card preview */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10 opacity-60 group-hover:opacity-85 transition-opacity" />
              
              {/* Indicator icon */}
              <span className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-sm text-white/90 p-1.5 rounded-lg border border-white/10">
                {item.type === 'image' ? <ImageIcon size={14} /> : <Video size={14} />}
              </span>

              {item.type === 'video' ? (
                <div className="relative h-full w-full bg-slate-900 overflow-hidden">
                  <video 
                    src={item.url} 
                    className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-all duration-300"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors z-20">
                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play size={20} className="text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img 
                  src={item.url} 
                  alt={item.title} 
                  className="h-full w-full object-cover group-hover:scale-105 transition-all duration-300"
                />
              )}

              {/* Title descriptions */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-white space-y-1">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary bg-primary/20 border border-primary/20 px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
                <h4 className="font-extrabold text-sm truncate pt-2">{item.title}</h4>
                {item.description && (
                  <p className="text-xs text-gray-400 font-medium whitespace-normal line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Hover maximize indicator */}
              <span className="absolute right-4 top-4 z-20 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Maximize2 size={16} />
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
