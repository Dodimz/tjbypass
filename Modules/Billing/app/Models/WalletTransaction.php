<?php

namespace Modules\Billing\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $type deposit|purchase|refund|adjustment
 * @property string $status pending|completed|rejected
 * @property float $amount signed: positive credit, negative debit
 */
class WalletTransaction extends Model
{
    public const TYPE_DEPOSIT = 'deposit';

    public const TYPE_PURCHASE = 'purchase';

    public const TYPE_REFUND = 'refund';

    public const TYPE_ADJUSTMENT = 'adjustment';

    public const STATUS_PENDING = 'pending';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'wallet_id',
        'user_id',
        'type',
        'amount',
        'balance_after',
        'status',
        'payment_method',
        'transaction_id',
        'description',
        'meta',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'meta' => 'array',
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }
}
