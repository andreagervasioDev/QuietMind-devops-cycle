/** Pagina di cortesia mostrata dall'ErrorBoundary di Sentry quando un componente va in crash. */
export function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-sand-50 p-6 text-center text-sage-900">
      <h1 className="font-display text-2xl font-semibold">Qualcosa è andato storto</h1>
      <p className="text-sage-600">L'errore è stato registrato. Ricarica la pagina per continuare.</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-full bg-sage-500 px-6 py-2 font-medium text-white hover:bg-sage-600"
      >
        Ricarica
      </button>
    </div>
  );
}
