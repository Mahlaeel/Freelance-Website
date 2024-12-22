<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //for the dashboard
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
    public function show(User $user)
    {
    $services = $user->services()->get();

    return response()->json([
        'success' => true,
        'services' => $services,
    ]);
    }

    /**
     * Update the specified resource in storage.
     */

    public function updateJobTitle(Request $request, User $user)
    {
    $u = User::find($user->id);

    if (!$u) {
        return response()->json(['message' => 'The user not found'], 404);
    }

    $u->update([
        'job_title' => $request->job_title,
    ]);

    return response()->json([
        'message' => 'Job title updated successfully!',
        'user' => $u
    ], 200);
    }

    public function updateAboutMe(Request $request, User $user)
    {
        $u = User::find($user->id);

        if (!$u) {
            return response()->json(['message' => 'The user not found'], 404);
        }

        $u->update([
            'about_me' => $request->about_me,
        ]);

        return response()->json([
            'message' => 'About me updated successfully!',
            'user' => $u
        ], 200);
    }

    public function updateRole(Request $request, User $user)
    {
        $u = User::find($user->id);

        if (!$u) {
            return response()->json(['message' => 'The user not found'], 404);
        }

        $u->update([
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'role updated successfully!',
            'user' => $u
        ], 200);
    }

    public function updateImage(Request $request, User $user)
    {
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        if ($request->has('image')) {
            $imageData = $request->input('image');

            if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
                $extension = strtolower($type[1]);

                if (!in_array($extension, ['jpg', 'jpeg', 'png'])) {
                    return response()->json(['message' => 'Unsupported image format'], 400);
                }

                $image = explode(',', $imageData)[1];
                $fileName = time() . '.' . $extension;
                $filePath = 'uploads/profile_pictures/' . $fileName;

                if ($user->image && Storage::disk('public')->exists($user->image)) {
                    Storage::disk('public')->delete($user->image);
                }

                Storage::disk('public')->put($filePath, base64_decode($image));

                $fullPath = asset('storage/' . $filePath);

                $user->update(['image' => $fullPath]);

                return response()->json([
                    'message' => 'Image updated successfully!',
                    'user' => $user,
                    'image_url' => $fullPath, // تأكيد الرابط الكامل
                ], 200);
            }

            return response()->json(['message' => 'Invalid image data'], 400);
        }

        return response()->json(['message' => 'No image uploaded'], 400);
    }

    public function deleteImage(User $user)
    {
    if (!$user) {
        return response()->json(['message' => 'The user not found'], 404);
    }

    if ($user->image && Storage::disk('public')->exists(str_replace('storage/', '', $user->image))) {
        Storage::disk('public')->delete(str_replace('storage/', '', $user->image));
        $user->update(['image' => null]);
    }

    return response()->json(['message' => 'Image deleted successfully'], 200);
    }

    public function deleteJobTitle(User $user)
    {
    $user->job_title = null;
    $user->save();
    return response()->json(['message' => 'تم حذف المسمى الوظيفي بنجاح.'], 200);
    }


    public function verifyPhone(Request $request, User $user)
    {
        $u = User::find($user->id);

        if (!$u) {
            return response()->json(['message' => 'The user not found'], 404);
        }

        // التحقق من صحة رقم الجوال
        $request->validate([
            'phone_number' => 'required',
        ]);

        // تحديث رقم الجوال وتحديده على أنه قيد المراجعة
        $u->update([
            'phone_number' => $request->phone_number,
            // 'is_auth_phone_num' => null, // يعني أنه قيد المراجعة
        ]);
        // $u->save();

        return response()->json([
            'message' => 'رقم الجوال قيد المراجعة',
            'user' => $u
        ], 200);
    }


    public function updatePassword(Request $request) {
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


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // for the dashboard
    }
}
