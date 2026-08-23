export function LotusIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} role="img" aria-label="Illustrazione di un fiore di loto">
      <ellipse cx="100" cy="140" rx="90" ry="10" className="fill-sage-100 dark:fill-sage-800" />
      <g className="fill-sage-300 dark:fill-sage-600">
        <path d="M100 130 C60 130 40 90 55 60 C70 85 85 100 100 110 C115 100 130 85 145 60 C160 90 140 130 100 130Z" />
      </g>
      <g className="fill-sage-400 dark:fill-sage-500">
        <path d="M100 130 C75 125 65 95 75 70 C85 90 92 105 100 115 C108 105 115 90 125 70 C135 95 125 125 100 130Z" />
      </g>
      <g className="fill-dusk-400 dark:fill-dusk-300">
        <path d="M100 128 C88 122 84 100 92 82 C96 96 98 106 100 115 C102 106 104 96 108 82 C116 100 112 122 100 128Z" />
      </g>
      <circle cx="100" cy="118" r="8" className="fill-sand-200" />
    </svg>
  );
}

export function MountainsIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 200" className={className} role="img" aria-label="Illustrazione di montagne al tramonto">
      <rect x="0" y="0" width="400" height="200" className="fill-sand-100 dark:fill-sage-900" />
      <circle cx="320" cy="50" r="30" className="fill-dusk-300 dark:fill-dusk-500" />
      <path d="M0 160 L90 80 L150 140 L210 60 L280 150 L340 100 L400 160 Z" className="fill-sage-300 dark:fill-sage-700" />
      <path d="M0 200 L60 140 L130 190 L200 120 L260 200 Z" className="fill-sage-500 dark:fill-sage-800" />
    </svg>
  );
}

export function WavesIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 120" className={className} role="img" aria-label="Illustrazione di onde">
      <path
        d="M0 60 C50 20 100 100 150 60 C200 20 250 100 300 60 C350 20 400 100 400 60 L400 120 L0 120 Z"
        className="fill-dusk-200 dark:fill-dusk-700"
      />
      <path
        d="M0 80 C50 40 100 120 150 80 C200 40 250 120 300 80 C350 40 400 120 400 80 L400 120 L0 120 Z"
        className="fill-dusk-300 dark:fill-dusk-600"
      />
    </svg>
  );
}
