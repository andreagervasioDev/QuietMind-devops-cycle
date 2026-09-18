import { useState } from 'react';
import { Sentry } from '../monitoring';

/**
 * Pagina nascosta (/debug/error) per verificare che il tracciamento errori funzioni.
 * Non è linkata dal menu: si raggiunge scrivendo l'URL a mano.
 */
export function DebugError() {
  const [shouldCrash, setShouldCrash] = useState(false);
  const [sent, setSent] = useState(false);
  const sentryEnabled = Boolean(import.meta.env.VITE_SENTRY_DSN);

  if (shouldCrash) {
    // Errore di rendering: viene catturato dall'ErrorBoundary di Sentry in main.tsx.
    throw new Error('Quiet Mind: errore di test generato da /debug/error');
  }

  function sendHandledError() {
    try {
      JSON.parse('{ questo non è json valido');
    } catch (error) {
      Sentry.captureException(error);
      setSent(true);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-14 text-center sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-sage-800 dark:text-sage-100">Test monitoraggio</h1>
      <p className="mt-2 text-sage-600 dark:text-sage-300">
        Sentry è <strong>{sentryEnabled ? 'attivo' : 'disattivato (VITE_SENTRY_DSN mancante)'}</strong>.
      </p>
      <p className="mt-1 text-sm text-sage-500 dark:text-sage-400">
        Ambiente: {import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE} · versione: {import.meta.env.VITE_APP_VERSION ?? 'dev'}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={sendHandledError}
          className="rounded-full bg-sage-500 px-6 py-2 font-medium text-white hover:bg-sage-600"
        >
          Invia errore gestito (captureException)
        </button>
        <button
          type="button"
          onClick={() => setShouldCrash(true)}
          className="rounded-full border border-red-400 px-6 py-2 font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
        >
          Provoca crash (ErrorBoundary)
        </button>
        {sent && <p className="text-sm text-sage-600 dark:text-sage-300">Errore inviato: controlla la dashboard Sentry.</p>}
      </div>
    </div>
  );
}
