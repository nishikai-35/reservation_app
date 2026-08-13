<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PasswordSetupToken;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
 
use Inertia\Inertia;


class PasswordSetupController extends Controller
{
    public function create(string $token)
    {
        $passwordSetupToken =
            PasswordSetupToken::where(
                'token',
                $token
            )->first();

        if (!$passwordSetupToken) {
            abort(404);
        }

        return Inertia::render(
            'Auth/SetPassword',
            [
                'token' => $token,
            ]
        );
    }

    public function store(Request $request)
    {
        // 入力チェック
        $validated = $request->validate([
            'token' => [
                'required',
            ],
    
            'password' => [
                'required',
                'confirmed',
                'min:8',
            ],
        ]);
    
        // 初回パスワード設定時　URL確認
        $passwordSetupToken =
            PasswordSetupToken::where(
                'token',
                $validated['token']
            )->first();
    
        if (!$passwordSetupToken) {
            return back()->withErrors([
                'token' => '無効なURLです。',
            ]);
        }
    
        if (
            $passwordSetupToken->expires_at
                ->isPast()
        ) {
    
            return back()->withErrors([
                'token' => '有効期限が切れています。',
            ]);
    
        }
    
        // 初回パスワード設定の完了処理
        $user = User::find(
            $passwordSetupToken->user_id
        );
    
        $user->update([
            'password' => Hash::make(
                $validated['password']
            ),
        ]);
    
        $passwordSetupToken->delete();
    
        return redirect()
            ->route('login')
            ->with(
                'success',
                'パスワードを設定しました。'
            );
    }
}   