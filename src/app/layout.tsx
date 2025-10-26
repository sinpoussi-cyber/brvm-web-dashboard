import "../styles/globals.css";

export const metadata = {
  title: "BRVM Dashboard",
  description: "Tableau de bord du marché BRVM"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-6xl mx-auto p-6">{children}</div>
      </body>
    </html>
  );
}
