<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function share(Request $request): array
    {
        $legacyUrl = config('agtech.legacy_url');

        return [
            ...parent::share($request),
            'links' => [
                'home' => route('home', absolute: false),
                'about' => route('about', absolute: false),
                'team' => route('team', absolute: false),
                'faq' => route('faq', absolute: false),
                'contact' => route('contact', absolute: false),
                'login' => route('login', absolute: false),
                'contactSubmit' => route('contact.store', absolute: false),
                'loginSubmit' => $legacyUrl.'/Login/Login.php',
                'forgotPassword' => $legacyUrl.'/Verification/Forgot_pass.php',
                'register' => route('register', absolute: false),
                'registerSubmit' => $legacyUrl.'/Verification/Register.php',
                'terms' => $legacyUrl.'/Terms-&-Condition.php',
                'privacy' => $legacyUrl.'/PrivacyPolicy.php',
            ],
        ];
    }
}
