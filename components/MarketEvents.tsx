'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, RefreshCw } from 'lucide-react';

type MarketEvent = {
  id: string | number;
  title: string;
  description?: string | null;
  event_date?: string | null;
  category?: string | null;
  location?: string | null;
  starts_at?: string | null;
  created_at?: string | null;
};

export default function MarketEvents() {
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchEvents() {
      try {
        const response = await fetch('/api/market-events', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        if (!response.ok) {
          throw new Error('Impossible de charger les événements.');
        }
        const payload = await response.json();
        if (isMounted) {
          setEvents(payload.events ?? []);
          setError(null);
        }
      } catch (err) {
        console.error('Erreur chargement événements:', err);
        if (isMounted) {
          setError('Les événements récents n\'ont pas pu être chargés.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchEvents();
    const interval = setInterval(fetchEvents, 1000 * 60 * 15); // refresh every 15 minutes
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow p-6">
        <div className="flex items-center gap-2 text-indigo-700 mb-4">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Synchronisation des événements...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white/70 p-4 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
        <p className="text-red-800 font-semibold mb-1">{error}</p>
        <p className="text-sm text-red-700">Merci de réessayer dans quelques instants.</p>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Événements du Marché</h2>
        <p className="text-gray-600 text-sm">
          Aucun événement n'est planifié pour le moment. Les prochains rendez-vous apparaîtront dès leur publication sur Supabase.
        </p>
      </div>
    );
  }

  const formatDate = (value?: string | null) => {
    if (!value) return 'Date à confirmer';
    try {
      return new Date(value).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      return value;
    }
  };

  const formatHour = (value?: string | null) => {
    if (!value) return null;
    return value.length <= 5 ? `${value} GMT` : new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Événements du Marché</h2>
        <div className="text-xs uppercase tracking-widest text-purple-600 font-semibold">Flux Supabase en direct</div>
      </div>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white border-l-4 border-indigo-500 p-4 rounded-lg shadow-sm">
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-2">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {formatDate(event.event_date)}
              </span>
              {event.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </span>
              )}
              {formatHour(event.starts_at) && (
                <span className="inline-flex items-center gap-1">
                  ⏰ {formatHour(event.starts_at)}
                </span>
              )}
            </div>
            <p className="text-lg font-semibold text-gray-900">{event.title}</p>
            {event.description && (
              <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{event.description}</p>
            )}
            {event.category && (
              <span className="mt-3 inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                {event.category}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
