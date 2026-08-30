<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RatingTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_rate_a_listing_once_and_update_or_delete_own_rating(): void
    {
        $seller = User::factory()->create();
        $reviewer = User::factory()->create();
        $listing = Listing::factory()->active()->create(['seller_id' => $seller->id]);
        Sanctum::actingAs($reviewer);

        $created = $this->postJson("/api/listings/{$listing->id}/ratings", [
            'score' => 5,
            'comment' => 'Excellent product and communication.',
        ])->assertCreated()->assertJsonPath('data.score', 5);

        $ratingId = $created->json('data.id');
        $this->assertDatabaseHas('ratings', [
            'id' => $ratingId,
            'reviewer_id' => $reviewer->id,
            'seller_id' => $seller->id,
        ]);

        $this->postJson("/api/listings/{$listing->id}/ratings", ['score' => 4])
            ->assertUnprocessable();
        $this->patchJson("/api/ratings/{$ratingId}", ['score' => 4])
            ->assertOk()
            ->assertJsonPath('data.score', 4);
        $this->deleteJson("/api/ratings/{$ratingId}")->assertNoContent();
    }

    public function test_seller_cannot_rate_own_listing(): void
    {
        $seller = User::factory()->create();
        $listing = Listing::factory()->active()->create(['seller_id' => $seller->id]);
        Sanctum::actingAs($seller);

        $this->postJson("/api/listings/{$listing->id}/ratings", ['score' => 5])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('listing');
        $this->assertDatabaseCount('ratings', 0);
    }

    public function test_non_reviewer_cannot_modify_a_rating(): void
    {
        $seller = User::factory()->create();
        $reviewer = User::factory()->create();
        $other = User::factory()->create();
        $listing = Listing::factory()->active()->create(['seller_id' => $seller->id]);
        $rating = Rating::factory()->create([
            'listing_id' => $listing->id,
            'seller_id' => $seller->id,
            'reviewer_id' => $reviewer->id,
        ]);
        Sanctum::actingAs($other);

        $this->patchJson("/api/ratings/{$rating->id}", ['score' => 1])->assertForbidden();
        $this->deleteJson("/api/ratings/{$rating->id}")->assertForbidden();
    }
}
