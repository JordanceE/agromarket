<?php

namespace App\Http\Requests;

use App\Models\Category;
use App\Models\Listing;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MyListingIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:120'],
            'group' => ['nullable', Rule::in(Category::GROUPS)],
            'listing_type' => ['nullable', Rule::in(Listing::TYPES)],
            'status' => ['nullable', Rule::in(Listing::STATUSES)],
            'sort' => ['nullable', Rule::in(['newest', 'price_asc', 'price_desc', 'rating_desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
