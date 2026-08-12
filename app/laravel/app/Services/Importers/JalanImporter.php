<?php

namespace App\Services\Importers;

use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Services\RoomAvailabilityService;

class JalanImporter
{
    private RoomAvailabilityService $roomAvailabilityService;

    public function __construct(RoomAvailabilityService $roomAvailabilityService)
    {
        $this->roomAvailabilityService = $roomAvailabilityService;
    }

    
    // CSVファイルを解析して予約データを取得し、DBに保存する
    public function import(
        string $path,
        array $selectedReservationNumbers = [] 
    ): int {

        Log::info('Jalan import start', [
            'selectedReservationNumbers' => $selectedReservationNumbers,
        ]);
    
        if (empty($selectedReservationNumbers)) {
            Log::warning('Jalan import: selectedReservationNumbers is empty');
            return 0;
        }

        // CSVを解析して予約データを取得
        $reservations = $this->parseCsv(
            $path,
            true
        );

        Log::info('Jalan parsed reservations', [
            'count' => count($reservations),
            'reservations' => $reservations,
        ]);

        // 選択された予約だけに絞り込む
        $reservations = array_filter(
            $reservations,
            function ($reservation) use ($selectedReservationNumbers) {

                return in_array(
                    $reservation['reservation_number'],
                    $selectedReservationNumbers,
                    true
                );
            }
        );

        // array_filter後のキーを振り直す
        $reservations = array_values($reservations);

        Log::info('Jalan selected reservations', [
            'count' => count($reservations),
            'reservations' => $reservations,
        ]);

        DB::beginTransaction();

        try {

            $importedCount = 0;
            foreach ($reservations as $data) {

                Log::info('Jalan import processing', [
                    'reservation_number' => $data['reservation_number'],
                    'can_import' => $data['can_import'] ?? null,
                    'import_error' => $data['import_error'] ?? null,
                ]);

                // プレビュー時点で登録不可の予約は登録しない
                if ( 
                    isset($data['can_import'])
                    && !$data['can_import']
                ) { 

                    Log::warning('Jalan import skipped: can_import=false', [
                        'reservation_number' => $data['reservation_number'],
                        'import_error' => $data['import_error'] ?? null,
                    ]);
                    continue;
                }

                // 登録直前の最終空室確認
                $isAvailable = $this->roomAvailabilityService->check(
                    $data['room_id'], 
                    $data['checkin_date'], 
                    $data['checkout_date'], 
                );

                Log::info('Jalan final availability check', [
                    'reservation_number' => $data['reservation_number'],
                    'room_id' => $data['room_id'],
                    'checkin_date' => $data['checkin_date'],
                    'checkout_date' => $data['checkout_date'],
                    'is_available' => $isAvailable,
                ]);

                // ダブルブッキングになった場合は登録しない
                if (!$isAvailable) { 

                    Log::warning('Jalan import skipped: unavailable', [
                        'reservation_number' => $data['reservation_number'],
                    ]);
                    continue;
                }

                // プレビュー専用項目を削除
                unset( 
                    $data['can_import'], 
                    $data['import_error']
                );

                Log::info('Jalan updateOrCreate', [
                    'reservation_number' => $data['reservation_number'],
                    'data' => $data,
                ]);

                $reservation = Reservation::updateOrCreate(
                    ['reservation_number' => $data['reservation_number'],],
                    $data
                );

                Log::info('Jalan reservation saved', [
                    'reservation_id' => $reservation->id,
                    'reservation_number' => $reservation->reservation_number,
                    'room_id' => $reservation->room_id,
                    'checkin_date' => $reservation->checkin_date,
                    'checkout_date' => $reservation->checkout_date,
                ]);

                $importedCount++;
            }

            Log::info('Jalan import before commit', [
                'importedCount' => $importedCount,
            ]);

            DB::commit();

            Log::info('Jalan import committed', [
                'importedCount' => $importedCount,
            ]);

            return $importedCount;

        } catch (\Exception $e) {

            DB::rollBack();
            throw $e;
        }
    }


