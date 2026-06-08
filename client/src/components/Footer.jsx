import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLS = [
  {
    heading: 'Platform',
    links: [
      ['/', 'Find Schools'],
      ['/compare', 'Compare Schools'],
      ['/find-tutoring', 'Find a Tutor'],
      ['/videos', 'Watch Reviews'],
      ['/list-your-school', 'List Your School'],
      ['/reviews', 'Parent Reviews'],
    ],
  },
  {
    heading: 'Company',
    links: [
      ['/about', 'About Us'],
      ['/contact', 'Contact Us'],
      ['/blog', 'Blog & Resources'],
      ['/become-a-tutor', 'Become a Tutor'],
      ['/register', 'Sign Up Free'],
    ],
  },
  {
    heading: 'Study Abroad',
    links: [
      ['/study-abroad/uk', 'United Kingdom'],
      ['/study-abroad/canada', 'Canada'],
      ['/study-abroad/usa', 'United States'],
      ['/study-abroad/australia', 'Australia'],
      ['/study-abroad/germany', 'Germany'],
    ],
  },
];

export default function Footer() {
  const [email, setEmail]         = useState('');
  const [subLoading, setSubLoading] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubLoading(true);
    try {
      await api.post('/contact', { name: 'Newsletter', email, message: 'Newsletter subscription request', subject: 'Newsletter Signup' });
      toast.success('Subscribed! Welcome to Naija & Overseas.');
      setEmail('');
    } catch {
      toast.error('Could not subscribe. Please try again.');
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <footer className="bg-gray-950">
      {/* Top accent */}
      <div className="h-px bg-linear-to-r from-transparent via-green-600/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main content */}
        <div className="py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">

            {/* Brand + newsletter — spans 2 cols on lg */}
            <div className="lg:col-span-2">
              {/* Logo */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap className="text-white" size={16} />
                </div>
                <span className="font-extrabold text-white text-[17px] tracking-tight">
                  Naija<span className="text-green-500">&</span>Overseas
                </span>
              </div>
              <p className="text-gray-600 text-[13px] leading-relaxed mb-4 max-w-xs">
                West Africa's school discovery and international admissions platform — serving families across Nigeria, Ghana, The Gambia and Cameroon.
              </p>
              {/* Newsletter */}
              <form onSubmit={handleNewsletter} className="flex gap-2 max-w-xs">
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-gray-900 text-white placeholder-gray-600 text-[13px] focus:outline-none focus:ring-1 focus:ring-green-500 border border-gray-800"
                />
                <button type="submit" disabled={subLoading}
                  className="bg-green-600 text-white px-3.5 py-2.5 rounded-xl hover:bg-green-500 transition shrink-0">
                  <ArrowRight size={15} />
                </button>
              </form>
              <p className="text-gray-700 text-[11px] mt-1.5">No spam. Unsubscribe any time.</p>
            </div>

            {/* Link columns — 3-col compact grid on mobile, individual cols on lg */}
            <div className="col-span-1 md:col-span-1 lg:col-span-3">
              <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {COLS.map(({ heading, links }) => (
                  <div key={heading}>
                    <h4 className="text-white font-bold text-[10px] sm:text-[11px] uppercase tracking-widest mb-2.5 sm:mb-4">{heading}</h4>
                    <ul className="space-y-1.5 sm:space-y-2.5">
                      {links.map(([to, label]) => (
                        <li key={label}>
                          <Link to={to} className="text-gray-600 hover:text-white text-[11px] sm:text-[13px] transition leading-tight block">
                            {label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-900 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            {/* Contact */}
            <div className="flex flex-wrap gap-3 sm:gap-5 text-[11px] text-gray-600">
              <a href="mailto:info@naijaandoverseas.com" className="flex items-center gap-1.5 hover:text-gray-400 transition">
                <Mail size={11} className="shrink-0" />
                <span>info@naijaandoverseas.com</span>
              </a>
              <a href="tel:+2348000000000" className="flex items-center gap-1.5 hover:text-gray-400 transition">
                <Phone size={11} className="shrink-0" />
                <span className="hidden sm:inline">+234 800 000 0000</span>
                <span className="sm:hidden">Call Us</span>
              </a>
              <span className="hidden md:flex items-center gap-1.5">
                <MapPin size={11} className="shrink-0" />
                Lagos, Nigeria · Ghana · Gambia · Cameroon
              </span>
            </div>

            {/* Copyright + legal */}
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-gray-700 text-[11px] whitespace-nowrap">
                &copy; {new Date().getFullYear()} Naija &amp; Overseas
              </p>
              <div className="flex gap-3 text-[11px] text-gray-700">
                <a href="#" className="hover:text-gray-400 transition">Privacy</a>
                <a href="#" className="hover:text-gray-400 transition">Terms</a>
                <a href="#" className="hover:text-gray-400 transition">Cookies</a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </footer>
  );
}
