<?php

namespace App\Services;

use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Support\Facades\DB;

class BookingImportService
{
    public function import(string $path)
    {
        // CSVを開く
        $handle = fopen($path, 'r');
        if (!$handle) {
            throw new \Exception('CSVを開けません。');
        }

        // ヘッダー取得（1行目）
        $header = fgetcsv($handle);
        if ($header === false) {
            throw new \Exception('CSVヘッダーが取得できません。');
        }

        // BOM除去・前後空白除去
        $header = array_map(function ($value) {
            return preg_replace('/^\xEF\xBB\xBF/', '', trim($value));
        }, $header);


        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle)) !== false) {

                // 空行はスキップ
                if (count($header) !== count($row)) {
                    continue;
                }

                // ヘッダーとデータを結合
                $row = array_combine($header, $row);

                // 複数部屋の予約はスキップ
                if (str_contains($row['ユニットタイプ'], ',')) {
                    continue;
                }

                // バリデーション
                $roomId = $this->getRoomId($row['ユニットタイプ']);
                if ($roomId === null) {
                    throw new \Exception(
                        '部屋が存在しません: ' . $row['ユニットタイプ']
                    );
                }
    
                // DB用に変換
                $data = [
                    'reservation_number' => $row['予約番号'],
                    'guest_name' => $row['宿泊者氏名'],
                    'checkin_date' => $row['チェックイン'],
                    'checkout_date' => $row['チェックアウト'],
                    'reservation_date' => $row['予約日'],
                    'guest_count' => $row['人数'],
                    'adult_count' => $row['大人'],
                    'child_count' => $row['子供'],
                    'amount' => $this->convertAmount($row['料金']),
                    'room_id' => $roomId,
                    'status' => $this->convertStatus(
                        $row['ステータス']
                    ),
                    'booking_site' => 'Booking.com',
                ];

                // Reservation登録
                Reservation::updateOrCreate(
                    [
                        'reservation_number' => $data['reservation_number'],
                    ],
                    $data
                );
    
                // 動作確認
                // dd($row);
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

        // CSVの部屋名 → テスト用部屋番号へ変換
        $roomMap = [
            'Resort House Ricca【A号室】' => '101',
            'Resort House Ricca【B号室】' => '102',
            'Resort House Ricca【C号室】' => '103',
            'Resort House Ricca【D号室】' => '104',
        ];
        
        // 前後の空白を除去
        $roomName = trim($roomName);
        $roomNumber = $roomMap[$roomName] ?? null;
    
        // dd([
        //     'CSVの値' => $roomName,
        //     '変換後' => $roomNumber,
        // ]);

        if ($roomNumber === null) {
            return null;
        }

        // roomsテーブルのカラム名に合わせて変更
        $room = Room::where('room_number', $roomNumber)->first();

        // dd([
        //     'roomName'   => $roomName,
        //     'roomNumber' => $roomNumber,
        //     'room'       => $room,
        // ]);

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
