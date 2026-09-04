<?php

namespace Modules\Billing\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Models\TempStore;
use App\Services\SettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Transaction;
use Modules\Billing\Services\PaymentService;

class MidtransController extends Controller
{
    private $midtrans;

    private $serverKey;

    private $clientKey;

    public function __construct(
        private PaymentService $payment,
        private SettingsService $settingsService,
    ) {
        $this->midtrans = $this->settingsService->getSetting(['type' => 'payment', 'sub_type' => 'midtrans']);
        $this->serverKey = $this->midtrans->fields['test_mode']
            ? $this->midtrans->fields['test_server_key']
            : $this->midtrans->fields['live_server_key'];
        $this->clientKey = $this->midtrans->fields['test_mode']
            ? $this->midtrans->fields['test_client_key']
            : $this->midtrans->fields['live_client_key'];

        $this->configureMidtrans();
    }

    private function configureMidtrans(): void
    {
        Config::$serverKey = $this->serverKey;
        Config::$clientKey = $this->clientKey;
        Config::$isProduction = ! $this->midtrans->fields['test_mode'];
        Config::$isSanitized = config('midtrans.is_sanitized', true);
        Config::$is3ds = config('midtrans.is_3ds', true);
    }

    public function payment(Request $request): JsonResponse
    {
        $user = Auth::user();
        $checkoutItem = $this->payment->getCheckoutItem(
            $request->item_type,
            $request->item_id,
            $request->coupon
        );

        $orderId = 'MID-'.uniqid();

        $params = [
            'transaction_details' => [
                'order_id' => $orderId,
                'gross_amount' => round($checkoutItem['finalPrice']),
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
            ],
            'item_details' => [
                [
                    'id' => $orderId,
                    'price' => round($checkoutItem['finalPrice']),
                    'quantity' => 1,
                    'name' => ucfirst($request->item_type).' Purchase',
                ],
            ],
            'callbacks' => [
                'finish' => route('payments.midtrans.success'),
            ],
        ];

        try {
            $snapToken = Snap::createTransaction($params);

            setTempStore([
                'user_id' => $user->id,
                'properties' => [
                    'from' => $request->from,
                    'item_type' => $request->item_type,
                    'item_id' => $request->item_id,
                    'order_id' => $orderId,
                    'tax_amount' => $checkoutItem['taxAmount'],
                    'coupon_code' => $checkoutItem['coupon'] ? $checkoutItem['coupon']->code : null,
                ],
            ]);

            return response()->json([
                'snap_token' => $snapToken,
                'client_key' => $this->clientKey,
                'is_production' => ! $this->midtrans->fields['test_mode'],
            ]);
        } catch (\Throwable $th) {
            Log::error('MIDTRANS create transaction failed', ['error' => $th->getMessage()]);

            return response()->json([
                'error' => $th->getMessage(),
            ], 500);
        }
    }

    public function success(Request $request)
    {
        $user = Auth::user();
        $temp = getTempStore($user->id);

        $from = $temp->properties['from'];
        $item_type = $temp->properties['item_type'];
        $item_id = $temp->properties['item_id'];
        $orderId = $temp->properties['order_id'];
        $tax_amount = $temp->properties['tax_amount'];
        $coupon_code = $temp->properties['coupon_code'];

        if (! in_array($item_type, ['course', 'exam', 'service'])) {
            return redirect()->route('student.index', ['tab' => 'courses'])
                ->with('error', 'Invalid item type');
        }

        try {
            $status = Transaction::status($orderId);
            $transactionStatus = $status->transaction_status ?? '';

            if (in_array($transactionStatus, ['settlement', 'capture'])) {
                $this->payment->coursesBuy(
                    'midtrans',
                    $item_type,
                    $item_id,
                    $orderId,
                    $tax_amount,
                    (float) ($status->gross_amount ?? 0),
                    $coupon_code
                );

                if ($from == 'api') {
                    return redirect()->to(env('FRONTEND_URL').'/student');
                }

                return redirect()
                    ->to($this->payment->successRedirectUrl($item_type))
                    ->with('success', 'Congratulation! Your payment have completed');
            }

            return redirect()
                ->route('payments.index', ['from' => $from, 'item' => $item_type, 'id' => $item_id])
                ->with('error', 'Midtrans payment status: '.$transactionStatus.'. Please try again.');
        } catch (\Throwable $th) {
            Log::error('MIDTRANS success verify failed', ['error' => $th->getMessage()]);

            return redirect()
                ->route('payments.index', ['from' => $from, 'item' => $item_type, 'id' => $item_id])
                ->with('error', $th->getMessage());
        }
    }

    public function cancel()
    {
        $user = Auth::user();
        $temp = getTempStore($user->id);

        $from = $temp->properties['from'];
        $item_type = $temp->properties['item_type'];
        $item_id = $temp->properties['item_id'];

        return redirect()
            ->route('payments.index', ['from' => $from, 'item' => $item_type, 'id' => $item_id])
            ->with('error', 'Your payment has been cancelled, please try again later.');
    }

    public function notification(Request $request)
    {
        try {
            $serverKey = $this->serverKey;
            $orderId = $request->input('order_id');
            $statusCode = $request->input('status_code');
            $grossAmount = $request->input('gross_amount');
            $signatureKey = $request->input('signature_key');

            $calculatedSignature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

            if ($calculatedSignature !== $signatureKey) {
                Log::warning('MIDTRANS invalid notification signature', ['order_id' => $orderId]);

                return response()->json(['error' => 'Invalid signature'], 403);
            }

            $transactionStatus = $request->input('transaction_status');
            $fraudStatus = $request->input('fraud_status');

            Log::info('MIDTRANS notification received', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'fraud_status' => $fraudStatus,
            ]);

            if ($transactionStatus === 'settlement' || ($transactionStatus === 'capture' && $fraudStatus === 'accept')) {
                $existingPayment = \Modules\Billing\Models\PaymentHistory::where('transaction_id', $orderId)->first();

                if ($existingPayment) {
                    return response()->json(['status' => 'already_processed']);
                }

                $temp = TempStore::where('properties->order_id', $orderId)->first();

                if (! $temp) {
                    Log::warning('MIDTRANS notification temp store not found', ['order_id' => $orderId]);

                    return response()->json(['error' => 'Order not found'], 404);
                }

                $this->payment->coursesBuy(
                    'midtrans',
                    $temp->properties['item_type'],
                    $temp->properties['item_id'],
                    $orderId,
                    $temp->properties['tax_amount'],
                    (float) $grossAmount,
                    $temp->properties['coupon_code'],
                    (string) $temp->user_id
                );
            }

            return response()->json(['status' => 'ok']);
        } catch (\Throwable $th) {
            Log::error('MIDTRANS notification error', ['error' => $th->getMessage()]);

            return response()->json(['error' => 'Internal error'], 500);
        }
    }
}
