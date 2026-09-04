<?php

namespace Modules\Service\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Modules\Billing\Services\WalletService;
use Modules\Service\Enums\ServiceOrderStatus;
use Modules\Service\Models\Service;
use Modules\Service\Models\ServiceOrder;
use Modules\Service\Notifications\ServiceOrderNotification;

class ServiceService
{
    public function __construct(private WalletService $walletService) {}
    /**
     * Get all technicians (instructors) for the admin assignment dropdown.
     *
     * @return Collection<int, array<string, mixed>>
     */
    public function getTechnicians(): Collection
    {
        return User::query()
            ->instructors()
            ->orderBy('name')
            ->get(['id', 'name']);
    }
    /**
     * Get paginated services for the admin dashboard.
     *
     * @param  array{search?: string|null, status?: string|null}  $filters
     * @return LengthAwarePaginator<int, Service>
     */
    public function getServices(array $filters = []): LengthAwarePaginator
    {
        return Service::query()
            ->searchTitle($filters['search'] ?? null)
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * Get paginated published services for the public listing.
     *
     * @return LengthAwarePaginator<int, Service>
     */
    public function getPublishedServices(?string $search = null): LengthAwarePaginator
    {
        return Service::query()
            ->published()
            ->searchTitle($search)
            ->with('technician:id,name')
            ->latest()
            ->paginate(12)
            ->withQueryString();
    }

    /**
     * Find a published service by uuid for the public detail page.
     */
    public function getPublishedService(string $uuid): ?Service
    {
        /** @var Service|null $service */
        $service = Service::query()
            ->published()
            ->where('uuid', $uuid)
            ->with('technician:id,name')
            ->first();

        return $service;
    }

    /**
     * Get published services for the page builder collections API.
     *
     * @param  int  $limit
     * @return Collection<int, array<string, mixed>>
     */
    public function getPublishedServicesForCollection(int $limit = 8): Collection
    {
        return Service::query()
            ->published()
            ->with('technician:id,name,photo')
            ->withCount('orders')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (Service $service): array => [
                'uuid' => $service->uuid,
                'title' => $service->title,
                'short_description' => $service->short_description,
                'price' => (float) $service->price,
                'delivery_days' => $service->delivery_days,
                'thumbnail' => $service->thumbnail,
                'orders_count' => $service->orders_count,
                'technician' => $service->technician
                    ? ['id' => $service->technician->id, 'name' => $service->technician->name, 'photo' => $service->technician->photo]
                    : null,
            ]);
    }

    /**
     * Create a new service.
     *
     * @param  array<string, mixed>  $data
     */
    public function createService(array $data): Service
    {
        return DB::transaction(function () use ($data) {
            /** @var Service $service */
            $service = Service::create($data);

            if (! empty($data['thumbnail'])) {
                $service->addMedia($data['thumbnail'])
                    ->toMediaCollection('thumbnail');
            }

            return $service;
        });
    }

    /**
     * Update an existing service.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateService(Service $service, array $data): Service
    {
        return DB::transaction(function () use ($service, $data) {
            $service->update($data);

            if (! empty($data['thumbnail'])) {
                $service->clearMediaCollection('thumbnail');
                $service->addMedia($data['thumbnail'])
                    ->toMediaCollection('thumbnail');
            }

            return $service->refresh();
        });
    }

    /**
     * Delete a service.
     */
    public function deleteService(Service $service): bool
    {
        return (bool) $service->delete();
    }

    /**
     * Get paginated orders for a buyer.
     *
     * @return LengthAwarePaginator<int, ServiceOrder>
     */
    public function getUserOrders(int $userId): LengthAwarePaginator
    {
        return ServiceOrder::query()
            ->byUser($userId)
            ->with(['service', 'technician:id,name'])
            ->latest()
            ->paginate(10);
    }

