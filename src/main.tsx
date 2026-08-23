import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { MeditationProvider } from './context/MeditationContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MeditationProvider>
        <App />
      </MeditationProvider>
    </BrowserRouter>
  </StrictMode>,
)
