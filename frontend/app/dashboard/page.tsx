'use client';

import dynamic from 'next/dynamic';

const UserDashboard = dynamic(
  () => import('./UserDashboard'),
  { ssr: false }
);

export default function DashboardPage() {
  return <UserDashboard />;
}
