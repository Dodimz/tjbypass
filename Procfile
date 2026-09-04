web: php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan view:cache && php artisan serve --host=0.0.0.0 --port=$PORT
worker: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
scheduler: while true; do php artisan schedule:run --verbose --no-interaction; sleep 60; done
