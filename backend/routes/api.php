<?php

use App\Http\Controllers\Api\Admin\ListingController as AdminListingController;
use App\Http\Controllers\Api\Admin\StatsController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\RatingController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::middleware('throttle:20,1')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/{listing}', [ListingController::class, 'show']);
Route::get('/users/{user}', [UserController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/my/listings', [ListingController::class, 'mine']);
    Route::get('/my/listings/{listing}', [ListingController::class, 'showMine']);
    Route::post('/listings', [ListingController::class, 'store']);
    Route::match(['put', 'patch'], '/listings/{listing}', [ListingController::class, 'update']);
    Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);

    Route::post('/listings/{listing}/ratings', [RatingController::class, 'store']);
    Route::match(['put', 'patch'], '/ratings/{rating}', [RatingController::class, 'update']);
    Route::delete('/ratings/{rating}', [RatingController::class, 'destroy']);

    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/stats', StatsController::class);
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole']);

        Route::post('/categories', [CategoryController::class, 'store']);
        Route::match(['put', 'patch'], '/categories/{category}', [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        Route::get('/listings', [AdminListingController::class, 'index']);
        Route::patch('/listings/{listing}', [AdminListingController::class, 'update']);
        Route::delete('/listings/{listing}', [AdminListingController::class, 'destroy']);
    });
});
