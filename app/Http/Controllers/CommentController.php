<?php

namespace App\Http\Controllers;

use App\Jobs\PublishComment;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $comments = Comment::paginate(15);
        return $comments;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $comment = Comment::create(
            [
                'description' => $request->input('description'),
                'user_id' => auth()->user()->id,
                'post_id' => $request->input('post_id')
            ]
        );
        PublishComment::dispatch($comment);
    }

    public function commentsByPostPublish(int $postId)
    {
        $comments = Comment::query()
            ->where('post_id', $postId)
            ->where('publish', true)
            ->paginate();

        return $comments;
    }
}
