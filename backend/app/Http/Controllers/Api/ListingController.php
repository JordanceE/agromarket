<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListingIndexRequest;
use App\Http\Requests\MyListingIndexRequest;
use App\Http\Requests\StoreListingRequest;
use App\Http\Requests\UpdateListingRequest;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class ListingController extends Controller
{
    public function index(ListingIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();

        if (($filters['status'] ?? 'active') !== 'active') {
            throw ValidationException::withMessages([
                'status' => ['Inactive listings are private to their owner.'],
            ]);
        }

        $filters['status'] = 'active';
        $query = Listing::query()->with(['category', 'seller'])->withRatingSummary();

        return ListingResource::collection(
            $this->applyFilters($query, $filters)
                ->paginate($filters['per_page'] ?? 12)
                ->withQueryString()
        );
    }

    public function show(Listing $listing): ListingResource
    {
        abort_unless($listing->status === 'active', 404);
        $listing->load(['category', 'seller', 'ratings.reviewer'])->loadAvg('ratings', 'score')->loadCount('ratings');

        return new ListingResource($listing);
    }

    public function showMine(MyListingIndexRequest $request, Listing $listing): ListingResource
    {
        $this->authorize('update', $listing);
        $listing->load(['category', 'seller', 'ratings.reviewer'])->loadAvg('ratings', 'score')->loadCount('ratings');

        return new ListingResource($listing);
    }

    public function mine(MyListingIndexRequest $request): AnonymousResourceCollection
    {
        $filters = $request->validated();
        $query = $request->user()->listings()->getQuery()->with(['category', 'seller'])->withRatingSummary();

        return ListingResource::collection(
            $this->applyFilters($query, $filters)
                ->paginate($filters['per_page'] ?? 12)
                ->withQueryString()
        );
    }

    public function store(StoreListingRequest $request): JsonResponse
    {
        $listing = $request->user()->listings()->create($request->validated());
        $listing->load(['category', 'seller'])->loadAvg('ratings', 'score')->loadCount('ratings');

        return (new ListingResource($listing))->response()->setStatusCode(201);
    }

    public function update(UpdateListingRequest $request, Listing $listing): ListingResource
    {
        $listing->update($request->validated());
        $listing->refresh();
        $listing->load(['category', 'seller'])->loadAvg('ratings', 'score')->loadCount('ratings');

        return new ListingResource($listing);
    }

    public function destroy(Listing $listing): JsonResponse
    {
        $this->authorize('delete', $listing);
        $listing->delete();

        return response()->json(null, 204);
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        $query
            ->when($filters['search'] ?? null, function (Builder $query, string $search) {
                $term = '%'.mb_strtolower($search).'%';
                $query->where(function (Builder $query) use ($term) {
                    $query->whereRaw('LOWER(title) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(description) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(location) LIKE ?', [$term]);
                });
            })
            ->when($filters['category'] ?? null, function (Builder $query, string $category) {
                if (ctype_digit($category)) {
                    $query->where('category_id', (int) $category);
                } else {
                    $query->whereHas('category', fn (Builder $query) => $query->where('slug', $category));
                }
            })
            ->when($filters['group'] ?? null, fn (Builder $query, string $group) => $query->whereHas('category', fn (Builder $query) => $query->where('group', $group)))
            ->when($filters['listing_type'] ?? null, fn (Builder $query, string $type) => $query->where('listing_type', $type))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['user_id'] ?? null, fn (Builder $query, int $userId) => $query->where('seller_id', $userId))
            ->when(isset($filters['min_price']), fn (Builder $query) => $query->where('price', '>=', $filters['min_price']))
            ->when(isset($filters['max_price']), fn (Builder $query) => $query->where('price', '<=', $filters['max_price']));

        return match ($filters['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('price')->orderByDesc('created_at'),
            'price_desc' => $query->orderByDesc('price')->orderByDesc('created_at'),
            'rating_desc' => $query
                ->orderByRaw('ratings_avg_score DESC NULLS LAST')
                ->orderByDesc('ratings_count')
                ->orderByDesc('created_at'),
            default => $query->latest(),
        };
    }
}
