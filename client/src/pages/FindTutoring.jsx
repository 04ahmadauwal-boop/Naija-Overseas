import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search, SlidersHorizontal, Star, MapPin, CheckCircle,
  ArrowRight, X, Video, Users, Clock, TrendingUp,
  Zap, Shield, Banknote, GraduationCap, UserCheck,
  ChevronLeft, ChevronRight, BookOpen, Globe,
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
  { label: 'Budget',    min: '',     max: '3000'  },
  { label: 'Mid',       min: '3000', max: '6000'  },
  { label: 'Premium',   min: '6000', max: '10000' },
  { label: 'Expert',    min: '10000', max: ''     },
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
  const shortBio = bio.length > 180 ? bio.slice(0, 180) + '…' : bio;
  const rateStr = formatRate(tutor);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:border-green-200 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4">

      {/* Photo */}
      <div className="shrink-0 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
        <div className="relative">
          {tutor.profilePhoto ? (
            <img src={tutor.profilePhoto} alt={name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-100" />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-xl border-2 border-green-100">
              {initials}
            </div>
          )}
          {tutor.isVerified && (
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle size={10} className="text-white" />
            </span>
          )}
        </div>
        {tutor.reviewCount > 0 && (
          <div className="sm:hidden flex items-center gap-1">
            <Stars rating={tutor.rating} size={12} />
            <span className="text-xs font-bold text-gray-700">{tutor.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({tutor.reviewCount})</span>
          </div>
        )}
      </div>

      {/* Center info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{name}</h3>
          {tutor.isVerified && <CheckCircle size={15} className="text-green-500 shrink-0" />}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Available now
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mb-2">
          {tutor.totalSessions > 0 && (
            <span className="flex items-center gap-1"><BookOpen size={11} className="text-gray-400" />{tutor.totalSessions} lessons</span>
          )}
          {tutor.reviewCount > 0 && (
            <span className="flex items-center gap-1"><Users size={11} className="text-gray-400" />Helped {tutor.reviewCount}+ students</span>
          )}
          {tutor.yearsExperience > 0 && (
            <span className="flex items-center gap-1"><Clock size={11} className="text-gray-400" />+{tutor.yearsExperience} yr{tutor.yearsExperience !== 1 ? 's' : ''}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {tutor.teachingMode?.includes('online') && (
            <span className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 border border-blue-100 font-semibold px-2 py-0.5 rounded-full">
              <Video size={9} /> Online
            </span>
          )}
          {tutor.teachingMode?.includes('in-person') && (
            <span className="flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 border border-purple-100 font-semibold px-2 py-0.5 rounded-full">
              <MapPin size={9} /> In-Person
            </span>
          )}
          {(tutor.city || tutor.country) && (
            <span className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">
              <Globe size={9} /> {[tutor.city, tutor.country].filter(Boolean).join(', ')}
            </span>
          )}
        </div>

        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {subjects.slice(0, 5).map(s => (
              <span key={s} className="text-[11px] bg-gray-100 text-gray-700 font-medium px-2.5 py-1 rounded-full">{s}</span>
            ))}
            {subjects.length > 5 && (
              <span className="text-[11px] bg-gray-100 text-gray-400 font-medium px-2.5 py-1 rounded-full">+{subjects.length - 5} more</span>
            )}
          </div>
        )}

        {tutor.headline && (
          <p className="text-xs font-semibold text-gray-500 mb-1">{tutor.headline}</p>
        )}
        {bio && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {expanded ? bio : shortBio}
            {bio.length > 180 && (
              <button onClick={() => setExpanded(!expanded)}
                className="text-green-700 font-semibold ml-1 hover:underline">
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>
        )}
      </div>

      {/* Right: price + book */}
      <div className="sm:shrink-0 sm:w-36 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
        {tutor.reviewCount > 0 && (
          <div className="hidden sm:flex flex-col items-end gap-0.5">
            <Stars rating={tutor.rating} size={13} />
            <span className="text-xs text-gray-500 font-medium">{tutor.rating.toFixed(1)} ({tutor.reviewCount})</span>
          </div>
        )}

        <div className="text-right">
          {rateStr ? (
            <>
              <p className="font-extrabold text-gray-900 text-lg leading-tight">{rateStr}</p>
              <p className="text-xs text-gray-400">/class</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 font-medium">Rate on request</p>
          )}
          {tutor.trialAvailable && (
            <p className="text-[10px] text-green-600 font-bold mt-0.5">
              Free {tutor.trialDurationMins || 30}-min trial
            </p>
          )}
        </div>

        <Link to={`/tutors/${tutor._id}`}
          className="bg-green-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-green-800 transition shadow-sm whitespace-nowrap">
          Book free trial
        </Link>
      </div>
    </div>
  );
}

