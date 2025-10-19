import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BRVM Investment Platform',
  description: 'Plateforme d\'investissement en bourse pour l\'UEMOA',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
