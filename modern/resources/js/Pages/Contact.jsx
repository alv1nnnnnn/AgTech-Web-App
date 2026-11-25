import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FiBookOpen, FiMail } from 'react-icons/fi';
import PublicLayout from '../Layouts/PublicLayout';

export default function Contact({ links }) {
    const { flash } = usePage();
    const form = useForm({ name: '', email: '', message: '' });

    function submit(event) {
        event.preventDefault();
        form.post(links.contactSubmit, { preserveScroll: true, onSuccess: () => form.reset() });
    }

    return (
        <PublicLayout>
            <Head title="Contact Us" />
            <section className="section support-page" aria-labelledby="contact-title">
                <div className="container support-layout">
                    <div>
                        <div className="page-intro support-intro">
                            <h1 id="contact-title">Contact Us</h1>
                            <p>Need help with AgTech? Send us a message about your account, a listing, or using the marketplace.</p>
                        </div>
                        <div className="support-card">
                            <FiMail size={23} aria-hidden="true" focusable="false" />
                            <div>
                                <h2>Email the team</h2>
                                <a href="mailto:theagtechteam@gmail.com">theagtechteam@gmail.com</a>
                            </div>
                        </div>
                        <div className="support-card">
                            <FiBookOpen size={23} aria-hidden="true" focusable="false" />
                            <div>
                                <h2>Common questions</h2>
                                <Link href={links.faq}>Browse the FAQ</Link>
                            </div>
                        </div>
                    </div>
                    <form className="form-panel contact-panel" onSubmit={submit} aria-labelledby="contact-form-title">
                        <h2 id="contact-form-title">Send a message</h2>
                        {flash?.contactSent && <p className="alert alert-success" role="status">Your message has been sent.</p>}
                        {form.errors.delivery && <p className="alert alert-danger" role="alert">{form.errors.delivery}</p>}
                        <div className="contact-fields">
                            <div>
                                <label className="form-label" htmlFor="contact-name">Full name</label>
                                <input className="form-control" id="contact-name" name="name" autoComplete="name" required maxLength={120} value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} aria-invalid={Boolean(form.errors.name)} aria-describedby={form.errors.name ? 'contact-name-error' : undefined} />
                                {form.errors.name && <p className="field-error" id="contact-name-error">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="form-label" htmlFor="contact-email">Email address</label>
                                <input className="form-control" id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} aria-invalid={Boolean(form.errors.email)} aria-describedby={form.errors.email ? 'contact-email-error' : undefined} />
                                {form.errors.email && <p className="field-error" id="contact-email-error">{form.errors.email}</p>}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label" htmlFor="contact-message">Your message</label>
                            <textarea className="form-control" id="contact-message" name="message" rows={5} required maxLength={5000} value={form.data.message} onChange={(event) => form.setData('message', event.target.value)} aria-invalid={Boolean(form.errors.message)} aria-describedby={form.errors.message ? 'contact-message-error' : undefined} />
                            {form.errors.message && <p className="field-error" id="contact-message-error">{form.errors.message}</p>}
                        </div>
                        <button className="cta" disabled={form.processing}>
                            {form.processing ? 'Sending…' : 'Send message'}
                        </button>
                    </form>
                </div>
            </section>
        </PublicLayout>
    );
}
