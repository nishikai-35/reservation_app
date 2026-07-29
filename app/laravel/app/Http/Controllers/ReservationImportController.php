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
        return Inertia::render(
            'Reservations/Import'
        );
    }


    /**
     * CSVアップロード
     */
    public function store(Request $request)
    {
        $request->validate([
            'csv' => [
                'required',
                'file',
                'mimes:csv,txt'
            ],
        ]);

        $path = $request
            ->file('csv')
            ->getRealPath();

        try {
            // インポート件数取得
            $count = $this->bookingImportService->import(
                $path
            );
        } catch (\Exception $e) {

            return back()->with(
                'error',
                $e->getMessage()
            );
        }

        return back()->with(
            'success',
            "{$count}件の予約をインポートしました。"
        );
    }
}