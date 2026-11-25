<?php

namespace Tests\Feature;

use Tests\TestCase;

class LandingTest extends TestCase
{
    public function test_home_serves_the_inertia_landing_page_with_legacy_links(): void
    {
        config(['agtech.legacy_url' => 'https://legacy.example.test/agtech']);

        $page = $this->get('/')
            ->assertOk()
            ->assertSee('<title>AgTech</title>', escape: false)
            ->viewData('page');

        $this->get('/', [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => $page['version'],
        ])
            ->assertOk()
            ->assertHeader('X-Inertia', 'true')
            ->assertJsonPath('component', 'Landing')
            ->assertJsonPath('props.links.about', '/about')
            ->assertJsonPath('props.links.login', '/login')
            ->assertJsonPath('props.links.loginSubmit', 'https://legacy.example.test/agtech/Login/Login.php')
            ->assertJsonPath('props.links.register', '/register')
            ->assertJsonPath('props.links.registerSubmit', 'https://legacy.example.test/agtech/Verification/Register.php')
            ->assertJsonPath('props.links.privacy', 'https://legacy.example.test/agtech/PrivacyPolicy.php');
    }

    public function test_about_can_be_opened_directly_or_from_the_landing_page(): void
    {
        $this->get('/About.php')->assertRedirect('/about');

        $page = $this->get('/about')->assertOk()->viewData('page');

        $this->get('/about', [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => $page['version'],
        ])
            ->assertOk()
            ->assertHeader('X-Inertia', 'true')
            ->assertJsonPath('component', 'About')
            ->assertJsonPath('props.links.home', '/');
    }

    public function test_home_page_only_shares_curated_public_content(): void
    {
        config(['agtech.public_listings' => null, 'agtech.approved_spotlight' => null]);
        $empty = $this->get('/')->assertOk()->viewData('page');
        $this->assertSame([], $empty['props']['listings']);
        $this->assertNull($empty['props']['spotlight']);

        config([
            'agtech.public_listings' => [
                ['product' => 'Pigs', 'municipality' => 'Camalig', 'availability' => 'Available', 'category' => 'pigs', 'phone' => 'private'],
                ['product' => 'Incomplete entry'],
            ],
            'agtech.approved_spotlight' => [
                'name' => 'Approved participant',
                'role' => 'Farmer',
                'quote' => 'Approved quote.',
                'story' => 'Approved story.',
                'photo' => 'https://example.test/photo.jpg',
                'email' => 'private',
            ],
        ]);

        $page = $this->get('/')->assertOk()->viewData('page');

        $this->assertSame([[
            'product' => 'Pigs',
            'municipality' => 'Camalig',
            'availability' => 'Available',
            'category' => 'pigs',
        ]], $page['props']['listings']);
        $this->assertSame('Approved quote.', $page['props']['spotlight']['quote']);
        $this->assertArrayNotHasKey('email', $page['props']['spotlight']);

        config(['agtech.approved_spotlight.photo' => 'http://example.test/photo.jpg']);
        $this->assertNull($this->get('/')->assertOk()->viewData('page')['props']['spotlight']);
    }
}