    /**
     * Get paginated orders for the admin dashboard.
     *
     * @param  array{status?: string|null}  $filters
     * @return LengthAwarePaginator<int, ServiceOrder>
     */
    public function getAllOrders(array $filters = []): LengthAwarePaginator
    {
        return ServiceOrder::query()
            ->with(['service', 'user', 'technician:id,name'])
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * Get paginated orders assigned to a technician.
     *
     * @param  array{status?: string|null}  $filters
     * @return LengthAwarePaginator<int, ServiceOrder>
     */
    public function getTechnicianOrders(int $technicianId, array $filters = []): LengthAwarePaginator
    {
        return ServiceOrder::query()
            ->forTechnician($technicianId)
            ->with(['service', 'user:id,name,email'])
            ->when($filters['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();
    }

    /**
     * Update an order status with a validated transition.
     */
    public function updateOrderStatus(ServiceOrder $order, ServiceOrderStatus|string $status, ?string $deliveryNote = null): ServiceOrder
    {
        $target = $status instanceof ServiceOrderStatus ? $status : ServiceOrderStatus::from($status);

        if (! $order->transitionTo($target)) {
            throw new \InvalidArgumentException("Cannot transition order from [{$order->status->value}] to [{$target->value}].");
        }

        $updates = match ($target) {
            ServiceOrderStatus::PAID => ['paid_at' => now()],
            ServiceOrderStatus::IN_PROGRESS => ['started_at' => now()],
            ServiceOrderStatus::DELIVERED => [
                'delivered_at' => now(),
                'delivery_note' => $deliveryNote,
            ],
            ServiceOrderStatus::COMPLETED => ['completed_at' => now()],
            default => [],
        };

        if ($updates !== []) {
            $order->update($updates);
        }

        $order->refresh();

        $this->notifyStatusChange($order, $target);

        return $order;
    }

    /**
     * Cancel an order. When the order was already paid, refund the full
     * total back to the buyer's wallet.
     */
    public function cancelOrder(ServiceOrder $order): ServiceOrder
    {
        $wasPaid = ! is_null($order->paid_at);

        return DB::transaction(function () use ($order, $wasPaid) {
            $this->updateOrderStatus($order, ServiceOrderStatus::CANCELLED);

            if ($wasPaid) {
                /** @var User $buyer */
                $buyer = $order->user;

                $this->walletService->refundToWallet(
                    $buyer,
                    (float) $order->total,
                    "Refund for cancelled service order #{$order->uuid}",
                    ['service_order_id' => $order->id],
                );

                $buyer->notify(new ServiceOrderNotification([
                    'title' => __('Service order cancelled — refunded to your wallet'),
                    'description' => $order->service->title.' · '.app('system')->fields['selling_currency'].' '.number_format((float) $order->total, 2),
                    'url' => route('services.my-orders', absolute: false),
                ]));
            }

            return $order;
        });
    }

    /**
     * Notify the interested party about an order status change.
     */
    private function notifyStatusChange(ServiceOrder $order, ServiceOrderStatus $target): void
    {
        match ($target) {
            ServiceOrderStatus::IN_PROGRESS => $order->user?->notify(new ServiceOrderNotification([
                'title' => __('Work has started on your service order'),
                'description' => $order->service?->title,
                'url' => route('services.my-orders', absolute: false),
            ])),
            ServiceOrderStatus::DELIVERED => $order->user?->notify(new ServiceOrderNotification([
                'title' => __('Your service order has been delivered'),
                'description' => $order->service?->title,
                'url' => route('services.my-orders', absolute: false),
            ])),
            ServiceOrderStatus::COMPLETED => $order->technician?->notify(new ServiceOrderNotification([
                'title' => __('Your service order was completed'),
                'description' => $order->service?->title,
                'url' => route('services.orders.index', absolute: false),
            ])),
            default => null,
        };
    }

    /**
     * Technician (or admin) starts working on a paid order.
     */
    public function startOrder(ServiceOrder $order): ServiceOrder
    {
        return $this->updateOrderStatus($order, ServiceOrderStatus::IN_PROGRESS);
    }
}
