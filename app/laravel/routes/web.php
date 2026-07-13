<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoomCalendarController;
use App\Http\Controllers\AnalysisController;
use App\Mail\TestMail;

use Illuminate\Support\Facades\Mail;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;

use Inertia\Inertia;

// ログインルート
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// ダッシュボードルート
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');


// メール送信ルート
Route::get('/mail-test', function () {

    Mail::to('test@example.com')
        ->send(new TestMail());

    return 'メール送信完了';
});


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

    Route::get('/reservations/{reservation}/edit', [ReservationController::class, 'edit'])
        ->name('reservations.edit');

    Route::put('/reservations/{reservation}', [ReservationController::class, 'update'])
        ->name('reservations.update');

    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy'])
        ->name('reservations.destroy');

    Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])
        ->name('reservations.updateStatus');

    // Calendarルート
    Route::get('/room-calendar', [RoomCalendarController::class, 'index'])
        ->name('room-calendar.index');

    // Analysisルート
    Route::get('/analysis', [AnalysisController::class, 'index'])
        ->name('analysis.index');

    Route::get('/analysis/export', [AnalysisController::class, 'export'])
        ->name('analysis.export');
});

require __DIR__.'/auth.php';
