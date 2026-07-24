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
        // CSVを開く
        $handle = fopen($path, 'r');

        if (!$handle) {
            throw new \Exception('CSVを開けません。');
        }

        // ヘッダー取得
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
            $this->bookingImporter->import($path);
            return;
        }

        // じゃらん
        if (
            in_array('部屋タイプ名称', $header) &&
            in_array('予約番号', $header)
        ) {
            $this->jalanImporter->import($path);
            return;
        }

        // 未対応CSV
        throw new \Exception(
            '対応していないCSV形式です。'
        );
    }
}