<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_cannot_access_admin_endpoints(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/admin/stats')->assertForbidden();
        $this->getJson('/api/admin/users')->assertForbidden();
    }

    public function test_admin_can_manage_roles_categories_and_listing_status(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $listing = Listing::factory()->active()->create(['seller_id' => $user->id]);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/stats')
            ->assertOk()
            ->assertJsonPath('listings.total', 1);
        $this->patchJson("/api/admin/users/{$user->id}/role", ['role' => 'admin'])
            ->assertOk()
            ->assertJsonPath('data.role', 'admin');
        $this->postJson('/api/admin/categories', [
            'name' => 'Greenhouses',
            'group' => 'supplies',
        ])->assertCreated()->assertJsonPath('data.slug', 'greenhouses');
        $this->patchJson("/api/admin/listings/{$listing->id}", ['status' => 'inactive'])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');
    }

    public function test_admin_listing_search_matches_the_seller_name(): void
    {
        $admin = User::factory()->admin()->create();
        $matchingSeller = User::factory()->create(['name' => 'Vladimir Orchard']);
        $matchingListing = Listing::factory()->active()->create([
            'seller_id' => $matchingSeller->id,
            'title' => 'Seasonal farm produce',
            'description' => 'Bulk goods available for collection this week.',
        ]);
        Listing::factory()->active()->create([
            'seller_id' => User::factory()->create(['name' => 'Another Farmer'])->id,
            'title' => 'Agricultural equipment',
            'description' => 'A completely unrelated marketplace listing.',
        ]);
        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/listings?search=vLaDiMiR')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matchingListing->id)
            ->assertJsonPath('data.0.seller.name', 'Vladimir Orchard');
    }
}
