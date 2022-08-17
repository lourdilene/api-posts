<?php

namespace App\Http\Controllers;

use App\Jobs\PublishLike;
use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LikeController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try{
            $likes = Like::paginate(15);
            return $likes;
        }catch(\Exception $e){
            Log::error($e->getMessage());
            return response()->json([
                'message'=>'Erro ao retornar likes.'
            ],500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $like = Like::create(
            [
                'user_id' => auth()->user()->id,
                'post_id' => $request->input('post_id')
            ]
        );
        PublishLike::dispatch($like);
    }

    public function likesByPostPublish(int $postId)
    {
        $likes = Like::query()
            ->where('post_id', $postId)
            ->where('publish', true)
            ->paginate();

        return $likes;
    }
}
