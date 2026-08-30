FROM composer:2.8 AS vendor

WORKDIR /app

COPY backend/composer.* ./
RUN composer config --global platform.php 8.3.0 \
    && composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --no-scripts

COPY backend/ ./
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative

FROM php:8.3-cli-alpine AS runtime

RUN apk add --no-cache \
        icu-libs \
        libpq \
        oniguruma \
        postgresql-client \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-dev \
        oniguruma-dev \
        postgresql-dev \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_pgsql \
    && apk del .build-deps

WORKDIR /var/www/html

COPY docker/php.ini /usr/local/etc/php/conf.d/agromarket.ini
COPY docker/backend-entrypoint.sh /usr/local/bin/agromarket-entrypoint
COPY --from=vendor --chown=www-data:www-data /app ./

RUN chmod +x /usr/local/bin/agromarket-entrypoint \
    && mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

USER www-data

EXPOSE 8000

ENTRYPOINT ["agromarket-entrypoint"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
