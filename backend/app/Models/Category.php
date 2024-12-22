<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'image',
        'mainCategory'
    ];

    public function mainCategory() {  //main_Category relation
        return $this->belongsTo(Category::class);
    }

    public function categories() { //category relation
        return $this->hasMany(Category::class, 'mainCategory');
    }

    public function services() {
        return $this->hasMany(Service::class);
    }

}
