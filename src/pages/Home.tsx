import { Link } from 'react-router-dom';
import { LotusIllustration } from '../components/Illustrations';
import { QuoteCard } from '../components/QuoteCard';

const STEPS = [
  { title: 'Scegli il tempo', description: 'Da 3 a 60 minuti, adatta la sessione alla tua giornata.' },
  { title: 'Premi Inizia', description: 'Puoi mettere in pausa e riprendere quando vuoi.' },
  { title: 'Respira', description: 'Lascia andare i pensieri e concentrati sul respiro.' },
];

export function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <section className="flex flex-col items-center gap-6 text-center">
        <LotusIllustration className="h-40 w-40" />
        <h1 className="font-display text-4xl font-semibold text-sage-800 sm:text-5xl dark:text-sage-100">
          Trova il tuo momento di quiete
        </h1>
        <p className="max-w-xl text-lg text-sage-600 dark:text-sage-300">
          Quiet Mind ti aiuta a ritagliarti pochi minuti al giorno per meditare, con un timer semplice e suoni
          rilassanti di sottofondo.
        </p>
        <Link
          to="/meditate"
          className="rounded-full bg-sage-500 px-8 py-3 font-medium text-white shadow-sm transition-colors hover:bg-sage-600"
        >
          Inizia a meditare
        </Link>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.title} className="rounded-2xl border border-sage-100 bg-white/60 p-5 text-center dark:border-sage-800 dark:bg-sage-900/40">
            <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-sage-100 font-display font-semibold text-sage-700 dark:bg-sage-800 dark:text-sage-100">
              {index + 1}
            </div>
            <h3 className="font-display font-semibold text-sage-800 dark:text-sage-100">{step.title}</h3>
            <p className="mt-1 text-sm text-sage-600 dark:text-sage-300">{step.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <QuoteCard
          quote="La quiete che cerchi non è nel mondo, è dentro di te."
          author="Anonimo"
        />
      </section>
    </div>
  );
}
