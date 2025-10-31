// src/app/layout.tsx
import './globals.css';
import React from 'react';

export const metadata = {
  title: 'BRVM Dashboard',
  description: 'Analyses Marché BRVM',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 md:p-6">{children}</div>
      </body>
    </html>
  );
}
