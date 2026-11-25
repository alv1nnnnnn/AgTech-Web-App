import { Head, Link } from '@inertiajs/react';
import { FiBarChart2, FiCheckCircle, FiShoppingBag, FiUsers } from 'react-icons/fi';
import PublicLayout from '../Layouts/PublicLayout';
import farmPhoto from '../../../../images/AgTech-About-BG.png';

const mission = [
    { title: 'Make trading easier', description: 'Help farmers and traders buy and sell livestock with a straightforward listing and inquiry process.', icon: FiShoppingBag },
    { title: 'Connect local producers', description: 'Give farmers and traders a place to find each other, share knowledge, and work together.', icon: FiUsers },
    { title: 'Build trust', description: 'Help members make informed choices with profiles, ratings, and reviews.', icon: FiCheckCircle },
    { title: 'Share market information', description: 'Give members access to up-to-date market information as they make buying and selling decisions.', icon: FiBarChart2 },
];

export default function About({ links }) {
    return (
        <PublicLayout>
            <Head title="About AgTech">
                <meta
                    head-key="description"
                    name="description"
                    content="Learn how AgTech connects livestock farmers and traders and helps make agricultural trading more accessible."
                />
            </Head>

            <section className="section about-hero" aria-labelledby="about-title">
                <div className="container">
                    <div className="page-intro about-intro">
                        <h1 id="about-title">About AgTech</h1>
                        <p>AgTech helps livestock farmers and traders in Albay find each other and trade directly. Our goal is to make local agricultural trading easier to access.</p>
                    </div>
                    <img className="about-panorama" src={farmPhoto} alt="Chickens outdoors on a farm" width="1200" height="420" fetchPriority="high" />
                </div>
            </section>

            <section className="section about-mission" aria-labelledby="about-mission-title">
                <div className="container mission-layout">
                    <div>
                        <h2 id="about-mission-title">What we’re building</h2>
                        <Link className="cta cta-outline" href={links.team}>Meet the team</Link>
                    </div>
                    <ul className="mission-grid" role="list">
                        {mission.map(({ title, description, icon: MissionIcon }) => (
                            <li key={title}>
                                <span className="mission-icon"><MissionIcon size={21} aria-hidden="true" focusable="false" /></span>
                                <div>
                                    <h3>{title}</h3>
                                    <p>{description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </PublicLayout>
    );
}
