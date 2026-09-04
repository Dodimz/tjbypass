<?php

use App\Enums\UserType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login.index'));
});

test('authenticated admins can visit the dashboard', function () {
    $user = User::factory()->create(['role' => UserType::ADMIN->value]);
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});
