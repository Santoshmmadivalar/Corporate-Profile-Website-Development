'use client';

import dynamic from 'next/dynamic';

const ClientPortal = dynamic(
  () => import('./ClientPortal'),
  { ssr: false }
);

export default function ClientPortalPage() {
  return <ClientPortal />;
}
