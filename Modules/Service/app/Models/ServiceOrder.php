<?php

namespace Modules\Service\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;
use Modules\Service\Enums\ServiceOrderStatus;

/**
 * @property int $id
 * @property string $uuid
 * @property int $user_id
 * @property int|null $technician_id
 * @property int $service_id
 * @property float $price
 * @property float $tax
 * @property float $total
 * @property string|null $requirements
 * @property string|null $delivery_note
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $paid_at
 * @property \Illuminate\Support\Carbon|null $started_at
 * @property \Illuminate\Support\Carbon|null $delivered_at
 * @property \Illuminate\Support\Carbon|null $completed_at
 */
class ServiceOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'user_id',
        'technician_id',
        'service_id',
        'price',
        'tax',
        'total',
        'requirements',
        'delivery_note',
        'status',
        'paid_at',
        'started_at',
        'delivered_at',
        'completed_at',
    ];

    protected $casts = [
        'price' => 'float',
        'tax' => 'float',
        'total' => 'float',
        'paid_at' => 'datetime',
        'started_at' => 'datetime',
        'delivered_at' => 'datetime',
        'completed_at' => 'datetime',
        'status' => ServiceOrderStatus::class,
    ];

    protected $attributes = [
        'status' => ServiceOrderStatus::PENDING->value,
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function (ServiceOrder $order) {
            if (empty($order->uuid)) {
                $order->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the buyer who placed this order.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the technician assigned to work on this order.
     */
    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    /**
     * Get the service this order is for.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Scope a query to only include orders of a specific buyer.
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope a query to only include orders assigned to a specific technician.
     */
    public function scopeForTechnician(Builder $query, int $technicianId): Builder
    {
        return $query->where('technician_id', $technicianId);
    }

    /**
     * Get available statuses (value => label) for UI selects.
     *
     * @return array<string, string>
     */
    public static function getStatuses(): array
    {
        return array_map(
            fn (ServiceOrderStatus $status): string => $status->getLabel(),
            ServiceOrderStatus::cases()
        );
    }

    /**
     * Transition the order to a new status.
     */
    public function transitionTo(ServiceOrderStatus|string $target): bool
    {
        $target = $target instanceof ServiceOrderStatus ? $target : ServiceOrderStatus::from($target);

        if ($this->status instanceof ServiceOrderStatus && ! $this->status->canTransitionTo($target)) {
            return false;
        }

        return (bool) $this->update(['status' => $target->value]);
    }
}
