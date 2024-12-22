<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Controller;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;

class UpdatePasswordController extends Controller
{
        /**
     * Update Password with current password validation
     */
    public function updatePassword(Request $request) {
        $this->authorize('updatePassword', User::class);

        $request->validate([
            'current_password' => 'required | string',
            'password' => 'required | min:8 | string | confirmed',
        ]);

        $currentPasswordStatus = Hash::check($request->current_password, auth()->user()->password);

        if($currentPasswordStatus) {
            User::findOrFail(Auth::user()->id)->update([
                'password' => Hash::make($request->password),
            ]);
            return response()->json([
                'message' => 'Password updated successfully'
            ], 200);
        }else {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

    }
}
