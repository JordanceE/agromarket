<?php

namespace Database\Factories;

use App\Models\Listing;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Rating> */
class RatingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'listing_id' => Listing::factory(),
            'reviewer_id' => User::factory(),
            'seller_id' => fn (array $attributes) => Listing::findOrFail($attributes['listing_id'])->seller_id,
            'score' => fake()->numberBetween(1, 5),
            'comment' => fake()->optional()->sentence(),
        ];
    }
}
