<?php

use Illuminate\Support\Facades\Route;
use Modules\Service\Http\Controllers\ServiceController;
use Modules\Service\Http\Controllers\ServiceOrderController;

// Public listing/detail routes are registered in the app's routes/web.php
// (above the inner-page catch-all), following the Job Circulars convention.

// Buyer routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('my/services', [ServiceOrderController::class, 'my_orders'])->name('services.my-orders');
    Route::post('my/services/{uuid}/complete', [ServiceOrderController::class, 'complete'])->name('services.orders.complete');
});

// Order workspace: admins see all orders, technicians see their assigned orders.
// Completion shares a single endpoint: buyer confirms delivery, or the
// technician/admin completes directly (permission checked in the controller).
Route::middleware(['auth', 'role:admin,instructor'])->prefix('dashboard/services')->name('services.orders.')->group(function () {
    Route::get('orders', [ServiceOrderController::class, 'index'])->name('index');
    Route::post('{uuid}/start', [ServiceOrderController::class, 'start'])->name('start');
    Route::post('{uuid}/deliver', [ServiceOrderController::class, 'deliver'])->name('deliver');
});

// Admin routes
Route::middleware(['auth', 'role:admin'])->prefix('dashboard/services')->name('services.')->group(function () {
    Route::get('/', [ServiceController::class, 'index'])->name('index');
    Route::get('create', [ServiceController::class, 'create'])->name('create');
    Route::post('/', [ServiceController::class, 'store'])->name('store');
    Route::get('{uuid}/edit', [ServiceController::class, 'edit'])->name('edit');
    Route::post('{uuid}', [ServiceController::class, 'update'])->name('update');
    Route::delete('{uuid}', [ServiceController::class, 'destroy'])->name('destroy');

    Route::post('orders/{uuid}/cancel', [ServiceOrderController::class, 'cancel'])->name('orders.cancel');
});
