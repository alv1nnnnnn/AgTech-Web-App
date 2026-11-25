import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { FiMessageCircle, FiSearch } from 'react-icons/fi';
import PublicLayout from '../Layouts/PublicLayout';

export default function Faq({ links }) {
    const [query, setQuery] = useState('');
    const questions = [
        ['What is AgTech?', 'AgTech connects farmers and traders so they can buy and sell livestock and agricultural products directly.'],
        ['How do I get started?', <><Link href={links.register}>Create an account</Link> and <Link href={links.login}>log in</Link>. You can then browse listings or add products to start buying or selling.</>, 'register sign up account login sign in browse listings products'],
        ['What can I buy on AgTech?', 'You can buy pigs, chickens, and fresh chicken eggs directly from local farmers.'],
        ['How do I manage trade offers?', 'Farmers can create and update their listings, including prices and availability. Traders can send offers or questions directly to farmers.'],
        ['Is product quality guaranteed?', 'AgTech requires farmers to meet quality standards for listed products. Contact the seller to confirm product details before buying.'],
        ['How can I contact support?', <>Use the <Link href={links.contact}>contact form</Link> or email <a href="mailto:theagtechteam@gmail.com">theagtechteam@gmail.com</a>.</>, 'help contact form email theagtechteam@gmail.com'],
    ];
    const search = query.trim().toLowerCase();
    const results = questions.filter(([question, answer, keywords]) => {
        const terms = `${question} ${keywords ?? answer}`.toLowerCase();
        return search.split(/\s+/).every((word) => terms.includes(word));
    });

    return (
        <PublicLayout>
            <Head title="Frequently Asked Questions" />
            <section className="section support-page" aria-labelledby="faq-title">
                <div className="container support-layout">
                    <div>
                        <div className="page-intro support-intro">
                            <h1 id="faq-title">Frequently Asked Questions</h1>
                            <p>Find answers about getting started, buying and selling, and getting help on AgTech.</p>
                        </div>
                        <div className="support-card">
                            <FiMessageCircle size={23} aria-hidden="true" focusable="false" />
                            <div>
                                <h2>Still have a question?</h2>
                                <Link href={links.contact}>Contact the AgTech team</Link>
                            </div>
                        </div>
                    </div>
                    <div className="faq-content">
                        <label className="form-label" htmlFor="faq-search">Search questions</label>
                        <div className="faq-search">
                            <FiSearch size={20} aria-hidden="true" focusable="false" />
                            <input className="form-control" id="faq-search" type="search" value={query} placeholder="Try eggs, registration, or trade offers" onChange={(event) => setQuery(event.target.value)} />
                        </div>
                        {search && (
                            <p className="faq-results" role="status">
                                {results.length === 0 ? 'No questions match your search.' : `${results.length} matching ${results.length === 1 ? 'question' : 'questions'}`}
                            </p>
                        )}
                        <div className="faq-list">
                            {results.map(([question, answer], index) => (
                                <details key={question} open={index === 0} name="agtech-faq">
                                    <summary>{question}</summary>
                                    <p>{answer}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
