<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = now()->toDateString();

        $checkinReservations = Reservation::with('room')
            ->whereDate('checkin_date', $today)
            ->whereNotIn('status', [5, 9])
            ->orderBy('checkin_date')
            ->get();

        $checkoutReservations = Reservation::with('room')
            ->whereDate('checkout_date', $today)
            ->whereNotIn('status', [5, 9])
            ->orderBy('checkout_date')
            ->get();

        $stayingGuestCount = Reservation::where('checkin_date', '<=', $today)
            ->where('checkout_date', '>', $today)
            ->whereNotIn('status', [5, 9])
            ->sum('guest_count');

        return Inertia::render('Dashboard', [
            'today' => $today,
            'checkinReservations' => $checkinReservations,
            'checkoutReservations' => $checkoutReservations,
            'stayingGuestCount' => $stayingGuestCount,
        ]);
    }
}