<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use Illuminate\Http\Request;

use function Laravel\Prompts\error;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $messages = Message::with(['sender', 'receiver'])->get();
        return response()->json([
            'success' => true,
            'data' => $messages
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {

    }

    /**
     * Display the specified resource.
     */
    public function show(Message $message)
    {
        $message = Message::where('id', '=', $message->id)->with(['sender', 'receiver'])
        ->get();
        return response()->json([
            'success' => true,
            'message' => $message
        ]);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
