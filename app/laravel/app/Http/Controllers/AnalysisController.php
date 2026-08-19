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

        $roomCount = Room::count();


        // 対象月取得　集計用
        $reservations = Reservation::with('room')
            ->whereYear('checkout_date', $year)
            ->whereMonth('checkout_date', $month)
            ->where('status', 5)
            ->get();

        // 売上合計
        $totalSales = $reservations->sum('amount');

        // 大人・子ども人数
        $totalAdults = $reservations->sum('adult_count');
        $totalChildren = $reservations->sum('child_count');

        // 合計宿泊人数
        $totalGuests = $totalAdults + $totalChildren;

        // 予約件数
        $reservationCount = $reservations->count();


        // 稼働率計算
        $monthStart = Carbon::create(
            $year,
            $month,
            1
        )->startOfDay();

        $nextMonthStart = $monthStart
            ->copy()
            ->addMonth()
            ->startOfDay();

        $daysInMonth = $monthStart->daysInMonth;


        // 対象月に宿泊期間が重なっている予約を取得
        $occupancyReservations = Reservation::with('room')
            ->whereIn('status', [2, 3, 4, 5])
            ->whereDate('checkin_date', '<', $nextMonthStart)
            ->whereDate('checkout_date', '>', $monthStart)
            ->get();

        // 最大販売可能客室数
        $availableRoomDays = $roomCount * $daysInMonth;


        // 実際の宿泊日数
        $usedRoomDays = 0;

        foreach ($occupancyReservations as $reservation) {

            $checkin = Carbon::parse(
                $reservation->checkin_date
            )->startOfDay();

            $checkout = Carbon::parse(
                $reservation->checkout_date
            )->startOfDay();

            // 対象月の開始日より前なら月初から計算
            $start = $checkin->greaterThan($monthStart)
                ? $checkin
                : $monthStart;

            // 翌月1日より後なら翌月1日まで
            $end = $checkout->lessThan($nextMonthStart)
                ? $checkout
                : $nextMonthStart;

            $stayDays = $start->diffInDays($end);

            $usedRoomDays += $stayDays;
        }

        // 稼働率
        if ($availableRoomDays > 0) {

            $occupancyRate = round(
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


            // その日に宿泊している予約 (稼働率用)
            $dayReservations = Reservation::whereIn(
                'status',
                [2, 3, 4, 5]
            )
                ->whereDate(
                    'checkin_date',
                    '<=',
                    $date
                )
                ->whereDate(
                    'checkout_date',
                    '>',
                    $date
                )
                ->get();

            // その日にチェックアウトした予約　(集計用)
            $checkoutReservations = Reservation::where(
                'status',
                5
            )
                ->whereDate(
                    'checkout_date',
                    $date
                )
                ->get();

            // 売上
            $sales = $checkoutReservations->sum('amount');

            // 宿泊人数
            $guests =
                $checkoutReservations->sum('adult_count')
                +
                $checkoutReservations->sum('child_count');

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
        | 月別売上・稼働率データ
        |--------------------------------------------------------------------------
        */
        $monthlyData = [];

        for ($m = 1; $m <= 12; $m++) {

            // 月別売上
            $monthReservations = Reservation::whereYear(
                'checkout_date',
                $year
            )
                ->whereMonth(
                    'checkout_date',
                    $m
                )
                ->where('status', 5)
                ->get();

            $monthlySales = $monthReservations->sum('amount');


            // 月別稼働率
            $targetMonthStart = Carbon::create(
                $year,
                $m,
                1
            )->startOfDay();

            $targetNextMonthStart = $targetMonthStart
                ->copy()
                ->addMonth()
                ->startOfDay();

            $targetDaysInMonth = $targetMonthStart->daysInMonth;

            $occupancyReservations = Reservation::whereIn(
                'status',
                [2, 3, 4, 5]
            )
                ->whereDate(
                    'checkin_date',
                    '<',
                    $targetNextMonthStart
                )
                ->whereDate(
                    'checkout_date',
                    '>',
                    $targetMonthStart
                )
                ->get();


            $availableRoomDays = $roomCount * $targetDaysInMonth;


            $usedRoomDays = 0;

            foreach (
                $occupancyReservations
                as $reservation
            ) {

                $checkin = Carbon::parse(
                    $reservation->checkin_date
                )->startOfDay();

                $checkout = Carbon::parse(
                    $reservation->checkout_date
                )->startOfDay();


                $start = $checkin->greaterThan(
                    $targetMonthStart
                )
                    ? $checkin
                    : $targetMonthStart;


                $end = $checkout->lessThan(
                    $targetNextMonthStart
                )
                    ? $checkout
                    : $targetNextMonthStart;


                $usedRoomDays +=
                    $start->diffInDays($end);
            }


            $monthlyOccupancy = 0;

            if ($availableRoomDays > 0) {

                $monthlyOccupancy = round(
                    (
                        $usedRoomDays
                        /
                        $availableRoomDays
                    ) * 100,
                    1
                );
            }


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

            /*
            |----------------------------------------------------------------------
            | 本年売上
            |----------------------------------------------------------------------
            */

            $currentReservations = Reservation::whereYear(
                'checkout_date',
                $year
            )
                ->whereMonth(
                    'checkout_date',
                    $m
                )
                ->where('status', 5)
                ->get();


            /*
            |----------------------------------------------------------------------
            | 本年稼働率
            |----------------------------------------------------------------------
            */

            $currentMonthStart = Carbon::create(
                $year,
                $m,
                1
            )->startOfDay();

            $currentNextMonthStart = $currentMonthStart
                ->copy()
                ->addMonth()
                ->startOfDay();

            $currentDaysInMonth =
                $currentMonthStart->daysInMonth;


            $currentOccupancyReservations =
                Reservation::whereIn(
                    'status',
                    [2, 3, 4, 5]
                )
                ->whereDate(
                    'checkin_date',
                    '<',
                    $currentNextMonthStart
                )
                ->whereDate(
                    'checkout_date',
                    '>',
                    $currentMonthStart
                )
                ->get();


            $currentAvailableRoomDays =
                $roomCount * $currentDaysInMonth;

            $currentUsedRoomDays = 0;


            foreach (
                $currentOccupancyReservations
                as $reservation
            ) {

                $checkin = Carbon::parse(
                    $reservation->checkin_date
                )->startOfDay();

                $checkout = Carbon::parse(
                    $reservation->checkout_date
                )->startOfDay();


                $start = $checkin->greaterThan(
                    $currentMonthStart
                )
                    ? $checkin
                    : $currentMonthStart;


                $end = $checkout->lessThan(
                    $currentNextMonthStart
                )
                    ? $checkout
                    : $currentNextMonthStart;


                $currentUsedRoomDays +=
                    $start->diffInDays($end);
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


            /*
            |----------------------------------------------------------------------
            | 前年売上
            |----------------------------------------------------------------------
            */

            $previousReservations = Reservation::whereYear(
                'checkout_date',
                $previousYear
            )
                ->whereMonth(
                    'checkout_date',
                    $m
                )
                ->where('status', 5)
                ->get();


            /*
            |----------------------------------------------------------------------
            | 前年稼働率
            |----------------------------------------------------------------------
            */

            $previousMonthStart = Carbon::create(
                $previousYear,
                $m,
                1
            )->startOfDay();

            $previousNextMonthStart =
                $previousMonthStart
                    ->copy()
                    ->addMonth()
                    ->startOfDay();

            $previousDaysInMonth =
                $previousMonthStart->daysInMonth;


            $previousOccupancyReservations =
                Reservation::whereIn(
                    'status',
                    [2, 3, 4, 5]
                )
                ->whereDate(
                    'checkin_date',
                    '<',
                    $previousNextMonthStart
                )
                ->whereDate(
                    'checkout_date',
                    '>',
                    $previousMonthStart
                )
                ->get();


            $previousAvailableRoomDays =
                $roomCount * $previousDaysInMonth;

            $previousUsedRoomDays = 0;


            foreach (
                $previousOccupancyReservations
                as $reservation
            ) {

                $checkin = Carbon::parse(
                    $reservation->checkin_date
                )->startOfDay();

                $checkout = Carbon::parse(
                    $reservation->checkout_date
                )->startOfDay();


                $start = $checkin->greaterThan(
                    $previousMonthStart
                )
                    ? $checkin
                    : $previousMonthStart;


                $end = $checkout->lessThan(
                    $previousNextMonthStart
                )
                    ? $checkout
                    : $previousNextMonthStart;


                $previousUsedRoomDays +=
                    $start->diffInDays($end);
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


            /*
            |----------------------------------------------------------------------
            | 比較データ格納
            |----------------------------------------------------------------------
            */

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


        /*
        |--------------------------------------------------------------------------
        | Reactへ渡すデータ
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Analysis/Index',
            [
                'summary' => [
                    'year' => $year,
                    'month' => $month,

                    'sales' => $totalSales,

                    'guest_count' =>
                        $totalGuests,

                    'adult_count' =>
                        $totalAdults,

                    'child_count' =>
                        $totalChildren,

                    'reservation_count' =>
                        $reservationCount,

                    'occupancy_rate' =>
                        $occupancyRate,

                    'room_count' =>
                        $roomCount,

                    'used_rooms' =>
                        $usedRoomDays,

                    'total_rooms' =>
                        $roomCount,
                ],

                'chartData' =>
                    collect($comparisonData)
                        ->map(function ($item) {

                            return [
                                'month' =>
                                    $item['month'],

                                'sales' =>
                                    $item['current_sales'],

                                'previous_sales' =>
                                    $item['previous_sales'],

                                'occupancy' =>
                                    $item['current_occupancy'],

                                'previous_occupancy' =>
                                    $item['previous_occupancy'],
                            ];
                        }),

                'dailyData' => $dailyData,

                'year' => $year,

                'month' => $month,
            ]
        );
    }


    /*
    |--------------------------------------------------------------------------
    | CSVエクスポート
    |--------------------------------------------------------------------------
    */

    public function export(Request $request)
    {
        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;

        $roomCount = Room::count();

        $monthStart = Carbon::create(
            $year,
            $month,
            1
        )->startOfDay();

        $daysInMonth = $monthStart->daysInMonth;

        $dailyData = [];


        /*
        |--------------------------------------------------------------------------
        | 毎日の集計処理
        |--------------------------------------------------------------------------
        */

        for ($day = 1; $day <= $daysInMonth; $day++) {

            $date = $monthStart
                ->copy()
                ->day($day)
                ->format('Y-m-d');


            // 稼働率用
            $dayReservations = Reservation::whereIn(
                'status',
                [2, 3, 4, 5]
            )
                ->whereDate(
                    'checkin_date',
                    '<=',
                    $date
                )
                ->whereDate(
                    'checkout_date',
                    '>',
                    $date
                )
                ->get();


            // 売上・宿泊人数用
            $checkoutReservations = Reservation::where(
                'status',
                5
            )
                ->whereDate(
                    'checkout_date',
                    $date
                )
                ->get();

            // 売上
            $sales = $checkoutReservations->sum('amount');

            // 宿泊人数
            $guests =
                $checkoutReservations->sum('adult_count')
                +
                $checkoutReservations->sum('child_count');

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


        // 集計値
        $totalSales = collect($dailyData)->sum('sales');
        $totalGuests = collect($dailyData)->sum('guests');
        $averageOccupancy = round(
            collect($dailyData)
                ->avg('occupancy_rate'),
            1
        );


        // CSV設定
        $fileName = 'analysis.csv';

        $headers = [
            'Content-Type' =>
                'text/csv; charset=Shift_JIS',

            'Content-Disposition' =>
                "attachment; filename={$fileName}",
        ];


        /*
        |--------------------------------------------------------------------------
        | CSV出力
        |--------------------------------------------------------------------------
        */

        $callback = function () use (
            $dailyData,
            $year,
            $month,
            $totalSales,
            $totalGuests,
            $averageOccupancy
        ) {

            $file = fopen(
                'php://output',
                'w'
            );


            // UTF-8 → CP932
            stream_filter_append(
                $file,
                'convert.iconv.UTF-8/CP932//TRANSLIT'
            );


            fputcsv(
                $file,
                ['月次分析レポート']
            );

            fputcsv(
                $file,
                []
            );


            fputcsv(
                $file,
                [
                    '対象年月',
                    "{$year}年{$month}月"
                ]
            );


            fputcsv(
                $file,
                [
                    '作成日',
                    now()->format('Y-m-d')
                ]
            );


            fputcsv(
                $file,
                []
            );


            // 集計値
            fputcsv(
                $file,
                [
                    '合計売上',
                    number_format($totalSales) . '円'
                ]
            );


            fputcsv(
                $file,
                [
                    '合計宿泊人数',
                    number_format($totalGuests) . '人'
                ]
            );


            fputcsv(
                $file,
                [
                    '平均稼働率',
                    $averageOccupancy . '%'
                ]
            );


            fputcsv(
                $file,
                []
            );


            // ヘッダー
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


    /*
    |--------------------------------------------------------------------------
    | 詳細内容（日別データ）
    |--------------------------------------------------------------------------
    */

    public function daily(Request $request)
    {
        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;

        $roomCount = Room::count();

        $monthStart = Carbon::create(
            $year,
            $month,
            1
        )->startOfDay();

        $daysInMonth =
            $monthStart->daysInMonth;


        $dailyData = [];


        for (
            $day = 1;
            $day <= $daysInMonth;
            $day++
        ) {

            $date = $monthStart
                ->copy()
                ->day($day)
                ->format('Y-m-d');


            /*
            |----------------------------------------------------------------------
            | 稼働率用
            |----------------------------------------------------------------------
            */

            $dayReservations = Reservation::whereIn(
                'status',
                [2, 3, 4, 5]
            )
                ->whereDate(
                    'checkin_date',
                    '<=',
                    $date
                )
                ->whereDate(
                    'checkout_date',
                    '>',
                    $date
                )
                ->get();


            /*
            |----------------------------------------------------------------------
            | 売上・宿泊人数用
            |----------------------------------------------------------------------
            */

            $checkoutReservations = Reservation::where(
                'status',
                5
            )
                ->whereDate(
                    'checkout_date',
                    $date
                )
                ->get();


            // 売上
            $sales =
                $checkoutReservations->sum('amount');


            // 宿泊人数
            $guests =
                $checkoutReservations->sum('adult_count')
                +
                $checkoutReservations->sum('child_count');


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
        | 集計値
        |--------------------------------------------------------------------------
        */

        $totalSales =
            collect($dailyData)->sum('sales');

        $totalGuests =
            collect($dailyData)->sum('guests');

        $averageOccupancy = round(
            collect($dailyData)
                ->avg('occupancy_rate'),
            1
        );


        return Inertia::render(
            'Analysis/Daily',
            [
                'year' => $year,

                'month' => $month,

                'dailyData' => $dailyData,

                'summary' => [
                    'total_sales' =>
                        $totalSales,

                    'total_guests' =>
                        $totalGuests,

                    'occupancy_rate' =>
                        $averageOccupancy,
                ],
            ]
        );
    }
}