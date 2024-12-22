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
        Schema::dropIfExists('services');

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->decimal('price', 5, 2, true);
            $table->json('images')->nullable();
            $table->foreignId('user_id')->constrained()->references('id')->on('users');
            $table->foreignId('category_id')->constrained()->references('id')->on('categories');
            $table->text('seller_note');
            $table->string('duration');
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