    // プレビュー
    public function preview(string $path): array
    {
        return $this->parseCsv(
            $path,
            true
        );
    }

    
    // CSV解析
    private function parseCsv(
        string $path,
        bool $checkAvailability = true
    ): array {
    
        // CSVを開く
        $handle = fopen($path, 'r');

        if (!$handle) {
            throw new \Exception('CSVを開けません。');
        }

        // CSV文字コード確認
        $content = file_get_contents($path);

        $encoding = mb_detect_encoding(
            $content,
            ['CP932', 'SJIS-win', 'UTF-8'],
            true
        );

        // ヘッダー取得
        $header = null;

        while (($row = fgetcsv($handle)) !== false) {
            $row = array_map(function ($value) use ($encoding) {

                return trim(
                    mb_convert_encoding(
                        $value,
                        'UTF-8',
                        $encoding
                    )
                );
            }, $row);

            if (in_array('予約番号', $row)) {
                $header = $row;
                break;
            }
        }

        if ($header === null) {
            fclose($handle);

            throw new \Exception(
                'CSVヘッダーが取得できません。'
            );
        }

        // BOM除去
        $header = array_map(function ($value) use ($encoding) {

            return preg_replace(
                '/^\xEF\xBB\xBF/',
                '',
                trim($value)
            );

        }, $header);


        // データ加工・予約データ作成
        $reservations = [];

        while (($row = fgetcsv($handle)) !== false) {

            // 空行・列数違いスキップ
            if (
                empty($row) ||
                count($header) !== count($row)
            ) {
                continue;
            }

            // 文字コード変換
            $row = array_map(function ($value) use ($encoding) {

                return trim(
                    mb_convert_encoding(
                        $value,
                        'UTF-8',
                        $encoding
                    )
                );

            }, $row);

            // ヘッダーと結合
            $row = array_combine(
                $header,
                $row
            );
            
            if ($row === false) {
                continue;
            }

            // 複数部屋予約は対象外
            if (
                str_contains(
                    $row['部屋タイプ名称'],
                    ','
                )
            ) {
                continue;
            }

            // 部屋存在確認
            $roomId = $this->getRoomId(
                $row['部屋タイプ名称']
            );

            if ($roomId === null) {

                fclose($handle);

                throw new \Exception(
                    '部屋が存在しません: '
                    . $row['部屋タイプ名称']
                );
            }

            // 日付
            $checkin = $this->convertDate($row['チェックイン日']);
            $checkout = $this->convertDate($row['チェックアウト日']);

            // 初期値
            $canImport = true; 
            $importError = null;

            // ダブルブッキング確認
            if ($checkAvailability) {    
                $isAvailable = $this->roomAvailabilityService->check(
                    $roomId,
                    $checkin,
                    $checkout
                );

                if (!$isAvailable) {
                    $canImport = false;
                    $importError = 'ダブルブッキングになります。';
                }
            }

            // 予約データ作成
            $reservations[] = [
                'reservation_number' => $row['予約番号'],
                'reservation_name' => 'じゃらん予約',
                'guest_name' => 'じゃらん予約',
                'reservation_date' => $this->convertDate($row['予約受付日']),
                'checkin_date' => $this->convertDate($row['チェックイン日']),
                'checkout_date' => $this->convertDate($row['チェックアウト日']),
                'adult_count' => (int)$row['大人（男性）人数']
                                + (int)$row['大人（女性）人数'],
                'child_count' => (int)$row['子供人数'],
                'guest_count' => (int)$row['大人（男性）人数']
                                + (int)$row['大人（女性）人数']
                                + (int)$row['子供人数'],
                'amount' => $this->convertAmount($row['支払料金（円）']),
                'room_id' => $roomId,
                'booking_site' => 'じゃらん',
                'payment_status' => 0,
                'status' => empty($row['キャンセル日']) ? 1 : 9,

                // プレビュー用の項目
                'can_import' => $canImport,
                'import_error' => $importError,
            ];
        }

        fclose($handle);

        return $reservations;
    }


    // 金額変換
    private function convertAmount(?string $amount): int
    {
        if (empty($amount)) {
            return 0;
        }

        return (int) preg_replace('/[^0-9]/', '', $amount);
    }


    // 部屋ID取得
    private function getRoomId(?string $roomName): ?int
    {
        if (empty($roomName)) {
            return null;
        }

        // じゃらんの部屋名 → roomsテーブル
        $roomMap = [
            'ANNEX（別館）1棟貸し'=>'101',
            'ANNEX_2（別館）1棟貸し'=>'102',
            'ANNEX_3（別館）1棟貸し'=>'103',
            'ANNEX_4（別館）1棟貸し'=>'104',
        ];
        
        // 前後の空白を除去
        $roomName = trim($roomName);
        $roomNumber = $roomMap[$roomName] ?? null;

        if ($roomNumber === null) {
            return null;
        }

        // roomsテーブルのカラム名に合わせて変更
        $room = Room::where('room_number', $roomNumber)->first();

        return $room?->id;
    }


    // 日付変換（YYYYMMDD → YYYY-MM-DD）
    private function convertDate(?string $date): ?string
    {
        if (empty($date)) {
            return null;
        }

        $date = trim($date);

        // YYYYMMDD
        if (preg_match('/^\d{8}$/', $date)) {
            return substr($date, 0, 4)
                . '-'
                . substr($date, 4, 2)
                . '-'
                . substr($date, 6, 2);
        }

        return null;
    }
}
