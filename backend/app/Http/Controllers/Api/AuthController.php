<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\AuthenticatedUserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->safe()->except(['password_confirmation', 'device_name']);
        $data['role'] = 'user';
        $user = User::create($data);
        $token = $user->createToken($request->string('device_name')->value() ?: 'web')->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully.',
            'token' => $token,
            'user' => (new AuthenticatedUserResource($user))->resolve($request),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email')->lower()->value())->first();

        if (! $user || ! Hash::check($request->string('password')->value(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken($request->string('device_name')->value() ?: 'web')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'token' => $token,
            'user' => (new AuthenticatedUserResource($user))->resolve($request),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();
        Auth::guard('sanctum')->forgetUser();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): AuthenticatedUserResource
    {
        $user = $request->user()
            ->loadCount(['activeListings', 'inactiveListings', 'ratingsReceived'])
            ->loadAvg('ratingsReceived', 'score');

        return new AuthenticatedUserResource($user);
    }
}
