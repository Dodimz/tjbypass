<?php

use App\Models\Setting;
use App\Models\User;
use Modules\Billing\Services\PaymentService;
use Modules\Service\Enums\ServiceOrderStatus;
use Modules\Service\Models\Service;
use Modules\Service\Models\ServiceOrder;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;
use function Pest\Laravel\post;

uses(Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    Illuminate\Support\Facades\Storage::disk('public')->put('installed', 'true');

    Setting::create(['type' => 'system', 'sub_type' => 'collaborative', 'title' => 'System', 'fields' => [
        'name' => 'Test App',
        'title' => 'Test App',
        'author' => 'Test',
        'description' => 'Test app description',
        'keywords' => 'test',
        'frontend_theme' => 1,
        'instructor_revenue' => 70,
        'selling_currency' => 'USD',
        'selling_tax' => 0,
    ]]);
});

function serviceAdmin(): User
{
    return User::factory()->create(['role' => 'admin']);
}

function serviceTechnician(): User
{
    return User::factory()->create(['role' => 'instructor']);
}

function publishedService(?User $technician = null): Service
{
    return Service::create([
        'user_id' => serviceAdmin()->id,
        'technician_id' => $technician?->id,
        'title' => 'AC Repair Pro',
        'price' => 200,
        'delivery_days' => 3,
        'status' => 'published',
    ]);
}

function paidOrder(User $buyer, ?Service $service = null): ServiceOrder
{
    $service ??= publishedService();

    return ServiceOrder::create([
        'user_id' => $buyer->id,
        'technician_id' => $service->technician_id,
        'service_id' => $service->id,
        'price' => 200,
        'tax' => 0,
        'total' => 200,
        'status' => ServiceOrderStatus::PAID,
        'paid_at' => now(),
    ]);
}

it('allows admin to create a service', function () {
    actingAs(serviceAdmin());

    post(route('services.store'), [
        'title' => 'Logo Design Pro',
        'short_description' => 'A professional logo design service',
        'description' => '<p>Full logo package</p>',
        'price' => 149.99,
        'delivery_days' => 5,
        'status' => 'published',
    ])->assertRedirect(route('services.index'));

    $service = Service::where('slug', 'logo-design-pro')->first();
    expect($service)->not->toBeNull()
        ->and($service->uuid)->not->toBeEmpty()
        ->and((float) $service->price)->toBe(149.99)
        ->and($service->status)->toBe('published');
});

it('assigns the creating admin as default technician when none is selected', function () {
    $admin = serviceAdmin();
    actingAs($admin);

    post(route('services.store'), [
        'title' => 'Default Tech Service',
        'price' => 99,
        'delivery_days' => 2,
        'status' => 'published',
    ])->assertRedirect(route('services.index'));

    $service = Service::where('slug', 'default-tech-service')->first();

    expect($service->technician_id)->toBe($admin->id)
        ->and($service->technician->id)->toBe($admin->id);
});

it('resets the technician to the admin when cleared on update', function () {
    $admin = serviceAdmin();
    $service = publishedService(serviceTechnician());

    actingAs($admin)
        ->post(route('services.update', $service->uuid), [
            'title' => $service->title,
            'price' => 100,
            'delivery_days' => 3,
            'status' => 'published',
            'technician_id' => '',
        ])
        ->assertRedirect(route('services.index'));

    expect($service->refresh()->technician_id)->toBe($admin->id);
});

it('generates a unique slug when the title is taken', function () {
    actingAs(serviceAdmin());

    foreach (['Logo Design', 'Logo Design'] as $title) {
        post(route('services.store'), [
            'title' => $title,
            'price' => 50,
            'delivery_days' => 2,
            'status' => 'draft',
        ])->assertRedirect(route('services.index'));
    }

    expect(Service::where('title', 'Logo Design')->count())->toBe(2)
        ->and(Service::pluck('slug')->unique()->count())->toBe(2);
});

