<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;


class AdminReservationNotificationMail extends Mailable
{
    use Queueable, SerializesModels;


    public $reservation;


    public function __construct(Reservation $reservation)
    {
        $this->reservation = $reservation;
    }

    // メール件名、本文作成
    public function build()
    {
        return $this
            ->subject('新規予約通知')
            ->view('emails.admin_reservation_notification');
    }
}