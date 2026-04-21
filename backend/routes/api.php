<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\WatchController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Middleware\CheckAdmin;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public watches route
Route::get('/watches', [WatchController::class, 'index']);
Route::get('/watches/{id}', [WatchController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    
    // Cart Routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    
    // Order Routes
    Route::post('/orders/place', [OrderController::class, 'placeOrder']);
    Route::get('/orders', [OrderController::class, 'index']);
    
    // Profile
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);

    
    // Admin Only Watch routes
    Route::middleware([CheckAdmin::class])->group(function () {
        Route::post('/watches', [WatchController::class, 'store']);
        Route::put('/watches/{id}', [WatchController::class, 'update']);
        Route::delete('/watches/{id}', [WatchController::class, 'destroy']);
        
        // Admin Dashboard & User Management
        Route::get('/admin/stats', [AdminController::class, 'stats']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    });
});
