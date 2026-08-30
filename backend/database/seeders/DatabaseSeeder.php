<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Listing;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@agromarket.mk'],
            [
                'name' => 'AgroMarket Admin',
                'password' => config('seeding.admin_password'),
                'role' => 'admin',
                'phone' => '+389 70 000 001',
                'location' => 'Skopje',
                'bio' => 'AgroMarket platform administrator.',
                'email_verified_at' => now(),
            ]
        );

        $users = collect([
            ['name' => 'Elena Petrova', 'email' => 'elena@example.com', 'phone' => '+389 75 111 222', 'location' => 'Strumica', 'bio' => 'Family crop producer from Strumica.'],
            ['name' => 'Nikola Trajkov', 'email' => 'nikola@example.com', 'phone' => '+389 70 333 444', 'location' => 'Bitola', 'bio' => 'Farmer and agricultural machinery owner.'],
            ['name' => 'Marija Ilievska', 'email' => 'marija@example.com', 'phone' => '+389 78 555 666', 'location' => 'Kavadarci', 'bio' => 'Grape and almond producer.'],
        ])->map(fn (array $data) => User::firstOrCreate(
            ['email' => $data['email']],
            [...$data, 'password' => config('seeding.user_password'), 'role' => 'user', 'email_verified_at' => now()]
        ));

        $categoryDefinitions = [
            ['name' => 'Tractors', 'slug' => 'tractors', 'group' => 'machinery'],
            ['name' => 'Combines', 'slug' => 'combines', 'group' => 'machinery'],
            ['name' => 'Farm Equipment', 'slug' => 'farm-equipment', 'group' => 'machinery'],
            ['name' => 'Wheat', 'slug' => 'wheat', 'group' => 'crops'],
            ['name' => 'Corn', 'slug' => 'corn', 'group' => 'crops'],
            ['name' => 'Grapes', 'slug' => 'grapes', 'group' => 'crops'],
            ['name' => 'Almonds', 'slug' => 'almonds', 'group' => 'crops'],
            ['name' => 'Cattle', 'slug' => 'cattle', 'group' => 'livestock'],
            ['name' => 'Milk', 'slug' => 'milk', 'group' => 'dairy'],
            ['name' => 'Seeds', 'slug' => 'seeds', 'group' => 'supplies'],
            ['name' => 'Fertilizers', 'slug' => 'fertilizers', 'group' => 'supplies'],
        ];

        $categories = collect($categoryDefinitions)->mapWithKeys(function (array $data) {
            $category = Category::firstOrCreate(['slug' => $data['slug']], $data);

            return [$data['slug'] => $category];
        });

        $listingDefinitions = [
            ['seller' => 0, 'category' => 'wheat', 'title' => 'Organic wheat, 2026 harvest', 'description' => 'Clean, dry organic wheat from this season, available for collection or arranged delivery.', 'listing_type' => 'sell', 'price' => 18.50, 'unit' => 'kg', 'status' => 'active', 'location' => 'Strumica', 'image_url' => 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b'],
            ['seller' => 1, 'category' => 'tractors', 'title' => 'John Deere 5075E tractor', 'description' => 'Well-maintained 75 HP tractor with service history and recently replaced rear tyres.', 'listing_type' => 'sell', 'price' => 31500, 'unit' => 'piece', 'status' => 'active', 'location' => 'Bitola', 'image_url' => 'https://images.unsplash.com/photo-1605338198618-d6c16421e8f1'],
            ['seller' => 2, 'category' => 'grapes', 'title' => 'Vranec wine grapes', 'description' => 'Fresh Vranec grapes from Tikvesh, hand-picked and available in bulk quantities.', 'listing_type' => 'sell', 'price' => 32, 'unit' => 'kg', 'status' => 'active', 'location' => 'Kavadarci', 'image_url' => 'https://images.unsplash.com/photo-1537640538966-79f369143f8f'],
            ['seller' => 0, 'category' => 'corn', 'title' => 'Looking to buy feed corn', 'description' => 'Seeking dry feed corn from a local producer; regular monthly quantities preferred.', 'listing_type' => 'buy', 'price' => 15, 'unit' => 'kg', 'status' => 'active', 'location' => 'Strumica', 'image_url' => 'https://images.unsplash.com/photo-1551754655-cd27e38d2076'],
            ['seller' => 1, 'category' => 'farm-equipment', 'title' => 'Used irrigation pump', 'description' => 'Diesel irrigation pump in working condition, sold with hoses and connectors.', 'listing_type' => 'sell', 'price' => 850, 'unit' => 'piece', 'status' => 'inactive', 'location' => 'Bitola', 'image_url' => null],
            ['seller' => 2, 'category' => 'almonds', 'title' => 'Shelled local almonds', 'description' => 'Naturally dried shelled almonds packed in five-kilogram bags.', 'listing_type' => 'sell', 'price' => 420, 'unit' => 'kg', 'status' => 'active', 'location' => 'Kavadarci', 'image_url' => 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46'],
        ];

        $listings = collect($listingDefinitions)->map(function (array $data) use ($users, $categories) {
            $seller = $users[$data['seller']];
            $category = $categories[$data['category']];
            unset($data['seller'], $data['category']);

            return Listing::firstOrCreate(
                ['seller_id' => $seller->id, 'title' => $data['title']],
                [...$data, 'category_id' => $category->id]
            );
        });

        foreach ($listings->take(4) as $index => $listing) {
            $reviewer = $users[($index + 1) % $users->count()];

            if ($reviewer->id === $listing->seller_id) {
                $reviewer = $admin;
            }

            Rating::firstOrCreate(
                ['listing_id' => $listing->id, 'reviewer_id' => $reviewer->id],
                ['seller_id' => $listing->seller_id, 'score' => 4 + ($index % 2), 'comment' => 'Clear description and reliable communication.']
            );
        }
    }
}
