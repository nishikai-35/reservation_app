<?php

namespace App\Services\Importers;

use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Support\Facades\DB;

class BookingComImporter
{
    public function import(string $path)
    {
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

        DB::beginTransaction();


        // インポート成功件数
        $count = 0;

        try {
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

                    throw new \Exception(
                        '部屋が存在しません: '
                        . $row['ユニットタイプ']
                    );
                }

                // DB登録用データ
                $data = [
                    'reservation_number' => $row['予約番号'],
                    'reservation_name' => $row['宿泊者氏名'],
                    'guest_name' => $row['宿泊者氏名'],
                    'checkin_date' => $row['チェックイン'],
                    'checkout_date' => $row['チェックアウト'],
                    'reservation_date' => $row['予約日'],
                    'guest_count' => $row['人数'],
                    'adult_count' => $row['大人'],
                    'child_count' => $row['子供'],
                    'total_price' => $this->convertAmount($row['料金']),
                    'room_id' => $roomId,
                    'status' => $this->convertStatus($row['ステータス']),
                    'booking_site' => 'Booking.com',
                    'payment_status' => '0',
                ];

                // 登録・更新
                Reservation::updateOrCreate(
                    [
                        'reservation_number' => $data['reservation_number'],
                    ],
                    $data
                );

                // 登録成功後に加算
                $count++;
            }
            
            DB::commit();

        } catch (\Exception $e) {

            DB::rollBack();
            fclose($handle);
            throw $e;
        }
        
        fclose($handle);

        // インポート件数を返却
        return $count;
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
