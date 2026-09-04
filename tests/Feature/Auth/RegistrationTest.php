<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('registration screen can be rendered', function () {
    $response = $this->get(route('register.index'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'recaptcha_status' => false,
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('student.index', ['tab' => 'courses'], absolute: false));

    expect(User::query()->where('email', 'test@example.com')->exists())->toBeTrue();
});
