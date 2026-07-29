<?php

namespace App\Services;

use App\Services\Importers\BookingComImporter;
use App\Services\Importers\JalanImporter;

class BookingImportService
{
    protected BookingComImporter $bookingImporter;
    protected JalanImporter $jalanImporter;

    public function __construct(
        BookingComImporter $bookingImporter,
        JalanImporter $jalanImporter
    ) {
        $this->bookingImporter = $bookingImporter;
        $this->jalanImporter = $jalanImporter;
    }

    public function import(string $path)
    {
        // csvファイル文字コード確認
        $content = file_get_contents($path);

        $encoding = mb_detect_encoding(
            $content,
            ['UTF-8', 'SJIS-win', 'CP932', 'EUC-JP'],
            true
        );

        // CSVを開く
        $handle = fopen($path, 'r');

        if (!$handle) {
            throw new \Exception('CSVを開けません。');
        }

        // ヘッダー取得
        $header = null;

        while (($row = fgetcsv($handle)) !== false) {

            // Shift_JIS → UTF-8
            $row = array_map(function ($value) use ($encoding) {

                $value = mb_convert_encoding(
                    $value,
                    'UTF-8',
                    $encoding
                );

                return trim(
                    preg_replace(
                        '/^\xEF\xBB\xBF/',
                        '',
                        $value
                    )
                );

            }, $row);


            if (in_array('予約番号', $row)) {

                $header = $row;
                break;
            }
        }

        if ($header === null) {
            throw new \Exception('BookingImportService：CSVヘッダーが取得できません。');
        }

        // 動作確認（ヘッダー名　取得確認）
        // dd($header);

        // BOM除去
        $header = array_map(function ($value) {
            return preg_replace(
                '/^\xEF\xBB\xBF/',
                '',
                trim($value)
            );
        }, $header);

        fclose($handle);

        /*
        |--------------------------------------------------------------------------
        | CSV種類判定
        |--------------------------------------------------------------------------
        */

        // Booking.com
        if (
            in_array('ユニットタイプ', $header) &&
            in_array('予約番号', $header)
        ) {
            return $this->bookingImporter->import($path);
        }

        // じゃらん
        if (
            in_array('部屋タイプ名称', $header) &&
            in_array('予約番号', $header)
        ) {
            return $this->jalanImporter->import($path);
        }

        // 未対応CSV
        throw new \Exception(
            '対応していないCSV形式です。'
        );
    }
}