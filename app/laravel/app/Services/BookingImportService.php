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


    public function preview(string $path): array
    {
        $importer = $this->getImporter($path);

        return $importer->preview($path);
    }


    public function import(
        string $path,
        array $selectedReservationNumbers = []
    ): int {
    
        $importer = $this->getImporter($path);

        return $importer->import(
            $path,
            $selectedReservationNumbers
        );
    }


    private function getImporter(string $path)
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

        fclose($handle);

        if ($header === null) {

            throw new \Exception(
                'BookingImportService：CSVヘッダーが取得できません。'
            );
        }


        // Booking.com
        if (
            in_array('ユニットタイプ', $header) &&
            in_array('予約番号', $header)
        ) {
            return $this->bookingImporter;
        }


        // じゃらん
        if (
            in_array('部屋タイプ名称', $header) &&
            in_array('予約番号', $header)
        ) {
            return $this->jalanImporter;
        }

        // その他CSVファイル
        throw new \Exception(
            '対応していないCSV形式です。'
        );
    }
}