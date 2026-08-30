<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Listing;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $averageRating = Rating::query()->avg('score');

        return response()->json([
            'users' => [
                'total' => User::query()->count(),
                'admins' => User::query()
                    ->where('role', 'admin')
                    ->count(),
            ],

            'listings' => [
                'total' => Listing::query()->count(),

                'active' => Listing::query()
                    ->where('status', 'active')
                    ->count(),

                'inactive' => Listing::query()
                    ->where('status', 'inactive')
                    ->count(),

                'selling' => Listing::query()
                    ->where('listing_type', 'sell')
                    ->count(),

                'buying' => Listing::query()
                    ->where('listing_type', 'buy')
                    ->count(),
            ],

            'categories' => Category::query()->count(),

            'ratings' => [
                'total' => Rating::query()->count(),
                'average' => $averageRating === null
                    ? null
                    : round((float) $averageRating, 2),
            ],
        ]);
    }
}
