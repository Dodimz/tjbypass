<?php

namespace Modules\Service\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Modules\Service\Http\Requests\ServiceRequest;
use Modules\Service\Models\Service;
use Modules\Service\Services\ServiceService;

class ServiceController extends Controller
{
    public function __construct(private ServiceService $serviceService) {}

    /**
     * Display a listing of services in the dashboard.
     */
    public function index(\Illuminate\Http\Request $request)
    {
        $services = $this->serviceService->getServices($request->only(['search', 'status']));

        return Inertia::render('Service/dashboard/index', [
            'services' => $services,
            'filters' => $request->only(['search', 'status']),
            'statuses' => Service::getStatuses(),
        ]);
    }

    /**
     * Show the form for creating a new service.
     */
    public function create()
    {
        return Inertia::render('Service/dashboard/create-edit', [
            'service' => null,
            'statuses' => Service::getStatuses(),
            'technicians' => $this->serviceService->getTechnicians(),
        ]);
    }

    /**
     * Store a newly created service.
     */
    public function store(ServiceRequest $request): RedirectResponse
    {
        $data = $this->serviceData($request);

        $this->serviceService->createService($data);

        return redirect()
            ->route('services.index')
            ->with('success', __('Service created successfully.'));
    }

    /**
     * Show the form for editing the specified service.
     */
    public function edit(string $uuid)
    {
        $service = Service::where('uuid', $uuid)->firstOrFail();

        return Inertia::render('Service/dashboard/create-edit', [
            'service' => $service,
            'statuses' => Service::getStatuses(),
            'technicians' => $this->serviceService->getTechnicians(),
        ]);
    }

    /**
     * Update the specified service.
     */
    public function update(ServiceRequest $request, string $uuid): RedirectResponse
    {
        $service = Service::where('uuid', $uuid)->firstOrFail();

        $this->serviceService->updateService($service, $this->serviceData($request, withOwner: false));

        return redirect()
            ->route('services.index')
            ->with('success', __('Service updated successfully.'));
    }

    /**
     * Build the payload for store/update. When no technician is selected,
     * the authenticated admin becomes the default technician.
     *
     * @return array<string, mixed>
     */
    private function serviceData(ServiceRequest $request, bool $withOwner = true): array
    {
        $data = $request->validated();

        if ($withOwner) {
            $data['user_id'] = $request->user()->id;
        }

        if (empty($data['technician_id'])) {
            $data['technician_id'] = $request->user()->id;
        }

        return $data;
    }

    /**
     * Remove the specified service.
     */
    public function destroy(string $uuid): RedirectResponse
    {
        $service = Service::where('uuid', $uuid)->firstOrFail();
        $this->serviceService->deleteService($service);

        return back()->with('success', __('Service deleted successfully.'));
    }

    /**
     * Public listing of published services.
     */
    public function guest_index(\Illuminate\Http\Request $request)
    {
        $services = $this->serviceService->getPublishedServices($request->input('search'));

        return Inertia::render('Service/index', [
            'services' => $services,
            'search' => $request->input('search'),
        ]);
    }

    /**
     * Public detail page for a published service.
     */
    public function guest_show(string $uuid)
    {
        $service = $this->serviceService->getPublishedService($uuid);

        if (! $service) {
            abort(404);
        }

        return Inertia::render('Service/show', [
            'service' => $service,
        ]);
    }
}
