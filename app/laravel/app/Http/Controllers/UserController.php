<?php

namespace App\Http\Controllers;

use App\Models\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // 名前検索
        if ($request->filled('name')) {
            $query->where(
                'name',
                'like',
                '%' . $request->name . '%'
            );
        }       

        // メール検索
        if ($request->filled('email')) {
            $query->where(
                'email',
                'like',
                '%' . $request->email . '%'
            );
        }

        return Inertia::render('Users/Index', [
            'users' => $query
                ->orderBy('id')
                ->get(),

            'filters' => [
                'name' => $request->input('name', ''),
                'email' => $request->input('email', ''),
            ],
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render(
            'Users/Create'
        );
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'in:user,admin'],
        ]);

        // ユーザー作成
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // 権限付与
        $user->assignRole($validated['role']);

        return redirect()
            ->route('users.index')
            ->with(
                'success',
                'ユーザーを登録しました。'
            );
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        // 管理者以外は自分自身のみ編集可能
        if (
            auth()->id() !== $user->id &&
            !auth()->user()->hasRole('admin')
        ) {
            abort(403);
        }
        // dd([
        //     'auth_id' => auth()->id(),
        //     'user_id' => $user->id,
        //     'auth_user' => auth()->user()->name,
        //     'is_admin' => auth()->user()->hasRole('admin'),
        // ]);

        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames()->first(),
            ],
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
public function update(Request $request, User $user)
{
    // 管理者以外は自分自身のみ編集可能
    if (
        auth()->id() !== $user->id &&
        !auth()->user()->hasRole('admin')
    ) {
        abort(403);
    }

    $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'max:255'],
        'password' => ['nullable', 'string', 'min:8'],
        'role' => ['required', 'in:user,admin'],
    ]);

    // 名前・メール更新
    $user->update([
        'name' => $validated['name'],
        'email' => $validated['email'],
    ]);

    // パスワードが入力されている場合のみ変更
    if (!empty($validated['password'])) {
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);
    }

    // 権限変更は管理者のみ
    if (auth()->user()->hasRole('admin')) {
        $user->syncRoles([
            $validated['role']
        ]);
    }

    // 編集後リダイレクト
    if (auth()->user()->hasRole('admin')) {
        return redirect()
            ->route('users.index')
            ->with(
                'success',
                'ユーザー情報を更新しました'
            );
    }

    return redirect()
        ->route('dashboard')
        ->with(
            'success',
            'プロフィールを更新しました'
        );
}


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // 自分自身の削除防止
        if (auth()->id() === $user->id) {

            return redirect()
                ->route('users.index')
                ->with(
                    'error',
                    '自分自身を削除することはできません。'
                );
        }

        // Spatie権限解除
        $user->syncRoles([]);
    
        // ユーザー削除
        $user->delete();

        return redirect()
            ->route('users.index')
            ->with(
                'success',
                'ユーザーを削除しました。'
            );
    }
}