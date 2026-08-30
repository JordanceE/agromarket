<?php

namespace App\Http\Requests;

use App\Models\Listing;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $listing = $this->route('listing');

        return $listing instanceof Listing && $this->user()?->can('update', $listing) === true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'title' => ['sometimes', 'string', 'min:3', 'max:180'],
            'description' => ['sometimes', 'string', 'min:10', 'max:10000'],
            'listing_type' => ['sometimes', Rule::in(Listing::TYPES)],
            'price' => ['sometimes', 'numeric', 'min:0', 'max:9999999999.99'],
            'unit' => ['sometimes', 'string', 'max:50'],
            'status' => ['sometimes', Rule::in(Listing::STATUSES)],
            'location' => ['sometimes', 'string', 'max:255'],
            'image_url' => ['sometimes', 'nullable', 'url:http,https', 'max:2048'],
        ];
    }
}
