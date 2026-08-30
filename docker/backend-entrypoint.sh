#!/bin/sh
set -eu

cd /var/www/html

max_attempts="${DB_WAIT_ATTEMPTS:-30}"
attempt=1

while ! php -r '
    $host = getenv("DB_HOST") ?: "database";
    $port = getenv("DB_PORT") ?: "5432";
    $name = getenv("DB_DATABASE") ?: "agromarket";
    $user = getenv("DB_USERNAME") ?: "agromarket";
    $pass = getenv("DB_PASSWORD") ?: "";
    try {
        new PDO("pgsql:host={$host};port={$port};dbname={$name}", $user, $pass);
    } catch (Throwable $exception) {
        exit(1);
    }
' >/dev/null 2>&1; do
    if [ "$attempt" -ge "$max_attempts" ]; then
        echo "PostgreSQL is not reachable after ${max_attempts} attempts." >&2
        exit 1
    fi

    echo "Waiting for PostgreSQL (${attempt}/${max_attempts})..."
    attempt=$((attempt + 1))
    sleep 2
done

php artisan migrate --force

if [ "${SEED_DATABASE:-false}" = "true" ]; then
    php artisan db:seed --force
fi

php artisan config:cache

exec "$@"

