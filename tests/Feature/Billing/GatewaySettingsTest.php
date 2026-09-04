<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use App\Models\Setting;
use App\Models\User;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    Storage::disk('public')->put('installed', '1');

    $this->admin = User::factory()->create(['role' => 'admin']);
});

it('allows disabling a gateway without credentials', function () {
    $setting = Setting::query()->create([
        'type' => 'payment',
        'sub_type' => 'stripe',
        'title' => 'Stripe',
        'fields' => [
            'type' => 'stripe',
            'active' => true,
            'currency' => 'USD',
            'test_mode' => true,
            'test_public_key' => 'pk_test_x',
            'test_secret_key' => 'sk_test_x',
        ],
    ]);

    $response = $this->actingAs($this->admin)->post(
        route('payment-gateways.update', $setting->id),
        [
            'type' => 'stripe',
            'active' => false,
            'test_mode' => false,
            // no keys provided
        ],
    );

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    expect($setting->refresh()->fields['active'])->toBeFalse();
});

it('accepts string booleans like an inertia form submission', function () {
    $setting = Setting::query()->create([
        'type' => 'payment',
        'sub_type' => 'offline',
        'title' => 'Offline',
        'fields' => [
            'type' => 'offline',
            'active' => true,
            'payment_instructions' => 'Wire transfer details',
            'payment_details' => 'Bank account info',
        ],
    ]);

    $response = $this->actingAs($this->admin)->post(
        route('payment-gateways.update', $setting->id),
        [
            'type' => 'offline',
            'active' => 'false',
            'test_mode' => 'false',
        ],
    );

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    expect($setting->refresh()->fields['active'])->toBeFalse();
});

it('still requires credentials when enabling a stripe gateway', function () {
    $setting = Setting::query()->create([
        'type' => 'payment',
        'sub_type' => 'stripe',
        'title' => 'Stripe',
        'fields' => ['type' => 'stripe', 'active' => false],
    ]);

    $response = $this->actingAs($this->admin)->post(
        route('payment-gateways.update', $setting->id),
        [
            'type' => 'stripe',
            'active' => true,
            'currency' => 'USD',
            'test_mode' => false,
            // live keys missing
        ],
    );

    $response->assertSessionHasErrors(['live_public_key', 'live_secret_key']);
});
