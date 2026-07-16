<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BackupDatabase extends Command
{
    protected $signature = 'backup:database';
    protected $description = 'Database backup';

    public function handle()
    {
        $filename = 'backup_' . Carbon::now()->format('Y-m-d_H-i-s') . '.sql';
        $path = storage_path('app/backups/' . $filename);

        // 保存先ディレクトリ作成
        if (!file_exists(storage_path('app/backups'))) {
            mkdir(storage_path('app/backups'), 0755, true);
        }


        // MySQLバックアップ
        $command = sprintf(
            'mysqldump --skip-ssl -h %s -u %s -p%s %s > %s',
            env('DB_HOST'),
            env('DB_USERNAME'),
            env('DB_PASSWORD'),
            env('DB_DATABASE'),
            $path
        );

        exec($command, $output, $result);
        if ($result !== 0) {
            $this->error('Backup failed');

            return Command::FAILURE;
        }

        $this->info('Backup completed: ' . $filename);
        return Command::SUCCESS;
    }
}