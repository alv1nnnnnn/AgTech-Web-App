import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PublicLayout from '../Layouts/PublicLayout';
import trina from '../../../../images/t.png';
import rachelle from '../../../../images/r.png';
import hazel from '../../../../images/h.png';
import alvin from '../../../../images/a.png';

const team = [
    { name: 'Trina Chariz B. Hibo', role: 'Project Manager', image: trina, focus: 'Project planning and coordination' },
    { name: 'Rachelle Anne B. Manila', role: 'Frontend Developer', status: 'Evicted', image: rachelle, focus: 'User interface and frontend development' },
    { name: 'Hazel Anne B. Marqueses', role: 'Systems Analyst', image: hazel, focus: 'System requirements and workflows' },
    { name: 'Alvin Nario', role: 'Full Stack Developer', image: alvin, focus: 'Frontend and backend development' },
];

export default function Team() {
    const [selection, setSelection] = useState({ index: 0, manual: false });
    const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const selected = team[selection.index];

    useEffect(() => {
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = (event) => setReducedMotion(event.matches);
        preference.addEventListener('change', update);
        return () => preference.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (reducedMotion) {
            return;
        }

        const timer = window.setTimeout(() => {
            setSelection({ index: (selection.index + 1) % team.length, manual: false });
        }, 6000);

        return () => window.clearTimeout(timer);
    }, [selection, reducedMotion]);

    function selectMember(index) {
        setSelection({ index, manual: true });
    }

    return (
        <PublicLayout>
            <Head title="Meet the Team" />
            <section className="section team-page" aria-labelledby="team-title">
                <div className="container">
                    <div className="page-intro team-intro">
                        <h1 id="team-title">Meet the Team</h1>
                        <p>We’re Information Technology students from Bicol University’s College of Science. We built AgTech to help local farmers and traders connect.</p>
                    </div>
                    <div className="team-roster">
                        <ul className="team-picker" aria-label="Team members" role="list">
                            {team.map(({ name, role, image }, index) => (
                                <li key={name}>
                                    <button
                                        className="team-picker-button"
                                        type="button"
                                        aria-pressed={selection.index === index}
                                        aria-controls="team-profile"
                                        onClick={() => selectMember(index)}
                                    >
                                        <img src={image} alt="" width="48" height="48" />
                                        <span>
                                            <strong>{name}</strong>
                                            <span className="team-picker-role">{role}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div
                            className="team-profile"
                            id="team-profile"
                            aria-live={selection.manual || reducedMotion ? 'polite' : 'off'}
                            aria-atomic="true"
                        >
                            <div className="team-profile-content" key={selected.name}>
                                <div className="team-portrait">
                                    <img src={selected.image} alt="" width="320" height="320" />
                                    {selected.status && <span className="team-portrait-overlay">{selected.status}</span>}
                                </div>
                                <div className="team-details">
                                    <h2>{selected.name}</h2>
                                    <p className="team-role">{selected.role}</p>
                                    <p>{selected.focus}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
