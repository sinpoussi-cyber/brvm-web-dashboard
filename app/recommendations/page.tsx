'use client';

import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import { getRecommendations } from '@/lib/api';
import type {
  RecommendationPayload,
  RecommendationRecord,
} from '@/types/recommendations';

function isBuy(value?: string | null) {
  return value ? /achat/i.test(value) || /buy/i.test(value) : false;
}

function isSell(value?: string | null) {
  return value ? /vente/i.test(value) || /sell/i.test(value) : false;
}

export default function RecommendationsPage() {
  const [payload, setPayload] = useState<RecommendationPayload | null>(null);
  
  useEffect(() => {
    (async () => {
      try {
        const data = await getRecommendations();
        setPayload(data);
      } catch (error) {
        console.error('Erreur chargement recommandations', error);
        setPayload({ items: [], metadata: { fetched_at: new Date().toISOString(), buy_count: 0, sell_count: 0 } });
      }
    })();
  }, []);

  const items = payload?.items ?? [];
  const metadata = payload?.metadata;
  
  const { buy, sell } = useMemo(() => {
    const buyList = items
      .filter(
        (item) =>
          item.doc_action === 'buy' ||
          isBuy(item.recommendation) ||
          isBuy(item.overall_signal)
      )
      .sort((a, b) => (a.doc_rank ?? Number.MAX_SAFE_INTEGER) - (b.doc_rank ?? Number.MAX_SAFE_INTEGER))
      .slice(0, 10);
    const sellList = items
      .filter(
        (item) =>
          item.doc_action === 'sell' ||
          isSell(item.recommendation) ||
          isSell(item.overall_signal)
      )
      .sort((a, b) => (a.doc_rank ?? Number.MAX_SAFE_INTEGER) - (b.doc_rank ?? Number.MAX_SAFE_INTEGER))
      .slice(0, 10);
    return { buy: buyList, sell: sellList };
  }, [items]);

  const renderDocBadge = (record: RecommendationRecord) => {
    if (!record.doc_action) return null;
    const labels: Record<string, string> = {
      buy: 'Achat',
      sell: 'Vente',
      avoid: 'Éviter',
      watch: 'Surveiller',
    };
    const colors: Record<string, string> = {
      buy: 'bg-green-100 text-green-700',
      sell: 'bg-red-100 text-red-700',
      avoid: 'bg-orange-100 text-orange-700',
      watch: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[record.doc_action]}`}>
        {labels[record.doc_action]}
        {record.doc_rank ? ` #${record.doc_rank}` : ''}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold">Recommandations d’investissement</h1>
          {metadata?.doc_updated_at && (
            <div className="text-sm text-gray-500">
              Rapport du {metadata.doc_updated_at}
              {metadata.source && (
                <>
                  {' • '}
                  <a
                    href={metadata.source}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Source GitHub
                  </a>
                </>
              )}
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-green-600 mb-2">Top 10 — Actions à acheter</h2>
            {buy.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune recommandation d’achat disponible pour le moment.</p>
            ) : (
              <ul className="list-disc ml-6 text-sm space-y-1">
                {buy.map((item) => (
                  <li key={`buy-${item.symbol}`} className="space-x-1">
                    <span className="font-semibold">{item.symbol}</span>
                    {item.sector ? <span className="text-gray-500">({item.sector})</span> : null}
                    {renderDocBadge(item)}
                    <span>— {item.recommendation ?? item.overall_signal ?? 'Signal indisponible'}</span>
                    {item.variation_pred !== undefined && item.variation_pred !== null
                      ? ` (${new Intl.NumberFormat('fr-FR', {
                          maximumFractionDigits: 2,
                        }).format(item.variation_pred)} %)`
                      : ''}
                    {item.doc_comment && (
                      <span className="block text-xs text-gray-500">{item.doc_comment}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-red-600 mb-2">Top 10 — Actions à vendre</h2>
            {sell.length === 0 ? (
              <p className="text-sm text-gray-500">Aucune recommandation de vente disponible pour le moment.</p>
            ) : (
              <ul className="list-disc ml-6 text-sm space-y-1">
                {sell.map((item) => (
                  <li key={`sell-${item.symbol}`} className="space-x-1">
                    <span className="font-semibold">{item.symbol}</span>
                    {item.sector ? <span className="text-gray-500">({item.sector})</span> : null}
                    {renderDocBadge(item)}
                    <span>— {item.recommendation ?? item.overall_signal ?? 'Signal indisponible'}</span>
                    {item.variation_pred !== undefined && item.variation_pred !== null
                      ? ` (${new Intl.NumberFormat('fr-FR', {
                          maximumFractionDigits: 2,
                        }).format(item.variation_pred)} %)`
                      : ''}
                    {item.doc_comment && (
                      <span className="block text-xs text-gray-500">{item.doc_comment}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold mb-3">Liste complète</h2>
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Symbole</th>
              <th className="text-left p-2">Société</th>
              <th className="text-left p-2">Secteur</th>
              <th className="text-right p-2">Cours</th>
              <th className="text-right p-2">Var. prévue</th>
              <th className="text-right p-2">RSI</th>
              <th className="text-right p-2">MACD</th>
              <th className="text-left p-2">Recommandation</th>
              <th className="text-left p-2">Signal IA</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const signal = item.recommendation ?? item.overall_signal ?? '—';
              const colorClass = isBuy(signal)
                ? 'text-green-600'
                : isSell(signal)
                ? 'text-red-600'
                : 'text-gray-600';
      const priceText =
                item.last_close !== undefined && item.last_close !== null
                  ? `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(item.last_close)} FCFA`
                  : '—';
              const variationText =
                item.variation_pred !== undefined && item.variation_pred !== null
                  ? `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(item.variation_pred)} %`
                  : '—';
              const rsiText =
                item.rsi !== undefined && item.rsi !== null
                  ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(item.rsi)
                  : '—';
              const macdText =
                item.macd !== undefined && item.macd !== null
                  ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(item.macd)
                  : '—';
              return (
                <tr key={`row-${item.symbol}`} className="border-b">
                  <td className="p-2">{item.symbol}</td>
                  <td className="p-2">{item.company_name ?? '—'}</td>
                  <td className="p-2">{item.sector ?? '—'}</td>
                  <td className="p-2 text-right">{priceText}</td>
                  <td className="p-2 text-right">{variationText}</td>
                  <td className="p-2 text-right">{rsiText}</td>
                  <td className="p-2 text-right">{macdText}</td>
                  <td className={`p-2 font-medium ${colorClass}`}>{signal}</td>
                  <td className="p-2">{renderDocBadge(item)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
