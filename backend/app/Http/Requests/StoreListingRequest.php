<?php

namespace App\Http\Requests;

use App\Models\Listing;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'title' => ['required', 'string', 'min:3', 'max:180'],
            'description' => ['required', 'string', 'min:10', 'max:10000'],
            'listing_type' => ['required', Rule::in(Listing::TYPES)],
            'price' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'unit' => ['required', 'string', 'max:50'],
            'status' => ['sometimes', Rule::in(Listing::STATUSES)],
            'location' => ['required', 'string', 'max:255'],
            'image_url' => ['nullable', 'url:http,https', 'max:2048'],
        ];
    }
}
