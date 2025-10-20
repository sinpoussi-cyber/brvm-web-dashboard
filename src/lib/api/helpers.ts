// ==============================================================================
// API HELPERS - Utilitaires communs pour normaliser les réponses API
// ==============================================================================

/**
 * Normalise les différentes structures de réponses API en conservant uniquement
 * la charge utile métier (tableau d'éléments, objet, etc.). Les API peuvent
 * retourner directement les données ou les encapsuler dans un objet `data`,
 * éventuellement paginé (`items`).
 */
export function unwrapApiResponse<T>(payload: unknown): T {
  if (payload === null || payload === undefined) {
    return payload as T;
  }

  if (Array.isArray(payload)) {
    return payload as T;
  }

  if (typeof payload !== 'object') {
    return payload as T;
  }

  const container = payload as Record<string, unknown>;

  if ('data' in container) {
    return unwrapApiResponse<T>(container.data);
  }

  if ('items' in container && Array.isArray(container.items)) {
    return container.items as T;
  }

  return payload as T;
}
