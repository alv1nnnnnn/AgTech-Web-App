import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useId, useRef, useState } from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import favicon from '../../../../images/AgTech-Logo.ico';
import brand from '../../../../images/AgTech-Logo.png';

function ThemeToggle() {
    const readTheme = () => document.documentElement.dataset.bsTheme === 'dark';
    const [isDark, setIsDark] = useState(readTheme);

    useEffect(() => {
        const syncTheme = () => setIsDark(readTheme());
        window.addEventListener('agtech-theme-change', syncTheme);
        return () => window.removeEventListener('agtech-theme-change', syncTheme);
    }, []);

    function toggleTheme() {
        const theme = isDark ? 'light' : 'dark';
        document.documentElement.dataset.bsTheme = theme;
        try {
            localStorage.setItem('agtech-theme', theme);
        } catch {}
        setIsDark(!isDark);
    }

    const ThemeIcon = isDark ? FiSun : FiMoon;

    return (
        <button
            className="theme-toggle"
            type="button"
            aria-label="Dark mode"
            aria-pressed={isDark}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
        >
            <ThemeIcon size={18} aria-hidden="true" focusable="false" />
        </button>
    );
}

function CompanyMenu({ links, component }) {
    const [isOpen, setIsOpen] = useState(false);
    const container = useRef(null);
    const toggle = useRef(null);
    const menuId = useId();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function closeOutside(event) {
            if (!container.current?.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('pointerdown', closeOutside);
        return () => document.removeEventListener('pointerdown', closeOutside);
    }, [isOpen]);

    function isHoverPointer(event) {
        return event.pointerType === 'mouse' && window.matchMedia('(min-width: 992px) and (any-hover: hover)').matches;
    }

    function handleKeyDown(event) {
        if (event.key === 'Escape' && isOpen) {
            event.preventDefault();
            setIsOpen(false);
            toggle.current.focus();
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setIsOpen(true);
            requestAnimationFrame(() => {
                const items = Array.from(container.current?.querySelectorAll('.dropdown-item') ?? []);
                const active = items.indexOf(document.activeElement);
                const next = event.key === 'ArrowDown'
                    ? Math.min(active + 1, items.length - 1)
                    : active < 0 ? items.length - 1 : Math.max(0, active - 1);
                items[next]?.focus();
            });
        }
    }

    return (
        <li
            className="nav-item dropdown company-menu"
            ref={container}
            onPointerEnter={(event) => { if (isHoverPointer(event)) setIsOpen(true); }}
            onPointerLeave={(event) => {
                if (isHoverPointer(event) && !event.currentTarget.querySelector('.dropdown-menu').contains(document.activeElement)) {
                    setIsOpen(false);
                }
            }}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false); }}
            onKeyDown={handleKeyDown}
        >
            <button
                className="nav-link dropdown-toggle"
                type="button"
                ref={toggle}
                aria-controls={menuId}
                aria-expanded={isOpen}
                onClick={(event) => {
                    if (isHoverPointer(event.nativeEvent)) {
                        setIsOpen(true);
                    } else {
                        setIsOpen((open) => !open);
                    }
                }}
            >
                Our Company
            </button>
            <ul className={isOpen ? 'dropdown-menu show' : 'dropdown-menu'} id={menuId}>
                <li><Link className="dropdown-item" href={links.about} aria-current={component === 'About' ? 'page' : undefined} onClick={() => setIsOpen(false)}>About Us</Link></li>
                <li><Link className="dropdown-item" href={links.team} aria-current={component === 'Team' ? 'page' : undefined} onClick={() => setIsOpen(false)}>Meet the Team</Link></li>
            </ul>
        </li>
    );
}

export default function PublicLayout({ children }) {
    const { component, props: { links } } = usePage();
    const isHome = component === 'Landing';

    function currentPage(name) {
        return component === name ? 'page' : undefined;
    }

    return (
        <>
            <Head>
                <link rel="icon" head-key="favicon" href={favicon} />
            </Head>
            <header className="sticky-top">
                <nav className="navbar navbar-expand-lg site-nav" aria-label="Main navigation">
                    <div className="container">
                        <Link className="navbar-brand brand" href={links.home}>
                            <img src={brand} alt="" width="40" height="40" />
                            AgTech
                        </Link>
                        <button
                            className="navbar-toggler"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#main-navigation"
                            aria-controls="main-navigation"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon" />
                        </button>
                        <div className="collapse navbar-collapse" id="main-navigation">
                            <ul className="navbar-nav ms-auto gap-lg-3 align-items-lg-center">
                                <li className="nav-item"><Link className={isHome ? 'nav-link active' : 'nav-link'} href={links.home} aria-current={isHome ? 'page' : undefined}>Home</Link></li>
                                <CompanyMenu links={links} component={component} />
                                <li className="nav-item"><Link className="nav-link" href={links.faq} aria-current={currentPage('Faq')}>FAQ</Link></li>
                                <li className="nav-item"><Link className="nav-link" href={links.contact} aria-current={currentPage('Contact')}>Contact Us</Link></li>
                                <li className="nav-item"><Link className="nav-link site-login" href={links.login} aria-current={currentPage('Login')}>Login</Link></li>
                                <li className="nav-item"><ThemeToggle /></li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>

            <main>{children}</main>

            <footer className="footer">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-lg-7">
                            <Link className="brand mb-3" href={links.home}>
                                <img src={brand} alt="" width="48" height="48" />
                                AgTech
                            </Link>
                            <p>AgTech is a platform designed to connect farmers and traders conveniently. It enables users to purchase livestock, including pigs, chickens, and chicken eggs, directly from local farmers in Albay Province. By fostering direct connections, AgTech supports local livestock market visibility, transparency, and opportunities.</p>
                        </div>
                        <div className="col-lg-4 offset-lg-1">
                            <h2 className="h5">Quick Links</h2>
                            <ul className="list-unstyled mb-0">
                                <li><Link href={links.about}>About Us</Link></li>
                                <li><Link href={links.team}>Meet the Team</Link></li>
                                <li><Link href={links.faq}>Frequently Asked Questions</Link></li>
                                <li><Link href={links.contact}>Contact Us</Link></li>
                            </ul>
                        </div>
                    </div>
                    <hr />
                    <div className="d-flex flex-wrap justify-content-between gap-3">
                        <p className="mb-0">© 2024. All Rights Reserved. Designed by AgTech Team</p>
                        <div className="d-flex flex-wrap gap-3">
                            <a href={links.terms}>Terms &amp; Conditions</a>
                            <a href={links.privacy}>Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
