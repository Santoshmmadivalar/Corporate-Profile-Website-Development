import React from 'react';
import AdminLayoutWrapper from '../../components/layout/AdminLayoutWrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
