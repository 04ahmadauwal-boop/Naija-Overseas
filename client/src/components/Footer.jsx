import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useFadeIn, useSlideIn } from '../hooks/useGsapAnimations';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subLoading, setSubLoading] = useState(false);

  // Animation refs
  const footerRef = useFadeIn(0.6, 0);
  const brandRef = useSlideIn('right', 0.6, 0);
  useSlideIn('up', 0.8, 0.2);

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

  const cols = [
    {
      heading: 'Platform',
      links: [
        ['/', 'Compare Schools'],
        ['/study-abroad', 'Study Abroad'],
        ['/list-your-school', 'List Your School'],
        ['/blog', 'Blog'],
      ],
    },
    {
      heading: 'Company',
      links: [
        ['/about', 'About Us'],
        ['/contact', 'Contact'],
        ['/blog', 'Resources'],
        ['/register', 'Sign Up Free'],
      ],
    },
    {
      heading: 'Destinations',
      links: [
        ['/study-abroad', 'Study in UK'],
        ['/study-abroad', 'Study in Canada'],
        ['/study-abroad', 'Study in USA'],
        ['/study-abroad', 'Study in Australia'],
      ],
    },
  ];

  return (
    <footer ref={footerRef} className="bg-gray-950 text-gray-400 pt-16 pb-8 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div ref={brandRef} className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white" size={17} />
              </div>
              <span className="font-bold text-white text-[17px] tracking-tight">Naija<span className="text-green-500">&</span>Overseas</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-5">
              West Africa's smartest school discovery and international admissions platform. Trusted by 10,000+ students and families.
            </p>
            {/* Newsletter */}
            <p className="text-white text-sm font-semibold mb-3">Get education tips in your inbox</p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-3.5 py-2.5 rounded-lg bg-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-700" />
              <button type="submit" disabled={subLoading}
                className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition text-sm font-medium shrink-0">
                <ArrowRight size={15} />
              </button>
            </form>
            <p className="text-gray-600 text-xs mt-2">No spam. Unsubscribe any time.</p>
          </div>

          {/* Link columns */}
          {cols.map(({ heading, links }) => (
            <div key={heading}>
              <h4 className="text-white font-semibold text-sm mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map(([to, label]) => (
                  <li key={label}>
                    <Link to={to} className="text-gray-500 hover:text-white text-sm transition">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact bar */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-wrap gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2"><Mail size={14} />info@naijaandoverseas.com</span>
            <span className="flex items-center gap-2"><Phone size={14} />+234 800 000 0000</span>
            <span className="flex items-center gap-2"><MapPin size={14} />Nigeria · Ghana · Gambia · Cameroon</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Naija &amp; Overseas. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-gray-600">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
