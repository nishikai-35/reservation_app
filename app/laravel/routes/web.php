<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoomCalendarController;
use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PasswordSetupController;
use App\Http\Controllers\ReservationImportController;
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


// トークンルート
Route::get(
    '/password/setup/{token}',
    [PasswordSetupController::class, 'create']
)->name('password.setup');

Route::post(
    '/password/setup',
    [PasswordSetupController::class, 'store']
)->name('password.setup.store');


// 予約フォームルート
Route::get('/booking',
    [BookingController::class,'create']
)
    ->name('booking.create');

Route::post(
    '/booking',
    [BookingController::class, 'store']
)->name('booking.store');


// 空室検索・料金計算(API)
Route::post(
    '/booking/search',
    [BookingController::class, 'search']
)->name('booking.search');

Route::post(
    '/booking/calculate',
    [BookingController::class, 'calculatePrice']
)->name('booking.calculate');


// 予約フォーム登録完了ルート
Route::get('/booking/complete', function () {
    return Inertia::render(
        'Booking/Complete'
    );
})->name('booking.complete');


// 認証グループ(管理者)
Route::middleware(['auth', 'role:admin'])->group(function () {

    // users管理ルート
    Route::get('/users', [UserController::class, 'index'])
        ->name('users.index');

    Route::get('/users/create', [UserController::class, 'create'])
        ->name('users.create');

    Route::post('/users', [UserController::class, 'store'])
        ->name('users.store');

    Route::delete('/users/{user}', [UserController::class, 'destroy'])
        ->name('users.destroy');

    // roomsルート
    Route::resource('rooms', RoomController::class);

    // Analysisルート
    Route::get('/analysis', [AnalysisController::class, 'index'])
        ->name('analysis.index');

    Route::get('/analysis/export', [AnalysisController::class, 'export'])
        ->name('analysis.export');

    Route::get('/analysis/daily', [AnalysisController::class, 'daily'])
        ->name('analysis.daily');

    // インポートルート
    Route::get('/reservations/import', [ReservationImportController::class, 'index'])
        ->name('reservations.import');

    Route::post('/reservations/import', [ReservationImportController::class, 'store'])
        ->name('reservations.import.store');

    Route::post('/reservations/preview', [ReservationImportController::class, 'preview'])
        ->name('reservations.import.preview');
});


// 認証グループ(ログインユーザー共通)
Route::middleware('auth')->group(function () {

    // Users編集
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])
        ->name('users.edit');

    Route::put('/users/{user}', [UserController::class, 'update'])
        ->name('users.update');

    // proflileルート
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

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
});

require __DIR__.'/auth.php';