function MatchCard({ tutor }) {
  const name = tutor.displayName || tutor.user?.name || 'Tutor';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const rateStr = tutor.hourlyRateNaira
    ? `₦${tutor.hourlyRateNaira.toLocaleString()}/hr`
    : null;

  return (
    <Link to={`/tutors/${tutor._id}`}
      className="group bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-2xl p-4 flex gap-4 transition-all duration-200">
      <div className="relative shrink-0">
        {tutor.profilePhoto ? (
          <img src={tutor.profilePhoto} alt={name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white/20" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-green-600 border-2 border-green-500 flex items-center justify-center text-white font-bold text-lg">
            {initials}
          </div>
        )}
        <span className="absolute -top-1.5 -right-1.5 bg-green-400 text-green-900 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow">
          {tutor.percentage}%
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <p className="font-bold text-white text-sm leading-tight truncate">{name}</p>
          {tutor.isVerified && <CheckCircle size={12} className="text-green-400 shrink-0" />}
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {(tutor.matchReasons || []).slice(0, 3).map((reason, i) => (
            <span key={i} className="text-[10px] font-semibold bg-green-800/60 text-green-300 px-2 py-0.5 rounded-full">
              {reason}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-green-400">
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
      <p className="font-extrabold text-gray-900 text-sm mb-1">Find your ideal tutor in less than a minute</p>
      <p className="text-xs text-gray-400 mb-4">Get a personalised match instantly</p>
      <div className="space-y-3">
        <input type="text" value={q.subject} onChange={e => setQ(p => ({ ...p, subject: e.target.value }))}
          placeholder="What do you want to learn?"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500" />
        <select value={q.level} onChange={e => setQ(p => ({ ...p, level: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500">
          {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <select value={q.mode} onChange={e => setQ(p => ({ ...p, mode: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500">
          <option value="">Online or in-person?</option>
          <option value="online">Online</option>
          <option value="in-person">In-Person</option>
        </select>
        <button onClick={handleMatch}
          className="w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition text-sm">
          Get started →
        </button>
      </div>
    </div>
  );
}

export default function FindTutoring() {
  const location = useLocation();
  const searchRef = useRef(null);
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

  const fetchMatches = useCallback(async () => {
    if (!user || user.role !== 'student') return;
    try {
      const { data } = await api.get('/tutors/match');
      setMatches(data.matches || []);
    } catch {
      // silently ignore — matching is non-critical
    }
  }, [user]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const doFetch = async (page, f, s) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort: s };
      if (f.search)   params.search   = f.search;
      if (f.subject)  params.subject  = f.subject;
      if (f.level)    params.level    = f.level;
      if (f.mode)     params.mode     = f.mode;
      if (f.country)  params.country  = f.country;
      if (f.minRate)  params.minRate  = f.minRate;
      if (f.maxRate)  params.maxRate  = f.maxRate;
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
  }, [location.search]); // eslint-disable-line

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
    const q = searchRef.current?.value?.trim() || '';
    const next = { ...filters, search: q };
    setFilters(next);
    doFetch(1, next, sort);
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

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section
        className="relative px-4 py-14 sm:py-20 overflow-hidden"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark green gradient overlay — keeps text readable */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/92 via-green-800/88 to-emerald-900/90" />

        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-3xl sm:text-5xl md:text-[3.5rem] font-extrabold text-white tracking-tight leading-tight mb-4">
            Learn from the best.<br />
            <span className="text-green-300">Pass with confidence.</span>
          </h1>
          <p className="text-green-100 text-base sm:text-lg mb-8 max-w-2xl leading-relaxed">
            Book a verified tutor for <strong className="text-white">WAEC, JAMB, GCSE, A-Level, SAT, IELTS</strong> and more.
            1-on-1 sessions, online or in-person — wherever you are.
          </p>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { icon: Shield, label: 'Verified tutors' },
              { icon: Zap,    label: 'Free trial lesson' },
              { icon: Globe,  label: 'Online & In-Person' },
              { icon: Clock,  label: 'Flexible schedule' },
              { icon: Users,  label: 'All ages & levels' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-sm text-white/90 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full font-medium">
                <Icon size={12} className="text-green-300" /> {label}
              </span>
            ))}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-sm border border-white/20 p-2 rounded-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={16} />
                <input
                  ref={searchRef}
                  type="text"
                  defaultValue={filters.search}
                  placeholder="Search by subject, name, or keyword…"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition"
                />
              </div>
              <select value={filters.level} onChange={e => update('level', e.target.value)}
                className="sm:w-48 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:bg-white/20 transition appearance-none">
                {LEVELS.map(l => <option key={l.value} value={l.value} className="text-gray-900">{l.label}</option>)}
              </select>
              <select value={filters.mode} onChange={e => update('mode', e.target.value)}
                className="sm:w-40 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:bg-white/20 transition appearance-none">
                <option value="" className="text-gray-900">Any mode</option>
                <option value="online" className="text-gray-900">Online</option>
                <option value="in-person" className="text-gray-900">In-Person</option>
              </select>
              <button type="submit"
                className="bg-white text-green-800 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition text-sm whitespace-nowrap shadow-lg">
                Find Tutors →
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── MATCHED FOR YOU (logged-in students only) ─────────── */}
      {user?.role === 'student' && matches.length > 0 && (
        <section className="bg-green-900 py-10">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <span className="text-[11px] font-bold text-green-400 tracking-widest uppercase">Matched for you</span>
                <h2 className="text-xl font-extrabold text-white mt-1">Your perfect tutors</h2>
                <p className="text-green-400 text-xs mt-0.5">
                  Ranked by subject, level, schedule, language &amp; teaching style
                </p>
              </div>
              <Link to="/student-onboarding"
                className="shrink-0 text-xs text-green-400 hover:text-green-300 font-semibold border border-green-700 hover:border-green-500 px-3 py-1.5 rounded-lg transition">
                Refine preferences
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matches.slice(0, 4).map(tutor => (
                <MatchCard key={tutor._id} tutor={tutor} />
              ))}
            </div>

            {matches.length > 4 && (
              <p className="text-xs text-green-500 mt-4 text-center">
                {matches.length - 4} more matched tutor{matches.length - 4 > 1 ? 's' : ''} — scroll down to see all results
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-green-600 tracking-widest uppercase bg-green-50 px-3 py-1.5 rounded-full">How it works</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3">Get matched with a tutor in minutes</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">Four simple steps — and you'll be booked with the right tutor before the day is over.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                step: '01',
                icon: UserCheck,
                title: 'Sign Up',
                desc: 'Create your free account in under a minute — no credit card needed.',
                color: 'bg-green-100 text-green-700',
                ring: 'ring-green-200',
              },
              {
                step: '02',
                icon: BookOpen,
                title: 'Tell Us Your Needs',
                desc: 'Choose your subjects, learning goal, class level and preferred schedule.',
                color: 'bg-blue-100 text-blue-700',
                ring: 'ring-blue-200',
              },
              {
                step: '03',
                icon: Zap,
                title: 'Get Matched',
                desc: 'Our system instantly finds verified tutors who fit your exact needs.',
                color: 'bg-purple-100 text-purple-700',
                ring: 'ring-purple-200',
              },
              {
                step: '04',
                icon: GraduationCap,
                title: 'Start Learning',
                desc: 'Book your first session and begin preparing with confidence.',
                color: 'bg-yellow-100 text-yellow-700',
                ring: 'ring-yellow-200',
              },
            ].map(({ step, icon: Icon, title, desc, color, ring }, i) => (
              <div key={step} className="flex flex-col items-center text-center gap-3 relative">
                {i < 3 && (
                  <div className="hidden sm:block absolute top-6 left-[calc(50%+28px)] w-[calc(100%-56px)] h-0.5 border-t-2 border-dashed border-gray-200" />
                )}
                <div className={`w-12 h-12 rounded-2xl ${color} ring-4 ${ring} flex items-center justify-center relative z-10`}>
                  <Icon size={22} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Step {step}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/register"
              className="inline-flex items-center gap-2 bg-green-700 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-green-800 transition text-sm shadow-lg shadow-green-200">
              Get matched now <ArrowRight size={16} />
            </Link>
            <p className="text-xs text-gray-400 mt-3">Free to join · No commitment · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ── SUBJECT CHIPS ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 overflow-x-auto">
        <div className="max-w-5xl mx-auto flex items-center gap-2 w-max sm:w-auto sm:flex-wrap">
          <span className="text-xs font-bold text-gray-400 whitespace-nowrap shrink-0">Browse:</span>
          {POPULAR_SUBJECTS.map(s => (
            <button key={s} onClick={() => update('subject', filters.subject === s ? '' : s)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                filters.subject === s
                  ? 'bg-green-700 border-green-700 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 bg-white'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6 items-start">

        {/* ── LEFT: Tutor list ──────────────────────────────────── */}
        <div className="flex-1 min-w-0" id="tutor-list">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <p className="text-sm text-gray-600 font-semibold">
              {loading ? 'Searching…' : (
                <><strong className="text-gray-900">{total}</strong> tutor{total !== 1 ? 's' : ''} found{filters.subject ? ` for ${filters.subject}` : ''}{filters.country ? ` in ${filters.country}` : ''}</>
              )}
            </p>

            <div className="flex items-center gap-2">
              <select value={sort} onChange={e => handleSort(e.target.value)}
                className="text-xs border border-gray-200 bg-white rounded-xl px-3 py-2 focus:outline-none focus:border-green-500 transition">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <button onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 bg-white rounded-xl px-3 py-2 hover:border-green-500 hover:text-green-700 transition">
                <SlidersHorizontal size={13} />
                Filters
                {activeCount > 0 && (
                  <span className="bg-green-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{activeCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Extended filter panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5 overflow-hidden">
              {activeCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap px-5 py-3 bg-green-50 border-b border-green-100">
                  <span className="text-xs text-green-700 font-bold shrink-0">Active:</span>
                  {filters.subject && (
                    <button onClick={() => update('subject', '')}
                      className="flex items-center gap-1 bg-white border border-green-200 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      {filters.subject} <X size={9} />
                    </button>
                  )}
                  {filters.level && (
                    <button onClick={() => update('level', '')}
                      className="flex items-center gap-1 bg-white border border-green-200 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      {LEVELS.find(l => l.value === filters.level)?.label} <X size={9} />
                    </button>
                  )}
                  {filters.country && (
                    <button onClick={() => update('country', '')}
                      className="flex items-center gap-1 bg-white border border-green-200 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      {filters.country} <X size={9} />
                    </button>
                  )}
                  {(filters.minRate || filters.maxRate) && (
                    <button onClick={() => setPriceRange('', '')}
                      className="flex items-center gap-1 bg-white border border-green-200 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      Price filter <X size={9} />
                    </button>
                  )}
                  <button onClick={clearAll} className="ml-auto text-xs text-red-500 font-semibold hover:text-red-700 transition shrink-0">Clear all</button>
                </div>
              )}

              <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Country */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Country / Location</p>
                  <select value={filters.country} onChange={e => update('country', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white">
                    <option value="">All Countries</option>
                    {WORLD_COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Rate Range</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRICE_RANGES.map(({ label, min, max }) => {
                      const active = filters.minRate === min && filters.maxRate === max;
                      return (
                        <button key={label} type="button" onClick={() => setPriceRange(min, max)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            active ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300 bg-white'
                          }`}>{label}</button>
                      );
                    })}
                  </div>
                </div>

                {/* Mode */}
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Teaching Mode</p>
                  <div className="flex gap-2">
                    {[
                      { label: 'Online', val: 'online' },
                      { label: 'In-Person', val: 'in-person' },
                    ].map(({ label, val }) => (
                      <button key={val} type="button"
                        onClick={() => update('mode', filters.mode === val ? '' : val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          filters.mode === val ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300 bg-white'
                        }`}>{label}</button>
                    ))}
                  </div>
                </div>
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
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <GraduationCap size={36} className="text-gray-200 mx-auto mb-3" />
              <h3 className="font-bold text-gray-700 text-base mb-2">No tutors found</h3>
              <p className="text-gray-400 text-sm mb-5 max-w-sm mx-auto">
                {activeCount > 0
                  ? 'Try removing some filters — tutors join daily!'
                  : "We're onboarding tutors right now. Be the first to register!"}
              </p>
              <div className="flex gap-3 justify-center">
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

          {/* Pagination */}
          {pages > 1 && !loading && (
            <div className="flex items-center justify-center gap-1.5 mt-8">
              <button disabled={currentPage === 1}
                onClick={() => doFetch(currentPage - 1, filters, sort)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-600">
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => doFetch(p, filters, sort)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${
                    p === currentPage ? 'bg-green-700 text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}>
                  {p}
                </button>
              ))}
              <button disabled={currentPage === pages}
                onClick={() => doFetch(currentPage + 1, filters, sort)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-600">
                <ChevronRight size={15} />
              </button>
            </div>
          )}

          {/* Browse footer */}
          {!loading && (
            <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Browse tutors by subject</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mb-6">
                {['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
                  'Economics', 'JAMB Prep', 'WAEC Prep', 'IELTS', 'Computer Science',
                  'Further Maths', 'SAT Prep'].map(s => (
                  <button key={s} onClick={() => update('subject', s)}
                    className="text-left text-sm text-green-700 hover:underline hover:text-green-800 transition">
                    {s} tutors
                  </button>
                ))}
              </div>
              <h3 className="font-bold text-gray-900 mb-4">Browse by level</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                {LEVELS.filter(l => l.value).map(l => (
                  <button key={l.value} onClick={() => update('level', l.value)}
                    className="text-left text-sm text-green-700 hover:underline hover:text-green-800 transition">
                    {l.label} tutors
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ─────────────────────────────────────── */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-24 space-y-4">
          <SmartMatchWidget onMatch={handleMatch} />

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <p className="font-bold text-gray-900 text-sm">Why Naija & Overseas?</p>
            {[
              { icon: Globe,       text: 'Tutors from 30+ countries', color: 'text-blue-600' },
              { icon: GraduationCap, text: 'WAEC, JAMB & global exams', color: 'text-green-600' },
              { icon: Banknote,    text: 'Pay in your local currency', color: 'text-blue-600' },
              { icon: MapPin,      text: 'Online & in-person options', color: 'text-purple-600' },
              { icon: Shield,      text: '100% verified tutors', color: 'text-orange-500' },
              { icon: UserCheck,   text: 'Free first trial lesson', color: 'text-green-600' },
              { icon: Users,       text: 'Group sessions available', color: 'text-blue-600' },
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

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-16 px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">The Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">
              How 1:1 tutoring works
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              From your first search to exam-ready confidence — here's exactly what happens.
            </p>
          </div>

          {/* Steps */}
          <div className="relative">

            {/* Vertical connector — mobile */}
            <div className="md:hidden absolute left-[26px] top-8 bottom-8 w-0.5 bg-gradient-to-b from-green-300 via-green-500 to-green-300" />

            {/* Horizontal connector — desktop */}
            <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-green-200 via-green-500 to-green-200" style={{ zIndex: 0 }} />

            <div className="grid md:grid-cols-5 gap-0 md:gap-4 relative" style={{ zIndex: 1 }}>
              {[
                {
                  n: '01',
                  icon: Search,
                  color: 'bg-green-700',
                  ring: 'ring-green-200',
                  title: 'Search & Match',
                  tagline: 'Find your perfect tutor',
                  bullets: ['Filter by subject, exam & level', 'Country, mode & budget', 'See ratings & reviews'],
                },
                {
                  n: '02',
                  icon: UserCheck,
                  color: 'bg-green-700',
                  ring: 'ring-green-200',
                  title: 'Book a Free Trial',
                  tagline: 'Zero risk, no payment',
                  bullets: ['Pick your date & time online', 'No credit card needed', 'Tutor confirms fast'],
                },
                {
                  n: '03',
                  icon: Video,
                  color: 'bg-green-700',
                  ring: 'ring-green-200',
                  title: 'Meet Your Tutor',
                  tagline: 'Feel the teaching style',
                  bullets: ['Live session via Zoom / Meet', 'Interactive whiteboard', '30-min to assess the fit'],
                },
                {
                  n: '04',
                  icon: Zap,
                  color: 'bg-green-700',
                  ring: 'ring-green-200',
                  title: 'Subscribe & Schedule',
                  tagline: 'Lock in your weekly plan',
                  bullets: ['Choose sessions per week (1–5×)', 'Pick your preferred time slots', 'Pay monthly in Naira via Paystack'],
                },
                {
                  n: '05',
                  icon: TrendingUp,
                  color: 'bg-yellow-400',
                  ring: 'ring-yellow-200',
                  title: 'Learn & Excel',
                  tagline: 'Results you can see',
                  bullets: ['Auto-booked monthly sessions', '24h email reminders', 'WAEC / JAMB / IELTS ready'],
                },
              ].map(({ n, icon: Icon, color, ring, title, tagline, bullets }, i) => (
                <div key={n} className="flex md:flex-col items-start md:items-center gap-4 md:gap-0 md:text-center group pl-14 md:pl-0 pb-8 md:pb-0 last:pb-0 relative">

                  {/* Step bubble */}
                  <div className={`absolute left-0 md:static md:mb-5 w-[52px] h-[52px] rounded-2xl ${color} flex items-center justify-center shadow-lg shrink-0 ring-4 ${ring} ring-offset-2 transition group-hover:scale-110`}>
                    {n === '05'
                      ? <Icon size={22} className="text-green-900" />
                      : <Icon size={22} className="text-white" />}
                    <span className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center shadow ${n === '05' ? 'bg-green-700 text-white' : 'bg-white text-green-800'}`}>
                      {n}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 md:flex-none md:w-full">
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${n === '05' ? 'text-yellow-500' : 'text-green-600'}`}>{tagline}</p>
                    <h3 className="font-extrabold text-gray-900 text-sm mb-2">{title}</h3>
                    <ul className="space-y-1 md:items-center">
                      {bullets.map(b => (
                        <li key={b} className="flex items-start md:justify-center gap-1.5 text-xs text-gray-500">
                          <CheckCircle size={11} className="text-green-500 shrink-0 mt-0.5" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-14 bg-gradient-to-r from-green-800 to-green-700 rounded-3xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <p className="text-white font-extrabold text-lg leading-tight mb-1">Ready to get started?</p>
              <p className="text-green-200 text-sm">Your first trial session is completely free. No card, no commitment.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link to="/find-tutoring"
                className="inline-flex items-center gap-2 bg-yellow-400 text-green-900 font-bold px-5 py-3 rounded-xl text-sm hover:bg-yellow-300 transition shadow">
                <Search size={14} /> Browse Tutors
              </Link>
              <Link to="/become-a-tutor"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-5 py-3 rounded-xl text-sm hover:bg-white/20 transition border border-white/20">
                Become a Tutor
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100 py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Frequently asked questions</h2>
          <div className="space-y-0 bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {[
              { q: 'How can I book a trial lesson?', a: 'Click "Book free trial" on any tutor card. Fill in your name, email, preferred date and time, and submit. The tutor will confirm within their response time. No payment is required for the trial.' },
              { q: 'Which currencies are supported?', a: 'Tutors set their own rates in their local currency — Nigerian Naira (₦), US Dollar ($), British Pound (£), Euro (€), Ghanaian Cedis, Kenyan Shillings, and more. You see the tutor\'s rate in their currency.' },
              { q: 'Can I find tutors outside Nigeria?', a: 'Yes! Our platform is worldwide. You can find tutors from the UK, US, Canada, Ghana, Kenya, India, and many more countries. Use the Country filter to narrow your search.' },
              { q: 'Who are the tutors on this platform?', a: 'All tutors are manually reviewed before going live. We verify qualifications, teaching experience, and subject expertise. Look for the green verified badge on profiles.' },
              { q: 'Can I get a tutor for WAEC and JAMB preparation?', a: 'Yes! We have dedicated WAEC Prep and JAMB Prep tutors. Filter by subject (e.g. "WAEC Prep" or "JAMB Prep") to find specialists for Nigerian exams.' },
              { q: 'How does online tutoring work?', a: 'Online sessions are conducted via Zoom, Google Meet, or WhatsApp Video — agreed between you and your tutor. In-person tutors visit your home or meet at an agreed location.' },
            ].map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 hover:bg-gray-50 transition">
        <span className="font-semibold text-gray-900 text-sm">{q}</span>
        <span className={`shrink-0 w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center transition ${open ? 'rotate-45' : ''}`}>
          <span className="text-gray-400 text-xs font-black leading-none">+</span>
        </span>
      </button>
      {open && <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{a}</div>}
    </div>
  );
}
