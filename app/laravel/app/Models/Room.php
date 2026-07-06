<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'room_number',
        'capacity_min',
        'capacity_max',
        'adult_price',
        'child_price',
        'checkin_time',
        'checkout_time',
        'note',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}