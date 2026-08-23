import { useCallback, useEffect, useRef, useState } from 'react';

interface UseTimerOptions {
  onComplete?: () => void;
}

export function useTimer(initialSeconds: number, { onComplete }: UseTimerOptions = {}) {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clear = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (endTimeRef.current === null) return;
    const remainingMs = endTimeRef.current - Date.now();
    const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
    setSecondsLeft(remaining);

    if (remaining <= 0) {
      clear();
      setIsRunning(false);
      onCompleteRef.current?.();
    }
  }, [clear]);

  const start = useCallback(() => {
    if (secondsLeft <= 0) return;
    endTimeRef.current = Date.now() + secondsLeft * 1000;
    intervalRef.current = window.setInterval(tick, 250);
    setIsRunning(true);
  }, [secondsLeft, tick]);

  const pause = useCallback(() => {
    clear();
    setIsRunning(false);
  }, [clear]);

  const reset = useCallback(
    (nextSeconds?: number) => {
      clear();
      setIsRunning(false);
      const value = nextSeconds ?? totalSeconds;
      setTotalSeconds(value);
      setSecondsLeft(value);
      endTimeRef.current = null;
    },
    [clear, totalSeconds],
  );

  const setDuration = useCallback(
    (seconds: number) => {
      clear();
      setIsRunning(false);
      setTotalSeconds(seconds);
      setSecondsLeft(seconds);
      endTimeRef.current = null;
    },
    [clear],
  );

  useEffect(() => clear, [clear]);

  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  return { secondsLeft, totalSeconds, isRunning, progress, start, pause, reset, setDuration };
}
