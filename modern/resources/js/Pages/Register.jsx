import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import favicon from '../../../../images/AgTech-Logo.ico';
import brand from '../../../../images/AgTech-Logo.png';

const steps = ['Personal details', 'Address', 'Account details'];

function useLocationOptions(url) {
    const [request, setRequest] = useState(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!url) {
            setRequest(null);
            return;
        }

        const controller = new AbortController();
        setRequest(null);
        fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error('Could not load location options.');
                return response.json();
            })
            .then((data) => setRequest({ url, ...data }))
            .catch((error) => {
                if (error.name !== 'AbortError') setRequest({ url, error: true });
            });

        return () => controller.abort();
    }, [url, attempt]);

    if (!url) {
        return { options: [], pending: false, error: false };
    }

    return {
        options: request?.url === url ? request.options ?? [] : [],
        postalCode: request?.url === url ? request.postalCode : null,
        pending: request?.url !== url,
        error: request?.url === url && request.error,
        retry: () => setAttempt((previous) => previous + 1),
    };
}

function LocationSelect({ id, label, value, onChange, options, disabled = false, pending = false }) {
    return (
        <div>
            <label className="form-label" htmlFor={id}>{label}</label>
            <select className="form-select" id={id} value={value} onChange={onChange} required disabled={disabled}>
                <option value="">{pending ? 'Loading…' : `Select ${label.toLowerCase()}`}</option>
                {options.map(({ code, name }) => <option value={code} key={code}>{name}</option>)}
            </select>
        </div>
    );
}

