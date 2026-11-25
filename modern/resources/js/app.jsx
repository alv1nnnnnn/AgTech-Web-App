import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fontsource-variable/manrope';
import '@fontsource-variable/dm-sans';
import 'bootstrap/js/dist/collapse';
import '../css/app.css';
import Landing from './Pages/Landing';
import About from './Pages/About';
import Team from './Pages/Team';
import Faq from './Pages/Faq';
import Contact from './Pages/Contact';
import Login from './Pages/Login';
import Register from './Pages/Register';

const pages = { Landing, About, Team, Faq, Contact, Login, Register };

createInertiaApp({
    resolve: (name) => pages[name],
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
