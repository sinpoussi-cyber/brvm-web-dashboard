import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BRVM Investment Platform',
  description: 'Plateforme d\'investissement en bourse pour l\'UEMOA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
