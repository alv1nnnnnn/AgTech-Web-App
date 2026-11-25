<?php

namespace App\Http\Controllers;

use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __invoke(): Response
    {
        $listingFields = ['product', 'municipality', 'availability'];
        $listings = collect(config('agtech.public_listings'))
            ->filter(fn (mixed $listing): bool => $this->hasTextFields($listing, $listingFields))
            ->take(3)
            ->map(fn (array $listing): array => [
                ...Arr::only($listing, $listingFields),
                ...(in_array($listing['category'] ?? null, ['pigs', 'chickens', 'eggs'], true)
                    ? ['category' => $listing['category']]
                    : []),
            ])
            ->values()
            ->all();

        $spotlight = config('agtech.approved_spotlight');
        $spotlightFields = ['name', 'role', 'story', 'quote', 'photo'];
        $spotlight = $this->hasTextFields($spotlight, $spotlightFields) && $this->isHttpsUrl($spotlight['photo'])
            ? Arr::only($spotlight, $spotlightFields)
            : null;

        return Inertia::render('Landing', ['listings' => $listings, 'spotlight' => $spotlight]);
    }

    private function hasTextFields(mixed $record, array $fields): bool
    {
        if (! is_array($record)) {
            return false;
        }

        foreach ($fields as $field) {
            if (! is_string($record[$field] ?? null) || trim($record[$field]) === '') {
                return false;
            }
        }

        return true;
    }

    private function isHttpsUrl(string $url): bool
    {
        return filter_var($url, FILTER_VALIDATE_URL) !== false && parse_url($url, PHP_URL_SCHEME) === 'https';
    }
}