export default function Register({ links, provinces, latestBirthdate, locationsUrl, notice }) {
    const [step, setStep] = useState(0);
    const fieldsets = useRef([]);
    const pendingFocus = useRef(null);
    const [province, setProvince] = useState('');
    const [municipality, setMunicipality] = useState('');
    const [barangay, setBarangay] = useState('');
    const [postalCode, setPostalCode] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const password = useRef(null);
    const confirmation = useRef(null);
    const PasswordIcon = showPassword ? FiEyeOff : FiEye;

    const municipalities = useLocationOptions(province ? `${locationsUrl}/provinces/${province}` : null);
    const barangays = useLocationOptions(municipality ? `${locationsUrl}/municipalities/${municipality}` : null);
    const defaultPostalCode = barangays.postalCode ?? '';

    useEffect(() => {
        if (pendingFocus.current) {
            const target = pendingFocus.current;
            pendingFocus.current = null;
            if (target.tagName === 'LEGEND') {
                target.focus();
            } else {
                target.reportValidity();
            }
        }
    }, [step]);

    function goToStep(index, field) {
        pendingFocus.current = field ?? fieldsets.current[index].querySelector('legend');
        setStep(index);
    }

    function advanceRegistration(event) {
        if (step === steps.length - 1) {
            validatePassword();
        }

        for (let index = 0; index <= step; index++) {
            const invalid = Array.from(fieldsets.current[index].elements).find((field) => field.willValidate && !field.validity.valid);
            if (invalid) {
                event.preventDefault();
                if (index === step) {
                    invalid.reportValidity();
                } else {
                    goToStep(index, invalid);
                }
                return;
            }
        }

        if (step >= 1 && (!barangay || municipalities.pending || barangays.pending || municipalities.error || barangays.error)) {
            event.preventDefault();
            return;
        }

        if (step < steps.length - 1) {
            event.preventDefault();
            goToStep(step + 1);
        }
    }

    function validatePassword() {
        const matches = password.current.value === confirmation.current.value;
        confirmation.current.setCustomValidity(!confirmation.current.value || matches ? '' : 'Passwords must match.');
    }

    return (
        <main className="register-page">
            <Head title="Create an account">
                <link rel="icon" head-key="favicon" href={favicon} />
            </Head>
            <div className="container register-shell">
                <div className="register-intro">
                    <Link className="brand" href={links.home} aria-label="AgTech home">
                        <img src={brand} alt="" width="42" height="42" />
                        AgTech
                    </Link>
                    <h1 id="register-title">Create an account</h1>
                    <p>Join AgTech to buy or sell livestock directly with local farmers and traders.</p>
                    <p>Already have an account? <Link href={links.login}>Log in</Link></p>
                </div>

                <form className="form-panel register-form" method="post" action={links.registerSubmit} aria-labelledby="register-title" onSubmit={advanceRegistration} noValidate>
                    <input type="hidden" name="agtech_modern_register" value="1" />
                    {notice && <p className="alert alert-warning" role="alert">{notice}</p>}

                    <ol className="register-progress" aria-label="Registration progress">
                        {steps.map((label, index) => (
                            <li key={label} aria-current={step === index ? 'step' : undefined} data-complete={index < step ? '' : undefined}>
                                <span className="register-step-number">{index + 1}</span>
                                <span>{label}</span>
                            </li>
                        ))}
                    </ol>

                    <fieldset hidden={step !== 0} ref={(element) => { fieldsets.current[0] = element; }}>
                        <legend tabIndex={-1}>Personal details</legend>
                        <div className="register-fields">
                            <div>
                                <label className="form-label" htmlFor="first-name">First name</label>
                                <input className="form-control" id="first-name" name="first-name" autoComplete="given-name" maxLength={100} required />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="last-name">Last name</label>
                                <input className="form-control" id="last-name" name="last-name" autoComplete="family-name" maxLength={100} required />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="birthdate">Date of birth</label>
                                <input className="form-control" id="birthdate" name="birthdate" type="date" autoComplete="bday" max={latestBirthdate} required />
                            </div>
                            <div>
                                <label className="form-label" htmlFor="phone">Mobile number</label>
                                <input className="form-control" id="phone" name="phone" type="tel" autoComplete="tel-national" pattern="[0-9]{11}" maxLength={11} placeholder="09XXXXXXXXX" aria-describedby="register-phone-tip" required />
                                <small id="register-phone-tip" className="form-text">Enter 11 digits.</small>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset hidden={step !== 1} ref={(element) => { fieldsets.current[1] = element; }}>
                        <legend tabIndex={-1}>Address</legend>
                        <input type="hidden" name="province-name" value={provinces.find(({ code }) => code === province)?.name ?? ''} />
                        <input type="hidden" name="municipality-name" value={municipalities.options.find(({ code }) => code === municipality)?.name ?? ''} />
                        <input type="hidden" name="barangay-name" value={barangays.options.find(({ code }) => code === barangay)?.name ?? ''} />
                        <div className="register-fields">
                            <LocationSelect
                                id="register-province" label="Province" options={provinces} value={province}
                                onChange={(event) => {
                                    setProvince(event.target.value);
                                    setMunicipality('');
                                    setBarangay('');
                                    setPostalCode(null);
                                }}
                            />
                            <LocationSelect
                                id="register-municipality" label="Municipality or city" options={municipalities.options} value={municipality}
                                disabled={!province || municipalities.pending || municipalities.error} pending={municipalities.pending}
                                onChange={(event) => {
                                    setMunicipality(event.target.value);
                                    setBarangay('');
                                    setPostalCode(null);
                                }}
                            />
                            <LocationSelect
                                id="register-barangay" label="Barangay" options={barangays.options} value={barangay}
                                disabled={!municipality || barangays.pending || barangays.error} pending={barangays.pending}
                                onChange={(event) => setBarangay(event.target.value)}
                            />
                            <div>
                                <label className="form-label" htmlFor="postal-code">Postal code</label>
                                <input className="form-control" id="postal-code" name="postal-code" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} value={postalCode ?? defaultPostalCode} onChange={(event) => setPostalCode(event.target.value)} required />
                            </div>
                        </div>
                        {(municipalities.error || barangays.error) && (
                            <p className="field-error" role="alert">
                                Couldn’t load address options. <button className="btn btn-link p-0" type="button" onClick={municipalities.error ? municipalities.retry : barangays.retry}>Try again</button>
                            </p>
                        )}
                    </fieldset>

                    <fieldset hidden={step !== 2} ref={(element) => { fieldsets.current[2] = element; }}>
                        <legend tabIndex={-1}>Account details</legend>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="email">Email address</label>
                            <input className="form-control" id="email" name="email" type="email" autoComplete="email" maxLength={254} aria-describedby="register-email-tip" required />
                            <small id="register-email-tip" className="form-text">We’ll send a verification code to this address.</small>
                        </div>
                        <div className="register-fields">
                            <div>
                                <label className="form-label" htmlFor="password">Password</label>
                                <div className="input-group">
                                    <input ref={password} className="form-control" id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} onInput={validatePassword} aria-describedby="register-password-tip" required />
                                    <button className="btn password-toggle" type="button" aria-label={showPassword ? 'Hide passwords' : 'Show passwords'} aria-controls="password confirm-password" onClick={() => setShowPassword(!showPassword)}>
                                        <PasswordIcon size={20} aria-hidden="true" focusable="false" />
                                    </button>
                                </div>
                                <small id="register-password-tip" className="form-text">Use at least 8 characters.</small>
                            </div>
                            <div>
                                <label className="form-label" htmlFor="confirm-password">Confirm password</label>
                                <input ref={confirmation} className="form-control" id="confirm-password" name="confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} maxLength={72} onInput={validatePassword} required />
                            </div>
                        </div>
                        <div className="form-check register-consent">
                            <input className="form-check-input" id="register-agreement" name="accept-terms" type="checkbox" value="1" required />
                            <label className="form-check-label" htmlFor="register-agreement">
                                I agree to the <a href={links.terms} target="_blank" rel="noopener noreferrer">Terms and Conditions</a> and <a href={links.privacy} target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
                            </label>
                        </div>
                    </fieldset>
                    <div className="register-actions">
                        {step > 0 && <button className="cta cta-outline" type="button" onClick={() => goToStep(step - 1)}>Back</button>}
                        <button className="cta" type="submit">
                            {step === steps.length - 1 ? 'Continue to email verification' : 'Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
