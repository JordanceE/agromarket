<?php

namespace App\Models;

use Database\Factories\ListingFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Listing extends Model
{
    /** @use HasFactory<ListingFactory> */
    use HasFactory;

    public const TYPES = ['sell', 'buy'];

    public const STATUSES = ['active', 'inactive'];

    protected $fillable = [
        'seller_id',
        'category_id',
        'title',
        'description',
        'listing_type',
        'price',
        'unit',
        'status',
        'location',
        'image_url',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
        ];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    public function scopeWithRatingSummary(Builder $query): Builder
    {
        return $query->withAvg('ratings', 'score')->withCount('ratings');
    }
}
