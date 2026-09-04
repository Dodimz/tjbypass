<?php

namespace Modules\Billing\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Modules\Billing\Models\Wallet;
use Modules\Billing\Models\WalletTransaction;

class InsufficientWalletBalanceException extends \RuntimeException {}

class WalletService
{
    public function getOrCreateWallet(User $user): Wallet
    {
        return Wallet::firstOrCreate(['user_id' => $user->id]);
    }

    public function getBalance(User $user): float
    {
        return (float) (Wallet::where('user_id', $user->id)->value('balance') ?? 0);
    }

    /**
     * Create a pending deposit request. Balance is credited only after an
     * admin approves it (manual/bank-transfer flow).
     */
    public function createDepositRequest(User $user, float $amount, ?string $note = null): WalletTransaction
    {
        $wallet = $this->getOrCreateWallet($user);

        return $wallet->transactions()->create([
            'user_id' => $user->id,
            'type' => WalletTransaction::TYPE_DEPOSIT,
            'amount' => round($amount, 2),
            'balance_after' => (float) $wallet->balance,
            'status' => WalletTransaction::STATUS_PENDING,
            'payment_method' => 'manual',
            'transaction_id' => 'DEP-'.strtoupper(Str::random(12)),
            'meta' => [
                'note' => $note,
                'submitted_at' => now()->toDateTimeString(),
            ],
        ]);
    }

    /**
     * Approve a pending deposit: credit the wallet exactly once.
     * Idempotent — re-approving a completed/rejected transaction is a no-op.
     */
    public function approveDeposit(int $transactionId, ?string $adminNotes = null): WalletTransaction
    {
        return DB::transaction(function () use ($transactionId, $adminNotes) {
            /** @var WalletTransaction $txn */
            $txn = WalletTransaction::query()->lockForUpdate()->findOrFail($transactionId);

            if ($txn->status !== WalletTransaction::STATUS_PENDING) {
                return $txn;
            }

            $meta = $txn->meta ?? [];
            $meta['verified_at'] = now()->toDateTimeString();
            $meta['verified_by'] = auth()->id();
            $meta['admin_notes'] = $adminNotes;

            $this->applyBalance(
                walletId: $txn->wallet_id,
                transaction: $txn,
                delta: (float) $txn->amount,
                status: WalletTransaction::STATUS_COMPLETED,
                meta: $meta,
            );

            return $txn->refresh();
        });
    }

    public function rejectDeposit(int $transactionId, ?string $reason = null): WalletTransaction
    {
        return DB::transaction(function () use ($transactionId, $reason) {
            /** @var WalletTransaction $txn */
            $txn = WalletTransaction::query()->lockForUpdate()->findOrFail($transactionId);

            if ($txn->status !== WalletTransaction::STATUS_PENDING) {
                return $txn;
            }

            $meta = $txn->meta ?? [];
            $meta['rejected_at'] = now()->toDateTimeString();
            $meta['rejected_by'] = auth()->id();
            $meta['admin_notes'] = $reason;

            $txn->update([
                'status' => WalletTransaction::STATUS_REJECTED,
                'meta' => $meta,
            ]);

            return $txn->refresh();
        });
    }

    /**
     * Debit the user's wallet for a purchase inside the caller's DB
     * transaction. Locks the row so concurrent checkouts cannot overspend.
     *
     * @throws InsufficientWalletBalanceException
     */
    public function purchaseWithWallet(User $user, float $amount, string $description): WalletTransaction
    {
        $amount = round($amount, 2);

        return DB::transaction(function () use ($user, $amount, $description) {
            $wallet = Wallet::where('user_id', $user->id)->lockForUpdate()->first();

            if (! $wallet || ! $wallet->hasSufficientBalance($amount)) {
                throw new InsufficientWalletBalanceException('Insufficient wallet balance.');
            }

            $txn = $wallet->transactions()->make([
                'user_id' => $user->id,
                'type' => WalletTransaction::TYPE_PURCHASE,
                'status' => WalletTransaction::STATUS_COMPLETED,
                'description' => $description,
            ]);

            $this->applyBalance(walletId: $wallet->id, transaction: $txn, delta: -$amount);

            return $txn->refresh();
        });
    }

    /**
     * Credit a refund back to the user's wallet inside the caller's DB
     * transaction.
     */
    public function refundToWallet(User $user, float $amount, string $description, array $meta = []): WalletTransaction
    {
        $amount = round($amount, 2);

        return DB::transaction(function () use ($user, $amount, $description, $meta) {
            $wallet = $this->getOrCreateWallet($user);

            $txn = $wallet->transactions()->make([
                'user_id' => $user->id,
                'type' => WalletTransaction::TYPE_REFUND,
                'status' => WalletTransaction::STATUS_COMPLETED,
                'description' => $description,
            ]);

            $this->applyBalance(walletId: $wallet->id, transaction: $txn, delta: $amount, meta: $meta);

            return $txn->refresh();
        });
    }

    /**
     * Atomically move the wallet balance and persist the ledger entry with
     * the resulting balance snapshot.
     */
    private function applyBalance(int $walletId, WalletTransaction $transaction, float $delta, string $status = WalletTransaction::STATUS_COMPLETED, array $meta = []): void
    {
        /** @var Wallet $wallet */
        $wallet = Wallet::query()->lockForUpdate()->findOrFail($walletId);

        $newBalance = round(((float) $wallet->balance) + $delta, 2);

        $wallet->update(['balance' => max(0, $newBalance)]);

        $transaction->forceFill([
            'wallet_id' => $wallet->id,
            'user_id' => $transaction->user_id ?? $wallet->user_id,
            'amount' => round($delta, 2),
            'balance_after' => max(0, $newBalance),
            'status' => $status,
            'meta' => $meta ?: $transaction->meta,
        ])->save();
    }

    public function getUserTransactions(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return WalletTransaction::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Admin listing of all wallet transactions with optional filters.
     */
    public function getTransactions(array $params): LengthAwarePaginator
    {
        $page = isset($params['per_page']) ? intval($params['per_page']) : 10;

        return WalletTransaction::query()
            ->with(['user:id,name,email'])
            ->when($params['search'] ?? null, function ($query) use ($params) {
                return $query->where(function ($q) use ($params) {
                    $q->where('transaction_id', 'LIKE', '%'.$params['search'].'%')
                        ->orWhere('amount', 'LIKE', '%'.$params['search'].'%')
                        ->orWhereHas('user', function ($user) use ($params) {
                            $user->where('name', 'LIKE', '%'.$params['search'].'%')
                                ->orWhere('email', 'LIKE', '%'.$params['search'].'%');
                        });
                });
            })
            ->when($params['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($params['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->when($params['date_from'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
            ->when($params['date_to'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '<=', $date))
            ->orderByDesc('created_at')
            ->paginate($page);
    }
}
