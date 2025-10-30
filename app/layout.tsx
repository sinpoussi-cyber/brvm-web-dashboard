import './globals.css';
import Header from '@/components/shell/Header';
import Footer from '@/components/shell/Footer';

export const metadata = { title: 'BRVM Web Dashboard', description: 'Analyse BRVM — Marché, Indices, Prévisions' };

export default function RootLayout({ children }:{ children: React.ReactNode }) {
  return (
    <html lang="fr"><body>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <Footer />
    </body></html>
  );
}
