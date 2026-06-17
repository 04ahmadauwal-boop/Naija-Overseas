import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';
import {
  Search, SlidersHorizontal, Star, MapPin, CheckCircle,
  ArrowRight, X, Video, Users, Clock, TrendingUp,
  Zap, Shield, Banknote, GraduationCap, UserCheck,
  BookOpen, Globe, ChevronDown, Wallet,
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const WORLD_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania', 'Rwanda',
  'Cameroon', 'Senegal', 'Ethiopia', 'Zimbabwe', 'Zambia', 'Ivory Coast',
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany',
  'France', 'Netherlands', 'Ireland', 'New Zealand', 'UAE', 'Qatar',
  'Saudi Arabia', 'India', 'Pakistan', 'Malaysia', 'Singapore',
];

const CURRENCY_SYMBOLS = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€', GHS: 'GH₵',
  KES: 'KSh', ZAR: 'R', CAD: 'CA$', AUD: 'A$', INR: '₹', ZMW: 'ZK',
};

const LEVELS = [
  { value: '',           label: 'All Levels' },
  { value: 'primary',    label: 'Primary School' },
  { value: 'jss',        label: 'Junior Secondary (JSS)' },
  { value: 'sss',        label: 'Senior Secondary (SSS)' },
  { value: 'waec',       label: 'WAEC Preparation' },
  { value: 'jamb',       label: 'JAMB / UTME' },
  { value: 'neco',       label: 'NECO Preparation' },
  { value: 'gcse',       label: 'GCSE / IGCSE' },
  { value: 'a-level',    label: 'A-Level' },
  { value: 'ib',         label: 'IB Programme' },
  { value: 'sat',        label: 'SAT / ACT' },
  { value: 'university', label: 'University Level' },
  { value: 'adult',      label: 'Adult Learning' },
];

const POPULAR_SUBJECTS = [
  'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'JAMB Prep', 'WAEC Prep', 'IELTS', 'Further Mathematics',
  'Computer Science', 'French', 'Spanish', 'SAT Prep', 'A-Level Maths',
];

const PRICE_RANGES = [
  { label: 'Budget',  min: '',      max: '3000'  },
  { label: 'Mid',     min: '3000',  max: '6000'  },
  { label: 'Premium', min: '6000',  max: '10000' },
  { label: 'Expert',  min: '10000', max: ''      },
];

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Featured' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest',     label: 'Newest' },
];

const EMPTY = { search: '', subject: '', level: '', mode: '', country: '', minRate: '', maxRate: '' };

function formatRate(tutor) {
  if (!tutor.hourlyRateNaira) return null;
  const sym = CURRENCY_SYMBOLS[tutor.currency] || '₦';
  return `${sym}${tutor.hourlyRateNaira.toLocaleString()}`;
}

