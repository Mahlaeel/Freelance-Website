<?php

use App\Models\User;
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
        Schema::dropIfExists('messages');

        Schema::create('messages', function (Blueprint $table) {
            
            $table->id();
            $table->text('content');
            $table->foreignId('receiver_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreignId('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
