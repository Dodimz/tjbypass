<?php

namespace App\Http\Middleware;

use App\Services\SettingsService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthConfig
{
    public function __construct(private SettingsService $settingsService) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $auth = $this->settingsService->getSetting([
            'type' => 'auth',
            'sub_type' => 'google',
        ])['fields'] ?? [];

        $recaptcha = $this->settingsService->getSetting([
            'type' => 'auth',
            'sub_type' => 'recaptcha',
        ])['fields'] ?? [];

        // Google Auth configuration
        config([
            'services.google.status' => $auth['active'] ?? config('services.google.status', false),
            'services.google.client_id' => $auth['client_id'] ?? config('services.google.client_id'),
            'services.google.client_secret' => $auth['client_secret'] ?? config('services.google.client_secret'),
            'services.google.redirect' => $auth['redirect'] ?? config('services.google.redirect'),
        ]);

        // Recaptcha configuration
        config([
            'captcha.status' => $recaptcha['active'] ?? config('captcha.status', false),
            'captcha.secret' => $recaptcha['secret_key'] ?? config('captcha.secret'),
            'captcha.sitekey' => $recaptcha['site_key'] ?? config('captcha.sitekey'),
        ]);

        return $next($request);
    }
}
