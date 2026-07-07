<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


// 認証グループ
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // roomsルート
    Route::resource('rooms', RoomController::class);

    // reservationsルート
    Route::get('/reservations', [ReservationController::class, 'index'])
    ->name('reservations.index');
    Route::post('/reservations', [ReservationController::class, 'store'])
    ->name('reservations.store');
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy'])
    ->name('reservations.destroy');
    Route::get('/reservations/{reservation}/edit', [ReservationController::class, 'edit'])
    ->name('reservations.edit');
    Route::put('/reservations/{reservation}', [ReservationController::class, 'update'])
    ->name('reservations.update');
});

require __DIR__.'/auth.php';
