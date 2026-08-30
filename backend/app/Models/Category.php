<?php

namespace App\Models;

use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory;

    public const GROUPS = ['machinery', 'crops', 'livestock', 'dairy', 'supplies', 'other'];

    protected $fillable = ['name', 'slug', 'group'];

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }
}
