<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class ContactController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:254'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $body = "Name: {$data['name']}\nEmail: {$data['email']}\n\n{$data['message']}";

        try {
            Mail::raw($body, function (Message $message) use ($data): void {
                $message->to(config('agtech.contact_email'))
                    ->replyTo($data['email'])
                    ->subject('AgTech contact form');
            });
        } catch (TransportExceptionInterface $exception) {
            report($exception);

            return to_route('contact')->withErrors([
                'delivery' => 'We couldn’t send your message. Please try again.',
            ]);
        }

        Inertia::flash('contactSent', true);

        return to_route('contact');
    }
}
