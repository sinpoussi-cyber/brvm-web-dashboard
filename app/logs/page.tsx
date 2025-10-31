import { LogsViewer } from '@/components/LogsViewer';
import { sampleDeploymentLogs } from '@/data/sampleDeploymentLogs';

export const metadata = {
  title: 'Logs de déploiement',
  description: 'Consultez un exemple de logs Vercel avec recherche intégrée.',
};

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Suivi des déploiements</h1>
        <p className="text-gray-600">
          Utilisez le champ de recherche pour trouver rapidement des étapes spécifiques dans les logs d'une build Vercel.
        </p>
      </div>

      <LogsViewer logs={sampleDeploymentLogs} />
    </div>
  );
}
