'use client';

import dynamic from 'next/dynamic';

const EmployeePortal = dynamic(
  () => import('./EmployeePortal'),
  { ssr: false }
);

export default function EmployeePortalPage() {
  return <EmployeePortal />;
}
