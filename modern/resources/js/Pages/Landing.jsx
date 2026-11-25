import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { GiChicken, GiEggClutch, GiPig } from 'react-icons/gi';
import PublicLayout from '../Layouts/PublicLayout';
import { AlbayStory, CommunitySpotlight, MarketplacePaths, MarketplacePreview } from '../Components/HomepageStories';
import heroPhoto from '../../../../images/AgTech-Farm-Hero.webp';
import swine from '../../../../images/pig.jpg';
import chickens from '../../../../images/chicken.jpg';
import eggs from '../../../../images/eggs.jpg';

const products = [
    {
        name: 'Pigs',
        image: swine,
        icon: GiPig,
        buyingTip: 'Ask the farmer about live weight and pickup.',
        description: 'Pigs from local farms in a range of breeds and sizes.',
    },
    {
        name: 'Chickens',
        image: chickens,
        icon: GiChicken,
        buyingTip: 'Check the birds’ age and how they were raised.',
        description: 'Free-range and conventionally raised chickens.',
    },
    {
        name: 'Fresh Eggs',
        image: eggs,
        icon: GiEggClutch,
        buyingTip: 'Ask when the eggs were collected and how many come in a tray.',
        description: 'Locally sourced chicken eggs for homes and businesses.',
    },
];

const tutorialId = 'OVT4AiLxpr8';

function Tutorial({ aboutUrl }) {
    return (
        <section className="tutorial-section" aria-labelledby="video-title" data-scroll-reveal>
            <div className="tutorial-intro container">
                <h2 id="video-title">How to use AgTech</h2>
                <p>See how farmers and traders get started on the platform.</p>
            </div>
            <div className="tutorial-stage">
                <div className="tutorial-video ratio ratio-16x9">
                    <iframe
                        src={`https://www.youtube.com/embed/${tutorialId}`}
                        title="AgTech Web App Testimonial and Tutorial"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
                <div className="tutorial-links">
                    <Link href={aboutUrl}>About AgTech</Link>
                    <a href={`https://www.youtube.com/watch?v=${tutorialId}`}>Watch on YouTube</a>
                </div>
            </div>
        </section>
    );
}

export default function Landing({ links, listings, spotlight }) {
    const content = useRef(null);
    const hasListings = listings.length > 0;
    const hasSpotlight = Boolean(spotlight);

    useEffect(() => {
        if (!('IntersectionObserver' in window)) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            for (const { isIntersecting, target } of entries) {
                if (isIntersecting) {
                    target.dataset.revealed = '';
                    observer.unobserve(target);
                }
            }
        });

        for (const section of content.current.querySelectorAll('[data-scroll-reveal]:not([data-revealed])')) {
            observer.observe(section);
        }

        return () => observer.disconnect();
    }, [hasListings, hasSpotlight]);

    return (
        <PublicLayout>
            <Head title="AgTech">
                <meta
                    head-key="description"
                    name="description"
                    content="AgTech connects local livestock farmers and traders in Albay Province."
                />
            </Head>

            <div ref={content}>
                <section className="hero" aria-labelledby="hero-title">
                    <img className="hero-photo" src={heroPhoto} alt="" fetchPriority="high" />
                    <div className="container">
                        <div className="hero-content">
                            <p className="hero-location">Albay, Philippines</p>
                            <h1 id="hero-title">Buy and sell livestock with AgTech</h1>
                            <p>Find local livestock and fresh eggs, or bring what you raise to buyers in your community.</p>
                            <a className="cta" href="#products">Explore products</a>
                        </div>
                    </div>
                </section>

                <nav className="home-actions container" aria-label="Get started" data-scroll-reveal>
                    <div className="home-action-panel">
                        <a className="home-action home-action-primary" href={links.register}>
                            <strong>Create an account</strong>
                            <span>Register as a farmer or trader.</span>
                        </a>
                        <a className="home-action" href="#video-title">
                            <strong>Watch the walkthrough</strong>
                            <span>See how the marketplace works.</span>
                        </a>
                        <Link className="home-action" href={links.faq}>
                            <strong>Read the FAQ</strong>
                            <span>Buying, selling, and trade offers.</span>
                        </Link>
                    </div>
                </nav>

                <MarketplacePaths links={links} />

                <section className="section products" id="products" aria-labelledby="products-title" data-scroll-reveal>
                    <div className="container">
                        <div className="section-intro">
                            <h2 id="products-title">Livestock and fresh eggs</h2>
                            <p>Explore what Albay farmers raise and sell, from pigs and chickens to fresh eggs.</p>
                        </div>
                        <ul className="product-cards" role="list">
                            {products.map(({ name, image, description, icon: CategoryIcon, buyingTip }) => (
                                <li className="product-card" key={name}>
                                    <div className="product-photo">
                                        <img src={image} alt="" loading="lazy" width="400" height="300" />
                                    </div>
                                    <div className="product-card-body">
                                        <span className="product-icon">
                                            <CategoryIcon size={23} aria-hidden="true" focusable="false" />
                                        </span>
                                        <h3>{name}</h3>
                                        <p>{description}</p>
                                        <p className="product-tip">{buyingTip}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {hasListings && <MarketplacePreview listings={listings} loginUrl={links.login} />}
                <Tutorial aboutUrl={links.about} />
                <AlbayStory aboutUrl={links.about} />
                {hasSpotlight && <CommunitySpotlight spotlight={spotlight} />}
            </div>
        </PublicLayout>
    );
}
