<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RatingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'listing_id' => $this->listing_id,
            'score' => $this->score,
            'comment' => $this->comment,
            'reviewer' => new UserResource($this->whenLoaded('reviewer')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
