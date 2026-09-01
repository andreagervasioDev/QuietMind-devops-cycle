# Quiet Mind

Sito di meditazione con timer programmabile, suoni ambientali e contenuti informativi sui benefici della meditazione.

**Demo:** https://quiet-mind-react.netlify.app/

## Funzionalità

- Timer programmabile (preset 3/5/10/15/20 minuti o durata personalizzata), con stop e ripresa
- La sessione sopravvive alla navigazione tra pagine: una mini console flottante mostra il countdown e i controlli quando si lascia la pagina Meditate
- Suoni ambientali (pioggia, onde, rumore bianco) generati via Web Audio API, senza file audio esterni
- Pagina dedicata ai benefici della meditazione, con consigli e citazioni
- Tema chiaro/scuro, statistiche di sessione salvate in localStorage
- Design responsive

## Stack tecnico

- React + TypeScript + Vite
- React Router
- Context API (`MeditationContext` per tema/statistiche, `SessionContext` per timer e audio)
- Tailwind CSS

## Avvio locale

```bash
npm install
npm run dev
```

Build di produzione:

```bash
npm run build
```

## Note tecniche

- **Autoplay audio:** i suoni ambientali usano la Web Audio API, che i browser avviano solo dopo un'interazione esplicita dell'utente (politica di autoplay). Nell'app funziona perché il suono viene scelto con un click; se in futuro si volesse far partire un suono automaticamente insieme al timer, va previsto un gesto dell'utente che sblocchi l'`AudioContext` prima.
