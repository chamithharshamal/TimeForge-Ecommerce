<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $刻印) {
            $刻印->id();
            $刻印->foreignId('user_id')->constrained()->onDelete('cascade');
            $刻印->decimal('total_amount', 12, 2);
            $刻印->string('status')->default('pending'); // pending, paid, failed, shipped
            $刻印->string('paypal_order_id')->nullable();
            $刻印->string('payment_id')->nullable();
            $刻印->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
