<?php

namespace Modules\Billing\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\Billing\Services\WalletService;

class WalletReportController extends Controller
{
    public function __construct(
        private WalletService $walletService,
    ) {}

    public function index(Request $request)
    {
        $transactions = $this->walletService->getTransactions($request->all());

        return Inertia::render('Billing/reports/wallet', [
            'transactions' => $transactions,
            'filters' => $request->only(['status', 'search']),
            'currency' => app('system')->fields['selling_currency'] ?? 'USD',
        ]);
    }

    public function verify(Request $request, int $id)
    {
        $this->walletService->approveDeposit($id, $request->admin_notes);

        return back()->with('success', 'Deposit verified and wallet credited successfully.');
    }

    public function reject(Request $request, int $id)
    {
        $this->walletService->rejectDeposit($id, $request->admin_notes);

        return back()->with('success', 'Deposit rejected successfully.');
    }
}
