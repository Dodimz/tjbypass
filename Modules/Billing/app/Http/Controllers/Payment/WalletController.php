<?php

namespace Modules\Billing\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Modules\Billing\Models\WalletTransaction;
use Modules\Billing\Services\InsufficientWalletBalanceException;
use Modules\Billing\Services\PaymentService;
use Modules\Billing\Services\WalletService;

class WalletController extends Controller
{
    public function __construct(
        private WalletService $walletService,
        private PaymentService $payment,
        private SettingsService $settingsService,
    ) {}

    /**
     * Student wallet page: balance, deposit form, transaction history.
     */
    public function index()
    {
        $user = Auth::user();
        $this->walletService->getOrCreateWallet($user);

        $offlineSetting = $this->settingsService->getSetting(['type' => 'payment', 'sub_type' => 'offline']);

        return Inertia::render('Billing/wallet/index', [
            'balance' => $this->walletService->getBalance($user),
            'transactions' => $this->walletService->getUserTransactions($user),
            'currency' => app('system')->fields['selling_currency'] ?? 'USD',
            'payment_instructions' => $offlineSetting?->fields['payment_instructions'] ?? '',
            'payment_details' => $offlineSetting?->fields['payment_details'] ?? '',
        ]);
    }

    /**
     * Submit a deposit request (manual/bank transfer, pending admin approval).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1', 'max:1000000'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $this->walletService->createDepositRequest(
            Auth::user(),
            (float) $validated['amount'],
            $validated['note'] ?? null
        );

        return back()->with('success', 'Deposit request submitted. Your balance will be updated once our team verifies it.');
    }

    /**
     * Pay for a checkout item using the wallet balance.
     */
    public function pay(Request $request)
    {
        $request->validate([
            'item_type' => ['required', 'string', 'in:course,exam,service'],
            'item_id' => ['required', 'string'],
            'coupon' => ['nullable', 'string'],
            'from' => ['nullable', 'string'],
        ]);

        $checkoutItem = $this->payment->getCheckoutItem(
            $request->item_type,
            $request->item_id,
            $request->coupon
        );

        try {
            DB::transaction(function () use ($request, $checkoutItem) {
                $this->walletService->purchaseWithWallet(
                    Auth::user(),
                    (float) $checkoutItem['finalPrice'],
                    ucfirst($request->item_type).' purchase'
                );

                $this->payment->coursesBuy(
                    'wallet',
                    $request->item_type,
                    $request->item_id,
                    'WALLET-'.strtoupper(uniqid()),
                    (float) $checkoutItem['taxAmount'],
                    (float) $checkoutItem['finalPrice'],
                    $checkoutItem['coupon'] ? $checkoutItem['coupon']->code : null
                );
            });
        } catch (InsufficientWalletBalanceException $e) {
            return redirect()
                ->route('payments.index', ['from' => $request->from, 'item' => $request->item_type, 'id' => $request->item_id])
                ->with('error', 'Your wallet balance is not enough to complete this purchase.');
        }

        if ($request->item_type === 'service') {
            return redirect()
                ->route('services.my-orders')
                ->with('success', 'Congratulation! Your payment have completed');
        }

        return redirect()
            ->route('student.index', ['tab' => 'courses'])
            ->with('success', 'Congratulation! Your payment have completed');
    }

    /**
     * Pending deposit count badge helper for menus.
     */
    public static function pendingDepositsCount(): int
    {
        return WalletTransaction::query()
            ->where('type', WalletTransaction::TYPE_DEPOSIT)
            ->pending()
            ->count();
    }
}
