import { CircularTimer } from '../components/CircularTimer';
import { DurationPicker } from '../components/DurationPicker';
import { SoundPicker } from '../components/SoundPicker';
import { useMeditation } from '../context/MeditationContext';
import { useSession } from '../context/SessionContext';

export function Meditate() {
  const { sessionsCompleted, totalMinutesMeditated } = useMeditation();
  const {
    minutes,
    selectMinutes,
    secondsLeft,
    totalSeconds,
    isRunning,
    progress,
    start,
    pause,
    reset,
    justFinished,
    sound,
    setSound,
    volume,
    setVolume,
  } = useSession();

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold text-sage-800 dark:text-sage-100">Il tuo momento di calma</h1>
        <p className="mt-2 text-sage-600 dark:text-sage-300">
          Scegli una durata, respira e lascia che il timer faccia il resto.
        </p>
      </div>

      <CircularTimer secondsLeft={secondsLeft} progress={progress} isRunning={isRunning} />

      {justFinished && (
        <p className="rounded-full bg-sage-100 px-4 py-2 text-sm font-medium text-sage-700 dark:bg-sage-800 dark:text-sage-100">
          Sessione completata. Ben fatto! 🙏
        </p>
      )}

      <div className="flex gap-3">
        {!isRunning ? (
          <button
            type="button"
            onClick={start}
            disabled={secondsLeft === 0}
            className="rounded-full bg-sage-500 px-8 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-sage-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {secondsLeft === totalSeconds ? 'Inizia' : 'Riprendi'}
          </button>
        ) : (
          <button
            type="button"
            onClick={pause}
            className="rounded-full bg-sage-100 px-8 py-2.5 font-medium text-sage-700 shadow-sm transition-colors hover:bg-sage-200 dark:bg-sage-800 dark:text-sage-100"
          >
            Pausa
          </button>
        )}

        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-sage-200 px-6 py-2.5 font-medium text-sage-600 transition-colors hover:border-sage-400 dark:border-sage-700 dark:text-sage-200"
        >
          Reset
        </button>
      </div>

      <section className="w-full space-y-6">
        <div>
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-sage-500 dark:text-sage-400">
            Durata
          </h2>
          <DurationPicker minutes={minutes} onSelect={selectMinutes} disabled={isRunning} />
        </div>

        <div>
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-sage-500 dark:text-sage-400">
            Suono ambientale
          </h2>
          <SoundPicker sound={sound} onSelect={setSound} volume={volume} onVolumeChange={setVolume} />
        </div>
      </section>

      {sessionsCompleted > 0 && (
        <p className="text-center text-sm text-sage-500 dark:text-sage-400">
          Hai completato <strong>{sessionsCompleted}</strong> sessioni per un totale di{' '}
          <strong>{totalMinutesMeditated}</strong> minuti di meditazione.
        </p>
      )}
    </div>
  );
}
