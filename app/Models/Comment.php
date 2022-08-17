<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'description', 'publish','user_id','post_id'
    ];

    public function post(){
        return $this->belognsTo(Post::class);
    }
}
