<?php

namespace Tests\Feature;

use Illuminate\Mail\Transport\ArrayTransport;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    #[DataProvider('publicPages')]
    public function test_public_page_resolves(string $path, string $component, string $oldPath): void
    {
        $this->get($path)
            ->assertOk()
            ->assertViewHas('page', fn (array $page): bool => $page['component'] === $component);

        $this->get($oldPath)->assertRedirect($path);
    }

    public static function publicPages(): array
    {
        return [
            'team' => ['/team', 'Team', '/meet-the-team.php'],
            'faq' => ['/faq', 'Faq', '/FAQ.php'],
            'contact' => ['/contact', 'Contact', '/Contact.php'],
            'login' => ['/login', 'Login', '/Login/Login.php'],
        ];
    }

    public function test_contact_validates_and_delivers_a_replyable_message(): void
    {
        config(['agtech.contact_email' => 'support@example.test']);

        $transport = Mail::mailer('array')->getSymfonyTransport();
        $this->assertInstanceOf(ArrayTransport::class, $transport);

        $this->from('/contact')->post('/contact', [
            'email' => 'invalid',
        ])->assertSessionHasErrors(['name', 'email', 'message']);
        $this->assertCount(0, $transport->messages());

        $this->post('/contact', [
            'name' => 'AgTech Visitor',
            'email' => 'visitor@example.test',
            'message' => 'How do I list my products?',
        ])->assertRedirect('/contact');

        $this->assertCount(1, $transport->messages());
        $mail = $transport->messages()->sole()->getOriginalMessage();
        $this->assertSame('support@example.test', $mail->getTo()[0]->getAddress());
        $this->assertSame('visitor@example.test', $mail->getReplyTo()[0]->getAddress());
        $this->assertStringContainsString('How do I list my products?', $mail->getTextBody());
        $this->get('/contact')->assertViewHas('page', fn (array $page): bool => $page['flash']['contactSent'] === true);
    }

    public function test_login_only_displays_recognized_status_messages(): void
    {
        $this->get('/login?status=invalid')->assertViewHas('page',
            fn (array $page): bool => $page['props']['notice'] === 'Email or phone and password did not match.'
        );

        $this->get('/login?status=unexpected')->assertViewHas('page',
            fn (array $page): bool => $page['props']['notice'] === null
        );
    }
}
