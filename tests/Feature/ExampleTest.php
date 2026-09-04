<?php

use Illuminate\Support\Facades\Storage;

it('redirects to the installer when the application is not installed', function () {
    Storage::fake('public');

    $this->get('/')
        ->assertRedirect(route('install.index'));
});
