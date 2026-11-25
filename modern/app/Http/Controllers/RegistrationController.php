<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class RegistrationController extends Controller
{
    public function show(Request $request): Response
    {
        $provinces = array_map(
            fn (array $row): array => ['code' => $row['province_code'], 'name' => $row['province_name']],
            $this->readLocationFile('province.js', '[', ']'),
        );

        return Inertia::render('Register', [
            'provinces' => $provinces,
            'locationsUrl' => route('register', absolute: false).'/locations',
            'latestBirthdate' => now()->subDay()->toDateString(),
            'notice' => match ($request->query('status')) {
                'invalid' => 'Check the required fields and make sure your passwords match.',
                'account-exists' => 'An account already uses this email or phone number.',
                'mail-error' => 'We couldn’t send your verification code. Please try again.',
                default => null,
            },
        ]);
    }

    public function municipalities(string $province): JsonResponse
    {
        $options = collect($this->readLocationFile('municipality.js', '[', ']'))
            ->where('province_code', $province)
            ->map(fn (array $row): array => ['code' => $row['city_code'], 'name' => $row['city_name']])
            ->values();

        return response()->json(['options' => $options]);
    }

    public function barangays(string $municipality): JsonResponse
    {
        $city = collect($this->readLocationFile('municipality.js', '[', ']'))
            ->firstWhere('city_code', $municipality);
        abort_if($city === null, 404);

        $source = base_path('../js/barangay.js');
        $options = Cache::remember(
            'registration.barangays.'.filemtime($source).'.'.$municipality,
            now()->addDay(),
            fn () => collect($this->readLocationFile('barangay.js', '[', ']'))
                ->where('city_code', $municipality)
                ->map(fn (array $row): array => ['code' => $row['brgy_code'], 'name' => $row['brgy_name']])
                ->values()
                ->all(),
        );

        $postalCodes = $this->readLocationFile('zipcode.js', '{', '}');
        $postalCode = collect($postalCodes)->search(fn ($places): bool => in_array($city['city_name'], (array) $places, true));

        return response()->json([
            'options' => $options,
            'postalCode' => $postalCode === false ? null : (string) $postalCode,
        ]);
    }

    private function readLocationFile(string $file, string $start, string $end): array
    {
        $source = file_get_contents(base_path('../js/'.$file));
        $offset = strpos($source, $start);
        $length = strrpos($source, $end) - $offset + 1;

        return json_decode(substr($source, $offset, $length), true, flags: JSON_THROW_ON_ERROR);
    }
}
