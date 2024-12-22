<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function logout() { // (post) http://127.0.0.1:8000/api/logout
        Auth::logout();

        return response()->json([
            'message' => 'Logged out' 
        ]);
    }
}
