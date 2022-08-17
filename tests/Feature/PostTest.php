<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PostTest extends TestCase
{
    use RefreshDatabase;
    /**
     * A basic feature test example.
     *
     * @return void
     */
    public function test_index()
    {
        $user = User::factory(User::class)->create();

        auth()->setUser($user);

        $response= $this->actingAs($user)
            ->getJson('/api/posts');

        $response->assertStatus(200);
    }

    public function test_create_new_post()
    {
        $user = User::factory()->make();

        $response = $this->actingAs($user)
            ->postJson('/api/posts', [
                'title' => 'Title Post',
                'description' => 'Description Post',
            ]);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'title' => 'Title Post',
                'description' => 'Description Post',
            ]);
    }

    public function test_show_post()
    {
        $user = User::factory(User::class)->create();

        auth()->setUser($user);

        $post = Post::factory(Post::class)->create();

        $response= $this->actingAs($user)
            ->getJson('/api/posts/' . $post->id);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'title' => $post->title,
                'description' => $post->description
            ]);
    }

    public function test_update_post()
    {
        $user = User::factory(User::class)->create();

        auth()->setUser($user);

        $post = Post::factory(Post::class)->create();

        $response= $this->actingAs($user)
            ->putJson('/api/posts/' . $post->id, [
                'title' => 'update title',
                'description' => 'update description'
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'title' => 'update title',
                'description' => 'update description'
            ]);
    }

    public function test_destroy_post()
    {
        $user = User::factory(User::class)->create();

        auth()->setUser($user);

        $post = Post::factory(Post::class)->create();

        $response = $this->actingAs($user)
            ->deleteJson('/api/posts/' . $post->id);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'sucess' => 'Post deletado com sucesso'
            ]);
    }
}
