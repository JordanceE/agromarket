<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ModerateListingRequest;
use App\Http\Requests\ListingIndexRequest;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ListingController extends Controller
{
    public function index(ListingIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $query = Listing::query()
            ->with(['category', 'seller'])
            ->withRatingSummary()
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $term = '%'.mb_strtolower($search).'%';
                $query->where(fn (Builder $query) => $query
                    ->whereRaw('LOWER(title) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(description) LIKE ?', [$term])
                    ->orWhereHas('seller', fn (Builder $query) => $query->whereRaw('LOWER(name) LIKE ?', [$term])));
            })
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['listing_type'] ?? null, fn (Builder $query, string $type) => $query->where('listing_type', $type))
            ->when($filters['user_id'] ?? null, fn (Builder $query, int $id) => $query->where('seller_id', $id))
            ->when($filters['group'] ?? null, fn (Builder $query, string $group) => $query->whereHas('category', fn (Builder $query) => $query->where('group', $group)))
            ->when($filters['category'] ?? null, function (Builder $query, string $category) {
                ctype_digit($category)
                    ? $query->where('category_id', (int) $category)
                    : $query->whereHas('category', fn (Builder $query) => $query->where('slug', $category));
            })
            ->latest()
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();

        return ListingResource::collection($query);
    }

    public function update(ModerateListingRequest $request, Listing $listing): ListingResource
    {
        $listing->update($request->validated());
        $listing->load(['category', 'seller'])->loadAvg('ratings', 'score')->loadCount('ratings');

        return new ListingResource($listing);
    }

    public function destroy(Listing $listing): JsonResponse
    {
        $listing->delete();

        return response()->json(null, 204);
    }
}
