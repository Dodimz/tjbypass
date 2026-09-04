<?php

namespace App\Http\Middleware;

use App\Services\SettingsService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SmtpConfig
{
    public function __construct(private SettingsService $settingsService) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $smtp = $this->settingsService->getSetting(['type' => 'smtp'])['fields'] ?? [];

        // SMTP configuration
        config([
            'mail.default' => $smtp['mail_mailer'] ?? config('mail.default'),
            'mail.mailers.smtp.host' => $smtp['mail_host'] ?? config('mail.mailers.smtp.host'),
            'mail.mailers.smtp.port' => intval($smtp['mail_port'] ?? config('mail.mailers.smtp.port')),
            'mail.mailers.smtp.encryption' => $smtp['mail_encryption'] ?? config('mail.mailers.smtp.encryption'),
            'mail.mailers.smtp.username' => $smtp['mail_username'] ?? config('mail.mailers.smtp.username'),
            'mail.mailers.smtp.password' => $smtp['mail_password'] ?? config('mail.mailers.smtp.password'),
            'mail.mailers.smtp.timeout' => null,
            // 'mail.mailers.smtp.local_domain' => $_SERVER['SERVER_NAME'],
            'mail.from.name' => $smtp['mail_from_name'] ?? config('mail.from.name'),
            'mail.from.address' => $smtp['mail_from_address'] ?? config('mail.from.address'),
        ]);

        // Check SMTP configuration from config
        if (config('mail.default') === 'smtp') {
            // Check if required SMTP credentials exist in config
            if (
                empty(config('mail.mailers.smtp.host')) ||
                empty(config('mail.mailers.smtp.port')) ||
                empty(config('mail.mailers.smtp.username')) ||
                empty(config('mail.mailers.smtp.password'))
            ) {
                return back()->with('error', 'SMTP configuration is incomplete. Email sending feature is not work right now.');
            }
        }

        return $next($request);
    }
}
