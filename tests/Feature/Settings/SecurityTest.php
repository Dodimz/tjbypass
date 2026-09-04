<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

test('password can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->put(route('change-password.update'), [
            'current_password' => 'password',
            'password' => 'NewSecurePass123',
            'password_confirmation' => 'NewSecurePass123',
        ]);

    $response->assertSessionHasNoErrors();

    expect(Hash::check('NewSecurePass123', $user->refresh()->password))->toBeTrue();
});

test('correct password must be provided to update password', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->put(route('change-password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'NewSecurePass123',
            'password_confirmation' => 'NewSecurePass123',
        ]);

    $response->assertSessionHasErrors('current_password');

    expect(Hash::check('password', $user->refresh()->password))->toBeTrue();
});
