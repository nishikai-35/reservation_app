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
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            
            // 部屋との関連
            $table->foreignId('room_id')
                  ->constrained('rooms')
                  ->cascadeOnDelete();

            // 予約情報
            $table->string('reservation_number')->unique();
            $table->string('booking_site')->nullable();
            $table->date('reservation_date');

            // 宿泊期間
            $table->date('checkin_date');
            $table->date('checkout_date');

            // 宿泊人数
            $table->integer('guest_count');
            $table->integer('adult_count')->default(0);
            $table->integer('child_count')->default(0);

            // 金額
            $table->integer('amount')->default(0);

            // 決済
            $table->tinyInteger('payment_status')->default(0);
            $table->string('payment_method')->nullable();

            // 宿泊者情報
            $table->string('guest_name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();

            // 備考
            $table->text('note')->nullable();

            // ステータス
            $table->tinyInteger('status')->default(1);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
