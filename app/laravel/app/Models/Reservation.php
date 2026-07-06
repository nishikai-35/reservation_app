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

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}