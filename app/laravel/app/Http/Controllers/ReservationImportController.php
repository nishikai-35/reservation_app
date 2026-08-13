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


    // インポート画面
    public function index()
    {
        return Inertia::render(
            'Reservations/Import'
        );
    }


    // CSVアップロード
    public function store(Request $request)
    {
        $request->validate([
            'csv' => [
                'required',
                'file',
                'mimes:csv,txt'
            ],

            'reservation_numbers' => [
                'required',
                'array'
            ],
            
            'reservation_numbers.*' => [
                'string'
            ],
        ]);

        $path = $request
            ->file('csv')
            ->getRealPath();

        // 選択された予約番号を取得
        $selectedReservationNumbers = $request->input(
            'reservation_numbers',
            []
        );

        try {

            // インポート件数取得
            $count = $this->bookingImportService->import(
                $path,
                $selectedReservationNumbers
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


    // プレビュー機能
    public function preview(Request $request)
    {
        $request->validate([
            'csv' => [
                'required',
                'file',
                'mimes:csv,txt'
            ],
        ]);

        $file = $request->file('csv');

        // 一時保存・絶対パス取得
        $path = $file->store('imports', 'local');
        $fullPath = storage_path(
            'app/private/'.$path
        );

        // 一時保存ファイルの削除処理
        try {

            $data = $this->bookingImportService
                ->preview($fullPath);

            unlink($fullPath);


        } catch (\Exception $e) {

            return response()->json([
                'message' => $e->getMessage()
            ], 500);

        } finally {

            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
        }

        return response()->json([
            'data' => $data,
        ]);
    }
}