<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Schema::table('rooms', function (Blueprint $table) {

        //     $table->integer('adult_price')
        //         ->default(0)
        //         ->after('capacity_max');

        //     $table->integer('child_price')
        //         ->default(0)
        //         ->after('adult_price');

        // });
    }


    public function down(): void
    {
        // Schema::table('rooms', function (Blueprint $table) {

        //     $table->dropColumn([
        //         'adult_price',
        //         'child_price'
        //     ]);

        // });
    }
};