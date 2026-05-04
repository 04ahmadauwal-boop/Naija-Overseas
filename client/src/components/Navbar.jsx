import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, GraduationCap, ChevronRight, LayoutDashboard,
  BookOpen, Globe, School, Users, Info, Mail, LogOut, User,
  Lightbulb, CheckCircle, Send
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: School, end: true },
  { to: '/study-abroad', label: 'Study Abroad', icon: Globe, end: false },
  { to: '/list-your-school', label: 'List Your School', icon: BookOpen, end: false },
  { to: '/blog', label: 'Blog', icon: BookOpen, end: false },
  { to: '/about', label: 'About', icon: Info, end: false },
  { to: '/contact', label: 'Contact', icon: Mail, end: false },
];

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara',
];

const SCHOOL_TYPES = ['Private', 'Public', 'Federal', 'International'];

function SuggestModal({ onClose }) {
  const [form, setForm] = useState({ schoolName: '', state: '', type: '', website: '', reason: '', submittedBy: '', submittedEmail: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.schoolName.trim()) { toast.error('School name is required'); return; }
    setLoading(true);
    try {
      await api.post('/schools/suggest', form);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit suggestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-linear-to-r from-green-700 to-green-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Lightbulb size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-base">Suggest a School</h2>
                <p className="text-green-200 text-xs">Know a school that should be listed?</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="font-extrabold text-gray-900 text-lg mb-2">Thank you!</h3>
              <p className="text-gray-500 text-sm mb-6">Your suggestion has been received. We'll review it and add the school to our platform soon.</p>
              <button onClick={onClose}
                className="bg-green-700 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-green-800 transition">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">School Name <span className="text-red-500">*</span></label>
                <input required value={form.schoolName}
                  onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                  className={inp} placeholder="e.g. Greenfield International School" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">State</label>
                  <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inp}>
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inp}>
                    <option value="">Select type</option>
                    {SCHOOL_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">School Website (optional)</label>
                <input value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className={inp} placeholder="https://schoolwebsite.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Why do you recommend this school?</label>
                <textarea value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className={inp + ' resize-none'} rows={3}
                  placeholder="Great facilities, excellent WAEC results..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Your Name</label>
                  <input value={form.submittedBy}
                    onChange={(e) => setForm({ ...form, submittedBy: e.target.value })}
                    className={inp} placeholder="Optional" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Your Email</label>
                  <input type="email" value={form.submittedEmail}
                    onChange={(e) => setForm({ ...form, submittedEmail: e.target.value })}
                    className={inp} placeholder="Optional" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-800 transition disabled:opacity-60">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                  : <><Send size={15} /> Submit Suggestion</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function getDashboardLink(role) {
  if (role === 'admin') return '/admin';
  if (role === 'student') return '/dashboard/student';
  if (role === 'parent') return '/dashboard/parent';
  if (role === 'school-owner') return '/dashboard/school-owner';
  return '/';
}

function getDashboardLabel(role) {
  if (role === 'admin') return 'Admin Panel';
  if (role === 'student') return 'My Dashboard';
  if (role === 'parent') return 'My Dashboard';
  if (role === 'school-owner') return 'School Dashboard';
  return 'Dashboard';
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <header className={`bg-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg border-b border-gray-100' : 'border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-17">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-white" size={17} />
              </div>
              <span className="font-bold text-gray-900 text-base tracking-tight">
                Naija<span className="text-green-600">&</span>Overseas
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_ITEMS.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }>
                  {label}
                </NavLink>
              ))}
              <button onClick={() => setShowSuggest(true)}
                className="flex items-center gap-1.5 ml-1 px-3 py-2 rounded-lg text-[13px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition">
                <Lightbulb size={13} /> Suggest a School
              </button>
            </nav>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {user ? (
                <>
                  <Link to={getDashboardLink(user.role)}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-green-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                    <LayoutDashboard size={14} /> {getDashboardLabel(user.role)}
                  </Link>
                  <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                    <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {userInitial}
                    </div>
                    <button onClick={handleLogout}
                      className="text-[13px] border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition font-medium">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className="text-[13px] font-medium text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                    Log in
                  </Link>
                  <Link to="/register"
                    className="text-[13px] font-semibold bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition">
                    Get started →
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu">
              <span className={`absolute transition-all duration-300 ${menuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
                <X size={22} />
              </span>
              <span className={`absolute transition-all duration-300 ${menuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
                <Menu size={22} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      {/* Mobile Slide-down Panel */}
      <div className={`lg:hidden fixed left-0 right-0 top-16 z-40 transition-all duration-300 ease-in-out ${
        menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="mx-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

          {/* User strip (if logged in) */}
          {user && (
            <div className="flex items-center gap-3 px-5 py-4 bg-linear-to-r from-green-700 to-green-600">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-extrabold text-base shrink-0">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">{user.name}</p>
                <p className="text-green-200 text-xs capitalize">{user.role?.replace('-', ' ')}</p>
              </div>
              <Link to={getDashboardLink(user.role)}
                className="flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/30 shrink-0">
                <LayoutDashboard size={12} /> Dashboard
              </Link>
            </div>
          )}

          {/* Nav links */}
          <nav className="p-3 space-y-0.5">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-green-700 bg-green-50'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }>
                <Icon size={17} className="shrink-0 opacity-60" />
                <span className="flex-1">{label}</span>
                <ChevronRight size={14} className="text-gray-300" />
              </NavLink>
            ))}
            <button onClick={() => { setMenuOpen(false); setShowSuggest(true); }}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition">
              <Lightbulb size={17} className="shrink-0" />
              <span className="flex-1">Suggest a School</span>
              <ChevronRight size={14} className="text-amber-400" />
            </button>
          </nav>

          {/* Auth footer */}
          <div className="px-3 pb-3 border-t border-gray-100 pt-2">
            {user ? (
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition">
                <LogOut size={17} />
                Log out
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <Link to="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-green-300 hover:text-green-700 transition">
                  <User size={16} /> Log in
                </Link>
                <Link to="/register"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition shadow-lg shadow-green-900/20">
                  Create Free Account →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggest a School Modal */}
      {showSuggest && <SuggestModal onClose={() => setShowSuggest(false)} />}
    </>
  );
}
