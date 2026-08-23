import { formatTime } from '../utils/time';

interface CircularTimerProps {
  secondsLeft: number;
  progress: number;
  isRunning: boolean;
  size?: number;
}

export function CircularTimer({ secondsLeft, progress, isRunning, size = 280 }: CircularTimerProps) {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-sage-100 dark:stroke-sage-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="fill-none stroke-sage-500 transition-[stroke-dashoffset] duration-300 ease-linear dark:stroke-sage-400"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <span className="font-display text-5xl font-semibold tabular-nums text-sage-800 dark:text-sage-100">
          {formatTime(secondsLeft)}
        </span>
        <span className="text-sm text-sage-500 dark:text-sage-300">
          {isRunning ? 'Respira...' : secondsLeft === 0 ? 'Completato' : 'In pausa'}
        </span>
      </div>
    </div>
  );
}
