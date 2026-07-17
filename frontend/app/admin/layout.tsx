'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RouteGuard } from '../../components/layout/RouteGuard';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, UserCheck, Briefcase, FileSpreadsheet, LogOut, ArrowLeft, Terminal, FileText, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Users & Staff', href: '/admin/users', icon: <Users size={20} /> },
    { name: 'HR Recruitment', href: '/admin/hr', icon: <Briefcase size={20} /> },
    { name: 'Leaves & Payroll', href: '/admin/leaves', icon: <FileSpreadsheet size={20} /> },
    { name: 'Projects & Billing', href: '/admin/projects', icon: <Terminal size={20} /> },
    { name: 'CRM Pipeline', href: '/admin/crm', icon: <UserCheck size={20} /> },
    { name: 'CMS & Audit', href: '/admin/cms', icon: <FileText size={20} /> },
    { name: 'Knowledge Base', href: '/admin/knowledge-base', icon: <Database size={20} /> },
  ];

  return (
    <RouteGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-border/40 glass-panel flex flex-col shrink-0">
          {/* Logo Section */}
          <div className="p-6 border-b border-border/40 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-1">
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                OUTPRO<span className="text-primary">.</span>ADMIN
              </span>
            </Link>
            <Link href="/" className="md:hidden text-muted-foreground hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
          </div>

          {/* User Details */}
          <div className="p-6 border-b border-border/40 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-foreground">{user?.name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || 'Admin'} Portal</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/40">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-grow p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}
