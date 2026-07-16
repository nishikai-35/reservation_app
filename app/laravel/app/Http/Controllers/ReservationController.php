<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Room;
use App\Mail\ReservationCreatedMail;
use App\Mail\AdminReservationNotificationMail;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

use Inertia\Inertia;

class ReservationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // 予約と一緒に部屋情報も取得
        $reservations = Reservation::with('room')
            ->when($request->reservation_number, function ($query, $reservationNumber) {
                $query->where('reservation_number', 'like', "%{$reservationNumber}%");
            })
            ->when($request->guest_name, function ($query, $guestName) {
                $query->where('guest_name', 'like', "%{$guestName}%");
            })
            ->when($request->room_id, function ($query, $roomId) {
                $query->where('room_id', $roomId);
            })
            ->when($request->checkin_date, function ($query, $checkinDate) {
                $query->whereDate('checkin_date', $checkinDate);
            })
            ->when($request->checkout_date, function ($query, $checkoutDate) {
                $query->whereDate('checkout_date', $checkoutDate);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->orderBy('checkin_date')

            ->paginate(20)
            ->withQueryString();

            
        return Inertia::render('Reservations/Index', [
            'reservations' => $reservations,
            'rooms' => Room::orderBy('room_number')->get(),
            'filters' => $request->only([
                'reservation_number',
                'guest_name',
                'room_id',
                'checkin_date',
                'checkout_date',
                'status',
            ]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 入力チェック
        $validated = $request->validate([
            'room_id' => ['required', 'exists:rooms,id'],
            'checkin_date' => ['required', 'date'],
            'checkout_date' => ['required', 'date', 'after:checkin_date'],
            'guest_count' => ['required', 'integer', 'min:1'],
            'adult_count' => ['nullable', 'integer', 'min:0'],
            'child_count' => ['nullable', 'integer', 'min:0'],
            'amount' => ['nullable', 'integer', 'min:0'],
            'payment_status' => ['nullable', 'integer'],
            'payment_method' => ['nullable', 'string', 'max:255'],
            'guest_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'note' => ['nullable', 'string'],
            'status' => ['required', 'integer'],
        ]);

        // 予約番号の自動採番、予約日自動セット
        $validated['reservation_number'] = 'R' . now()->format('YmdHis');
        $validated['reservation_date'] = now()->toDateString();
        $validated['booking_site'] = '直接予約';

        $validated['adult_count'] = $validated['adult_count'] ?? 0;
        $validated['child_count'] = $validated['child_count'] ?? 0;
        $validated['amount'] = $validated['amount'] ?? 0;
        $validated['payment_status'] = $validated['payment_status'] ?? 0;

        // 重複チェック
        $exists = Reservation::where('room_id', $validated['room_id'])
            ->where('status', '!=', 9)
            ->where('checkin_date', '<', $validated['checkout_date'])
            ->where('checkout_date', '>', $validated['checkin_date'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'room_id' => '指定された期間は既に予約があります。',
            ])->withInput();
        }

        
        // 予約登録
        $reservation = Reservation::create($validated);

        // 予約者へメール送信
        if ($reservation->email) {
            Mail::to($reservation->email)
                ->send(
                    new ReservationCreatedMail($reservation)
                );
        }

        // 管理者へ通知メール送信
        Mail::to('admin@example.com')
            ->send(
                new AdminReservationNotificationMail($reservation)
            );


        return redirect()
            ->route('reservations.index')
            ->with('success', '予約を登録しました。');
    }

    /**
     * Display the specified resource.
     */
    public function show(Reservation $reservation)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Reservation $reservation)
    {
        return Inertia::render('Reservations/Edit', [
            'reservation' => $reservation,
            'rooms' => Room::orderBy('room_number')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'room_id' => ['required', 'exists:rooms,id'],
            'checkin_date' => ['required', 'date'],
            'checkout_date' => ['required', 'date', 'after:checkin_date'],
            'guest_count' => ['required', 'integer', 'min:1'],
            'adult_count' => ['nullable', 'integer', 'min:0'],
            'child_count' => ['nullable', 'integer', 'min:0'],
            'amount' => ['nullable', 'integer', 'min:0'],
            'payment_status' => ['nullable', 'integer'],
            'payment_method' => ['nullable', 'string', 'max:255'],
            'guest_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'note' => ['nullable', 'string'],
        ]);

        $exists = Reservation::where('room_id', $validated['room_id'])
            ->where('status', '!=', 9)
            ->where('id', '!=', $reservation->id)
            ->where('checkin_date', '<', $validated['checkout_date'])
            ->where('checkout_date', '>', $validated['checkin_date'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'room_id' => '指定された期間は既に予約があります。',
            ])->withInput();
        }

        $validated['adult_count'] = $validated['adult_count'] ?? 0;
        $validated['child_count'] = $validated['child_count'] ?? 0;
        $validated['amount'] = $validated['amount'] ?? 0;
        $validated['payment_status'] = $validated['payment_status'] ?? 0;
        $validated['status'] = 1;

        // 予約内容保存
        $reservation->update($validated);

        return redirect()
            ->route('reservations.index')
            ->with('success', '予約を更新しました。');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Reservation $reservation)
    {
        $reservation->delete();

        return redirect()
            ->route('reservations.index')
            ->with('success', '予約を削除しました。');
    }


    public function updateStatus(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => ['required', 'integer', 'in:1,2,3,4,5,8,9'],
        ]);
    
        $reservation->update([
            'status' => $validated['status'],
        ]);
    
        return back()->with('success', 'ステータスを更新しました。');
    }
}