<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        try{
            $posts = Post::all();
            return response()->json([
                'status' => true,
                'posts' => $posts
            ]);
        }catch(Exception $e){
            Log::error($e->getMessage());
            return response()->json([
                'message'=>'Erro ao retornar Posts'
            ],500);
        }
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StorePostRequest $request)
    {
        try{
            return (new PostResource(Post::create($request->all())))
                ->response();

        }catch(Exception $e){
            Log::error($e->getMessage());
            return response()->json([
                'message'=>'Erro ao cadastrar Post'
            ],500);
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        try{
            return (new PostResource(Post::findOrFail($id)))
                ->response();
        }catch(Exception $e){
            Log::error($e->getMessage());
            return response()->json([
                'message'=>'Erro ao retornar Post'
            ],500);
        }

    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdatePostRequest $request,int $id)
    {
        try{
            $post = Post::findOrFail($id);
            $post->fill($request->all());
            $post->save();

            return (new PostResource($post))
                ->response();

        }catch(Exception $e){
            Log::error($e->getMessage());
            return response()->json([
                'message'=>'Erro ao atualizar Post'
            ],500);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        try{
            $post = Post::findOrFail( $id );
            $post->delete();
            return response()->json(['sucess' => 'Post deletado com sucesso']);

        }catch(Exception $e){
            Log::error($e->getMessage());
            return response()->json([
                'message'=>'Erro ao tentar excluir Post'
            ],500);
        }
    }
}
