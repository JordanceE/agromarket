<?php

namespace App\Http\Requests;

use App\Models\Rating;
use Illuminate\Foundation\Http\FormRequest;

class UpdateRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $rating = $this->route('rating');

        return $rating instanceof Rating && $this->user()?->can('update', $rating) === true;
    }

    public function rules(): array
    {
        return [
            'score' => ['sometimes', 'integer', 'between:1,5'],
            'comment' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
