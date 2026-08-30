<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ListingResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function show(Request $request, User $user): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 12), 1), 50);
        $user->loadCount(['activeListings', 'inactiveListings', 'ratingsReceived'])
            ->loadAvg('ratingsReceived', 'score');

        $listings = $user->activeListings()
            ->with(['category', 'seller'])
            ->withRatingSummary()
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $productGroups = $user->activeListings()
            ->with('category:id,group')
            ->get()
            ->countBy(fn ($listing) => $listing->category->group);

        return response()->json([
            'user' => new UserResource($user),
            'product_groups' => $productGroups,
            'listings' => ListingResource::collection($listings)->response()->getData(true),
        ]);
    }
}
