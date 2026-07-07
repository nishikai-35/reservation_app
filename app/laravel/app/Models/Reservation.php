<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'reservation_number',
        'booking_site',
        'reservation_date',
        'checkin_date',
        'checkout_date',
        'guest_count',
        'adult_count',
        'child_count',
        'amount',
        'payment_status',
        'payment_method',
        'guest_name',
        'phone',
        'email',
        'address',
        'note',
        'status',
    ];

    //　日付、数値等の扱いやすくするためのキャスト定義
    protected $casts = [
        'reservation_date' => 'date',
        'checkin_date' => 'date',
        'checkout_date' => 'date',
        'room_id' => 'integer',
        'guest_count' => 'integer',
        'adult_count' => 'integer',
        'child_count' => 'integer',
        'amount' => 'integer',
        'payment_status' => 'integer',
        'status' => 'integer',
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}