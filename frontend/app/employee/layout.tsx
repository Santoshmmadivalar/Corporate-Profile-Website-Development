'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RouteGuard } from '../../components/layout/RouteGuard';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, LogOut, ArrowLeft, UserCircle, CalendarDays, IndianRupee, Clock } from 'lucide-react';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <RouteGuard allowedRoles={['employee', 'admin']}>
      <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-r border-border/40 glass-panel flex flex-col shrink-0">
          <div className="p-6 border-b border-border/40 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-1">
              <span className="font-extrabold text-lg tracking-tight text-foreground">
                OUTPRO<span className="text-primary">.</span>PORTAL
              </span>
            </Link>
            <Link href="/" className="md:hidden text-muted-foreground hover:text-primary">
              <ArrowLeft size={20} />
            </Link>
          </div>

          {/* Employee profile details */}
          <div className="p-6 border-b border-border/40 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.title || 'Team Associate'}</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1.5">
            <Link
              href="/employee/portal"
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 bg-primary text-primary-foreground shadow-md shadow-primary/20`}
            >
              <Clock size={20} />
              <span>Workspace Dashboard</span>
            </Link>
          </nav>

          {/* Footer */}
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

        {/* Content */}
        <main className="flex-grow p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}
