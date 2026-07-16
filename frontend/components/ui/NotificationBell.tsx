'use client';

import React, { useState, useEffect } from 'react';
import { getNotifications, markRead } from '../../services/api';
import { Bell, Check, Info, Calendar, CreditCard, Ticket, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItem {
  _id: string;
  type: 'leave' | 'payroll' | 'invoice' | 'ticket' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const fallbackNotifications: NotificationItem[] = [
  {
    _id: 'notif1',
    type: 'system',
    title: 'Workspace Initialized',
    message: 'Welcome to Outpro.India! Your secure environment configuration is complete.',
    read: false,
    createdAt: new Date().toISOString()
  }
];

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifs = async () => {
    try {
      const response = await getNotifications();
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.data.filter((n: NotificationItem) => !n.read).length);
      } else {
        setNotifications(fallbackNotifications);
        setUnreadCount(fallbackNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      setNotifications(fallbackNotifications);
      setUnreadCount(fallbackNotifications.filter(n => !n.read).length);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const response = await markRead(id);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      // Offline fallback toggle
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'leave': return <Calendar size={14} className="text-amber-500" />;
      case 'payroll': return <CreditCard size={14} className="text-emerald-500" />;
      case 'invoice': return <CreditCard size={14} className="text-blue-500" />;
      case 'ticket': return <Ticket size={14} className="text-violet-500" />;
      default: return <Info size={14} className="text-primary" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-secondary hover:bg-accent text-foreground transition-all duration-200 relative"
        aria-label="View notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop layer */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2.5 w-80 glass-panel border border-border/40 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 bg-secondary/50 border-b border-border/40 flex items-center justify-between">
                <span className="font-bold text-xs text-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={12} className="text-primary" />
                  <span>Alert Center</span>
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-primary text-primary-foreground font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {/* Alerts List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-border/30">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground italic font-medium">
                    No new alerts to display
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n._id} 
                      className={`p-3.5 flex gap-3 text-xs transition-colors hover:bg-secondary/15 relative ${
                        !n.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 p-1.5 bg-secondary rounded-lg border border-border/20">
                        {getIcon(n.type)}
                      </div>
                      
                      <div className="space-y-1 pr-6">
                        <p className={`font-bold text-foreground leading-snug ${!n.read ? 'text-primary' : ''}`}>
                          {n.title}
                        </p>
                        <p className="text-muted-foreground leading-normal font-medium">{n.message}</p>
                        <span className="text-[9px] text-muted-foreground/60 block font-semibold">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Check button to dismiss */}
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          className="absolute right-3 top-3.5 p-1 bg-secondary border border-border/40 hover:bg-primary hover:text-primary-foreground rounded transition-colors text-muted-foreground"
                          title="Mark as Read"
                        >
                          <Check size={10} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
