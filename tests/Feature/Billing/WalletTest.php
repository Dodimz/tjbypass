<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Billing\Models\PaymentHistory;
use Modules\Billing\Models\Wallet;
use Modules\Billing\Models\WalletTransaction;
use Modules\Billing\Services\WalletService;
use Modules\Course\Models\Course;
use Modules\Course\Models\CourseCategory;
use Modules\Course\Models\CourseEnrollment;

uses(RefreshDatabase::class);

beforeEach(function () {
    Setting::create([
        'type' => 'system',
        'title' => 'System Settings',
        'fields' => [
            'name' => 'Test LMS',
            'frontend' => false,
            'selling_currency' => 'USD',
            'selling_tax' => 0,
            'instructor_revenue' => 50,
        ],
    ]);

    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->student = User::factory()->create(['role' => 'student']);

    $instructorUser = User::factory()->create(['role' => 'instructor']);
    $instructor = \App\Models\Instructor::create([
        'user_id' => $instructorUser->id,
        'status' => 'approved',
        'skills' => [],
        'biography' => 'Test biography',
        'resume' => '',
        'designation' => 'Instructor',
    ]);
    $instructorUser->update(['instructor_id' => $instructor->id]);

    $category = CourseCategory::create(['title' => 'Development', 'slug' => 'development']);

    $this->course = Course::create([
        'title' => 'Wallet Payment Course',
        'slug' => 'wallet-payment-course',
        'short_description' => 'Short description.',
        'level' => 'beginner',
        'language' => 'en',
        'pricing_type' => 'paid',
        'price' => 100,
        'status' => 'published',
        'expiry_type' => 'lifetime',
        'drip_content' => false,
        'user_id' => $instructorUser->id,
        'instructor_id' => $instructor->id,
        'course_category_id' => $category->id,
        'course_type' => 'general',
    ]);

    $this->walletService = app(WalletService::class);
});

it('creates a wallet and a pending deposit request', function () {
    $this->actingAs($this->student)
        ->post(route('wallet.deposit'), ['amount' => 50, 'note' => 'bank transfer'])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(Wallet::where('user_id', $this->student->id)->exists())->toBeTrue();
    expect((float) Wallet::where('user_id', $this->student->id)->value('balance'))->toBe(0.0);

    $txn = WalletTransaction::query()
        ->where('user_id', $this->student->id)
        ->first();

    expect($txn)->not->toBeNull();
    expect($txn->type)->toBe('deposit');
    expect($txn->status)->toBe('pending');
    expect((float) $txn->amount)->toBe(50.0);
});

it('rejects invalid deposit amounts', function () {
    $this->actingAs($this->student)
        ->post(route('wallet.deposit'), ['amount' => 0])
        ->assertSessionHasErrors('amount');

    expect(WalletTransaction::count())->toBe(0);
});

it('credits the wallet exactly once when verified', function () {
    $txn = $this->walletService->createDepositRequest($this->student, 75);

    $this->actingAs($this->admin)
        ->post(route('wallet-reports.verify', $txn->id))
        ->assertRedirect();

    expect((float) $this->student->fresh()->wallet->balance)->toBe(75.0);
    expect($txn->fresh()->status)->toBe('completed');
    expect((float) $txn->fresh()->balance_after)->toBe(75.0);

    // Re-verifying must not double credit (idempotent)
    $this->actingAs($this->admin)
        ->post(route('wallet-reports.verify', $txn->id))
        ->assertRedirect();

    expect((float) $this->student->fresh()->wallet->balance)->toBe(75.0);
});

it('does not credit the wallet when a deposit is rejected', function () {
    $txn = $this->walletService->createDepositRequest($this->student, 75);

    $this->actingAs($this->admin)
        ->post(route('wallet-reports.reject', $txn->id), ['admin_notes' => 'invalid proof'])
        ->assertRedirect();

    expect((float) $this->student->fresh()->wallet->balance)->toBe(0.0);
    expect($txn->fresh()->status)->toBe('rejected');
    expect($txn->fresh()->meta['admin_notes'])->toBe('invalid proof');
});

it('pays for a course with wallet balance', function () {
    Wallet::forceCreate(['user_id' => $this->student->id, 'balance' => 150]);

    $this->actingAs($this->student)
        ->post('/payments/wallet/payment', [
            'item_type' => 'course',
            'item_id' => (string) $this->course->id,
            'from' => 'web',
        ])
        ->assertRedirect();

    expect(CourseEnrollment::query()
        ->where('user_id', $this->student->id)
        ->where('course_id', $this->course->id)
        ->where('enrollment_type', 'paid')
        ->exists())->toBeTrue();

    $payment = PaymentHistory::query()
        ->where('user_id', $this->student->id)
        ->where('payment_type', 'wallet')
        ->first();

    expect($payment)->not->toBeNull();
    expect((float) $payment->amount)->toBe(100.0);

    expect((float) $this->student->fresh()->wallet->balance)->toBe(50.0);

    $purchaseTxn = WalletTransaction::query()
        ->where('user_id', $this->student->id)
        ->where('type', 'purchase')
        ->first();

    expect($purchaseTxn)->not->toBeNull();
    expect($purchaseTxn->status)->toBe('completed');
    expect((float) $purchaseTxn->amount)->toBe(-100.0);
});

it('refuses checkout when the balance is insufficient', function () {
    Wallet::forceCreate(['user_id' => $this->student->id, 'balance' => 10]);

    $this->actingAs($this->student)
        ->post('/payments/wallet/payment', [
            'item_type' => 'course',
            'item_id' => (string) $this->course->id,
            'from' => 'web',
        ])
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(CourseEnrollment::count())->toBe(0);
    expect(PaymentHistory::count())->toBe(0);
    expect((float) $this->student->fresh()->wallet->balance)->toBe(10.0);
});
