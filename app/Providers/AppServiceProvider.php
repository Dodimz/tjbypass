<?php

namespace App\Providers;

use App\Models\Setting;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton('system', function () {
            try {
                // Saat build di Railway, jangan sentuh DB sama sekali
                if (app()->runningInConsole() && env('SKIP_DB_CHECK', false)) {
                    return null;
                }

                if (function_exists('isDBConnected') && isDBConnected()) {
                    if (Schema::hasTable('settings')) {
                        return Setting::where('type', 'system')->first();
                    }
                }

                return null;
            } catch (\Throwable $th) {
                return null;
            }
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Force HTTPS hanya di production, aman karena trustProxies sudah di bootstrap/app.php
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // Fix redirect loop: switch session ke file jika DB belum connect
        // Ini harus jalan SEBELUM StartSession middleware
        if (! $this->app->runningInConsole()) {
            try {
                if (function_exists('isDBConnected') && ! isDBConnected()) {
                    config(['session.driver' => 'file']);
                }
            } catch (\Throwable $e) {
                config(['session.driver' => 'file']);
            }
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);
        Schema::defaultStringLength(191);

        // Fix untuk shared hosting yang tidak ada constant TLSv1.2
        if (!defined('CURL_SSLVERSION_TLSv1_2')) {
            define('CURL_SSLVERSION_TLSv1_2', 6);
        }

        ResetPassword::createUrlUsing(function (User $user, string $token) {
            return env('FRONTEND_URL', config('app.url')) . '/reset-password?token=' . $token . '&email=' . $user->email;
        });
    }
}