it('shows only published services on the public listing', function () {
    $author = serviceAdmin();

    Service::create([
        'user_id' => $author->id,
        'title' => 'Published Service',
        'price' => 100,
        'delivery_days' => 3,
        'status' => 'published',
    ]);

    Service::create([
        'user_id' => $author->id,
        'title' => 'Draft Service',
        'price' => 100,
        'delivery_days' => 3,
        'status' => 'draft',
    ]);

    get(route('services.guest.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('services.data', 1)
            ->where('services.data.0.title', 'Published Service'));
});

it('creates a paid service order through the payment flow for online payments', function () {
    $buyer = User::factory()->create(['role' => 'student']);
    $technician = serviceTechnician();
    $service = publishedService($technician);

    // Simulate what PaymentService::coursesBuy does when a gateway confirms payment.
    app(PaymentService::class)->coursesBuy(
        paymentMethod: 'stripe',
        item_type: 'service',
        item_id: $service->uuid,
        transactionId: 'txn_test_123',
        taxAmount: 10.0,
        totalPrice: 210.0,
        couponCode: null,
        user_id: $buyer->id,
    );

    $order = ServiceOrder::where('user_id', $buyer->id)->first();
    expect($order)->not->toBeNull()
        ->and($order->service_id)->toBe($service->id)
        ->and($order->status)->toBe(ServiceOrderStatus::PAID)
        ->and($order->paid_at)->not->toBeNull()
        ->and($order->technician_id)->toBe($technician->id)
        ->and($order->total)->toBe(210.0)
        ->and(Modules\Billing\Models\PaymentHistory::where('transaction_id', 'txn_test_123')->exists())->toBeTrue()
        ->and($technician->notifications()->count())->toBe(1);
});

it('keeps offline orders pending until reviewed', function () {
    $buyer = User::factory()->create(['role' => 'student']);

    $service = Service::create([
        'user_id' => serviceAdmin()->id,
        'title' => 'Content Writing',
        'price' => 80,
        'delivery_days' => 7,
        'status' => 'published',
    ]);

    app(PaymentService::class)->coursesBuy(
        paymentMethod: 'offline',
        item_type: 'service',
        item_id: $service->uuid,
        transactionId: 'txn_offline_1',
        taxAmount: 0.0,
        totalPrice: 80.0,
        couponCode: null,
        user_id: $buyer->id,
    );

    expect(ServiceOrder::first()->status)->toBe(ServiceOrderStatus::PENDING);
});

it('lets the assigned technician work a paid order through to delivery', function () {
    $buyer = User::factory()->create(['role' => 'student']);
    $technician = serviceTechnician();
    $service = publishedService($technician);
    $order = paidOrder($buyer, $service);

    actingAs($technician);

    post(route('services.orders.start', $order->uuid))->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe(ServiceOrderStatus::IN_PROGRESS)
        ->and($order->started_at)->not->toBeNull();

    post(route('services.orders.deliver', $order->uuid), ['delivery_note' => 'Unit repaired'])->assertRedirect();

    $order->refresh();
    expect($order->status)->toBe(ServiceOrderStatus::DELIVERED)
        ->and($order->delivered_at)->not->toBeNull()
        ->and($order->delivery_note)->toBe('Unit repaired');
});

it('lets the buyer confirm completion of a delivered order', function () {
    $buyer = User::factory()->create(['role' => 'student']);
    $technician = serviceTechnician();
    $order = paidOrder($buyer, publishedService($technician));
    $order->update([
        'status' => ServiceOrderStatus::DELIVERED,
        'delivered_at' => now(),
    ]);

    actingAs($buyer)
        ->post(route('services.orders.complete', $order->uuid))
        ->assertRedirect();

    expect($order->refresh()->status)->toBe(ServiceOrderStatus::COMPLETED);
});

it('lets the admin complete an order directly while it is in progress', function () {
    $buyer = User::factory()->create(['role' => 'student']);
    $order = paidOrder($buyer);
    $order->update(['status' => ServiceOrderStatus::IN_PROGRESS, 'started_at' => now()]);

    actingAs(serviceAdmin())
        ->post(route('services.orders.complete', $order->uuid))
        ->assertRedirect();

    expect($order->refresh()->status)->toBe(ServiceOrderStatus::COMPLETED);
});

it('forbids another technician from starting the order', function () {
    $buyer = User::factory()->create(['role' => 'student']);
    $order = paidOrder($buyer, publishedService(serviceTechnician()));

    actingAs(serviceTechnician())
        ->post(route('services.orders.start', $order->uuid))
        ->assertForbidden();

    expect($order->refresh()->status)->toBe(ServiceOrderStatus::PAID);
});

it('forbids the buyer from completing before delivery', function () {
    $buyer = User::factory()->create(['role' => 'student']);
    $order = paidOrder($buyer);

    actingAs($buyer)
        ->post(route('services.orders.complete', $order->uuid))
        ->assertForbidden();

    expect($order->refresh()->status)->toBe(ServiceOrderStatus::PAID);
});

it('refunds the buyer wallet when the admin cancels a paid order', function () {
    $buyer = User::factory()->create(['role' => 'student']);
    $order = paidOrder($buyer);

    actingAs(serviceAdmin())
        ->post(route('services.orders.cancel', $order->uuid))
        ->assertRedirect();

    expect($order->refresh()->status)->toBe(ServiceOrderStatus::CANCELLED)
        ->and((float) $buyer->wallet->balance)->toBe(200.0)
        ->and(Modules\Billing\Models\WalletTransaction::where('user_id', $buyer->id)->where('type', 'refund')->count())->toBe(1);
});

it('does not refund when cancelling an unpaid pending order', function () {
    $buyer = User::factory()->create(['role' => 'student']);
    $service = publishedService();

    $order = ServiceOrder::create([
        'user_id' => $buyer->id,
        'technician_id' => $service->technician_id,
        'service_id' => $service->id,
        'price' => 200,
        'tax' => 0,
        'total' => 200,
        'status' => ServiceOrderStatus::PENDING,
    ]);

    actingAs(serviceAdmin())
        ->post(route('services.orders.cancel', $order->uuid))
        ->assertRedirect();

    expect($order->refresh()->status)->toBe(ServiceOrderStatus::CANCELLED)
        ->and($buyer->wallet()->count())->toBe(0);
});
