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

        // 大人・子ども人数
        $totalAdults = $reservations->sum('adult_count');
        $totalChildren = $reservations->sum('child_count');

        // 合計宿泊人数
        $totalGuests = $totalAdults + $totalChildren;

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

            // その日にチェックインする予約
            $checkinReservations = Reservation::where('status', '!=', 9)
                ->whereDate('checkin_date', $date)
                ->get();

            // 売上
            $sales = $checkinReservations->sum('amount');

            // 宿泊人数
            $guests =
                $checkinReservations->sum('adult_count') + $checkinReservations->sum('child_count');

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

                $stayDays = Carbon::parse($reservation->checkin_date)
                    ->diffInDays(
                        Carbon::parse($reservation->checkout_date)
                    );

                $usedRoomDays += $stayDays;
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
                Carbon::parse($reservation->checkin_date)
                    ->diffInDays(
                        Carbon::parse($reservation->checkout_date)
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
                Carbon::parse($reservation->checkin_date)
                    ->diffInDays(
                        Carbon::parse($reservation->checkout_date)
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
            'Analysis/Index',
            [
                'summary'=>[
                    'year'=>$year,
                    'month'=>$month,
                    'sales'=>$totalSales,
                    'guest_count' => $totalGuests,
                    'adult_count' => $totalAdults,
                    'child_count' => $totalChildren,
                    'reservation_count'=> $reservationCount,
                    'occupancy_rate'=> $occupancyRate,
                    'room_count'=> $roomCount,
                    'used_rooms' => $usedRoomDays,
                    'total_rooms' => $roomCount,
                ],

                'chartData' => collect($comparisonData)->map(function ($item) {
                    return [
                            'month' => $item['month'],
                            'sales' => $item['current_sales'],
                            'previous_sales' => $item['previous_sales'],
                            'occupancy' => $item['current_occupancy'],
                            'previous_occupancy' => $item['previous_occupancy'],
                        ];
                }),

                'dailyData' => $dailyData,
                'year' => $year,
                'month' => $month,
            ]
        );
    }


    // CSVエクスポート
    public function export(Request $request)
    {
        // 初期変数
        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;
        $roomCount = Room::count();
        $daysInMonth = Carbon::create(
            $year,
            $month
        )->daysInMonth;

        $dailyData = [];


        // 毎日の集計処理
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

            // その日にチェックインする予約
            $checkinReservations = Reservation::where('status', '!=', 9)
                ->whereDate('checkin_date', $date)
                ->get();

            // 売上
            $sales = $checkinReservations->sum('amount');

            // 宿泊人数
            $guests =
                $checkinReservations->sum('adult_count') + $checkinReservations->sum('child_count');

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


        // 集計値
        $totalSales = collect($dailyData)->sum('sales');
        $totalGuests = collect($dailyData)->sum('guests');
        $averageOccupancy = round(
            collect($dailyData)->avg('occupancy_rate'),
            1
        );


        // ファイル名、ヘッダー設定
        $fileName = 'analysis.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=Shift_JIS',
            'Content-Disposition' => "attachment; filename={$fileName}",
        ];
        

        // CSV出力における事前処理
        $callback = function () use (
            $dailyData,
            $year,
            $month,
            $totalSales,
            $totalGuests,
            $averageOccupancy
        ) {
            
            $file = fopen('php://output', 'w');

            // UTF-8 → CP932（Excel対応）
            stream_filter_append(
                $file,
                'convert.iconv.UTF-8/CP932//TRANSLIT'
            );

            // タイトル
            fputcsv($file, ['月次分析レポート']);
            fputcsv($file, []);

            // 対象年月・作成日
            fputcsv($file, [
                '対象年月',
                "{$year}年{$month}月"
            ]);

            fputcsv($file, [
                '作成日',
                now()->format('Y-m-d')
            ]);

            fputcsv($file, []);


            // 集計値
            fputcsv($file, [
                '合計売上',
                number_format($totalSales) . '円'
            ]);

            fputcsv($file, [
                '合計宿泊人数',
                number_format($totalGuests) . '人'
            ]);

            fputcsv($file, [
                '平均稼働率',
                $averageOccupancy . '%'
            ]);

            // 空行
            fputcsv($file, []);

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


    // 詳細内容（日別データ）
    public function daily(Request $request)
    {
        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;
        $roomCount = Room::count();
        $daysInMonth = Carbon::create($year, $month)->daysInMonth;


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

            // その日にチェックインする予約
            $checkinReservations = Reservation::where('status', '!=', 9)
                ->whereDate('checkin_date', $date)
                ->get();

            // 売上
            $sales = $checkinReservations->sum('amount');

            // 宿泊人数
            $guests =
                $checkinReservations->sum('adult_count') + $checkinReservations->sum('child_count');

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
            collect($dailyData)->avg('occupancy_rate'),
            1
        );

        
        return Inertia::render(
            'Analysis/Daily',
            [
                'year' => $year,
                'month' => $month,
                'dailyData' => $dailyData,

                'summary' => [
                    'total_sales' => $totalSales,
                    'total_guests' => $totalGuests,
                    'occupancy_rate' => $averageOccupancy,
                ],
            ]
        );
    }
}
