<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillabel = [
        'content',
        'sender_id',
        'receiver_id'
    ];

    public function sender() { //sender_id relation
        return $this->belongsTo(User::class);
    }
    public function receiver() { //receiver_id relation
        return $this->belongsTo(User::class);
    }

}
