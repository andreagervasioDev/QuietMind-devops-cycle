# Backend Quiet Mind: server Node senza dipendenze, immagine minimale.
FROM node:22-alpine

# Utente non-root per ridurre la superficie d'attacco.
WORKDIR /app
COPY package.json server.js ./
RUN chown -R node:node /app
USER node

ENV NODE_ENV=production \
    PORT=3001

EXPOSE 3001

# Healthcheck usato da docker compose (depends_on: condition: service_healthy).
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["node", "server.js"]
