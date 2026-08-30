<?php

namespace App\Http\Requests\Admin;

use App\Models\Listing;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ModerateListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(Listing::STATUSES)],
        ];
    }
}
