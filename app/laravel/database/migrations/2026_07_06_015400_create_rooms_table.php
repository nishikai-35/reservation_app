<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
    
            // 部屋名
            $table->string('name');
    
            // 部屋番号
            $table->string('room_number')->unique();
    
            // 宿泊人数
            $table->integer('capacity_min')->default(1);
            $table->integer('capacity_max')->default(4);
    
            // 料金
            $table->integer('adult_price')->nullable();
            $table->integer('child_price')->nullable();
    
            // チェックイン・アウト時間
            $table->time('checkin_time')->default('15:00:00');
            $table->time('checkout_time')->default('10:00:00');
    
            // 備考
            $table->text('note')->nullable();
    
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
