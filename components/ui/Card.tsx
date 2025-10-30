import { ReactNode } from 'react';
export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white shadow-sm p-5 ${className}`}>{children}</div>;
}
