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
        Schema::table('service_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('technician_id')->nullable()->after('user_id'); // Technician snapshot from the service at order time
            $table->timestamp('paid_at')->nullable()->after('status');
            $table->timestamp('started_at')->nullable()->after('paid_at');
            $table->foreign('technician_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_orders', function (Blueprint $table) {
            $table->dropForeign(['technician_id']);
            $table->dropColumn(['technician_id', 'paid_at', 'started_at']);
        });
    }
};
