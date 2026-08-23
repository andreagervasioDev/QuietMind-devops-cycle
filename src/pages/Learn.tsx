import { BenefitCard } from '../components/BenefitCard';
import { MountainsIllustration, WavesIllustration } from '../components/Illustrations';
import { QuoteCard } from '../components/QuoteCard';

const BENEFITS = [
  { icon: '🧘', title: 'Riduce lo stress', description: 'Abbassa i livelli di cortisolo e calma il sistema nervoso.' },
  { icon: '🎯', title: 'Migliora la concentrazione', description: 'Allena la mente a restare presente più a lungo.' },
  { icon: '😴', title: 'Favorisce il sonno', description: 'Aiuta a rilassare corpo e mente prima di dormire.' },
  { icon: '❤️', title: 'Regola le emozioni', description: 'Aumenta la consapevolezza dei propri stati d’animo.' },
  { icon: '🩺', title: 'Abbassa la pressione', description: 'Contribuisce al benessere cardiovascolare nel tempo.' },
  { icon: '🌱', title: 'Aumenta la resilienza', description: 'Rende più semplice affrontare le difficoltà quotidiane.' },
];

const QUOTES = [
  { quote: 'Non puoi fermare le onde, ma puoi imparare a navigarle.', author: 'Jon Kabat-Zinn' },
  { quote: 'Il respiro è il ponte che collega la vita alla coscienza.', author: 'Thich Nhat Hanh' },
  { quote: 'La meditazione non è evasione, è un incontro sereno con la realtà.', author: 'Thich Nhat Hanh' },
];

const TIPS = [
  'Inizia con poco: anche 3-5 minuti al giorno fanno la differenza.',
  'Trova un posto tranquillo e siediti in una posizione comoda.',
  'Non c’è un modo giusto di respirare: osservalo, senza correggerlo.',
  'Se la mente vaga è normale: riporta gentilmente l’attenzione al respiro.',
  'Sii costante più che perfetto: la pratica conta più della durata.',
];

export function Learn() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <section className="text-center">
        <h1 className="font-display text-3xl font-semibold text-sage-800 dark:text-sage-100">
          Perché meditare fa bene
        </h1>
        <p className="mt-2 text-sage-600 dark:text-sage-300">
          Piccoli benefici quotidiani che, con costanza, diventano cambiamenti duraturi.
        </p>
      </section>

      <MountainsIllustration className="mt-10 h-40 w-full rounded-2xl" />

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((benefit) => (
          <BenefitCard key={benefit.title} {...benefit} />
        ))}
      </section>

      <section className="mt-16">
        <h2 className="mb-4 text-center font-display text-2xl font-semibold text-sage-800 dark:text-sage-100">
          Consigli per iniziare
        </h2>
        <ul className="mx-auto max-w-xl list-disc space-y-2 pl-6 text-sage-600 dark:text-sage-300">
          {TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      <WavesIllustration className="mt-16 h-24 w-full rounded-2xl" />

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {QUOTES.map((item) => (
          <QuoteCard key={item.quote} {...item} />
        ))}
      </section>
    </div>
  );
}
