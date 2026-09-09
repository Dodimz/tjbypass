FROM php:8.3-cli AS builder

# Node 22 karena @yaireo/tagify butuh >=22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get update && apt-get install -y \
    nodejs git unzip \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libzip-dev libicu-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) bcmath exif gd intl mbstring pdo_mysql zip \
    && pecl install redis && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --ignore-platform-reqs --no-scripts

# FIX BUILD: Bikin .env dummy agar php artisan bisa jalan saat vite build
RUN if [ ! -f .env ]; then cp .env.example .env 2>/dev/null || echo "APP_KEY=base64:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=" > .env; fi
RUN php artisan key:generate --no-interaction --force || true

# FIX WAYFINDER: Generate dulu dengan skip DB check biar tidak coba konek MySQL saat build
RUN SKIP_DB_CHECK=true php artisan wayfinder:generate --with-form || true

# Build frontend React/Inertia
RUN SKIP_DB_CHECK=true npm ci && npm run build

# --- Final Stage ---
FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev \
    libzip-dev libicu-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) bcmath exif gd intl mbstring pdo_mysql zip \
    && pecl install redis && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /var/www/html

COPY --from=builder /var/www/html ./

RUN composer dump-autoload --optimize

# Buat folder storage agar tidak permission denied
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

#CMD ["sh", "-c", "chmod -R 775 storage bootstrap/cache && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080} --no-reload"]
CMD ["sh", "-c", "chmod -R 775 storage bootstrap/cache && php artisan migrate --force || true && php artisan serve --host=0.0.0.0 --port=${PORT:-8080} --no-reload"]