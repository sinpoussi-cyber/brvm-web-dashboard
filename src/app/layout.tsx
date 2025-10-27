import "./globals.css";
import React from "react";

export const metadata = {
  title: "Tableau de bord BRVM",
  description: "Vue d'ensemble du marché BRVM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="max-w-6xl mx-auto p-6">
          <header className="mb-6">
            <h1 className="text-3xl font-bold">Tableau de bord BRVM</h1>
            <p className="text-gray-500">Vue d&apos;ensemble du marché</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
