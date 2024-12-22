<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class GoogleRegisterController extends Controller
{
    public function register(Request $request)
    {
        $messages = [
            'username.unique' => 'اسم المستخدم هذا مستخدم مسبقًا.',
            'google_id.unique' => 'هذا الحساب موجود بالفعل',
        ];

        $validator = Validator::make($request->all(), [
            'username' => 'required|string|unique:users,username',
            'role' => 'required|in:seller,buyer',
            'email' => 'required|email|unique:users,email',
            'first_name' => 'nullable|string',
            'last_name' => 'nullable|string',
            'image' => 'nullable|string',
            'google_id' => 'nullable|string|unique:users,google_id',
        ], $messages);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422, [], JSON_UNESCAPED_UNICODE);
        }


        $user = User::create([
            'username' => $request->username,
            'role' => $request->role,
            'email' => $request->email,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'image' => $request->image,
            'google_id' => $request->google_id,
            'password' => bcrypt(uniqid()),   //we dont need password empty
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => $user,
        ], 201);
    }
}

