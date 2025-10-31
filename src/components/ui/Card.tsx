// src/components/ui/Card.tsx
import React from 'react';

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white shadow rounded-2xl p-4 border border-gray-100">
      {children}
    </div>
  );
}
