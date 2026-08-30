<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_receive_a_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Ana Farmer',
            'email' => 'ana@example.com',
            'password' => 'StrongPass123!',
            'password_confirmation' => 'StrongPass123!',
            'phone' => '+389 70 123 456',
            'location' => 'Prilep',
        ]);

        $response->assertCreated()
            ->assertJsonPath('user.email', 'ana@example.com')
            ->assertJsonPath('user.role', 'user')
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email', 'role']]);

        $this->assertDatabaseHas('users', ['email' => 'ana@example.com', 'role' => 'user']);
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_user_can_login_view_profile_and_logout_current_token(): void
    {
        User::factory()->create([
            'email' => 'farmer@example.com',
            'password' => 'StrongPass123!',
        ]);

        $login = $this->postJson('/api/auth/login', [
            'email' => 'farmer@example.com',
            'password' => 'StrongPass123!',
            'device_name' => 'feature-test',
        ])->assertOk()->assertJsonStructure(['token', 'user']);

        $token = $login->json('token');
        $this->withToken($token)->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('data.email', 'farmer@example.com');

        $this->withToken($token)->postJson('/api/auth/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->withToken($token)->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create(['email' => 'farmer@example.com']);

        $this->postJson('/api/auth/login', [
            'email' => 'farmer@example.com',
            'password' => 'not-the-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_registration_requires_a_public_contact_phone(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'No Contact Farmer',
            'email' => 'no-contact@example.com',
            'password' => 'StrongPass123!',
            'password_confirmation' => 'StrongPass123!',
            'location' => 'Prilep',
        ])->assertUnprocessable()->assertJsonValidationErrors('phone');
    }
}
