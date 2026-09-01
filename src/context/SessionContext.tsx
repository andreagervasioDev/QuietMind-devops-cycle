import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useAmbientSound, type AmbientSound } from '../hooks/useAmbientSound';
import { useTimer } from '../hooks/useTimer';
import { useMeditation } from './MeditationContext';

interface SessionContextValue {
  minutes: number;
  selectMinutes: (minutes: number) => void;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  justFinished: boolean;
  dismissJustFinished: () => void;
  sound: AmbientSound;
  setSound: (sound: AmbientSound) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { defaultDurationMinutes, setDefaultDuration, completeSession } = useMeditation();
  const [minutes, setMinutes] = useState(defaultDurationMinutes);
  const [justFinished, setJustFinished] = useState(false);

  const handleComplete = useCallback(() => {
    completeSession(minutes);
    setJustFinished(true);
  }, [completeSession, minutes]);

  const {
    secondsLeft,
    totalSeconds,
    isRunning,
    progress,
    start: startTimer,
    pause,
    reset: resetTimer,
    setDuration,
  } = useTimer(minutes * 60, { onComplete: handleComplete });

  const { sound, setSound, volume, setVolume } = useAmbientSound();

  const selectMinutes = useCallback(
    (nextMinutes: number) => {
      setMinutes(nextMinutes);
      setDefaultDuration(nextMinutes);
      setDuration(nextMinutes * 60);
      setJustFinished(false);
    },
    [setDefaultDuration, setDuration],
  );

  const start = useCallback(() => {
    setJustFinished(false);
    startTimer();
  }, [startTimer]);

  const reset = useCallback(() => {
    resetTimer(minutes * 60);
    setJustFinished(false);
  }, [resetTimer, minutes]);

  const dismissJustFinished = useCallback(() => setJustFinished(false), []);

  const value: SessionContextValue = {
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
    dismissJustFinished,
    sound,
    setSound,
    volume,
    setVolume,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
