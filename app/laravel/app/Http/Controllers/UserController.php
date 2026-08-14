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
        ]);

        // ユーザー作成
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // 一般ユーザー権限付与
        $user->assignRole('user');

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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'role' => 'required'
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        $user->syncRoles([
            $validated['role']
        ]);

        return redirect()
            ->route('users.index')
            ->with(
                'success',
                'ユーザー情報を更新しました'
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