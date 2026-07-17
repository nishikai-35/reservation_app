<?php

namespace App\Http\Controllers;

use App\Services\BookingImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationImportController extends Controller
{
    /**
     * インポート画面
     */
    public function index()
    {
        return Inertia::render('Reservations/Import');
    }

    /**
     * CSVアップロード
     */
    public function store(
        Request $request,
        BookingImportService $service
    )
    {
        $request->validate([
            'csv' => ['required','file','mimes:csv,txt'],
        ]);

        $service->import(
            $request->file('csv')->getRealPath()
        );

        return back()->with(
            'success',
            'インポートが完了しました。'
        );
    }
}
