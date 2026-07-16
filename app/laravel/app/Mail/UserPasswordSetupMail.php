<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use App\Models\User;

class UserPasswordSetupMail extends Mailable
{
    use Queueable, SerializesModels;


    public $user;
    public $url;


    public function __construct(
        User $user,
        string $url
    )
    {
        $this->user = $user;
        $this->url = $url;
    }


    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'パスワード設定のお願い',
        );
    }


    public function content(): Content
    {
        return new Content(
            view: 'emails.user_password_setup',
        );
    }


    public function attachments(): array
    {
        return [];
    }
}