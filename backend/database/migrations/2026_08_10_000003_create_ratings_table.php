<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->smallInteger('score');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['reviewer_id', 'listing_id']);
            $table->index(['seller_id', 'score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
