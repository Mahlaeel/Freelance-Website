<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()  // (get) http://127.0.0.1:8000/api/categories
    {
        $category = Category::with('categories')->where('mainCategory', '=', null)->get();

        return response()->json([
            'success' => true,
            'categories' => $category
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)  
    {
        //for the dashboard
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category) // (get) http://127.0.0.1:8000/api/categories/{category}
    {
        $cate = Category::where('id', '=', $category->id)
        ->with(['categories', 'services'])
        ->get();

        return response()->json([
            'success' => true,
            'category' => $cate
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)  
    {
        //for the dashboard
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //for the dashboard
    }
}
