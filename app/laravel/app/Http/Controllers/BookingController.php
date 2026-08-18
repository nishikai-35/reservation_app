<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Reservation;
use App\Mail\ReservationCreatedMail;
use App\Mail\AdminReservationNotificationMail;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

use Carbon\Carbon;
use Inertia\Inertia;


class BookingController extends Controller
{
    public function create()
    {
        return Inertia::render('Booking/Create', [
            'rooms' => Room::orderBy('room_number')->get(),
        ]);
    }


    // 空室確認処理
    public function search(Request $request)
    {
        $validated = $request->validate([
            'checkin_date' => [
                'required',
                'date'
            ],
    
            'checkout_date' => [
                'required',
                'date',
                'after:checkin_date'
            ],
    
            'reservation_id' => [
                'nullable',
                'integer',
                'exists:reservations,id'
            ],
        ]);
    
        $rooms = Room::select(
                'id',
                'room_number',
                'name',
                'capacity_min',
                'capacity_max',
                'adult_price',
                'child_price'
            )
            ->whereNotExists(function ($query) use ($validated) {
    
                $query->selectRaw(1)
                    ->from('reservations')
                    ->whereColumn(
                        'reservations.room_id',
                        'rooms.id'
                    )
                    ->where(
                        'status',
                        '!=',
                        9
                    )
                    ->where(
                        'checkin_date',
                        '<',
                        $validated['checkout_date']
                    )
                    ->where(
                        'checkout_date',
                        '>',
                        $validated['checkin_date']
                    );
    
                // 編集時は現在の予約自身を除外
                if (!empty($validated['reservation_id'])) {
                    $query->where(
                        'reservations.id',
                        '!=',
                        $validated['reservation_id']
                    );
                }
    
            })
            ->orderBy('room_number')
            ->get();
    
        return response()->json([
            'rooms' => $rooms,
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => ['required', 'exists:rooms,id'],
            'checkin_date' => ['required', 'date'],
            'checkout_date' => ['required', 'date', 'after:checkin_date'],
            'adult_count' => ['required', 'integer', 'min:1'],
            'child_count' => ['nullable', 'integer', 'min:0'],
            'guest_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:255'],
            'note' => ['nullable', 'string'],
        ]);

        // 宿泊人数を自動計算
        $validated['guest_count'] =
            $validated['adult_count']
            + ($validated['child_count'] ?? 0);

        // 予約番号自動生成
        $validated['reservation_number']
            = 'R' . now()->format('YmdHis');

        $validated['reservation_date']
            = now()->toDateString();

        $validated['booking_site']
            = 'ホームページ';

        $validated['status']
            = 1;

        $validated['payment_status']
            = 0;

        $validated['payment_method']
            = null;

        $validated['address']
            = null;

        
        // 部屋情報取得
        $room = Room::findOrFail(
        $validated['room_id']
        );

        // 宿泊人数チェック
        $guestCount =
            $validated['adult_count']
            + ($validated['child_count'] ?? 0);

        if (
            $room->capacity_max !== null &&
            $guestCount > $room->capacity_max
        ) {
            return back()->withErrors([
                'guest_count' =>
                    "選択された部屋の最大宿泊人数は{$room->capacity_max}人です。",
            ]);
        }

        // 宿泊日数計算
        $checkin = Carbon::parse(
            $validated['checkin_date']
        );

        $checkout = Carbon::parse(
            $validated['checkout_date']
        );

        $days = $checkin->diffInDays(
            $checkout
        );

        if ($days <= 0) {
            $days = 1;
        }

        $dailyPrice =
            ($room->adult_price *
                $validated['adult_count'])
            +
            ($room->child_price *
                ($validated['child_count'] ?? 0));
        
                $validated['amount']
                = $dailyPrice * $days;

        // 重複チェック
        $exists = Reservation::where(
                'room_id',
                $validated['room_id']
            )
            ->where('status', '!=', 9)
            ->where(
                'checkin_date',
                '<',
                $validated['checkout_date']
            )
            ->where(
                'checkout_date',
                '>',
                $validated['checkin_date']
            )
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'room_id' => '指定された期間は既に予約があります。',
            ]);
        }

        // 予約登録
        $reservation = Reservation::create($validated);

        // 予約者メール
        Mail::to($reservation->email)
            ->send(
                new ReservationCreatedMail($reservation)
            );

        // 管理者通知メール 一時的にコメントアウト（テスト時のみ）
        // Mail::to('admin@example.com')
        //     ->send(
        //         new AdminReservationNotificationMail(
        //             $reservation
        //         )
        //     );

        return redirect()
            ->route('booking.complete');
    }


    public function calculatePrice(Request $request)
    {
        // 入力チェック
        $validated = $request->validate([
            'room_id' => [
                'required',
                'exists:rooms,id'
            ],

            'checkin_date' => [
                'required',
                'date'
            ],

            'checkout_date' => [
                'required',
                'date',
                'after:checkin_date'
            ],

            'adult_count' => [
                'required',
                'integer',
                'min:1'
            ],

            'child_count' => [
                'nullable',
                'integer',
                'min:0'
            ],
        ]);

        // 部屋情報取得
        $room = Room::findOrFail(
            $validated['room_id']
        );

        // 宿泊日数計算
        $checkin = Carbon::parse(
            $validated['checkin_date']
        );

        $checkout = Carbon::parse(
            $validated['checkout_date']
        );

        $days = $checkin->diffInDays(
            $checkout
        );  

        // 万が一0泊の場合
        if($days <= 0){
            $days = 1;
        }

        // 1泊料金
        $dailyPrice =
            ($room->adult_price *
            $validated['adult_count'])
            +
            ($room->child_price *
            ($validated['child_count'] ?? 0));

        // 合計料金
        $totalPrice =
            $dailyPrice * $days;

        return response()->json([
            'days' => $days,
            'price' => $totalPrice,
            'adult_price' => $room->adult_price,
            'child_price' => $room->child_price,
        ]);
    }
}