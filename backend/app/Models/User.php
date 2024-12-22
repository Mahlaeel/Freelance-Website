<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;



    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'username',
        'email',
        'password',
        'is_admin',
        'role',
        'image',
        'phone_number',
        'is_auth_phone_num',
        'image_pId',
        'is_auth_pId',
        'google_id',
        'about_me',
        'last_seen',
        'job_title',
        'verification_code'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];



    public function sendPasswordResetNotification($token) {

        $url = 'https://spa.test/reset-password?token=' . $token;

        $this->notify(new ResetPasswordNotification($url));
    }

    public function receiver_messages(){ //message relation
        return $this->hasMany(Message::class);
    }

    public function sender_messages() { //message relation
        return $this->hasMany(Message::class);
    }

    public function notifications() { //notification relation
        return $this->hasMany(Notifications::class);
    }

    public function services() {
        return $this->hasMany(Service::class);
    }

}
