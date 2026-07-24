<?php

namespace App\Http\Controllers;

use App\Services\BookingImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationImportController extends Controller
{
    private BookingImportService $bookingImportService;

    public function __construct(
        BookingImportService $bookingImportService
    ) {
        $this->bookingImportService = $bookingImportService;
    }

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
    public function store(Request $request)
    {
        $request->validate([
            'csv' => ['required', 'file', 'mimes:csv,txt'],
        ]);

        $path = $request
            ->file('csv')
            ->getRealPath();

        try {

            $this->bookingImportService->import($path);

        } catch (\Exception $e) {

            return back()->withErrors([
                'csv' => $e->getMessage(),
            ]);
        }

        return back()->with(
            'success',
            'インポートが完了しました。'
        );
    }
}