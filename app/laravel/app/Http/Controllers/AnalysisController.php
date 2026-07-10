<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Room;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AnalysisController extends Controller
{
    // 集計画面表示
    public function index(Request $request)
    {
        // 対象年月
        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;

        // 対象月の予約取得
        $reservations = Reservation::with('room')
            ->whereYear('checkin_date', $year)
            ->whereMonth('checkin_date', $month)
            ->where('status', '!=', 9) // キャンセル除外
            ->get();

        //売上合計
        $totalSales = $reservations->sum('amount');

        //宿泊人数合計
        $totalGuests = $reservations->sum('guest_count');

        //予約件数
        $reservationCount = $reservations->count();


        /*
        |--------------------------------------------------------------------------
        | 稼働率計算
        |--------------------------------------------------------------------------
        */
        $roomCount = Room::count();

        // 対象月の日数
        $daysInMonth = Carbon::create(
            $year,
            $month
        )->daysInMonth;
        
        // 最大販売可能客室数
        $availableRoomDays =
            $roomCount * $daysInMonth;
        
        // 実際の宿泊日数
        $usedRoomDays = 0;

        foreach ($reservations as $reservation) {
            $checkin = Carbon::parse(
                $reservation->checkin_date
            );
            $checkout = Carbon::parse(
                $reservation->checkout_date
            );

            // 泊数計算
            $stayDays = $checkin->diffInDays($checkout);

            $usedRoomDays += $stayDays;
        }


        // 稼働率
        if ($availableRoomDays > 0) {
            $occupancyRate =
                round(
                    ($usedRoomDays / $availableRoomDays) * 100,
                    1
                );
        } else {
            $occupancyRate = 0;
        }


        /*
        |--------------------------------------------------------------------------
        | 日別データ生成
        |--------------------------------------------------------------------------
        */
        $dailyData = [];

        for ($day = 1; $day <= $daysInMonth; $day++) {

            $date = Carbon::create(
                $year,
                $month,
                $day
            )->format('Y-m-d');

            // その日に宿泊中の予約
            $dayReservations = Reservation::where('status', '!=', 9)
                ->whereDate('checkin_date', '<=', $date)
                ->whereDate('checkout_date', '>', $date)
                ->get();

            // 売上
            $sales = $dayReservations->sum('amount');

            // 宿泊人数
            $guests = $dayReservations->sum('guest_count');

            // 稼働部屋数
            $usedRooms = $dayReservations
                ->pluck('room_id')
                ->unique()
                ->count();

            // 稼働率
            $occupancy = 0;

            if ($roomCount > 0) {
                $occupancy = round(
                    ($usedRooms / $roomCount) * 100,
                    1
                );
            }

            $dailyData[] = [
                'date' => $date,
                'sales' => $sales,
                'guests' => $guests,
                'occupancy_rate' => $occupancy,
            ];
        }


        /*
        |--------------------------------------------------------------------------
        | 月別売上データ
        |--------------------------------------------------------------------------
        */
        $monthlyData = [];

        for ($m = 1; $m <= 12; $m++) {

            $monthReservations = Reservation::whereYear(
                'checkin_date',
                $year
            )
            ->whereMonth(
                'checkin_date',
                $m
            )
            ->where('status', '!=', 9)
            ->get();

            $monthlySales = $monthReservations->sum('amount');
            
            
            // 月別稼働率計算
            $daysInMonth = Carbon::create(
                $year,
                $m
            )->daysInMonth;

            $availableRoomDays =
                $roomCount * $daysInMonth;

            $usedRoomDays = 0;

            foreach ($monthReservations as $reservation) {

                $checkin = Carbon::parse(
                    $reservation->checkin_date
                );

                $checkout = Carbon::parse(
                    $reservation->checkout_date
                );

                $usedRoomDays +=
                    $checkout->diffInDays($checkin);
            }

            $monthlyOccupancy = 0;

            if ($availableRoomDays > 0) {

                $monthlyOccupancy = round(
                    ($usedRoomDays / $availableRoomDays) * 100,
                    1
                );
            }

            // 月別データ格納
            $monthlyData[] = [
                'month' => $m,
                'sales' => $monthlySales,
                'occupancy_rate' => $monthlyOccupancy,
            ];
        }


        /*
        |--------------------------------------------------------------------------
        | 前年比較データ
        |--------------------------------------------------------------------------
        */
        $comparisonData = [];

        $previousYear = $year - 1;

        for ($m = 1; $m <= 12; $m++) {

            // 本年売上
            $currentReservations = Reservation::whereYear(
                'checkin_date',
                $year
            )
            ->whereMonth(
                'checkin_date',
                $m
            )
            ->where('status', '!=', 9)
            ->get();

            // 本年稼働率
            $currentDaysInMonth = Carbon::create(
                $year,
                $m
            )->daysInMonth;

            $currentAvailableRoomDays =
                $roomCount * $currentDaysInMonth;

            $currentUsedRoomDays = 0;

            foreach ($currentReservations as $reservation) {

                $currentUsedRoomDays +=
                    Carbon::parse(
                        $reservation->checkout_date
                    )->diffInDays(
                        Carbon::parse(
                            $reservation->checkin_date
                        )
                    );
            }

            $currentOccupancy = 0;

            if ($currentAvailableRoomDays > 0) {

                $currentOccupancy = round(
                    (
                        $currentUsedRoomDays
                        /
                        $currentAvailableRoomDays
                    ) * 100,
                    1
                );
            }

            // 前年売上
            $previousReservations = Reservation::whereYear(
                'checkin_date',
                $previousYear
            )
            ->whereMonth(
                'checkin_date',
                $m
            )
            ->where('status', '!=', 9)
            ->get();

            // 前年稼働率
            $previousDaysInMonth = Carbon::create(
                $previousYear,
                $m
            )->daysInMonth;

            $previousAvailableRoomDays =
                $roomCount * $previousDaysInMonth;

            $previousUsedRoomDays = 0;

            foreach ($previousReservations as $reservation) {

                $previousUsedRoomDays +=
                    Carbon::parse(
                        $reservation->checkout_date
                    )->diffInDays(
                        Carbon::parse(
                            $reservation->checkin_date
                        )
                    );
            }

            $previousOccupancy = 0;

            if ($previousAvailableRoomDays > 0) {

                $previousOccupancy = round(
                    (
                        $previousUsedRoomDays
                        /
                        $previousAvailableRoomDays
                    ) * 100,
                    1
                );
            }

            // 各比較集計処理
            $comparisonData[] = [
                'month' => $m,

                'current_sales' =>
                    $currentReservations->sum('amount'),
                'previous_sales' =>
                    $previousReservations->sum('amount'),

                'current_occupancy' =>
                    $currentOccupancy,
                'previous_occupancy' =>
                    $previousOccupancy,
            ];
        }


        // reactへ渡すデータ
        return Inertia::render(
            'Analysis',
            [

                'summary'=>[
                    'year'=>$year,
                    'month'=>$month,

                    'sales'=>$totalSales,
                    'guests'=>$totalGuests,
                    'reservation_count'=>$reservationCount,
                    'occupancy_rate'=>$occupancyRate,
                    'room_count'=>$roomCount,
                ],

                'dailyData' => $dailyData,
                'monthlyData' => $monthlyData,
                'comparisonData' => $comparisonData,
            ]
        );
    }


    // CSVエクスポート
    public function export(Request $request)
    {
        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;

        $roomCount = Room::count();

        $daysInMonth = Carbon::create(
            $year,
            $month
        )->daysInMonth;

        $dailyData = [];

        for ($day = 1; $day <= $daysInMonth; $day++) {

            $date = Carbon::create(
                $year,
                $month,
                $day
            )->format('Y-m-d');

            $dayReservations = Reservation::where('status', '!=', 9)
                ->whereDate('checkin_date', '<=', $date)
                ->whereDate('checkout_date', '>', $date)
                ->get();

            $sales = $dayReservations->sum('amount');

            $guests = $dayReservations->sum('guest_count');

            $usedRooms = $dayReservations
                ->pluck('room_id')
                ->unique()
                ->count();

            $occupancy = 0;

            if ($roomCount > 0) {
                $occupancy = round(
                    ($usedRooms / $roomCount) * 100,
                    1
                );
            }

            $dailyData[] = [
                'date' => $date,
                'sales' => $sales,
                'guests' => $guests,
                'occupancy_rate' => $occupancy,
            ];
        }

        $fileName = 'analysis.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' =>
                "attachment; filename={$fileName}",
        ];

        $callback = function () use ($dailyData) {

            $file = fopen('php://output', 'w');

            fputcsv(
                $file,
                [
                    '日付',
                    '売上',
                    '宿泊人数',
                    '稼働率',
                ]
            );

            foreach ($dailyData as $day) {

                fputcsv(
                    $file,
                    [
                        $day['date'],
                        $day['sales'],
                        $day['guests'],
                        $day['occupancy_rate'] . '%',
                    ]
                );

            }

            fclose($file);
        };

        return response()->stream(
            $callback,
            200,
            $headers
        );
    }
}
