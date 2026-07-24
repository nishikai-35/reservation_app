<?php

namespace App\Services\Importers;

use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Support\Facades\DB;

class JalanImporter
{
    public function import(string $path)
    {
        // CSVを開く
        $handle = fopen($path, 'r');
        if (!$handle) {
            throw new \Exception('CSVを開けません。');
        }


        // ヘッダー取得（1行目）
        $header = null;

        while (($row = fgetcsv($handle)) !== false) {

            // Shift_JIS → UTF-8
            $row = array_map(function ($value) {
                return mb_convert_encoding(
                    trim($value),
                    'UTF-8',
                    'SJIS-win'
                );
            }, $row);

            if (in_array('予約番号', $row)) {
                $header = $row;
                break;
            }
        }

        if ($header === null) {
            throw new \Exception('CSVヘッダーが取得できません。');
        }


        // BOM除去・前後空白除去
        $header = array_map(function ($value) {
            return preg_replace('/^\xEF\xBB\xBF/', '', trim($value));
        }, $header);


        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle)) !== false) {

                // UTF変換
                $row = array_map(function ($value) {
                    return mb_convert_encoding(
                        trim($value),
                        'UTF-8',
                        'SJIS-win'
                    );
                }, $row);

                // 空行はスキップ
                if (count($header) !== count($row)) {
                    continue;
                }

                // ヘッダーとデータを結合
                $row = array_combine($header, $row);


                // バリデーション
                $roomId = $this->getRoomId($row['部屋タイプ名称']);
                if ($roomId === null) {
                    throw new \Exception(
                        '部屋が存在しません: ' . $row['部屋タイプ名称']
                    );
                }
    
                // DB用に変換
                $data = [
                    'reservation_number' => $row['予約番号'],
                    'reservation_name' => 'じゃらん予約',
                    'guest_name' => 'じゃらん予約',
                    'reservation_date' => $this->convertDate($row['予約受付日']),
                    'checkin_date'     => $this->convertDate($row['チェックイン日']),
                    'checkout_date'    => $this->convertDate($row['チェックアウト日']),
                    'adult_count'        => (int)$row['大人（男性）人数']
                                           + (int)$row['大人（女性）人数'],
                    'child_count'        => (int)$row['子供人数'],
                    'guest_count'        => (int)$row['大人（男性）人数']
                                           + (int)$row['大人（女性）人数']
                                           + (int)$row['子供人数'],
                    'total_price' => $this->convertAmount($row['支払料金（円）']),
                    'room_id' => $roomId,
                    'booking_site' => 'じゃらん',
                    'payment_status' => 0,
                    'status' => empty($row['キャンセル日']) ? 1 : 9,
                ];

                // Reservation登録
                Reservation::updateOrCreate(
                    [
                        'reservation_number' => $data['reservation_number'],
                    ],
                    $data
                );
    
                // 動作確認
                // dd($header);
            }
            DB::commit();

        } catch (\Exception $e) {

            DB::rollBack();
            throw $e;
        }

        fclose($handle);
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
