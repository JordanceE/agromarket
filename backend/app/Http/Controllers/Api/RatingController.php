<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRatingRequest;
use App\Http\Requests\UpdateRatingRequest;
use App\Http\Resources\RatingResource;
use App\Models\Listing;
use App\Models\Rating;
use Illuminate\Http\JsonResponse;

class RatingController extends Controller
{
    public function store(StoreRatingRequest $request, Listing $listing): JsonResponse
    {
        abort_unless($listing->status === 'active', 404);

        if ($listing->seller_id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot rate your own listing.',
                'errors' => ['listing' => ['You cannot rate your own listing.']],
            ], 422);
        }

        if (Rating::where('listing_id', $listing->id)->where('reviewer_id', $request->user()->id)->exists()) {
            return response()->json([
                'message' => 'You have already rated this listing.',
                'errors' => ['listing' => ['Only one rating per listing is allowed. Update the existing rating instead.']],
            ], 422);
        }

        $rating = $listing->ratings()->create([
            ...$request->validated(),
            'reviewer_id' => $request->user()->id,
            'seller_id' => $listing->seller_id,
        ]);
        $rating->load('reviewer');

        return (new RatingResource($rating))->response()->setStatusCode(201);
    }

    public function update(UpdateRatingRequest $request, Rating $rating): RatingResource
    {
        $this->authorize('update', $rating);
        $rating->update($request->validated());

        return new RatingResource($rating->fresh('reviewer'));
    }

    public function destroy(Rating $rating): JsonResponse
    {
        $this->authorize('delete', $rating);
        $rating->delete();

        return response()->json(null, 204);
    }
}
