import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import brand from '../../../../images/AgTech-Logo.png';
import favicon from '../../../../images/AgTech-Logo.ico';

export default function Login({ links, notice }) {
    const [showPassword, setShowPassword] = useState(false);
    const PasswordIcon = showPassword ? FiEyeOff : FiEye;

    return (
        <main className="login-page">
            <Head title="Log in">
                <link rel="icon" head-key="favicon" href={favicon} />
            </Head>
            <div className="container login-shell">
                <div className="login-visual" aria-hidden="true" />
                <div className="login-content">
                    <Link className="brand login-brand" href={links.home} aria-label="AgTech home">
                        <img src={brand} alt="" width="42" height="42" />
                        AgTech
                    </Link>
                    <form className="form-panel login-form-panel" method="post" action={links.loginSubmit} aria-labelledby="login-title">
                        <h1 id="login-title">Log in to AgTech</h1>
                        <p className="login-intro">Sign in to browse listings, manage your products, or connect with traders.</p>
                        <input type="hidden" name="agtech_modern_login" value="1" />
                        {notice && <p className="alert alert-warning" role="alert">{notice}</p>}
                        <div className="mb-3">
                            <label className="form-label" htmlFor="email_or_phone">Email or phone</label>
                            <input className="form-control" id="email_or_phone" name="email_or_phone" autoComplete="username" required />
                        </div>
                        <div className="mb-4">
                            <div className="password-label">
                                <label className="form-label" htmlFor="password">Password</label>
                                <a href={links.forgotPassword}>Forgot your password?</a>
                            </div>
                            <div className="input-group">
                                <input className="form-control" id="password" name="password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} required />
                                <button className="btn password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-controls="password" onClick={() => setShowPassword(!showPassword)}>
                                    <PasswordIcon size={20} aria-hidden="true" focusable="false" />
                                </button>
                            </div>
                        </div>
                        <button className="cta w-100">Log in</button>
                        <p className="login-registration">Don’t have an account? <Link href={links.register}>Register</Link></p>
                    </form>
                </div>
            </div>
        </main>
    );
}
