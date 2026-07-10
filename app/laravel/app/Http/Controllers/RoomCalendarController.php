<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Reservation;
use Inertia\Inertia;

class RoomCalendarController extends Controller
{
    public function index()
    {
        return Inertia::render('RoomCalendar', [
            'rooms' => Room::orderBy('room_number')->get(),
            'reservations' => Reservation::with('room')->get(),
        ]);
    }
}