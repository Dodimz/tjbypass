# ---------- Stage 1: build frontend assets ----------
FROM node:22-alpine AS assets

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: PHP-FPM runtime ----------
FROM php:8.3-fpm-alpine

WORKDIR /var/www/html

# System dependencies
RUN apk add --no-cache \
    bash \
    curl \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    mysql-client \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        bcmath \
        exif \
        gd \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo \
        pdo_mysql \
        zip \
    && pecl install redis \
    && docker-php-ext-enable redis

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1

# Application code (.dockerignore excludes vendor, node_modules, tests, .env*)
COPY --chown=www-data:www-data . .

# Built assets from stage 1
COPY --from=assets --chown=www-data:www-data /app/public/build ./public/build

# Production dependencies + writable directories
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-progress \
    && mkdir -p storage/framework/cache/data \
       storage/framework/sessions \
       storage/framework/testing \
       storage/framework/views \
       storage/logs \
       storage/app/public \
       bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

USER www-data

EXPOSE 9000

CMD ["php-fpm"]
