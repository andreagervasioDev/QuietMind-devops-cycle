import { useEffect, useState } from 'react';

export interface Quote {
  quote: string;
  author: string;
}

/**
 * Carica le citazioni dal backend (GET /api/quotes) se VITE_API_URL è configurato.
 * In caso di backend assente o errore, restituisce il fallback passato in input:
 * così il sito statico su GitHub Pages funziona anche senza API.
 */
export function useQuotes(fallback: Quote[]) {
  const [quotes, setQuotes] = useState<Quote[]>(fallback);
  const [source, setSource] = useState<'api' | 'local'>('local');

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL;
    if (base === undefined) return;

    const controller = new AbortController();
    fetch(`${base.replace(/\/$/, '')}/api/quotes`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: Quote[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setQuotes(data);
          setSource('api');
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.warn('Backend non raggiungibile, uso le citazioni incorporate.', error);
      });

    return () => controller.abort();
  }, []);

  return { quotes, source };
}
