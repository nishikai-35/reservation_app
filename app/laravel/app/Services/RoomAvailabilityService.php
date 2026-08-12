<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Room;


class RoomAvailabilityService
{

    /**
     * 指定期間の空室一覧取得
     */
    public function getAvailableRooms(
        string $checkin,
        string $checkout
    ) {

        return Room::select(
                'id',
                'room_number',
                'name',
                'adult_price',
                'child_price'
            )
            ->whereNotExists(function ($query) use (
                $checkin,
                $checkout
            ) {

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
                        $checkout
                    )
                    ->where(
                        'checkout_date',
                        '>',
                        $checkin
                    );

            })
            ->orderBy('room_number')
            ->get();
    }


    /**
     * 指定部屋が予約可能か確認
     */
    public function check(
        int $roomId,
        string $checkin,
        string $checkout,
        ?int $excludeReservationId = null
    ): bool {


        $query = Reservation::where(
                'room_id',
                $roomId
            )
            ->where(
                'status',
                '!=',
                9
            )
            ->where(
                'checkin_date',
                '<',
                $checkout
            )
            ->where(
                'checkout_date',
                '>',
                $checkin
            );


        // 編集時は自分自身を除外
        if ($excludeReservationId) {

            $query->where(
                'id',
                '!=',
                $excludeReservationId
            );

        }


        return !$query->exists();
    }
}