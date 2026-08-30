<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('listing_type')->index();
            $table->decimal('price', 12, 2)->index();
            $table->string('unit', 50)->default('piece');
            $table->string('status')->default('active')->index();
            $table->string('location');
            $table->text('image_url')->nullable();
            $table->timestamps();

            $table->index(['category_id', 'status']);
            $table->index(['seller_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
