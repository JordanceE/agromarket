<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(
            Category::query()->withCount(['listings' => fn ($query) => $query->where('status', 'active')])
                ->orderBy('group')
                ->orderBy('name')
                ->get()
        );
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $category = Category::create($data);

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $data = $request->validated();

        if (isset($data['name']) && ! array_key_exists('slug', $data)) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return new CategoryResource($category->fresh());
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->listings()->exists()) {
            return response()->json([
                'message' => 'A category with listings cannot be deleted.',
            ], 409);
        }

        $category->delete();

        return response()->json(null, 204);
    }
}
