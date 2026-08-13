<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Room;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 今日の日付取得
        $today = now()->toDateString();

        // 本日チェックイン
        $checkinReservations = Reservation::with('room')
            ->whereDate('checkin_date', $today)
            ->whereIn('status', [1])
            ->orderBy('checkin_date')
            ->get();

        // 本日チェックアウト
        $checkoutReservations = Reservation::with('room')
            ->whereDate('checkout_date', $today)
            ->whereIn('status', [1, 2, 3, 4])
            ->orderBy('checkout_date')
            ->get();

        // 滞在中
        $stayingReservations = Reservation::with('room')
            ->where('checkin_date', '<=', $today)
            ->where('checkout_date', '>', $today)
            ->whereIn('status', [2, 3, 4])
            ->orderBy('room_id')
            ->get();

        // KPI
        $totalRooms = Room::count();
        $todayCheckinCount = $checkinReservations->count();
        $todayCheckoutCount = $checkoutReservations->count();
        $stayingCount = $stayingReservations->count();

        return Inertia::render('Dashboard', [

            'today' => $today,
            'rooms' => Room::orderBy('room_number')->get(),
            'totalRooms' => $totalRooms,
            'todayCheckinCount' => $todayCheckinCount,
            'todayCheckoutCount' => $todayCheckoutCount,
            'stayingCount' => $stayingCount,
            'checkinReservations' => $checkinReservations,
            'checkoutReservations' => $checkoutReservations,
            'stayingReservations' => $stayingReservations,
        ]);
    }
}