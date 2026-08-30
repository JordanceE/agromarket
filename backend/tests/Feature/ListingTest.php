<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_filters_and_sorts_only_active_listings(): void
    {
        $machinery = Category::factory()->create(['slug' => 'tractors', 'group' => 'machinery']);
        $crops = Category::factory()->create(['slug' => 'wheat', 'group' => 'crops']);
        $cheap = Listing::factory()->active()->create(['category_id' => $machinery->id, 'price' => 1000]);
        $expensive = Listing::factory()->active()->create(['category_id' => $machinery->id, 'price' => 5000]);
        $inactive = Listing::factory()->create(['category_id' => $crops->id, 'status' => 'inactive']);

        $this->getJson('/api/listings?group=machinery&sort=price_desc')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $expensive->id)
            ->assertJsonPath('data.1.id', $cheap->id);

        Rating::factory()->create([
            'listing_id' => $cheap->id,
            'seller_id' => $cheap->seller_id,
            'reviewer_id' => User::factory()->create()->id,
            'score' => 5,
        ]);
        $this->getJson('/api/listings?group=machinery&sort=rating_desc')
            ->assertOk()
            ->assertJsonPath('data.0.id', $cheap->id)
            ->assertJsonPath('data.1.id', $expensive->id);

        $this->getJson('/api/listings?max_price=1000')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $cheap->id);

        $this->getJson('/api/listings?status=inactive')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
        $this->getJson("/api/listings/{$inactive->id}")->assertNotFound();
    }

    public function test_owner_can_create_update_view_and_delete_own_listing(): void
    {
        $owner = User::factory()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($owner);

        $created = $this->postJson('/api/listings', $this->validPayload($category, [
            'title' => 'Fresh yellow corn',
            'status' => 'inactive',
        ]))->assertCreated()->assertJsonPath('data.status', 'inactive');

        $listingId = $created->json('data.id');
        $this->getJson('/api/my/listings?status=inactive')
            ->assertOk()
            ->assertJsonPath('data.0.id', $listingId);
        $this->getJson("/api/my/listings/{$listingId}")
            ->assertOk()
            ->assertJsonPath('data.id', $listingId);

        $this->patchJson("/api/listings/{$listingId}", ['status' => 'active', 'price' => 45.50])
            ->assertOk()
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.price', '45.50');

        $this->deleteJson("/api/listings/{$listingId}")->assertNoContent();
        $this->assertDatabaseMissing('listings', ['id' => $listingId]);
    }

    public function test_non_owner_cannot_update_delete_or_view_private_listing(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $listing = Listing::factory()->create(['seller_id' => $owner->id, 'status' => 'inactive']);
        Sanctum::actingAs($other);

        $this->patchJson("/api/listings/{$listing->id}", ['title' => 'Changed title'])
            ->assertForbidden();
        $this->deleteJson("/api/listings/{$listing->id}")->assertForbidden();
        $this->getJson("/api/my/listings/{$listing->id}")->assertForbidden();
        $this->assertDatabaseHas('listings', ['id' => $listing->id, 'title' => $listing->title]);
    }

    public function test_public_user_profile_contains_only_active_listings(): void
    {
        $seller = User::factory()->create();
        $active = Listing::factory()->active()->create(['seller_id' => $seller->id]);
        Listing::factory()->create(['seller_id' => $seller->id, 'status' => 'inactive']);

        $this->getJson("/api/users/{$seller->id}")
            ->assertOk()
            ->assertJsonPath('user.id', $seller->id)
            ->assertJsonPath('user.active_listings_count', 1)
            ->assertJsonCount(1, 'listings.data')
            ->assertJsonPath('listings.data.0.id', $active->id);
    }

    private function validPayload(Category $category, array $overrides = []): array
    {
        return [
            'category_id' => $category->id,
            'title' => 'Farm product listing',
            'description' => 'A detailed description of this agricultural product.',
            'listing_type' => 'sell',
            'price' => 120.50,
            'unit' => 'kg',
            'status' => 'active',
            'location' => 'Prilep',
            'image_url' => 'https://example.com/product.jpg',
            ...$overrides,
        ];
    }
}
