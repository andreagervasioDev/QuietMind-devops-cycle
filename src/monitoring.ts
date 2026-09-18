import * as Sentry from '@sentry/react';

/**
 * Inizializza Sentry solo se è configurato un DSN (VITE_SENTRY_DSN).
 * In locale senza DSN l'app funziona normalmente e non invia nulla.
 */
export function initMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION ? `quiet-mind@${import.meta.env.VITE_APP_VERSION}` : undefined,
    integrations: [Sentry.browserTracingIntegration()],
    // Campioniamo poche transazioni: bastano per vedere i tempi di caricamento senza esaurire la quota free.
    tracesSampleRate: 0.2,
    sendDefaultPii: false,
  });
}

export { Sentry };
