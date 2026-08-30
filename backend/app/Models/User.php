<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'role',
        'phone',
        'location',
        'bio',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class, 'seller_id');
    }

    public function activeListings(): HasMany
    {
        return $this->listings()->where('status', 'active');
    }

    public function inactiveListings(): HasMany
    {
        return $this->listings()->where('status', 'inactive');
    }

    public function ratingsWritten(): HasMany
    {
        return $this->hasMany(Rating::class, 'reviewer_id');
    }

    public function ratingsReceived(): HasMany
    {
        return $this->hasMany(Rating::class, 'seller_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
