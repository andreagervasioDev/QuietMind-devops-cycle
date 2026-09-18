# ---------- Stage 1: build dell'app Vite ----------
FROM node:22-alpine AS build
WORKDIR /app

# Prima solo i manifest: il layer con npm ci viene ricostruito solo se cambiano le dipendenze.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# Variabili di build (Vite le "cuoce" nel bundle: NON metterci segreti veri).
ARG VITE_API_URL=/
ARG VITE_SENTRY_DSN=
ARG VITE_APP_ENV=production
ARG VITE_APP_VERSION=dev
ARG VITE_BASE_PATH=/
ENV VITE_API_URL=$VITE_API_URL \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN \
    VITE_APP_ENV=$VITE_APP_ENV \
    VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_BASE_PATH=$VITE_BASE_PATH

RUN npm run lint && npm run build

# ---------- Stage 2: serve statico con nginx ----------
FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
