<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use App\Mail\VerificationCodeMail;
use App\Models\User;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $messages = [
            'username.unique' => 'اسم المستخدم هذا مستخدم مسبقًا.',
            'email.unique' => 'البريد الإلكتروني هذا مستخدم مسبقًا.',
        ];

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'c_password' => 'required|same:password',
            'role' => 'required|in:seller,buyer',
        ], $messages);

        $verificationCode = rand(100000, 999999);

        // Store in cache temporarily
        $registerData = [
            'first_name' => trim($request->first_name),
            'last_name' => trim($request->last_name),
            'username' => trim($request->username),
            'email' => trim($request->email),
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'verification_code' => $verificationCode,
        ];

        Cache::put('register_' . $request->email, $registerData, now()->addMinutes(15));

        Mail::to($request->email)->send(new VerificationCodeMail($verificationCode));

        return response()->json(['message' => 'تم إرسال رمز التحقق إلى بريدك الإلكتروني.'], 200);
    }

    public function verifyCode(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required|numeric',
        ]);

        $registerData = Cache::get('register_' . $validated['email']);

        if (!$registerData || $registerData['verification_code'] != $validated['code']) {
            return response()->json(['message' => 'رمز التحقق غير صحيح أو منتهي الصلاحية.'], 400);
        }

        // التحقق ناجح، حذف رمز التحقق
        $registerData['is_verified'] = true;
        Cache::put('register_' . $validated['email'], $registerData, now()->addMinutes(15));

        return response()->json(['message' => 'تم التحقق بنجاح. يمكنك الآن إكمال عملية التسجيل.'], 200);
    }

    public function createUser(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|email',
    ]);

    $registerData = Cache::get('register_' . $validated['email']);

    if (!$registerData || empty($registerData['is_verified'])) {
        return response()->json(['message' => 'لم يتم التحقق من بريدك الإلكتروني.'], 400);
    }

    // إنشاء المستخدم
    $user = User::create([
        'first_name' => $registerData['first_name'],
        'last_name' => $registerData['last_name'],
        'username' => $registerData['username'],
        'email' => $registerData['email'],
        'password' => $registerData['password'],
        'role' => $registerData['role'],
        'email_verified_at' => now(),
    ]);

    Cache::forget('register_' . $validated['email']);

    $token = $user->createToken('YourAppName')->plainTextToken;

    return response()->json(['message' => 'تم إنشاء المستخدم بنجاح.', 'token' => $token, 'user' => $user], 201);
}


public function resendVerificationCode(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|email',
    ]);

    $registerData = Cache::get('register_' . $validated['email']);

    if (!$registerData) {
        return response()->json(['message' => 'لا توجد بيانات مسجلة لهذا البريد الإلكتروني.'], 400);
    }

    $verificationCode = rand(100000, 999999);
    Cache::put('register_' . $validated['email'], array_merge($registerData, ['verification_code' => $verificationCode]), now()->addMinutes(15));

    Mail::to($validated['email'])->send(new VerificationCodeMail($verificationCode));

    return response()->json(['message' => 'تم إعادة إرسال رمز التحقق.'], 200);
}
}
