# ---------- Stage 1: build frontend assets ----------
FROM node:22-alpine AS assets

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: nginx serving public/ ----------
FROM nginx:stable-alpine

COPY docker/config/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=assets /app/public /var/www/html/public

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --spider -q http://127.0.0.1/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
