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
        Schema::table('cart_items', function (Blueprint $table) {
            $table->string('color')->nullable()->after('watch_id');
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('color')->nullable()->after('watch_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cart_items', function (Blueprint $table) {
            $table->dropColumn('color');
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('color');
        });
    }
};
