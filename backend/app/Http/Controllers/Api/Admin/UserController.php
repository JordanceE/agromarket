<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Http\Resources\AuthenticatedUserResource;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:120'],
            'role' => ['nullable', Rule::in(['user', 'admin'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $users = User::query()
            ->withCount(['activeListings', 'inactiveListings', 'ratingsReceived'])
            ->withAvg('ratingsReceived', 'score')
            ->when($validated['search'] ?? null, function (Builder $query, string $search) {
                $term = '%'.mb_strtolower($search).'%';
                $query->where(fn (Builder $query) => $query
                    ->whereRaw('LOWER(name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(email) LIKE ?', [$term]));
            })
            ->when($validated['role'] ?? null, fn (Builder $query, string $role) => $query->where('role', $role))
            ->latest()
            ->paginate($validated['per_page'] ?? 20)
            ->withQueryString();

        return AuthenticatedUserResource::collection($users);
    }

    public function updateRole(UpdateUserRoleRequest $request, User $user): AuthenticatedUserResource|JsonResponse
    {
        if ($request->user()->is($user) && $request->validated('role') !== 'admin') {
            return response()->json(['message' => 'You cannot remove your own administrator role.'], 422);
        }

        $user->update(['role' => $request->validated('role')]);

        return new AuthenticatedUserResource($user->fresh());
    }
}
