<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Modules\Service\Models\Service;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    Storage::disk('public')->put('installed', '1');
});

it('returns published services for the page builder collections api', function () {
    Service::query()->create([
        'user_id' => 1,
        'title' => 'Landing Page Design',
        'slug' => 'landing-page-design',
        'short_description' => 'Modern landing page design',
        'price' => 49.99,
        'delivery_days' => 5,
        'status' => 'published',
    ]);

    Service::query()->create([
        'user_id' => 1,
        'title' => 'Draft Service',
        'slug' => 'draft-service',
        'price' => 10,
        'status' => 'draft',
    ]);

    $response = $this->getJson('/api/collections/services/new');

    $response->assertSuccessful()
        ->assertJsonPath('success', true)
        ->assertJsonCount(1, 'collection')
        ->assertJsonPath('collection.0.title', 'Landing Page Design')
        ->assertJsonPath('collection.0.price', 49.99);
});

it('returns empty collection when no services are published', function () {
    $response = $this->getJson('/api/collections/services/new');

    $response->assertSuccessful()
        ->assertJsonPath('success', true)
        ->assertJsonCount(0, 'collection');
});
