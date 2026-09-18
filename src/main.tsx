import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { MeditationProvider } from './context/MeditationContext.tsx'
import { SessionProvider } from './context/SessionContext.tsx'
import { initMonitoring, Sentry } from './monitoring.ts'
import { ErrorFallback } from './components/ErrorFallback.tsx'

initMonitoring()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <MeditationProvider>
          <SessionProvider>
            <App />
          </SessionProvider>
        </MeditationProvider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
