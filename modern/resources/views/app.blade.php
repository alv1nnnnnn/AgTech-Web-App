<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AgTech</title>
    <script>
        (() => {
            const preference = window.matchMedia('(prefers-color-scheme: dark)');
            const applyTheme = () => {
                let savedTheme;
                try {
                    savedTheme = localStorage.getItem('agtech-theme');
                } catch {}

                const theme = savedTheme === 'light' || savedTheme === 'dark'
                    ? savedTheme
                    : preference.matches ? 'dark' : 'light';
                document.documentElement.dataset.bsTheme = theme;
                window.dispatchEvent(new Event('agtech-theme-change'));
            };

            applyTheme();
            preference.addEventListener('change', applyTheme);
        })();
    </script>
    @viteReactRefresh
    @vite('resources/js/app.jsx')
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
