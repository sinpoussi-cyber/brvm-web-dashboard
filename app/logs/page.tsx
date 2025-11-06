'use client';

import { useState } from 'react';
import LogsViewer from '@/src/components/LogsViewer';

// Données de logs d'exemple
const sampleDeploymentLogs = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    level: 'info' as const,
    message: 'Déploiement démarré',
    details: { version: '1.0.0', environment: 'production' }
  },
  {
    id: '2',
    timestamp: new Date().toISOString(),
    level: 'success' as const,
    message: 'Build terminé avec succès',
    details: { duration: '45s', size: '2.3 MB' }
  },
  {
    id: '3',
    timestamp: new Date().toISOString(),
    level: 'warning' as const,
    message: 'Avertissement: Dépendance obsolète détectée',
    details: { package: 'old-package', version: '1.0.0' }
  },
  {
    id: '4',
    timestamp: new Date().toISOString(),
    level: 'info' as const,
    message: 'Déploiement en cours...',
    details: { progress: '50%' }
  },
  {
    id: '5',
    timestamp: new Date().toISOString(),
    level: 'success' as const,
    message: 'Déploiement réussi!',
    details: { url: 'https://brvm-analysis.vercel.app' }
  }
];

export default function LogsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Logs de Déploiement
        </h1>
        
        <LogsViewer logs={sampleDeploymentLogs} title="Logs de Déploiement" />
      </div>
    </div>
  );
}
