# Quiet Mind — ciclo DevOps completo

[![CI/CD](https://github.com/andreagervasioDev/QuietMind-devops-cycle/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/andreagervasioDev/QuietMind-devops-cycle/actions/workflows/ci-cd.yml)

**Produzione:** https://andreagervasiodev.github.io/QuietMind-devops-cycle/
**Pipeline:** https://github.com/andreagervasioDev/QuietMind-devops-cycle/actions

Quiet Mind è un'app di meditazione sviluppata durante il Master (React + TypeScript + Vite). Questo repository
la porta dal computer locale alla produzione con un ciclo DevOps completo: container, pipeline CI/CD,
gestione dei secret, deploy automatico e monitoraggio.

---

## Indice

1. [Esplorazione e pianificazione](#1-esplorazione-e-pianificazione)
2. [Containerizzazione](#2-containerizzazione)
3. [Sicurezza e gestione dei secret](#3-sicurezza-e-gestione-dei-secret)
4. [Pipeline CI](#4-pipeline-ci)
5. [Pipeline CD e deploy pubblico](#5-pipeline-cd-e-deploy-pubblico)
6. [Monitoraggio](#6-monitoraggio)
7. [Struttura del repository](#7-struttura-del-repository)
8. [Consegna: checklist e screenshot](#8-consegna-checklist-e-screenshot)

---

## 1. Esplorazione e pianificazione

### Cosa fa l'app

Quiet Mind è una **Single Page Application** per meditare:

- timer programmabile (preset 3/5/10/15/20 minuti o durata personalizzata) con pausa e ripresa;
- la sessione sopravvive alla navigazione: una mini console flottante mostra countdown e controlli;
- suoni ambientali (pioggia, onde, rumore bianco) generati con la Web Audio API, senza file audio;
- pagina "Scopri" con benefici, consigli e citazioni;
- tema chiaro/scuro e statistiche di sessione salvate in `localStorage`.

### Analisi dal punto di vista DevOps

| Aspetto | Osservazione | Conseguenza per il ciclo DevOps |
|---|---|---|
| Tipo di applicazione | SPA React, build statica (`vite build` produce `dist/`) | Il deploy è la pubblicazione di file statici: GitHub Pages è sufficiente |
| Routing | React Router lato client (`/meditate`, `/learn`) | Il server statico deve fare fallback su `index.html` (nginx `try_files`, `404.html` su Pages) |
| Stato | Solo `localStorage`, nessun database | Nessuna migrazione, nessun volume persistente |
| Backend | Non esisteva | Aggiunto un backend Node minimale (`backend/`) che espone le citazioni e un health check, per avere un compose front end + back end realistico |
| Lint | `oxlint` già configurato (`react/rules-of-hooks` come errore) | Riusato in CI come primo gate della pipeline |
| Runtime | `oxlint` richiede Node ≥ 20.19; la macchina locale aveva Node 20.11 e il lint falliva silenziosamente | Standardizzato **Node 22** ovunque (`.nvmrc`, `engines`, Dockerfile, CI) |
| Configurazione | Nessuna variabile d'ambiente | Introdotte variabili `VITE_*` per API, Sentry e ambiente, gestite via `.env` |

### I tre ambienti

| Ambiente | Dove gira | Come si attiva | Cosa contiene | Variabili |
|---|---|---|---|---|
| **development** | Computer dello sviluppatore | `npm run dev` oppure `docker compose up` | Frontend + backend locali, hot reload, Sentry disattivato se il DSN è vuoto | `.env` locale (copiato da `.env.example`) |
| **staging** | GitHub Actions + GitHub Container Registry | push sul branch `develop` o apertura di una pull request | Stessa pipeline di produzione (lint, typecheck, build, immagine Docker, smoke test). Le immagini vengono pubblicate su GHCR con tag `staging` e il `dist/` è scaricabile come artifact. Serve a validare il codice **prima** che tocchi `main` | Secret del repository, `VITE_APP_ENV=staging` |
| **production** | GitHub Pages (`https://andreagervasiodev.github.io/QuietMind-devops-cycle/`) | push (o merge) sul branch `main` | Deploy automatico solo se tutta la CI è verde; immagini taggate `latest`; environment GitHub `github-pages` con URL tracciato | Secret del repository, `VITE_APP_ENV=production` |

Flusso di lavoro: feature branch → pull request verso `develop` (CI) → merge su `develop` (staging) → pull request `develop` → `main` → merge (produzione).

### Scelta degli strumenti: GitHub Actions

Ho scelto **GitHub Actions** invece di GitLab CI per queste ragioni:

1. **Il codice è già su GitHub.** Pipeline, secret, container registry (GHCR) e hosting (GitHub Pages) stanno
   nello stesso posto: nessun token da scambiare tra piattaforme diverse.
2. **Deploy su GitHub Pages senza segreti esterni.** Le action ufficiali (`configure-pages`, `deploy-pages`)
   usano un token OIDC generato dal run, quindi non serve un'API key da custodire.
3. **Marketplace maturo.** `setup-node`, `docker/build-push-action` con cache, `upload-artifact`: tutto il
   necessario esiste già ed è mantenuto da GitHub o Docker.
4. **Runner gratuiti** per i repository pubblici, con un limite mensile più che sufficiente per un progetto didattico.
5. **Environments** con URL e cronologia dei deploy, utili per distinguere staging da produzione nella UI.

GitLab CI sarebbe stato altrettanto valido (ottimo per runner self-hosted e pipeline complesse), ma avrebbe
richiesto di replicare il repository o configurare mirror e token cross-piattaforma senza un beneficio reale.

Altri strumenti scelti:

| Bisogno | Strumento | Motivo |
|---|---|---|
| Container | Docker + Docker Compose | Standard de facto, multi-stage build per immagini piccole |
| Server statico | nginx (alpine) | Leggero, fallback SPA e proxy `/api` in poche righe |
| Hosting | GitHub Pages | Gratuito, integrato nella pipeline |
| Registry | GitHub Container Registry | Integrato con `GITHUB_TOKEN`, nessun secret aggiuntivo |
| Uptime | UptimeRobot (piano free) | Check HTTP ogni 5 minuti con alert via e-mail |
| Error tracking | Sentry (piano free) | SDK React ufficiale, ErrorBoundary integrato, source map |

---

## 2. Containerizzazione

### Frontend: `Dockerfile` multi-stage

1. **Stage `build`** (`node:22-alpine`): installa le dipendenze con `npm ci`, esegue **lint** e **build**.
   Le variabili `VITE_*` arrivano come `ARG` e vengono incorporate nel bundle.
2. **Stage `runtime`** (`nginx:1.27-alpine`): copia solo `dist/` e la configurazione
   [docker/nginx.conf](docker/nginx.conf). Immagine finale di poche decine di MB, senza Node né sorgenti.

nginx gestisce: fallback SPA (`try_files ... /index.html`), proxy `/api/` verso il backend, cache lunga per gli asset
con hash, gzip, header di sicurezza, endpoint `/healthz` per l'`HEALTHCHECK`.

### Backend: `backend/Dockerfile`

Server HTTP Node **senza dipendenze** (`backend/server.js`), utente non-root, `HEALTHCHECK` su `/api/health`.
Endpoint: `GET /api/health`, `GET /api/quotes`, `GET /api/quotes/random`.

### `docker-compose.yml`

Due servizi: `backend` (porta 3001) e `frontend` (porta 8080). Il frontend parte solo quando il backend è
`healthy` (`depends_on: condition: service_healthy`) e lo raggiunge tramite il proxy nginx, quindi il browser
parla con una sola origine.

### Comandi usati e testati

```bash
# 0. prerequisiti: Docker Desktop avviato, Node 22 (nvm use) per lo sviluppo senza Docker
cp .env.example .env            # variabili locali (mai committate)

# 1. avvio dell'intero stack
docker compose up --build -d

# 2. verifica
docker compose ps               # entrambi i container "healthy"
curl http://localhost:3001/api/health          # backend diretto
curl http://localhost:8080/healthz             # nginx
curl http://localhost:8080/api/quotes/random   # proxy nginx -> backend
open http://localhost:8080                     # app nel browser

# 3. log e arresto
docker compose logs -f
docker compose down

# sviluppo senza Docker (hot reload)
npm ci && npm run dev           # frontend su http://localhost:5173
cd backend && npm run dev       # backend su http://localhost:3001

# build della sola immagine frontend
docker build -t quiet-mind:local .
docker run --rm -p 8080:80 quiet-mind:local
```

Output atteso di `docker compose ps`:

```
NAME             IMAGE                 STATUS
quiet-mind-api   quiet-mind-backend    Up (healthy)
quiet-mind-web   quiet-mind-frontend   Up (healthy)
```

Screenshot: [docs/screenshots/](docs/screenshots/) (`compose-up.png`).

---

## 3. Sicurezza e gestione dei secret

### Separazione tra codice e configurazione

- Tutte le variabili stanno in **`.env`**, creato dallo sviluppatore a partire da
  [.env.example](.env.example) (che contiene solo chiavi e valori di esempio, nessun valore reale).
- `.env` e `.env.*` sono in [.gitignore](.gitignore); solo `.env.example` è tracciato.
- Il [Dockerfile](Dockerfile) riceve i valori come `--build-arg`; [docker-compose.yml](docker-compose.yml) li legge
  da `.env` con `env_file` e interpolazione `${VAR:-default}`.

### Verifica che `.env` non sia mai finito nella history

```bash
git log --all --full-history --oneline -- .env '.env.*'   # nessun output = mai committato
git ls-files | grep -E '^\.env'                           # deve stampare solo .env.example
git check-ignore -v .env                                  # conferma la regola di .gitignore
```

Risultato: nessun commit contiene `.env`; l'unico file tracciato è `.env.example`.

### Secret nel repository GitHub

Da **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Uso | Obbligatorio |
|---|---|---|
| `VITE_SENTRY_DSN` | DSN del progetto Sentry, iniettato nella build di produzione | Sì per il monitoraggio (senza, Sentry resta spento e la pipeline avvisa con un warning) — **configurato** |

Il token per GHCR e per il deploy su Pages è il `GITHUB_TOKEN` generato automaticamente per ogni run:
non va creato né salvato.

> Nota: un DSN Sentry finisce nel bundle del browser ed è per natura "pubblico". Viene comunque gestito come
> secret per abituarsi al flusso corretto e per non legare il repository a un progetto Sentry specifico.

### Verifica che i secret non compaiano nei log

GitHub Actions maschera automaticamente con `***` ogni valore registrato come secret. Nella pipeline il job
`build` ha uno step **"Check secrets are set (masked)"** che stampa solo la **lunghezza** del secret, mai il
valore. Nei log si legge ad esempio:

```
VITE_SENTRY_DSN configurato (lunghezza: 88 caratteri)
```

Verifica manuale eseguita: ricerca del valore del DSN nei log del run (`Search logs`) → nessuna occorrenza.
Screenshot: `docs/screenshots/secrets-masked.png`.

Altre misure adottate:

- `.dockerignore` esclude `.env`, `.git` e `node_modules` dal contesto di build;
- il backend gira come utente `node` (non root);
- `permissions: contents: read` a livello di workflow, permessi ampliati solo nei job che ne hanno bisogno;
- `npm audit --audit-level=high` in un job informativo (non blocca la pipeline ma segnala vulnerabilità).

---

## 4. Pipeline CI

File: [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml). Si attiva a ogni **push su `main`** e
`develop`, a ogni pull request e manualmente (`workflow_dispatch`).

```
push / PR
   │
   ├─ lint (oxlint) ──┬─ build (tsc + vite build, artifact dist/)
   │                  ├─ docker (build immagini, smoke test, push su GHCR)
   │                  └─ audit (npm audit, informativo)
   │
   └─ deploy (solo push su main, needs: lint + build + docker) ─► GitHub Pages
```

| Job | Cosa fa | Cosa lo fa fallire |
|---|---|---|
| `lint` | `npm ci` + `npm run lint` (oxlint) | Qualsiasi regola a livello `error`, es. `react/rules-of-hooks` |
| `build` | `tsc -b` (typecheck) + `vite build` con le variabili di produzione; crea `404.html` e `.nojekyll`; carica `dist/` come artifact | Errori TypeScript o di bundling |
| `docker` | Build delle immagini frontend e backend con cache, avvio dei container e `curl` sugli health check; push su GHCR (`:sha`, `:staging` o `:latest`) | Dockerfile rotto, container che non risponde |
| `audit` | `npm audit --audit-level=high` | Mai (informativo, `continue-on-error`) |

`build`, `docker` e `audit` dipendono da `lint`: se il lint è rosso, nulla viene costruito né deployato.

### Fallimento visibile del lint

Test eseguito: introdotto un uso di hook dentro una condizione (`if (x) useState()` viola
`react/rules-of-hooks`), push → job `lint` rosso, i job successivi risultano `skipped`, il deploy non parte,
la PR mostra il check fallito. Screenshot: `docs/screenshots/ci-lint-failed.png`.

Pipeline verde: `docs/screenshots/ci-green.png` — link diretto: vedi la sezione [Consegna](#8-consegna-checklist-e-screenshot).

### Riprodurre la CI in locale

```bash
npm ci && npm run lint && npm run typecheck && npm run build   # con Node 22
docker build -t quiet-mind:ci .                                # stesso Dockerfile usato in CI
```

---

## 5. Pipeline CD e deploy pubblico

Il job `deploy` estende la stessa pipeline:

- condizione: `github.event_name == 'push' && github.ref == 'refs/heads/main'`;
- `needs: [lint, build, docker]` → parte solo se la CI è completamente verde;
- scarica l'artifact `dist/` prodotto dal job `build` (si deploya **esattamente** ciò che è stato testato);
- `actions/configure-pages` + `upload-pages-artifact` + `deploy-pages` pubblicano su GitHub Pages;
- l'`environment: github-pages` registra l'URL e la cronologia dei deploy;
- uno step finale fa `curl` sull'URL pubblico e fallisce se non risponde 200.

### Configurazione una tantum su GitHub

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Actions → General → Workflow permissions: Read and write** (serve per pubblicare su GHCR).
3. Aggiungere il secret `VITE_SENTRY_DSN` (vedi sezione 3).

### Dettagli tecnici del deploy su Pages

- Il sito vive in una sottocartella (`/QuietMind-devops-cycle/`): la pipeline imposta
  `VITE_BASE_PATH=/QuietMind-devops-cycle/` (calcolato automaticamente dal nome del repository), Vite usa
  `base` e React Router usa `basename={import.meta.env.BASE_URL}`.
- `404.html` è una copia di `index.html`: ricaricando `/QuietMind-devops-cycle/learn` GitHub Pages serve la
  SPA e il router mostra la pagina giusta.
- `.nojekyll` evita che Pages ignori i file con underscore.

**URL pubblico:** https://andreagervasiodev.github.io/QuietMind-devops-cycle/
**Run della pipeline:** https://github.com/andreagervasioDev/QuietMind-devops-cycle/actions/workflows/ci-cd.yml

---

## 6. Monitoraggio

### Uptime: UptimeRobot

Monitor **HTTP(s)** sull'URL pubblico, intervallo 5 minuti, alert via e-mail.

Configurazione (UptimeRobot → Add New Monitor):

| Campo | Valore |
|---|---|
| Monitor type | HTTP(s) |
| Friendly name | Quiet Mind (production) |
| URL | `https://andreagervasiodev.github.io/QuietMind-devops-cycle/` |
| Monitoring interval | 5 minuti |
| Alert contacts | e-mail |

Screenshot: `docs/screenshots/uptimerobot.png`.

### Error tracking: Sentry

- SDK `@sentry/react`, inizializzato in [src/monitoring.ts](src/monitoring.ts) solo se `VITE_SENTRY_DSN` è
  presente; `environment` = `VITE_APP_ENV` (development / staging / production) e `release` = SHA del commit,
  così ogni evento dice **dove** e **in quale versione** è avvenuto.
- `Sentry.ErrorBoundary` in [src/main.tsx](src/main.tsx) cattura i crash di rendering e mostra una pagina di
  cortesia invece dello schermo bianco.
- Le source map sono pubblicate insieme alla build, quindi gli stack trace in Sentry puntano al codice
  TypeScript originale.

### Simulazione di un errore

Pagina nascosta **`/debug/error`** ([src/pages/DebugError.tsx](src/pages/DebugError.tsx)), raggiungibile solo
digitando l'URL: `https://andreagervasiodev.github.io/QuietMind-devops-cycle/debug/error`

| Pulsante | Cosa succede | Cosa vedi in Sentry |
|---|---|---|
| **Invia errore gestito** | `JSON.parse` di una stringa non valida, catturato con `Sentry.captureException` | Issue `SyntaxError`, livello *error*, l'app continua a funzionare |
| **Provoca crash** | Un componente lancia un'eccezione durante il render | Issue `Error: Quiet Mind: errore di test…`, catturata dall'ErrorBoundary; l'utente vede la pagina "Qualcosa è andato storto" |

Screenshot della dashboard con l'evento registrato: `docs/screenshots/sentry-issue.png`.

### Come interpretare gli alert

**E-mail UptimeRobot "Monitor is DOWN"**

1. Aprire l'URL nel browser. Se non risponde, controllare https://www.githubstatus.com (GitHub Pages ha incidenti
   propri).
2. Aprire l'ultimo run della pipeline: un deploy fallito o un artifact vuoto spiegano un 404.
3. Se l'ultimo deploy è la causa, ripristinare: `git revert <sha> && git push` → la pipeline rideploya la
   versione precedente in pochi minuti.
4. L'e-mail "Monitor is UP" chiude l'incidente; la durata del down è nella dashboard di UptimeRobot.

**Alert Sentry (nuova issue / regressione)**

| Campo | Come leggerlo |
|---|---|
| **Titolo** | Tipo e messaggio dell'eccezione (`SyntaxError: Unexpected token…`) |
| **Environment** | `production` = utenti reali; `staging`/`development` = test, priorità bassa |
| **Release** | SHA del commit: `git show <sha>` per vedere cosa è cambiato |
| **Events / Users** | Quanti eventi e quanti utenti distinti: 1 evento da 1 utente è probabilmente un test; centinaia di eventi dopo un deploy indicano una regressione |
| **Stack trace** | Con le source map indica file e riga TypeScript |
| **Breadcrumbs** | Le azioni prima dell'errore (click, navigazione, fetch): utili per riprodurlo |
| **Tags → browser / os** | Se l'errore è concentrato su un browser, è probabilmente una incompatibilità |

Regola pratica: *nuova issue in production dopo un deploy* → guardare prima il diff del release, quindi
decidere tra hotfix e revert. Le issue con **"Handled: yes"** (come quella del pulsante "errore gestito")
non hanno rotto l'app; quelle catturate dall'ErrorBoundary sì.

---

## 7. Struttura del repository

```
.
├── .github/workflows/ci-cd.yml   # pipeline CI/CD
├── backend/                      # API Node minimale + Dockerfile
├── docker/nginx.conf             # server statico + proxy /api
├── docs/screenshots/             # prove per la consegna
├── src/
│   ├── monitoring.ts             # inizializzazione Sentry
│   ├── hooks/useQuotes.ts        # citazioni dal backend con fallback
│   └── pages/DebugError.tsx      # pagina /debug/error per testare Sentry
├── Dockerfile                    # frontend multi-stage (node -> nginx)
├── docker-compose.yml            # frontend + backend in locale
├── .env.example                  # template delle variabili (l'unico .env versionato)
└── .nvmrc                        # Node 22
```

---

## 8. Consegna: checklist e screenshot

| Requisito | Prova |
|---|---|
| Pipeline verde | https://github.com/andreagervasioDev/QuietMind-devops-cycle/actions/workflows/ci-cd.yml — `docs/screenshots/ci-green.png` |
| Lint che fallisce in modo visibile | `docs/screenshots/ci-lint-failed.png` |
| URL pubblico funzionante | https://andreagervasiodev.github.io/QuietMind-devops-cycle/ |
| Run della pipeline con deploy | link all'ultimo run su `main` (job `deploy`, environment `github-pages`) |
| Secret non visibili nei log | `docs/screenshots/secrets-masked.png` |
| Uptime monitor attivo | `docs/screenshots/uptimerobot.png` |
| Dashboard Sentry con evento | `docs/screenshots/sentry-issue.png` |
| Stack locale funzionante | `docs/screenshots/compose-up.png` |

---

## Note tecniche dell'app

- **Autoplay audio:** i suoni ambientali usano la Web Audio API, che i browser avviano solo dopo
  un'interazione esplicita dell'utente. Nell'app funziona perché il suono viene scelto con un click.
- **Citazioni:** la pagina "Scopri" chiede le citazioni al backend (`/api/quotes`) se `VITE_API_URL` è
  configurato; altrimenti, o in caso di errore, usa quelle incorporate. Su GitHub Pages non c'è backend, quindi
  la build di produzione non imposta `VITE_API_URL` e l'app non fa alcuna chiamata.
