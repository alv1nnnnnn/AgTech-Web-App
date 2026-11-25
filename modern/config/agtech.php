<?php

return [
    'public_listings' => json_decode((string) env('AGTECH_PUBLIC_LISTINGS', ''), true),
    'approved_spotlight' => json_decode((string) env('AGTECH_APPROVED_SPOTLIGHT', ''), true),
    'contact_email' => env('AGTECH_CONTACT_EMAIL', 'theagtechteam@gmail.com'),
    'legacy_url' => rtrim(env('LEGACY_APP_URL', 'http://localhost:8001'), '/'),
];
