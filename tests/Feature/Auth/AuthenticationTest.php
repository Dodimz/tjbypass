<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('login screen can be rendered', function () {
    $response = $this->get(route('login.index'));

    $response->assertOk();
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'recaptcha_status' => false,
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('category.courses', ['category' => 'all'], absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
        'recaptcha_status' => false,
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('logout'));

    $this->assertGuest();
    $response->assertRedirect(route('home'));
});

test('users are rate limited', function () {
    $user = User::factory()->create();

    foreach (range(1, 5) as $i) {
        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
            'recaptcha_status' => false,
        ]);
    }

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
        'recaptcha_status' => false,
    ]);

    $this->assertGuest();
    $response->assertSessionHasErrors('email');
});
