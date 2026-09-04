<?php

namespace App\Http\Middleware;

use App\Services\SettingsService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMenuEnabled
{
    public function __construct(private SettingsService $settingsService) {}

    /**
     * Abort the request when every given dashboard menu group is hidden.
     *
     * Usage: ->middleware('menu.enabled:job-circulars') or
     *        ->middleware('menu.enabled:certificate.templates,marksheet.templates')
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$menus): Response
    {
        $hidden = $this->settingsService->getHiddenMenus();

        if ($menus !== [] && array_diff($menus, $hidden) === []) {
            abort(404);
        }

        return $next($request);
    }
}
