<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

use App\Models\User;

class UserPasswordSetupMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $url
    )
    {
        $this->user = $user;
        $this->url = $url;
    }

    // メール件名、ヘッダー情報
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'パスワード設定のお願い',
        );
    }


    // メール本文
    public function content(): Content
    {
        return new Content(
            view: 'emails.user_password_setup',
        );
    }


    // 添付ファイル
    public function attachments(): array
    {
        return [];
    }
}