'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'employee' | 'client' | 'candidate' | 'user'>;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their default portal base
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'employee') {
          router.push('/employee/portal');
        } else if (user.role === 'client') {
          router.push('/client/portal');
        } else {
          router.push('/');
        }
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="relative flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
            Authenticating session...
          </p>
        </div>
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null; // Don't render children if unauthorized, router will redirect
  }

  return <>{children}</>;
};
