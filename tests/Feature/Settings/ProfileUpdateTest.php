<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('profile page is displayed', function () {
    $user = User::factory()->create();
    seedSmtpSetting();

    $response = $this
        ->actingAs($user)
        ->get(route('student.index', ['tab' => 'profile']));

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create(['name' => 'Old Name']);

    $response = $this
        ->actingAs($user)
        ->post(route('student.profile.update'), [
            'name' => 'Test User',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    expect($user->refresh()->name)->toBe('Test User');
});

test('name is required when updating the profile', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('student.profile.update'), [
            'name' => '',
        ]);

    $response->assertSessionHasErrors('name');

    expect($user->refresh()->name)->toBe($user->name);
});
