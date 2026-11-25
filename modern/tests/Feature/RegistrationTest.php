<?php

namespace Tests\Feature;

use Tests\TestCase;

class RegistrationTest extends TestCase
{
    public function test_register_displays_the_form_and_recognized_legacy_errors(): void
    {
        config(['agtech.legacy_url' => 'https://legacy.example.test']);

        $this->get('/register?status=account-exists')
            ->assertOk()
            ->assertViewHas('page', function (array $page): bool {
                return $page['component'] === 'Register'
                    && $page['props']['notice'] === 'An account already uses this email or phone number.'
                    && in_array(['code' => '0505', 'name' => 'Albay'], $page['props']['provinces'], true)
                    && $page['props']['links']['registerSubmit'] === 'https://legacy.example.test/Verification/Register.php';
            });

        $this->get('/Verification/Register.php')->assertRedirect('/register');
    }

    public function test_registration_loads_the_location_options_in_order(): void
    {
        $this->getJson('/register/locations/provinces/0505')
            ->assertOk()
            ->assertJsonFragment(['code' => '050502', 'name' => 'Camalig'])
            ->assertJsonMissing(['name' => 'Adams']);

        $this->getJson('/register/locations/municipalities/050502')
            ->assertOk()
            ->assertJsonFragment(['code' => '050502001', 'name' => 'Anoling'])
            ->assertJsonPath('postalCode', '4502');

        $this->getJson('/register/locations/municipalities/999999')->assertNotFound();
    }
}
