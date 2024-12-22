<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class GoogleLoginController extends Controller
{
    public function login(Request $request)
    {

        $messages = [
            'google_id.exists' => 'هذا الحساب غير موجود بالفعل',
        ];

        $request->validate([
            'google_id' => 'required|string|exists:users,google_id',
        ], $messages);

        $user = User::where('google_id', $request->google_id)->first();

        if ($user) {
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'access_token' => $token,
                'user' => $user,
            ], 200);
        } else {
            return response()->json(['message' => 'User not found'], 404);
        }
    }
}
