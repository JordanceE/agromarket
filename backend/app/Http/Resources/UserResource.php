<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $canSeePrivateFields = $request->user()?->id === $this->id || $request->user()?->isAdmin() === true;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->when($canSeePrivateFields, $this->email),
            'role' => $this->role,
            'phone' => $this->phone,
            'location' => $this->location,
            'bio' => $this->bio,
            'active_listings_count' => $this->whenCounted('active_listings'),
            'inactive_listings_count' => $this->when(
                $canSeePrivateFields && array_key_exists('inactive_listings_count', $this->resource->getAttributes()),
                fn () => $this->inactive_listings_count,
            ),
            'ratings_count' => $this->whenCounted('ratings_received'),
            'average_rating' => $this->when(
                array_key_exists('ratings_received_avg_score', $this->resource->getAttributes()),
                fn () => $this->ratings_received_avg_score === null ? null : round((float) $this->ratings_received_avg_score, 2),
            ),
            'created_at' => $this->created_at,
        ];
    }
}
