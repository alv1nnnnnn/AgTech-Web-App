<?php

use App\Http\Controllers\ContactController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\RegistrationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

Route::get('/', LandingController::class)->name('home');
Route::inertia('/about', 'About')->name('about');
Route::inertia('/team', 'Team')->name('team');
Route::inertia('/faq', 'Faq')->name('faq');
Route::inertia('/contact', 'Contact')->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');

Route::get('/login', function (Request $request): Response {
    return Inertia::render('Login', [
        'notice' => match ($request->query('status')) {
            'invalid' => 'Email or phone and password did not match.',
            'locked' => 'Too many sign-in attempts. Wait a few seconds and try again.',
            default => null,
        },
    ]);
})->name('login');

Route::get('/register', [RegistrationController::class, 'show'])->name('register');
Route::get('/register/locations/provinces/{province}', [RegistrationController::class, 'municipalities'])
    ->where('province', '[0-9]{4}')->middleware('throttle:60,1');
Route::get('/register/locations/municipalities/{municipality}', [RegistrationController::class, 'barangays'])
    ->where('municipality', '[0-9]{6}')->middleware('throttle:60,1');

Route::redirect('/About.php', '/about');
Route::redirect('/meet-the-team.php', '/team');
Route::redirect('/FAQ.php', '/faq');
Route::redirect('/Contact.php', '/contact');
Route::redirect('/Login/Login.php', '/login');
Route::redirect('/Verification/Register.php', '/register');
