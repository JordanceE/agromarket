<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->filled('name') && ! $this->filled('slug')) {
            $this->merge(['slug' => Str::slug($this->string('name')->value())]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120', 'unique:categories,name'],
            'slug' => ['required', 'string', 'max:120', 'alpha_dash:ascii', 'unique:categories,slug'],
            'group' => ['required', Rule::in(Category::GROUPS)],
        ];
    }
}
