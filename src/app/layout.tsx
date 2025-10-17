// ==============================================================================
// ROOT LAYOUT - Layout principal de l'application
// ==============================================================================

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BRVM Investment Platform',
  description: 'Plateforme d\'investissement en bourse pour l\'UEMOA',
  keywords: ['BRVM', 'investissement', 'bourse', 'UEMOA', 'Afrique de l\'Ouest'],
  authors: [{ name: 'BRVM Platform' }],
  openGraph: {
    title: 'BRVM Investment Platform',
    description: 'Investissez intelligemment en bourse BRVM',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
