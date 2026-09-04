<?php

namespace Modules\Service\Http\Controllers;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\Service\Enums\ServiceOrderStatus;
use Modules\Service\Models\ServiceOrder;
use Modules\Service\Services\ServiceService;

class ServiceOrderController extends Controller
{
    public function __construct(private ServiceService $serviceService) {}

    /**
     * Display the buyer's service orders.
     */
    public function my_orders(Request $request)
    {
        $orders = $this->serviceService->getUserOrders($request->user()->id);

        return Inertia::render('Service/my-orders', [
            'orders' => $orders,
            'statuses' => ServiceOrder::getStatuses(),
        ]);
    }

    /**
     * Display service orders in the dashboard: all orders for admins,
     * assigned orders for technicians.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $filters = $request->only('status');

        $orders = $user->role === UserType::ADMIN->value
            ? $this->serviceService->getAllOrders($filters)
            : $this->serviceService->getTechnicianOrders($user->id, $filters);

        return Inertia::render('Service/dashboard/orders', [
            'orders' => $orders,
            'filters' => $filters,
            'statuses' => ServiceOrder::getStatuses(),
        ]);
    }

    /**
     * Technician (or admin) starts working on a paid order.
     */
    public function start(string $uuid): RedirectResponse
    {
        $order = ServiceOrder::where('uuid', $uuid)->firstOrFail();
        $this->authorizeWorker($order);

        $this->serviceService->startOrder($order);

        return back()->with('success', __('Order started. Good luck!'));
    }

    /**
     * Mark an order as delivered (technician or admin).
     */
    public function deliver(Request $request, string $uuid): RedirectResponse
    {
        $order = ServiceOrder::where('uuid', $uuid)->firstOrFail();
        $this->authorizeWorker($order);

        $this->serviceService->updateOrderStatus(
            $order,
            ServiceOrderStatus::DELIVERED,
            $request->input('delivery_note')
        );

        return back()->with('success', __('Order marked as delivered.'));
    }

    /**
     * Mark an order as completed: buyer confirms a delivered order, or the
     * technician/admin completes it directly once the work is done.
     */
    public function complete(string $uuid): RedirectResponse
    {
        $order = ServiceOrder::where('uuid', $uuid)->firstOrFail();

        $user = auth()->user();
        $isBuyer = $order->user_id === $user->id;
        $isWorker = $this->isWorker($order, $user);

        if ($isBuyer && ! $isWorker) {
            abort_unless($order->status === ServiceOrderStatus::DELIVERED, 403);
        } else {
            abort_unless($isWorker, 403);
        }

        $this->serviceService->updateOrderStatus($order, ServiceOrderStatus::COMPLETED);

        return back()->with('success', __('Order completed. Thank you!'));
    }

    /**
     * Cancel an order (admin). Paid orders are refunded to the buyer's wallet.
     */
    public function cancel(string $uuid): RedirectResponse
    {
        $order = ServiceOrder::where('uuid', $uuid)->firstOrFail();

        $this->serviceService->cancelOrder($order);

        return back()->with('success', __('Order cancelled.'));
    }

    private function authorizeWorker(ServiceOrder $order): void
    {
        abort_unless($this->isWorker($order, auth()->user()), 403);
    }

    private function isWorker(ServiceOrder $order, \App\Models\User $user): bool
    {
        return $user->role === UserType::ADMIN->value || $order->technician_id === $user->id;
    }
}
