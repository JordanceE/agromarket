<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $averageRatingLoaded = array_key_exists('ratings_avg_score', $this->resource->getAttributes());

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'listing_type' => $this->listing_type,
            'price' => $this->price,
            'unit' => $this->unit,
            'status' => $this->status,
            'location' => $this->location,
            'image_url' => $this->image_url,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'seller' => new UserResource($this->whenLoaded('seller')),
            'average_rating' => $this->when(
                $averageRatingLoaded,
                fn () => $this->ratings_avg_score === null ? null : round((float) $this->ratings_avg_score, 2),
            ),
            'ratings_count' => $this->whenCounted('ratings'),
            'ratings' => RatingResource::collection($this->whenLoaded('ratings')),
            'is_owner' => $request->user()?->id === $this->seller_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
