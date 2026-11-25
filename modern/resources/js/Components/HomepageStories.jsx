import { Link } from '@inertiajs/react';
import { FiSearch, FiTag } from 'react-icons/fi';
import albayFarm from '../../../../images/AgTech-BG.jpg';
import pigs from '../../../../images/pig.jpg';
import chickens from '../../../../images/chicken.jpg';
import eggs from '../../../../images/eggs.jpg';

const listingPhotos = { pigs, chickens, eggs };

export function MarketplacePaths({ links }) {
    return (
        <section className="section" aria-labelledby="market-paths-title" data-scroll-reveal>
            <div className="container">
                <div className="section-intro section-intro-wide">
                    <h2 id="market-paths-title">Buying or selling?</h2>
                    <p>AgTech helps Albay farmers and traders connect directly and work out the details of a sale.</p>
                </div>
                <div className="row g-3">
                    <div className="col-md-6">
                        <article className="market-path">
                            <FiSearch size={24} aria-hidden="true" focusable="false" />
                            <h3>Find local livestock</h3>
                            <p>Browse what farmers have listed. Contact the seller to ask about availability, pickup, or product details.</p>
                            <Link href={links.login}>Log in to browse</Link>
                        </article>
                    </div>
                    <div className="col-md-6">
                        <article className="market-path">
                            <FiTag size={24} aria-hidden="true" focusable="false" />
                            <h3>Sell what you raise</h3>
                            <p>List your products, keep prices and availability up to date, and respond to inquiries from traders.</p>
                            <Link href={links.register}>Create an account</Link>
                        </article>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function AlbayStory({ aboutUrl }) {
    return (
        <section className="section albay-story" aria-labelledby="albay-story-title" data-scroll-reveal>
            <div className="container">
                <div className="albay-story-grid">
                    <img src={albayFarm} width="640" height="400" alt="A farmer tending pigs outdoors" loading="lazy" />
                    <div>
                        <h2 id="albay-story-title">Built for Albay</h2>
                        <p>AgTech began as a Bicol University student project to help Albay’s livestock farmers reach local buyers. By making it easier to share what’s available and start a conversation, the platform helps farmers and traders work directly with each other.</p>
                        <Link href={aboutUrl}>About AgTech</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function MarketplacePreview({ listings, loginUrl }) {
    return (
        <section className="section" aria-labelledby="market-preview-title" data-scroll-reveal>
            <div className="container">
                <div className="section-intro section-intro-wide">
                    <h2 id="market-preview-title">Marketplace preview</h2>
                    <p>See how farmers list livestock and eggs, with the municipality and availability for each product.</p>
                </div>
                <ul className="market-preview mb-4" role="list">
                    {listings.map(({ product, municipality, availability, category }, index) => (
                        <li key={`${product}-${municipality}-${index}`}>
                            {category && (
                                <img className="market-preview-photo" src={listingPhotos[category]} alt="" width="400" height="250" loading="lazy" />
                            )}
                            <div className="market-preview-details">
                                <h3>{product}</h3>
                                <p>{municipality}</p>
                                <p className="market-preview-availability">{availability}</p>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="text-center">
                    <Link className="cta" href={loginUrl}>Log in to see the marketplace</Link>
                </div>
            </div>
        </section>
    );
}

export function CommunitySpotlight({ spotlight }) {
    return (
        <section className="section community-spotlight" aria-labelledby="spotlight-title" data-scroll-reveal>
            <div className="container">
                <h2 id="spotlight-title" className="mb-4">Farmer or trader spotlight</h2>
                <figure className="albay-story-grid mb-0">
                    <img src={spotlight.photo} alt={spotlight.name} width="640" height="400" loading="lazy" />
                    <figcaption>
                        <blockquote className="spotlight-quote">{spotlight.quote}</blockquote>
                        <p><strong>{spotlight.name}</strong> · {spotlight.role}</p>
                        <p>{spotlight.story}</p>
                    </figcaption>
                </figure>
            </div>
        </section>
    );
}
