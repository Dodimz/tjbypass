<?php

use Illuminate\Support\Facades\Storage;

test('guests are redirected to the installer on a fresh application', function () {
    Storage::fake('public');

    $response = $this->get('/');

    $response->assertRedirect(route('install.index'));
});
