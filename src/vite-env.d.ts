/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend (es. http://localhost:3001). Se assente, l'app non chiama l'API. */
  readonly VITE_API_URL?: string;
  /** DSN del progetto Sentry. Se assente, Sentry resta disattivato. */
  readonly VITE_SENTRY_DSN?: string;
  /** Nome ambiente: development | staging | production */
  readonly VITE_APP_ENV?: string;
  /** Versione/commit dell'app, impostata dalla pipeline. */
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
