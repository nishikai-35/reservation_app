<?php

namespace App\Services\Importers;

use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Support\Facades\DB;
use App\Services\RoomAvailabilityService;

class BookingComImporter
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

        // dd($selectedReservationNumbers);
        if (empty($selectedReservationNumbers)) {
            return 0;
        }

        // CSVを解析して予約データを取得
        $reservations = $this->parseCsv(
            $path,
            true
        );

        // dd([
        //     'selected' => $selectedReservationNumbers,
        //     'parsed_numbers' => array_column(
        //         $reservations,
        //         'reservation_number'
        //     ),
        // ]);

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

        DB::beginTransaction();

        try {

            $importedCount = 0;
            foreach ($reservations as $data) {

                // プレビュー時点で登録不可の予約は登録しない
                if ( 
                    isset($data['can_import'])
                    && !$data['can_import']
                ) { 
                    continue;
                }

                // 登録直前の最終空室確認
                $isAvailable = $this->roomAvailabilityService->check(
                    $data['room_id'], 
                    $data['checkin_date'], 
                    $data['checkout_date'], 
                );

                // ダブルブッキングになった場合は登録しない
                if (!$isAvailable) { 
                    continue; 
                }

                // プレビュー専用項目を削除
                unset( 
                    $data['can_import'], 
                    $data['import_error'] 
                );

                Reservation::updateOrCreate(
                    ['reservation_number' => $data['reservation_number'],],
                    $data
                );

                $importedCount++;   
            }

            DB::commit();
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
            ['UTF-8', 'SJIS-win', 'CP932', 'EUC-JP'],
            true
        );

        // ヘッダー取得
        $header = fgetcsv($handle);

        if ($header === false) {
            fclose($handle);

            throw new \Exception(
                'CSVヘッダーが取得できません。'
            );
        }

        // BOM除去・文字コード変換
        $header = array_map(function ($value) use ($encoding) {

            $value = mb_convert_encoding(
                $value,
                'UTF-8',
                $encoding
            );

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

            // 複数部屋予約は対象外
            if (
                str_contains(
                    $row['ユニットタイプ'],
                    ','
                )
            ) {
                continue;
            }

            // 部屋存在確認
            $roomId = $this->getRoomId(
                $row['ユニットタイプ']
            );

            if ($roomId === null) {

                fclose($handle);

                throw new \Exception(
                    '部屋が存在しません: '
                    . $row['ユニットタイプ']
                );
            }

            // 日付
            $checkin = $row['チェックイン'];
            $checkout = $row['チェックアウト'];

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
                'reservation_name' => $row['宿泊者氏名'],
                'guest_name' => $row['宿泊者氏名'],
                'checkin_date' => $row['チェックイン'],
                'checkout_date' => $row['チェックアウト'],
                'reservation_date' => $row['予約日'],
                'guest_count' => $row['人数'],
                'adult_count' => $row['大人'],
                'child_count' => $row['子供'],
                'amount' => $this->convertAmount($row['料金']),
                'room_id' => $roomId,
                'status' => $this->convertStatus($row['ステータス']),
                'booking_site' => 'Booking.com',
                'payment_status' => '0',

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

        // Booking.comの部屋名 → roomsテーブルの部屋番号へ変換
        $roomMap = [
            'Resort House Ricca【A号室】' => '101',
            'Resort House Ricca【B号室】' => '102',
            'Resort House Ricca【C号室】' => '103',
            'Resort House Ricca【D号室】' => '104',
            'Resort House Ricca【E号室】' => '105',
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


    // ステータス変換
    private function convertStatus(?string $status): int
    {
        return match ($status) {
            'ok' => 1,
            'cancelled_by_guest' => 9,
            default => 1,
        };
    }
}
