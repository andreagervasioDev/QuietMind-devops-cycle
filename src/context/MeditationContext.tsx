import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface MeditationState {
  theme: Theme;
  defaultDurationMinutes: number;
  sessionsCompleted: number;
  totalMinutesMeditated: number;
}

type MeditationAction =
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_DEFAULT_DURATION'; minutes: number }
  | { type: 'COMPLETE_SESSION'; minutes: number };

const STORAGE_KEY = 'meditation-app-state';

function loadInitialState(): MeditationState {
  const fallback: MeditationState = {
    theme: 'light',
    defaultDurationMinutes: 10,
    sessionsCompleted: 0,
    totalMinutesMeditated: 0,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

function reducer(state: MeditationState, action: MeditationAction): MeditationState {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    case 'SET_DEFAULT_DURATION':
      return { ...state, defaultDurationMinutes: action.minutes };
    case 'COMPLETE_SESSION':
      return {
        ...state,
        sessionsCompleted: state.sessionsCompleted + 1,
        totalMinutesMeditated: state.totalMinutesMeditated + action.minutes,
      };
    default:
      return state;
  }
}

interface MeditationContextValue extends MeditationState {
  toggleTheme: () => void;
  setDefaultDuration: (minutes: number) => void;
  completeSession: (minutes: number) => void;
}

const MeditationContext = createContext<MeditationContextValue | undefined>(undefined);

export function MeditationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  const toggleTheme = useCallback(() => dispatch({ type: 'TOGGLE_THEME' }), []);
  const setDefaultDuration = useCallback((minutes: number) => dispatch({ type: 'SET_DEFAULT_DURATION', minutes }), []);
  const completeSession = useCallback((minutes: number) => dispatch({ type: 'COMPLETE_SESSION', minutes }), []);

  const value = useMemo<MeditationContextValue>(
    () => ({
      ...state,
      toggleTheme,
      setDefaultDuration,
      completeSession,
    }),
    [state, toggleTheme, setDefaultDuration, completeSession],
  );

  return <MeditationContext.Provider value={value}>{children}</MeditationContext.Provider>;
}

export function useMeditation() {
  const ctx = useContext(MeditationContext);
  if (!ctx) throw new Error('useMeditation must be used within a MeditationProvider');
  return ctx;
}
