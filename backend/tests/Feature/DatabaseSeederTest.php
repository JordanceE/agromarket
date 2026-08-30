<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Listing;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_repeated_demo_seeding_does_not_reset_existing_passwords_or_duplicate_data(): void
    {
        $this->seed();

        $admin = User::where('email', 'admin@agromarket.mk')->firstOrFail();
        $admin->update(['password' => 'AUniqueChangedPassword123!']);
        $counts = [User::count(), Category::count(), Listing::count(), Rating::count()];

        $this->seed();

        $this->assertTrue(Hash::check('AUniqueChangedPassword123!', $admin->fresh()->password));
        $this->assertSame($counts, [User::count(), Category::count(), Listing::count(), Rating::count()]);
    }
}
