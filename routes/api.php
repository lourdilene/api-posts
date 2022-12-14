<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/
Route::post('/auth/register', [AuthController::class, 'createUser']);
Route::post('/auth/login', [AuthController::class, 'loginUser'])->name('login');

Route::apiResource('posts', PostController::class)->middleware('auth:sanctum');

Route::apiResource('comments', CommentController::class)->middleware('auth:sanctum');

Route::apiResource('likes', LikeController::class)->middleware('auth:sanctum');

Route::get('{postId}/comments', [CommentController::class, 'commentsByPostPublish']);
Route::get('{postId}/likes', [LikeController::class, 'likesByPostPublish']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
