import { Link, useLocation } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { AMBIENT_SOUND_LABELS, type AmbientSound } from '../hooks/useAmbientSound';
import { formatTime } from '../utils/time';

export function FloatingSessionWidget() {
  const location = useLocation();
  const {
    secondsLeft,
    totalSeconds,
    isRunning,
    start,
    pause,
    reset,
    justFinished,
    dismissJustFinished,
    sound,
    setSound,
    volume,
    setVolume,
  } = useSession();

  const isPaused = !isRunning && secondsLeft > 0 && secondsLeft < totalSeconds;
  const isActive = isRunning || isPaused || justFinished;

  if (location.pathname === '/meditate' || !isActive) return null;

  return (
    <div className="border-b border-sage-200 bg-white/95 shadow-sm backdrop-blur dark:border-sage-700 dark:bg-sage-900/95">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-2.5 sm:px-6">
        {justFinished ? (
          <>
            <span className="flex-1 text-sm font-medium text-sage-700 dark:text-sage-100">
              Sessione completata. Ben fatto! 🙏
            </span>
            <button
              type="button"
              onClick={dismissJustFinished}
              className="rounded-full border border-sage-200 px-3 py-1 text-xs font-medium text-sage-600 dark:border-sage-700 dark:text-sage-200"
            >
              Chiudi
            </button>
          </>
        ) : (
          <>
            <span aria-hidden="true">🧘</span>
            <span className="font-display text-lg font-semibold tabular-nums text-sage-800 dark:text-sage-100">
              {formatTime(secondsLeft)}
            </span>

            <div className="flex items-center gap-1.5">
              {isRunning ? (
                <button
                  type="button"
                  onClick={pause}
                  className="rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-700 dark:bg-sage-800 dark:text-sage-100"
                >
                  Pausa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={start}
                  className="rounded-full bg-sage-500 px-3 py-1 text-xs font-medium text-white"
                >
                  Riprendi
                </button>
              )}
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-sage-200 px-3 py-1 text-xs font-medium text-sage-600 dark:border-sage-700 dark:text-sage-200"
              >
                Reset
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <select
                value={sound}
                onChange={(event) => setSound(event.target.value as AmbientSound)}
                aria-label="Suono ambientale"
                className="rounded-full border border-sage-200 bg-transparent px-2 py-1 text-xs text-sage-600 dark:border-sage-700 dark:bg-sage-900 dark:text-sage-200"
              >
                {(Object.keys(AMBIENT_SOUND_LABELS) as AmbientSound[]).map((key) => (
                  <option key={key} value={key}>
                    {AMBIENT_SOUND_LABELS[key]}
                  </option>
                ))}
              </select>

              {sound !== 'none' && (
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  aria-label="Volume"
                  className="w-16 accent-dusk-500"
                />
              )}
            </div>

            <Link
              to="/meditate"
              className="ml-auto text-xs font-medium text-dusk-500 underline-offset-2 hover:underline dark:text-dusk-300"
            >
              Apri
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
