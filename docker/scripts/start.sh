#!/bin/sh

# For Cloud Run, we need to handle the Cloud SQL Proxy connection
if [ ! -z "$DB_SOCKET" ]; then
    echo "Using Cloud SQL Unix socket connection..."
    export DB_HOST="localhost"
    export DB_PORT="3306"
else
    # Wait for database to be ready (for TCP connections)
    echo "Waiting for database connection..."
    timeout=30
    while ! mysqladmin ping -h"$DB_HOST" -P"${DB_PORT:-3306}" -u"$DB_USERNAME" -p"$DB_PASSWORD" --silent 2>/dev/null; do
        timeout=$((timeout - 1))
        if [ $timeout -le 0 ]; then
            echo "Database connection timeout. Continuing anyway..."
            break
        fi
        echo "Database is not ready yet. Waiting... ($timeout)"
        sleep 2
    done
fi

echo "Database connection established!"

# Generate application key if not exists
if [ -z "$APP_KEY" ]; then
    echo "Generating application key..."
    php artisan key:generate --no-interaction
fi

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force --no-interaction

# Cache configuration and routes for production
echo "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create symbolic link for storage
php artisan storage:link

# Clear any existing caches
php artisan cache:clear

# Set proper permissions
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache

echo "Starting services..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf