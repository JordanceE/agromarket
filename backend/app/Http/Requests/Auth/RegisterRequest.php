<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->filled('email')) {
            $this->merge(['email' => mb_strtolower(trim($this->string('email')->value()))]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'phone' => ['required', 'string', 'max:30', 'regex:/^[0-9+()\-\s.]+$/'],
            'location' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ];
    }
}
