'use client';

import LogsViewer from '@/src/components/LogsViewer';

// Données de logs d'exemple
const sampleDeploymentLogs = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    level: 'info' as const,
    message: 'Déploiement démarré',
    details: { 
      version: '1.0.0', 
      environment: 'production',
      initiatedBy: 'GitHub Actions'
    }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 240000).toISOString(),
    level: 'info' as const,
    message: 'Installation des dépendances',
    details: { 
      packages: 45,
      duration: '23s'
    }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    level: 'success' as const,
    message: 'Build terminé avec succès',
    details: { 
      duration: '45s', 
      size: '2.3 MB',
      pages: 12
    }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    level: 'warning' as const,
    message: 'Avertissement: Dépendance obsolète détectée',
    details: { 
      package: 'old-package', 
      version: '1.0.0',
      recommendation: 'Mettre à jour vers 2.0.0'
    }
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 60000).toISOString(),
    level: 'info' as const,
    message: 'Déploiement en cours...',
    details: { 
      progress: '75%',
      region: 'us-east-1'
    }
  },
  {
    id: '6',
    timestamp: new Date().toISOString(),
    level: 'success' as const,
    message: 'Déploiement réussi!',
    details: { 
      url: 'https://brvm-analysis.vercel.app',
      duration: '5m 30s'
    }
  }
];

export default function LogsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Logs de Déploiement
          </h1>
          <p className="text-gray-600">
            Historique et détails des déploiements de l'application
          </p>
        </div>
        
        <LogsViewer 
          logs={sampleDeploymentLogs} 
          title="Dernier Déploiement" 
        />
      </div>
    </div>
  );
}