function Stars({ rating, size = 13 }) {
  return (
    <div className="flex items-center gap-px">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size}
          className={n <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function TutorCard({ tutor }) {
  const [expanded, setExpanded] = useState(false);
  const name = tutor.displayName || tutor.user?.name || 'Tutor';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const subjects = tutor.subjects || [];
  const bio = tutor.bio || '';
  const shortBio = bio.length > 160 ? bio.slice(0, 160) + '…' : bio;
  const rateStr = formatRate(tutor);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-4 sm:p-5 flex gap-3 sm:gap-5">

        {/* Avatar */}
        <div className="shrink-0">
          <div className="relative">
            {tutor.profilePhoto ? (
              <img src={tutor.profilePhoto} alt={name}
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-100" />
            ) : (
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-green-700 flex items-center justify-center text-white font-bold text-xl border border-green-200">
                {initials}
              </div>
            )}
            {tutor.isVerified && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                <CheckCircle size={9} className="text-white" />
              </span>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Name + available badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight truncate">{name}</h3>
                {tutor.isVerified && <CheckCircle size={13} className="text-green-500 shrink-0" />}
              </div>
              {tutor.reviewCount > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Stars rating={tutor.rating} size={11} />
                  <span className="text-xs font-bold text-gray-700">{tutor.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({tutor.reviewCount})</span>
                </div>
              )}
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Available
            </span>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-gray-400 mb-2">
            {tutor.yearsExperience > 0 && (
              <span className="flex items-center gap-1"><Clock size={10} />{tutor.yearsExperience}yr exp</span>
            )}
            {tutor.totalSessions > 0 && (
              <span className="flex items-center gap-1"><BookOpen size={10} />{tutor.totalSessions} lessons</span>
            )}
            {tutor.reviewCount > 0 && (
              <span className="flex items-center gap-1"><Users size={10} />{tutor.reviewCount}+ students</span>
            )}
          </div>

          {/* Mode + location badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tutor.teachingMode?.includes('online') && (
              <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-semibold px-2 py-0.5 rounded-full">
                <Video size={9} /> Online
              </span>
            )}
            {tutor.teachingMode?.includes('in-person') && (
              <span className="flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 border border-purple-100 font-semibold px-2 py-0.5 rounded-full">
                <MapPin size={9} /> In-Person
              </span>
            )}
            {(tutor.city || tutor.country) && (
              <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">
                <Globe size={9} /> {[tutor.city, tutor.country].filter(Boolean).join(', ')}
              </span>
            )}
          </div>

          {/* Subjects */}
          {subjects.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {subjects.slice(0, 4).map(s => (
                <span key={s} className="text-[10px] sm:text-[11px] bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full">{s}</span>
              ))}
              {subjects.length > 4 && (
                <span className="text-[10px] sm:text-[11px] bg-gray-100 text-gray-400 font-medium px-2 py-0.5 rounded-full">+{subjects.length - 4}</span>
              )}
            </div>
          )}

          {/* Bio — hidden on mobile to keep card compact */}
          {bio && (
            <p className="hidden sm:block text-xs sm:text-sm text-gray-500 leading-relaxed">
              {expanded ? bio : shortBio}
              {bio.length > 160 && (
                <button onClick={() => setExpanded(!expanded)}
                  className="text-green-700 font-semibold ml-1 hover:underline text-xs">
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Price + CTA footer strip */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 border-t border-gray-50 bg-gray-50/60">
        <div>
          {rateStr ? (
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-gray-900 text-base sm:text-lg leading-none">{rateStr}</span>
              <span className="text-xs text-gray-400">/class</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400 font-medium">Rate on request</span>
          )}
          {tutor.trialAvailable && (
            <p className="text-[10px] text-green-600 font-bold mt-0.5">
              {tutor.trialDiscountPercent ?? 50}% off first session
            </p>
          )}
        </div>
        <Link to={`/tutors/${tutor._id}`}
          className="shrink-0 bg-green-700 text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl hover:bg-green-800 transition shadow-sm whitespace-nowrap">
          Book session →
        </Link>
      </div>
    </div>
  );
}

function MatchCard({ tutor }) {
  const name = tutor.displayName || tutor.user?.name || 'Tutor';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const rateStr = tutor.hourlyRateNaira ? `₦${tutor.hourlyRateNaira.toLocaleString()}/hr` : null;

  return (
    <Link to={`/tutors/${tutor._id}`}
      className="group bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-2xl p-4 flex gap-3 sm:gap-4 transition-all duration-200">
      <div className="relative shrink-0">
        {tutor.profilePhoto ? (
          <img src={tutor.profilePhoto} alt={name}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white/20" />
        ) : (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-600 border-2 border-green-500 flex items-center justify-center text-white font-bold text-base sm:text-lg">
            {initials}
          </div>
        )}
        <span className="absolute -top-1.5 -right-1.5 bg-green-400 text-green-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow">
          {tutor.percentage}%
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="font-bold text-white text-sm leading-tight truncate">{name}</p>
          {tutor.isVerified && <CheckCircle size={12} className="text-green-400 shrink-0" />}
        </div>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {(tutor.matchReasons || []).slice(0, 3).map((reason, i) => (
            <span key={i} className="text-[10px] font-semibold bg-green-800/60 text-green-300 px-2 py-0.5 rounded-full">{reason}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-green-400 flex-wrap">
          {tutor.subjects?.slice(0, 2).map(s => <span key={s}>{s}</span>)}
          {rateStr && <span className="text-green-300 font-semibold ml-auto">{rateStr}</span>}
        </div>
      </div>
    </Link>
  );
}

function SmartMatchWidget({ onMatch }) {
  const [q, setQ] = useState({ subject: '', level: '', mode: '' });
  const handleMatch = () => {
    if (!q.subject && !q.level) { toast.error('Please select at least a subject or level'); return; }
    onMatch(q);
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="font-extrabold text-gray-900 text-sm mb-0.5">Find your ideal tutor instantly</p>
      <p className="text-xs text-gray-400 mb-4">Get a personalised match in under a minute</p>
      <div className="space-y-2.5">
        <select value={q.subject} onChange={e => setQ(p => ({ ...p, subject: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition appearance-none cursor-pointer">
          <option value="">Select a subject…</option>
          {POPULAR_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={q.level} onChange={e => setQ(p => ({ ...p, level: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition appearance-none">
          {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <select value={q.mode} onChange={e => setQ(p => ({ ...p, mode: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 transition appearance-none">
          <option value="">Online or in-person?</option>
          <option value="online">Online</option>
          <option value="in-person">In-Person</option>
        </select>
        <button onClick={handleMatch}
          className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition text-sm">
          Get matched →
        </button>
      </div>
    </div>
  );
}

export default function FindTutoring() {
  const location = useLocation();
  const { user } = useAuth();

  const [tutors, setTutors] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY);
  const [sort, setSort] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [matches, setMatches] = useState([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const fetchMatches = useCallback(async () => {
    if (!user || user.role !== 'student') return;
    try {
      const { data } = await api.get('/tutors/match');
      setMatches(data.matches || []);
    } catch { /* non-critical */ }
  }, [user]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const doFetch = async (page, f, s) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort: s };
      if (f.search)  params.search  = f.search;
      if (f.subject) params.subject = f.subject;
      if (f.level)   params.level   = f.level;
      if (f.mode)    params.mode    = f.mode;
      if (f.country) params.country = f.country;
      if (f.minRate) params.minRate = f.minRate;
      if (f.maxRate) params.maxRate = f.maxRate;
      const { data } = await api.get('/tutors', { params });
      setTutors(data.tutors || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setCurrentPage(page);
    } catch {
      toast.error('Failed to load tutors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const init = {
      search:  sp.get('search')  || '',
      subject: sp.get('subject') || '',
      level:   sp.get('level')   || '',
      mode:    sp.get('mode')    || '',
      country: sp.get('country') || '',
      minRate: sp.get('minRate') || '',
      maxRate: sp.get('maxRate') || '',
    };
    setFilters(init);
    doFetch(1, init, 'featured');
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    doFetch(1, next, sort);
  };

  const setPriceRange = (min, max) => {
    const already = filters.minRate === min && filters.maxRate === max;
    const next = { ...filters, minRate: already ? '' : min, maxRate: already ? '' : max };
    setFilters(next);
    doFetch(1, next, sort);
  };

  const clearAll = () => { setFilters(EMPTY); doFetch(1, EMPTY, sort); };
  const handleSearch = e => {
    e.preventDefault();
    document.getElementById('tutor-list')?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleSort = s => { setSort(s); doFetch(1, filters, s); };
  const handleMatch = q => {
    const next = { ...EMPTY, subject: q.subject, level: q.level, mode: q.mode };
    setFilters(next);
    doFetch(1, next, sort);
    document.getElementById('tutor-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeCount = [
    filters.subject, filters.level, filters.mode, filters.country,
    filters.minRate || filters.maxRate,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section
        className="relative px-4 py-10 sm:py-16 md:py-20 overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-green-900/92 via-green-800/88 to-emerald-900/90" />

        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-[1.75rem] sm:text-4xl md:text-[3.2rem] font-extrabold text-white tracking-tight leading-[1.12] mb-3 sm:mb-4">
            Learn from the best.<br />
            <span className="text-green-300">Pass with confidence.</span>
          </h1>
          <p className="text-green-100 text-sm sm:text-base mb-6 sm:mb-8 max-w-2xl leading-relaxed">
            Book a verified tutor for <strong className="text-white">WAEC, JAMB, GCSE, A-Level, SAT, IELTS</strong> and more.
            1-on-1 sessions, online or in-person — wherever you are.
          </p>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
            {[
              { icon: Shield,   label: 'Verified tutors' },
              { icon: Zap,      label: 'Discounted first session' },
              { icon: Globe,    label: 'Online & In-Person' },
              { icon: Clock,    label: 'Flexible schedule' },
              { icon: Users,    label: 'All ages & levels' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs sm:text-sm text-white/90 bg-white/10 border border-white/20 px-2.5 sm:px-3 py-1.5 rounded-full font-medium">
                <Icon size={11} className="text-green-300" /> {label}
              </span>
            ))}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch}>
            <div className="flex flex-col gap-2 bg-white/10 backdrop-blur-sm border border-white/20 p-2 rounded-2xl">
              {/* Subject dropdown */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" size={15} />
                <select value={filters.subject} onChange={e => update('subject', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:bg-white/20 transition appearance-none cursor-pointer">
                  <option value="" className="text-gray-900">Select a subject…</option>
                  {POPULAR_SUBJECTS.map(s => (
                    <option key={s} value={s} className="text-gray-900">{s}</option>
                  ))}
                </select>
              </div>
              {/* Level + Mode + Button row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <select value={filters.level} onChange={e => update('level', e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:bg-white/20 transition appearance-none cursor-pointer">
                  {LEVELS.map(l => <option key={l.value} value={l.value} className="text-gray-900">{l.label}</option>)}
                </select>
                <select value={filters.mode} onChange={e => update('mode', e.target.value)}
                  className="flex-1 sm:max-w-[180px] bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:bg-white/20 transition appearance-none cursor-pointer">
                  <option value="" className="text-gray-900">Any mode</option>
                  <option value="online" className="text-gray-900">Online</option>
                  <option value="in-person" className="text-gray-900">In-Person</option>
                </select>
                <button type="submit"
                  className="bg-white text-green-800 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition text-sm shadow-lg whitespace-nowrap">
                  Find Tutors →
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ── MATCHED FOR YOU (logged-in students only) ─────────────── */}
      {user?.role === 'student' && matches.length > 0 && (
        <section className="bg-green-900 py-8 sm:py-10">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <span className="text-[11px] font-bold text-green-400 tracking-widest uppercase">Matched for you</span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">Your perfect tutors</h2>
                <p className="text-green-400 text-xs mt-0.5">Ranked by subject, level, schedule &amp; teaching style</p>
              </div>
              <Link to="/student-onboarding"
                className="shrink-0 text-xs text-green-400 hover:text-green-300 font-semibold border border-green-700 hover:border-green-500 px-3 py-1.5 rounded-lg transition">
                Refine
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matches.slice(0, 4).map(tutor => (
                <MatchCard key={tutor._id} tutor={tutor} />
              ))}
            </div>
            {matches.length > 4 && (
              <p className="text-xs text-green-500 mt-4 text-center">
                {matches.length - 4} more matched tutor{matches.length - 4 > 1 ? 's' : ''} — scroll down to see all
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS (short version) ──────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-xs font-bold text-green-600 tracking-widest uppercase bg-green-50 px-3 py-1.5 rounded-full">How it works</span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mt-3 mb-2">Get matched in minutes</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Four simple steps — booked with the right tutor before the day is over.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { step: '01', icon: UserCheck,    title: 'Sign Up',             desc: 'Free account, no card needed.',                    color: 'bg-green-100 text-green-700',  ring: 'ring-green-200' },
              { step: '02', icon: BookOpen,     title: 'Share Your Needs',    desc: 'Subject, level & schedule.',                       color: 'bg-blue-100 text-blue-700',    ring: 'ring-blue-200'  },
              { step: '03', icon: Zap,          title: 'Get Matched',         desc: 'Verified tutors for your goals.',                   color: 'bg-purple-100 text-purple-700',ring: 'ring-purple-200'},
              { step: '04', icon: GraduationCap,title: 'Start Learning',      desc: 'Book & begin preparing.',                          color: 'bg-yellow-100 text-yellow-700',ring: 'ring-yellow-200'},
            ].map(({ step, icon: Icon, title, desc, color, ring }, i) => (
              <div key={step} className="flex flex-col items-center text-center gap-2 sm:gap-3 relative">
                {i < 3 && (
                  <div className="hidden sm:block absolute top-5 sm:top-6 left-[calc(50%+24px)] sm:left-[calc(50%+28px)] w-[calc(100%-48px)] sm:w-[calc(100%-56px)] h-0.5 border-t-2 border-dashed border-gray-200" />
                )}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${color} ring-4 ${ring} flex items-center justify-center relative z-10`}>
                  <Icon size={18} className="sm:hidden" />
                  <Icon size={22} className="hidden sm:block" />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-0.5">Step {step}</div>
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-1">{title}</h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 text-center">
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-green-700 text-white font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl hover:bg-green-800 transition text-sm shadow-lg shadow-green-200">
              Get matched now <ArrowRight size={15} />
            </Link>
            <p className="text-xs text-gray-400 mt-3">Free to join · No commitment · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ── SUBJECT CHIPS (horizontal scroll on mobile) ───────────── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 overflow-x-auto scrollbar-none">
        <div className="max-w-5xl mx-auto flex items-center gap-2 w-max sm:w-auto sm:flex-wrap">
          <span className="text-xs font-bold text-gray-400 whitespace-nowrap shrink-0">Browse:</span>
          {POPULAR_SUBJECTS.map(s => (
            <button key={s} onClick={() => update('subject', filters.subject === s ? '' : s)}
              className={`whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                filters.subject === s
                  ? 'bg-green-700 border-green-700 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 bg-white'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 flex gap-6 items-start">

        {/* ── LEFT: Tutor list ────────────────────────────────────── */}
        <div className="flex-1 min-w-0" id="tutor-list">

          {/* Mobile-only quick tools */}
          <div className="lg:hidden mb-5 flex gap-3 overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="shrink-0 flex items-center gap-2 text-xs font-semibold bg-green-700 text-white rounded-xl px-4 py-2.5 whitespace-nowrap"
            >
              <Zap size={13} /> Smart Match
            </button>
            <Link to="/become-a-tutor"
              className="shrink-0 flex items-center gap-2 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 whitespace-nowrap hover:border-green-400 hover:text-green-700 transition">
              <GraduationCap size={13} /> Become a Tutor
            </Link>
            <Link to="/register"
              className="shrink-0 flex items-center gap-2 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-xl px-4 py-2.5 whitespace-nowrap hover:border-green-400 hover:text-green-700 transition">
              <UserCheck size={13} /> Sign Up Free
            </Link>
          </div>

          {/* Mobile SmartMatchWidget */}
          {showMobileSidebar && (
            <div className="lg:hidden mb-5">
              <SmartMatchWidget onMatch={(q) => { handleMatch(q); setShowMobileSidebar(false); }} />
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <p className="text-sm text-gray-600 font-semibold">
              {loading ? 'Searching…' : (
                <><strong className="text-gray-900">{total}</strong> tutor{total !== 1 ? 's' : ''} found
                  {filters.subject ? ` for ${filters.subject}` : ''}
                  {filters.country ? ` in ${filters.country}` : ''}
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select value={sort} onChange={e => handleSort(e.target.value)}
                  className="text-xs border border-gray-200 bg-white rounded-xl pl-3 pr-7 py-2 focus:outline-none focus:border-green-500 transition appearance-none cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <button onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 bg-white rounded-xl px-3 py-2 hover:border-green-500 hover:text-green-700 transition">
                <SlidersHorizontal size={13} />
                Filters
                {activeCount > 0 && (
                  <span className="bg-green-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{activeCount}</span>
                )}
              </button>

              {activeCount > 0 && (
                <button onClick={clearAll}
                  className="hidden sm:flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-700 transition">
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* ── PRO FILTER PANEL ── */}
          {showFilters && (
            <div className="mb-5">
              {/* Active chips */}
              {activeCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-4 px-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Active:</span>
                  {filters.subject && (
                    <button onClick={() => update('subject', '')}
                      className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      <BookOpen size={10} /> {filters.subject} <X size={9} />
                    </button>
                  )}
                  {filters.level && (
                    <button onClick={() => update('level', '')}
                      className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      <GraduationCap size={10} /> {LEVELS.find(l => l.value === filters.level)?.label} <X size={9} />
                    </button>
                  )}
                  {filters.country && (
                    <button onClick={() => update('country', '')}
                      className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      <MapPin size={10} /> {filters.country} <X size={9} />
                    </button>
                  )}
                  {filters.mode && (
                    <button onClick={() => update('mode', '')}
                      className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition capitalize">
                      <Video size={10} /> {filters.mode} <X size={9} />
                    </button>
                  )}
                  {(filters.minRate || filters.maxRate) && (
                    <button onClick={() => setPriceRange('', '')}
                      className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      <Wallet size={10} /> Rate filter <X size={9} />
                    </button>
                  )}
                  <button onClick={clearAll}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-700 transition shrink-0">
                    <X size={12} /> Clear all
                  </button>
                </div>
              )}

              {/* 3-card filter grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">

                {/* Country */}
                <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.country ? 'border-blue-300 shadow-blue-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                    <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <MapPin size={13} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Country</p>
                      <p className="text-xs font-bold text-gray-800 leading-tight truncate">{filters.country || 'All Countries'}</p>
                    </div>
                    {filters.country && (
                      <button onClick={() => update('country', '')}
                        className="w-5 h-5 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                        <X size={10} />
                      </button>
                    )}
                  </div>
                  <div className="p-3">
                    <select value={filters.country} onChange={e => update('country', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50 text-gray-700 transition appearance-none cursor-pointer">
                      <option value="">All Countries</option>
                      {WORLD_COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Price Range */}
                <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${(filters.minRate || filters.maxRate) ? 'border-rose-300 shadow-rose-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                    <div className="w-7 h-7 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                      <Wallet size={13} className="text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Rate Range</p>
                      <p className="text-xs font-bold text-gray-800 leading-tight">
                        {(filters.minRate || filters.maxRate)
                          ? PRICE_RANGES.find(p => p.min === filters.minRate && p.max === filters.maxRate)?.label || 'Custom'
                          : 'Any Rate'}
                      </p>
                    </div>
                    {(filters.minRate || filters.maxRate) && (
                      <button onClick={() => setPriceRange('', '')}
                        className="w-5 h-5 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                        <X size={10} />
                      </button>
                    )}
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-1.5">
                    {PRICE_RANGES.map(({ label, min, max }) => {
                      const active = filters.minRate === min && filters.maxRate === max;
                      return (
                        <button key={label} onClick={() => setPriceRange(min, max)}
                          className={`py-2 rounded-xl text-xs font-bold border-2 transition text-center ${
                            active
                              ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-sm'
                              : 'border-gray-100 text-gray-600 hover:border-rose-200 hover:bg-rose-50/40 bg-gray-50/80'
                          }`}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Teaching Mode */}
                <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.mode ? 'border-purple-300 shadow-purple-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                    <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                      <Video size={13} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Teaching Mode</p>
                      <p className="text-xs font-bold text-gray-800 leading-tight capitalize">{filters.mode || 'Any Mode'}</p>
                    </div>
                    {filters.mode && (
                      <button onClick={() => update('mode', '')}
                        className="w-5 h-5 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                        <X size={10} />
                      </button>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    {[
                      { label: 'Online',     val: 'online',    icon: Video,  desc: 'Zoom, Meet, WhatsApp' },
                      { label: 'In-Person',  val: 'in-person', icon: MapPin, desc: 'Home visit or agreed location' },
                    ].map(({ label, val, icon: Icon, desc }) => {
                      const active = filters.mode === val;
                      return (
                        <button key={val} onClick={() => update('mode', active ? '' : val)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs border-2 transition ${
                            active
                              ? 'bg-purple-50 border-purple-400 text-purple-800 shadow-sm'
                              : 'border-gray-100 text-gray-600 hover:border-purple-200 hover:bg-purple-50/40 bg-gray-50/80'
                          }`}>
                          <span className="flex items-center gap-2 font-semibold">
                            <Icon size={11} /> {label}
                          </span>
                          <span className={`text-[10px] ${active ? 'text-purple-500' : 'text-gray-400'}`}>{desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Filter footer */}
              <div className="mt-3 flex items-center justify-between px-1">
                <p className="text-sm text-gray-500">
                  {loading
                    ? <span className="text-gray-400">Searching…</span>
                    : <><span className="font-bold text-gray-900">{total}</span> tutor{total !== 1 ? 's' : ''} match your filters</>
                  }
                </p>
                {activeCount > 0 && (
                  <button onClick={clearAll}
                    className="inline-flex items-center gap-1 text-sm text-red-500 font-semibold hover:text-red-700 transition">
                    <X size={13} /> Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tutor list */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-36 skeleton-shimmer border border-gray-100" />
              ))}
            </div>
          ) : tutors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 sm:p-12 text-center">
              <GraduationCap size={36} className="text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 text-base mb-2">No tutors found</h3>
              <p className="text-gray-400 text-sm mb-5 max-w-sm mx-auto">
                {activeCount > 0 ? 'Try removing some filters — tutors join daily!' : "We're onboarding tutors right now. Be the first!"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {activeCount > 0 && (
                  <button onClick={clearAll}
                    className="bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-800 transition text-sm">
                    Clear Filters
                  </button>
                )}
                <Link to="/become-a-tutor"
                  className="border border-green-700 text-green-700 font-bold px-5 py-2.5 rounded-xl hover:bg-green-50 transition text-sm">
                  Register as a Tutor →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {tutors.map(t => <TutorCard key={t._id} tutor={t} />)}
            </div>
          )}

          {!loading && <Pagination page={currentPage} pages={pages} onPage={(p) => doFetch(p, filters, sort)} />}

          {/* Browse footer */}
          {!loading && (
            <div className="mt-8 sm:mt-10 bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Browse tutors by subject</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-2 mb-6">
                {['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
                  'Economics', 'JAMB Prep', 'WAEC Prep', 'IELTS', 'Computer Science',
                  'Further Maths', 'SAT Prep'].map(s => (
                  <button key={s} onClick={() => update('subject', s)}
                    className="text-left text-xs sm:text-sm text-green-700 hover:underline hover:text-green-800 transition truncate">
                    {s} tutors
                  </button>
                ))}
              </div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm sm:text-base">Browse by level</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-2">
                {LEVELS.filter(l => l.value).map(l => (
                  <button key={l.value} onClick={() => update('level', l.value)}
                    className="text-left text-xs sm:text-sm text-green-700 hover:underline hover:text-green-800 transition truncate">
                    {l.label} tutors
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mobile-only bottom cards */}
          <div className="lg:hidden mt-6 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-3">
              <p className="font-bold text-gray-900 text-sm">Why Education Naija &amp; Overseas?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { icon: Globe,       text: 'Tutors from 30+ countries',   color: 'text-blue-600'   },
                  { icon: GraduationCap,text: 'WAEC, JAMB & global exams', color: 'text-green-600'  },
                  { icon: Banknote,    text: 'Pay in your local currency',  color: 'text-blue-600'   },
                  { icon: MapPin,      text: 'Online & in-person options',  color: 'text-purple-600' },
                  { icon: Shield,      text: '100% verified tutors',        color: 'text-orange-500' },
                  { icon: UserCheck,   text: 'Discounted first session',    color: 'text-green-600'  },
                ].map(({ icon: Icon, text, color }) => (
                  <div key={text} className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Icon size={13} className={`${color} shrink-0`} />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-700 rounded-2xl p-5 text-white">
              <p className="font-bold text-sm mb-1">Are you a tutor?</p>
              <p className="text-green-200 text-xs mb-4">Set your own rate and start earning from anywhere in the world.</p>
              <Link to="/become-a-tutor"
                className="w-full flex items-center justify-center gap-1.5 bg-white text-green-700 font-bold py-2.5 rounded-xl hover:bg-green-50 transition text-xs sm:text-sm">
                Become a Tutor <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR (desktop only) ────────────────────────── */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-24 space-y-4">
          <SmartMatchWidget onMatch={handleMatch} />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <p className="font-bold text-gray-900 text-sm">Why Education Naija &amp; Overseas?</p>
            {[
              { icon: Globe,       text: 'Tutors from 30+ countries',   color: 'text-blue-600'   },
              { icon: GraduationCap,text: 'WAEC, JAMB & global exams', color: 'text-green-600'  },
              { icon: Banknote,    text: 'Pay in your local currency',  color: 'text-blue-600'   },
              { icon: MapPin,      text: 'Online & in-person options',  color: 'text-purple-600' },
              { icon: Shield,      text: '100% verified tutors',        color: 'text-orange-500' },
              { icon: UserCheck,   text: 'Discounted first session',    color: 'text-green-600'  },
              { icon: Users,       text: 'Group sessions available',    color: 'text-blue-600'   },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-gray-600">
                <Icon size={14} className={`${color} shrink-0`} />
                {text}
              </div>
            ))}
          </div>

          <div className="bg-green-700 rounded-2xl p-5 text-white">
            <p className="font-bold text-sm mb-1">Are you a tutor?</p>
            <p className="text-green-200 text-xs mb-4">Set your own rate and start earning from your knowledge — from anywhere in the world.</p>
            <Link to="/become-a-tutor"
              className="w-full flex items-center justify-center gap-1.5 bg-white text-green-700 font-bold py-2.5 rounded-xl hover:bg-green-50 transition text-xs">
              Become a Tutor <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── DETAILED HOW IT WORKS (5 steps) ──────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-12 sm:py-16 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">The Process</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              How 1:1 tutoring works
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
              From your first search to exam-ready confidence — here's exactly what happens.
            </p>
          </div>

          {/* Steps — vertical on mobile, horizontal on md+ */}
          <div className="flex flex-col md:grid md:grid-cols-5 gap-0 md:gap-4 relative">

            {/* Horizontal connector — desktop only */}
            <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-0.5 bg-linear-to-r from-green-200 via-green-500 to-green-200 z-0" />

            {[
              { n: '01', icon: Search,      color: 'bg-green-700',  ring: 'ring-green-200',  tagColor: 'text-green-600',  title: 'Search & Match',            tagline: 'Find your perfect tutor',          bullets: ['Filter by subject, exam & level', 'Country, mode & budget', 'See ratings & reviews'] },
              { n: '02', icon: UserCheck,   color: 'bg-green-700',  ring: 'ring-green-200',  tagColor: 'text-green-600',  title: 'Book First Session',         tagline: 'Pay a discounted rate',            bullets: ['Pick your date & time', 'Pay discounted first-session rate', 'Tutor confirms fast'] },
              { n: '03', icon: Video,       color: 'bg-green-700',  ring: 'ring-green-200',  tagColor: 'text-green-600',  title: 'Meet Your Tutor',            tagline: 'Feel the teaching style',          bullets: ['Live session via Zoom / Meet', 'Interactive whiteboard', '30-min to assess the fit'] },
              { n: '04', icon: Zap,         color: 'bg-green-700',  ring: 'ring-green-200',  tagColor: 'text-green-600',  title: 'Subscribe & Schedule',       tagline: 'Lock in your weekly plan',         bullets: ['Choose sessions per week (1–5×)', 'Pick your time slots', 'Pay monthly in Naira'] },
              { n: '05', icon: TrendingUp,  color: 'bg-yellow-400', ring: 'ring-yellow-200', tagColor: 'text-yellow-500', title: 'Learn & Excel',              tagline: 'Results you can see',              bullets: ['Auto-booked monthly sessions', '24h email reminders', 'WAEC / JAMB ready'] },
            ].map(({ n, icon: Icon, color, ring, tagColor, title, tagline, bullets }, i) => (
              <div key={n} className={`relative flex md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center group
                ${i < 4 ? 'pb-6 md:pb-0' : ''}`}>

                {/* Vertical connector — mobile only */}
                {i < 4 && (
                  <div className="md:hidden absolute left-[22px] top-[52px] bottom-0 w-0.5 bg-gradient-to-b from-green-400 to-green-100" />
                )}

                {/* Step bubble */}
                <div className={`relative shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg ring-4 ${ring} ring-offset-2 transition group-hover:scale-110 md:mb-5 z-10`}>
                  {n === '05'
                    ? <Icon size={20} className="text-green-900" />
                    : <Icon size={20} className="text-white" />}
                  <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center shadow ${n === '05' ? 'bg-green-700 text-white' : 'bg-white text-green-800'}`}>
                    {n}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 md:flex-none md:w-full pl-0 md:pl-0">
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${tagColor}`}>{tagline}</p>
                  <h3 className="font-extrabold text-gray-900 text-sm mb-2">{title}</h3>
                  <ul className="space-y-1">
                    {bullets.map(b => (
                      <li key={b} className="flex items-start md:justify-center gap-1.5 text-xs text-gray-500">
                        <CheckCircle size={10} className="text-green-500 shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* CTA strip */}
          <div className="mt-10 sm:mt-14 bg-linear-to-r from-green-800 to-green-700 rounded-2xl sm:rounded-3xl px-5 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <p className="text-white font-extrabold text-base sm:text-lg leading-tight mb-1">Ready to get started?</p>
              <p className="text-green-200 text-xs sm:text-sm">Book your first session at a discounted rate — try before you subscribe.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
              <Link to="/find-tutoring"
                className="flex items-center justify-center gap-2 bg-yellow-400 text-green-900 font-bold px-5 py-3 rounded-xl text-sm hover:bg-yellow-300 transition shadow">
                <Search size={14} /> Browse Tutors
              </Link>
              <Link to="/become-a-tutor"
                className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-5 py-3 rounded-xl text-sm hover:bg-white/20 transition border border-white/20">
                Become a Tutor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="relative py-10 md:py-24 px-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#052e16 0%,#064e3b 50%,#042f1e 100%)' }}>
        {/* Dot grid texture */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '22px 22px' }} />
        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-green-400/50 to-transparent" />
        {/* Bottom shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-green-800/60 to-transparent" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-16 items-start">

            {/* Left — sticky header */}
            <div className="lg:sticky lg:top-24">
              <span className="inline-block text-emerald-400 text-[11px] font-extrabold uppercase tracking-[0.2em] mb-4">FAQ</span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3 sm:mb-4"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Got questions?<br />
                <em className="text-emerald-300 not-italic">We have answers.</em>
              </h2>
              <p className="text-green-300/60 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6 max-w-xs">
                Everything you need to know about tutors, sessions, payments and more.
              </p>
              <Link to="/contact"
                className="inline-flex items-center gap-2 bg-white text-green-900 font-bold text-sm px-5 py-2.5 rounded-full hover:bg-green-50 transition shadow-lg shadow-green-950/50">
                Ask a question <ArrowRight size={14} />
              </Link>
              <div className="mt-10 gap-8 hidden lg:flex">
                {[['6', 'Common topics'], ['< 1 min', 'Avg. read time']].map(([v, l]) => (
                  <div key={l}>
                    <div className="text-2xl font-extrabold text-white">{v}</div>
                    <div className="text-green-400/60 text-xs mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — accordion */}
            <div className="space-y-2">
              {[
                { q: 'How can I book a first discounted session?', a: 'Click "Book session" on any tutor card. Log in or create a free account, pick your date and time, and complete a small discounted payment. The tutor will confirm within their response time.' },
                { q: 'Which currencies are supported?', a: "Tutors set their own rates in their local currency — Nigerian Naira (₦), US Dollar ($), British Pound (£), Euro (€), Ghanaian Cedis, Kenyan Shillings, and more. You see the tutor's rate in their currency." },
                { q: 'Can I find tutors outside Nigeria?', a: 'Yes! Our platform is worldwide. You can find tutors from the UK, US, Canada, Ghana, Kenya, India, and many more countries. Use the Country filter to narrow your search.' },
                { q: 'Who are the tutors on this platform?', a: 'All tutors are manually reviewed before going live. We verify qualifications, teaching experience, and subject expertise. Look for the green verified badge on profiles.' },
                { q: 'Can I get a tutor for WAEC and JAMB preparation?', a: 'Yes! We have dedicated WAEC Prep and JAMB Prep tutors. Select "WAEC Prep" or "JAMB Prep" from the subject dropdown to find specialists for Nigerian exams.' },
                { q: 'How does online tutoring work?', a: 'Online sessions are conducted via Zoom, Google Meet, or WhatsApp Video — agreed between you and your tutor. In-person tutors visit your home or meet at an agreed location.' },
              ].map(({ q, a }) => <TutoringFaqItem key={q} q={q} a={a} />)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TutoringFaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${
      open
        ? 'border-emerald-400/30 bg-white/10 shadow-lg shadow-green-950/30'
        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
    }`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 text-left gap-4"
      >
        <span className="font-semibold text-white text-[12px] sm:text-[15px] leading-snug pr-2"
          style={{ fontFamily: "'Poppins', 'Georgia', sans-serif" }}>
          {q}
        </span>
        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
          open ? 'bg-white text-green-800 rotate-180' : 'bg-white/10 text-white/50'
        }`}>
          <ChevronDown size={13} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-green-100/70 text-[11px] sm:text-sm leading-relaxed border-t border-white/10 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}
