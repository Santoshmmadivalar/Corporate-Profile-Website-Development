import React from 'react';
import EmployeeLayoutWrapper from '../../components/layout/EmployeeLayoutWrapper';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <EmployeeLayoutWrapper>{children}</EmployeeLayoutWrapper>;
}
