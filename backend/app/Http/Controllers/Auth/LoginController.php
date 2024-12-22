<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    public function login(Request $request) { // (post) http://127.0.0.1:8000/api/login
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            ], 401);
        }

        $user = User::where('email', $request->email)->first();
        $token = $user->createToken('auth_token')->plainTextToken;

            // if(isset($request->remember) && !empty($request->remember)){
            //     setcookie('email', $request->email, time()+3600);
            //     setcookie('password', $request->password, time()+3600);
            // }else{
            //     setcookie('email', '');
            //     setcookie('password', '');
            // }

            return response()->json([
                'access_token' => $token,
                'user' => $user,
            ]);

    }
}
