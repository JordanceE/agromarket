<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->filled('name') && ! $this->exists('slug')) {
            $this->merge(['slug' => Str::slug($this->string('name')->value())]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        $category = $this->route('category');

        return [
            'name' => ['sometimes', 'string', 'min:2', 'max:120', Rule::unique('categories', 'name')->ignore($category)],
            'slug' => ['sometimes', 'string', 'max:120', 'alpha_dash:ascii', Rule::unique('categories', 'slug')->ignore($category)],
            'group' => ['sometimes', Rule::in(Category::GROUPS)],
        ];
    }
}
