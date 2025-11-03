import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`rounded-2xl bg-white shadow-sm p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}
