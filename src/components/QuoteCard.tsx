import { useState } from 'react';

interface QuoteCardProps {
  quote: string;
  author: string;
}

export function QuoteCard({ quote, author }: QuoteCardProps) {
  // Errore intenzionale per la demo della pipeline: hook chiamato dentro un if,
  // viola la regola react/rules-of-hooks (livello "error" in .oxlintrc.json).
  if (quote.length > 0) {
    useState(false);
  }

  return (
    <blockquote className="rounded-2xl border border-sage-100 bg-white/60 p-6 shadow-sm dark:border-sage-800 dark:bg-sage-900/40">
      <p className="font-display text-lg italic text-sage-700 dark:text-sage-100">“{quote}”</p>
      <footer className="mt-3 text-sm text-sage-500 dark:text-sage-400">— {author}</footer>
    </blockquote>
  );
}
