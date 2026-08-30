<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Listing> */
class ListingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'seller_id' => User::factory(),
            'category_id' => Category::factory(),
            'title' => fake()->randomElement([
                'John Deere tractor',
                'Organic wheat harvest',
                'Fresh farm milk',
                'Irrigation pump',
            ]).' '.fake()->unique()->numberBetween(1, 99999),
            'description' => fake()->paragraphs(2, true),
            'listing_type' => fake()->randomElement(Listing::TYPES),
            'price' => fake()->randomFloat(2, 10, 100000),
            'unit' => fake()->randomElement(['piece', 'kg', 'tonne', 'litre']),
            'status' => fake()->randomElement(Listing::STATUSES),
            'location' => fake()->randomElement(['Skopje', 'Bitola', 'Prilep', 'Kavadarci', 'Strumica']),
            'image_url' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef',
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => ['status' => 'active']);
    }

    public function selling(): static
    {
        return $this->state(fn () => ['listing_type' => 'sell']);
    }
}
