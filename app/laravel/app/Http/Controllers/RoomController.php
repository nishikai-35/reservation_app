<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rooms = Room::orderby('room_number')
            ->paginate(10);

        return Inertia::render('Rooms/Index', [
            'rooms' => $rooms
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Rooms/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:255'],
            'room_number' => ['required', 'unique:rooms'],
            'capacity_min' => ['required', 'integer'],
            'capacity_max' => ['required', 'integer'],
            'adult_price' => ['required', 'integer', 'min:0'],
            'child_price' => ['required', 'integer', 'min:0'],
            'checkin_time' => ['required', 'date_format:H:i'],
            'checkout_time' => ['required', 'date_format:H:i'],
            'note' => ['nullable', 'string'],
        ]);

        Room::create($validated);

        return redirect()
            ->route('rooms.index')
            ->with('success', '部屋を登録しました');
    }

    /**
     * Display the specified resource.
     */
    public function show(Room $room)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Room $room)
    {
        return Inertia::render('Rooms/Edit', [
            'room' => $room
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => ['required', 'max:255'],
            'room_number' => [
                'required',
                Rule::unique('rooms')->ignore($room->id),
            ],

            'capacity_min' => ['required', 'integer'],
            'capacity_max' => ['required', 'integer'],
            'adult_price' => ['required', 'integer', 'min:0'],
            'child_price' => ['required', 'integer', 'min:0'],
            'checkin_time' => ['required', 'date_format:H:i'],
            'checkout_time' => ['required', 'date_format:H:i'],
            'note' => ['nullable', 'string'],
        ]);

        $room->update($validated);

        return redirect()
            ->route('rooms.index')
            ->with('success', '部屋情報を更新しました');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
            $room->delete();

            return redirect()
                ->route('rooms.index')
                ->with('success', '部屋を削除しました');
    }
}
