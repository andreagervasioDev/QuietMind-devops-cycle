/**
 * Quiet Mind API — backend minimale senza dipendenze esterne.
 *
 * Endpoint:
 *   GET /api/health         -> stato del servizio (usato dagli healthcheck Docker/uptime)
 *   GET /api/quotes         -> tutte le citazioni
 *   GET /api/quotes/random  -> una citazione casuale
 *
 * Configurazione via variabili d'ambiente (vedi .env.example):
 *   PORT            porta di ascolto (default 3001)
 *   ALLOWED_ORIGIN  valore dell'header Access-Control-Allow-Origin (default "*")
 *   APP_ENV         nome dell'ambiente riportato da /api/health
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 3001);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? '*';
const APP_ENV = process.env.APP_ENV ?? 'development';
const VERSION = process.env.npm_package_version ?? '1.0.0';

const QUOTES = [
  { quote: 'Non puoi fermare le onde, ma puoi imparare a navigarle.', author: 'Jon Kabat-Zinn' },
  { quote: 'Il respiro è il ponte che collega la vita alla coscienza.', author: 'Thich Nhat Hanh' },
  { quote: 'La meditazione non è evasione, è un incontro sereno con la realtà.', author: 'Thich Nhat Hanh' },
  { quote: 'La quiete che cerchi non è nel mondo, è dentro di te.', author: 'Anonimo' },
  { quote: 'Ogni respiro che facciamo può essere un nuovo inizio.', author: 'Pema Chödrön' },
  { quote: 'Sentirsi in pace con se stessi è il modo migliore per essere in pace con il mondo.', author: 'Anonimo' },
];

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const started = Date.now();

  res.on('finish', () => {
    // Log strutturato: una riga JSON per richiesta, facile da leggere con `docker compose logs`.
    console.log(
      JSON.stringify({
        time: new Date().toISOString(),
        method: req.method,
        path: url.pathname,
        status: res.statusCode,
        ms: Date.now() - started,
      }),
    );
  });

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  switch (url.pathname) {
    case '/api/health':
      return sendJson(res, 200, {
        status: 'ok',
        service: 'quiet-mind-api',
        version: VERSION,
        environment: APP_ENV,
        uptimeSeconds: Math.round(process.uptime()),
      });
    case '/api/quotes':
      return sendJson(res, 200, QUOTES);
    case '/api/quotes/random':
      return sendJson(res, 200, QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    default:
      return sendJson(res, 404, { error: 'Not found' });
  }
});

server.listen(PORT, () => {
  console.log(`quiet-mind-api in ascolto su http://0.0.0.0:${PORT} (env: ${APP_ENV})`);
});

// Chiusura pulita quando Docker invia SIGTERM (docker compose down / stop).
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`${signal} ricevuto, chiusura del server...`);
    server.close(() => process.exit(0));
  });
}
