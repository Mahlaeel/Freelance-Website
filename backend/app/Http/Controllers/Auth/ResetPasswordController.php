<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Auth\Events\PasswordReset;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ResetPasswordController extends Controller
{
    public function forgetPassword(Request $request) { // (post) http://127.0.0.1:8000/api/forget-password
        $request->validate([
            'email' => 'required | email'
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if($status == Password::RESET_LINK_SENT) {
            return [
                'status' => __($status)
            ];
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)]
        ]);
    }

    public function resetPassword(Request $request) { // (post) http://127.0.0.1:8000/api/reset-password
        $request->validate([
            'token' => 'required',
            'email' => 'required | email',
            'password' => 'required | confirmed'
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60)
                ])->save();

                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if($status == Password::PASSWORD_RESET) {
            // $request->user()->tokens()->delete();
            return response([
                'message' => 'Password reset Successfully!'
            ]);
        }

        return response([
            'message' => __($status)
        ], 500);

    }
}
