import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, SlidersHorizontal, CheckCircle, ArrowRight,
  Star, ChevronDown, ChevronUp, BookOpen, Globe,
  Users, BarChart3, Shield, Zap, Award, X
} from 'lucide-react';
import api from '../utils/api';
import SchoolCard from '../components/SchoolCard';
import toast from 'react-hot-toast';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara',
];

const STATS = [
  { value: '500+', label: 'Schools Listed' },
  { value: '10,000+', label: 'Students Helped' },
  { value: '4', label: 'Countries' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search & Filter',
    desc: 'Enter your state, budget, curriculum preference or school type. Our smart filters narrow down the best matches instantly.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Compare Side by Side',
    desc: 'Select up to 3 schools and view a detailed side-by-side comparison — fees, facilities, curriculum, contact info and more.',
    icon: BarChart3,
  },
  {
    step: '03',
    title: 'Make Your Decision',
    desc: 'Book a consultation, contact the school directly, or apply for study abroad placement — all in one place.',
    icon: CheckCircle,
  },
];

const FEATURES = [
  { icon: BarChart3, title: 'Smart Comparison Tool', desc: 'Compare multiple schools across 10+ criteria. No guesswork — just clear, structured data to help you decide.' },
  { icon: Globe, title: 'Study Abroad Placement', desc: 'Expert guidance for Nigerian students seeking admission in universities across UK, Canada, USA, Australia and Europe.' },
  { icon: Shield, title: 'Verified School Listings', desc: 'Every school on our platform is reviewed and verified by our team before it goes live. No fake or outdated listings.' },
  { icon: Zap, title: 'Instant Results', desc: 'Real-time search with live filters. Find schools matching your criteria in seconds — not hours of browsing.' },
  { icon: Users, title: 'Multi-Country Coverage', desc: 'Serving students and families across Nigeria, Ghana, The Gambia and Cameroon with locally relevant information.' },
  { icon: Award, title: 'Admission Support', desc: 'From school selection to international visa guidance — our counsellors are with you at every step of the journey.' },
];

const TESTIMONIALS = [
  {
    name: 'Mrs. Aisha Bello',
    role: 'Parent, Abuja',
    text: 'I spent weeks trying to find the right secondary school for my son. With Naija & Overseas, I compared 5 schools in 10 minutes and made a confident decision. Absolutely brilliant!',
    rating: 5,
    initials: 'AB',
    color: 'bg-green-600',
  },
  {
    name: 'Chukwuemeka Obi',
    role: 'Student, Lagos',
    text: 'Their study abroad team helped me secure admission to a university in Canada in just 3 months. They handled everything — application, visa, pre-departure briefing. I highly recommend them.',
    rating: 5,
    initials: 'CO',
    color: 'bg-blue-600',
  },
  {
    name: 'Principal Fatima Danjuma',
    role: 'School Owner, Kano',
    text: 'Listing our school on Naija & Overseas tripled our enquiries within the first month. The platform is professional and the admin tools are very easy to use. Worth every kobo.',
    rating: 5,
    initials: 'FD',
    color: 'bg-yellow-600',
  },
  {
    name: 'Mr. Kofi Mensah',
    role: 'Parent, Accra Ghana',
    text: 'As a Ghanaian parent, I was surprised to find so many schools listed for Ghana. The comparison tool saved me a lot of time and helped my daughter find a school she loves.',
    rating: 5,
    initials: 'KM',
    color: 'bg-purple-600',
  },
];

const FAQS = [
  {
    q: 'Is it free to search and compare schools?',
    a: 'Yes, completely free. Parents and students can search, filter and compare any school on the platform at no cost. You only pay if you want expert study abroad consultation services.',
  },
  {
    q: 'How do I list my school on the platform?',
    a: 'Click "List Your School" in the menu. Fill in your school details through our 3-step form, pay the one-time listing fee of ₦15,000, and your listing will be reviewed and published within 24–48 hours.',
  },
  {
    q: 'Which countries do you cover for study abroad placements?',
    a: 'We support placements in the United Kingdom, Canada, United States, Australia, Germany, Netherlands, Ireland, and New Zealand. Our counsellors have direct relationships with universities in all these destinations.',
  },
  {
    q: 'How accurate and up-to-date is the school information?',
    a: 'All school profiles are submitted and maintained by the schools themselves. Our team verifies each listing before approval. Schools are required to keep their information current, and we run periodic audits.',
  },
  {
    q: 'Can I book an appointment with a study abroad counsellor?',
    a: 'Absolutely. Go to the Study Abroad page and click "Start Your Application". You can also book a free 30-minute consultation call through the booking form. We\'ll match you with the right counsellor for your destination.',
  },
  {
    q: 'Which countries are you currently serving?',
    a: 'We currently serve Nigeria, Ghana, The Gambia, and Cameroon. We are actively expanding to more West African countries. Sign up to be notified when we launch in your country.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-semibold text-gray-900 text-[15px]">{q}</span>
        {open ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="pb-5 text-gray-500 text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

const EMPTY_FILTERS = { search: '', state: '', type: '', level: '', curriculum: '', minFee: '', maxFee: '' };

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [schools, setSchools] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Hero live-search dropdown
  const [heroQuery, setHeroQuery] = useState('');
  const [dropdownResults, setDropdownResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const q = heroQuery.trim();
    const timer = setTimeout(async () => {
      if (!q) { setDropdownResults([]); setShowDropdown(false); return; }
      setDropdownLoading(true);
      try {
        const { data } = await api.get('/schools', { params: { search: q, limit: 6 } });
        setDropdownResults(data.schools || []);
        setShowDropdown(true);
      } catch { /* silent */ } finally {
        setDropdownLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [heroQuery]);

  useEffect(() => {
    const handler = (e) => { if (heroRef.current && !heroRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doFetch = async (page, f) => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (f.search) params.search = f.search;
      if (f.state) params.state = f.state;
      if (f.type) params.type = f.type;
      if (f.level) params.level = f.level;
      if (f.curriculum) params.curriculum = f.curriculum;
      if (f.minFee) params.minFee = f.minFee;
      if (f.maxFee) params.maxFee = f.maxFee;
      const { data } = await api.get('/schools', { params });
      setSchools(data.schools);
      setTotal(data.total);
      setPages(data.pages);
      setCurrentPage(page);
    } catch {
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = (page = 1) => doFetch(page, filters);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const urlFilters = {
      search:     sp.get('search')     || '',
      state:      sp.get('state')      || '',
      type:       sp.get('type')       || '',
      level:      sp.get('level')      || '',
      curriculum: sp.get('curriculum') || '',
      minFee:     sp.get('minFee')     || '',
      maxFee:     sp.get('maxFee')     || '',
    };
    const hasFilters = Object.values(urlFilters).some(v => v);
    if (hasFilters) {
      setFilters(urlFilters);
      setShowFilters(true);
      doFetch(1, urlFilters);
    } else {
      doFetch(1, EMPTY_FILTERS);
    }
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompare = (school) => {
    if (selected.find((s) => s._id === school._id)) {
      setSelected(selected.filter((s) => s._id !== school._id));
    } else if (selected.length >= 3) {
      toast.error('You can compare up to 3 schools at a time');
    } else {
      setSelected([...selected, school]);
    }
  };

  const goCompare = () => {
    if (selected.length < 2) { toast.error('Select at least 2 schools to compare'); return; }
    navigate('/compare', { state: { schools: selected } });
  };

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-10 pb-32 px-4 overflow-hidden min-h-170 flex items-center">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80')" }}
        />
        {/* Layered gradient overlay for depth */}
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/30" />

        <div className="relative w-full max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {/* Badge 
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Trusted by 10,000+ families across West Africa
            </div>
            */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.06] mb-6 drop-shadow-lg">
              Find the perfect<br />
              school for your child.<br />
              <span className="text-green-400">Compare &amp; decide.</span>
            </h1>

            <p className="text-white/75 text-lg md:text-sl max-w-xxl mb-5 leading-relaxed">
              Nigeria's smartest school discovery platform — search, filter and compare hundreds of verified schools, then get expert study abroad guidance.
            </p>
          </div>

          {/* Hero live-search */}
          <div ref={heroRef} className="relative max-w-2xl mb-8">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  onFocus={() => dropdownResults.length > 0 && setShowDropdown(true)}
                  placeholder="Search by school name or location..."
                  className="w-full pl-11 pr-10 py-4 rounded-xl text-gray-400 text-sm border focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg"
                />
                {heroQuery && (
                  <button onClick={() => { setHeroQuery(''); setDropdownResults([]); setShowDropdown(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                )}
              </div>
              <button
                onClick={() => { const f = { ...filters, search: heroQuery }; setFilters(f); doFetch(1, f); setShowDropdown(false); }}
                className="bg-green-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-green-700 transition shadow-lg whitespace-nowrap">
                Search →
              </button>
            </div>

            {/* Dropdown results */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                {dropdownLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">Searching...</div>
                ) : dropdownResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">No schools found for "{heroQuery}"</div>
                ) : (
                  <ul>
                    {dropdownResults.map((s) => (
                      <li key={s._id}>
                        <Link
                          to={`/schools/${s.slug || s._id}`}
                          onClick={() => { setShowDropdown(false); setHeroQuery(''); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition border-b border-gray-50 last:border-0">
                          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {s.images?.[0]
                              ? <img src={s.images[0]} alt="" className="w-full h-full object-cover" />
                              : <BookOpen size={16} className="text-green-600" />}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-semibold text-gray-900 text-sm truncate">{s.name}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {[s.city, s.state].filter(Boolean).join(', ')} · <span className="capitalize">{s.type}</span>
                            </p>
                          </div>
                          {s.fees?.tuition && (
                            <span className="text-xs font-semibold text-green-700 shrink-0">
                              ₦{Number(s.fees.tuition).toLocaleString()}/yr
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={() => { const f = { ...filters, search: heroQuery }; setFilters(f); doFetch(1, f); setShowDropdown(false); }}
                        className="w-full text-center text-xs text-green-700 font-semibold py-3 hover:bg-green-50 transition">
                        View all results for "{heroQuery}" →
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Quick filters + secondary CTA */}
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <span className="text-white/50 text-xs">Popular:</span>
            {['Lagos Schools', 'Private Schools', 'IGCSE', 'Boarding Schools'].map((tag) => (
              <button key={tag}
                onClick={() => { const f = { ...filters, search: tag }; setHeroQuery(tag); setFilters(f); doFetch(1, f); }}
                className="px-3.5 py-1.5 rounded-full border border-white/25 text-white/75 hover:border-white hover:text-white hover:bg-white/10 transition backdrop-blur-sm text-xs">
                {tag}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <Link to="/study-abroad"
              className="inline-flex items-center gap-2 text-white/70 text-sm hover:text-white transition underline underline-offset-4 decoration-white/30">
              <ArrowRight size={14} /> Want to study abroad? Talk to our counsellors →
            </Link>
          </div>
        </div>

        {/* Floating stat chips — bottom right of hero */}
        <div className="absolute bottom-8 right-8 hidden lg:flex flex-row gap-3">
          {[
            { n: '500+', l: 'Schools Listed' },
            { n: '10k+', l: 'Families Served' },
            { n: '98%', l: 'Satisfaction' },
          ].map(({ n, l }) => (
            <div key={l} className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5">
              <span className="text-lg font-extrabold text-white">{n}</span>
              <span className="text-white/60 text-xs">{l}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-extrabold text-gray-900 mb-0.5">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-10 md:py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Find your ideal school in 3 steps
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">No more guessing. Our structured comparison process gives you the full picture before you make any decision.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-linear-to-r from-green-200 via-green-400 to-green-200" />

            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative text-center">
                <div className="relative inline-flex w-20 h-20 items-center justify-center rounded-2xl bg-green-700 text-white mb-5 mx-auto shadow-lg">
                  <Icon size={28} />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-400 text-green-900 text-[11px] font-black flex items-center justify-center shadow">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCHOOL SEARCH SECTION ─────────────────────────────────── */}
      <section className="bg-gray-50 py-8 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Browse Schools</h2>
              <p className="text-gray-500 text-sm mt-1">{total > 0 ? `${total} schools available` : 'Loading schools...'}</p>
            </div>

            {/* Filter toggle */}
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:border-green-400 hover:text-green-700 transition shadow-sm">
              <SlidersHorizontal size={15} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select value={filters.state} onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">All States</option>
                  {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">All Types</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="federal">Federal</option>
                </select>
                <select value={filters.level} onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">All Levels</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="both">Both</option>
                </select>
                <select value={filters.curriculum} onChange={(e) => setFilters({ ...filters, curriculum: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">All Curricula</option>
                  {['WAEC', 'NECO', 'IGCSE', 'IB', 'Cambridge', 'BECE'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={() => { setFilters(EMPTY_FILTERS); doFetch(1, EMPTY_FILTERS); }}
                  className="text-sm text-gray-500 hover:text-red-600 transition px-1">Clear all</button>
                <button onClick={() => fetchSchools(1)}
                  className="ml-auto text-sm bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 transition font-medium">
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* School Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium text-gray-600">No schools found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {schools.map((school) => (
                <SchoolCard key={school._id} school={school} onCompare={handleCompare}
                  isSelected={!!selected.find((s) => s._id === school._id)} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => fetchSchools(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                    p === currentPage ? 'bg-green-700 text-white' : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── COMPARE STICKY BAR ────────────────────────────────────── */}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white z-50 py-3.5 px-4 flex items-center justify-between shadow-2xl border-t border-gray-700">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold">{selected.length} selected</span>
            {selected.map((s) => (
              <span key={s._id} className="text-xs bg-gray-700 px-2.5 py-1 rounded-full">{s.name}</span>
            ))}
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setSelected([])} className="text-xs border border-gray-600 px-3.5 py-1.5 rounded-lg hover:bg-gray-700 transition">Clear</button>
            <button onClick={goCompare} className="text-xs bg-green-600 font-semibold px-5 py-1.5 rounded-lg hover:bg-green-500 transition">
              Compare Now →
            </button>
          </div>
        </div>
      )}

      {/* ── FEATURES GRID ─────────────────────────────────────────── */}
      <section className="py-10 md:py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-3">Why Naija & Overseas</p>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Everything you need to make the right choice
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Built specifically for West African families — combining local school knowledge with international university expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition bg-white">
                <div className="w-11 h-11 bg-green-50 group-hover:bg-green-100 rounded-xl flex items-center justify-center mb-4 transition">
                  <Icon size={20} className="text-green-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STUDY ABROAD BANNER ───────────────────────────────────── */}
      <section className="py-10 md:py-20 px-4 bg-green-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_50%,white,transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe size={22} className="text-yellow-300" />
              <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wider">Study Abroad</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold tracking-tight mb-4 max-w-xl">
              Dream of studying in the UK, Canada or USA? We'll get you there.
            </h2>
            <p className="text-green-100 max-w-lg leading-relaxed">
              Our international admissions team has helped over 2,000 Nigerian students gain university admission abroad — with full visa support and pre-departure briefing.
            </p>
            <ul className="mt-5 space-y-2">
              {['Free initial consultation', 'University shortlisting & application', 'Student visa guidance', 'Scholarship identification'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-green-100">
                  <CheckCircle size={15} className="text-yellow-300 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="shrink-0">
            <Link to="/study-abroad"
              className="inline-block bg-yellow-400 text-green-900 font-bold px-8 py-4 rounded-xl text-base hover:bg-yellow-300 transition shadow-lg">
              Start Your Application →
            </Link>
            <p className="text-green-200 text-xs mt-3 text-center">Free. No commitment required.</p>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="py-10 md:py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Trusted by families across West Africa
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Real stories from parents, students and school owners who used Naija & Overseas.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map(({ name, role, text, rating, initials, color }) => (
              <div key={name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                  <div className={`w-9 h-9 rounded-full ${color} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR SCHOOL OWNERS ─────────────────────────────────────── */}
      <section className="py-10 md:py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-3xl p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-white">
              <div className="inline-block bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-wider">
                For School Owners
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">
                Reach thousands of parents actively searching for schools right now.
              </h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                List your school on Nigeria's fastest-growing education platform. Get verified, get discovered, and fill your admission slots faster than ever before.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  ['3x', 'More enquiries on average'],
                  ['24h', 'Approval turnaround'],
                  ['₦15k', 'One-time listing fee'],
                  ['10k+', 'Monthly active parents'],
                ].map(([n, l]) => (
                  <div key={l}>
                    <div className="text-2xl font-extrabold text-yellow-400">{n}</div>
                    <div className="text-gray-400 text-xs">{l}</div>
                  </div>
                ))}
              </div>
              <Link to="/list-your-school"
                className="inline-block bg-white text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition">
                List Your School →
              </Link>
            </div>
            <div className="shrink-0 w-full md:w-72 bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h4 className="font-bold text-white mb-4 text-sm">What you get</h4>
              {[
                'Full school profile page',
                'Search & comparison visibility',
                'Direct enquiry routing',
                'Admin management tools',
                'Monthly performance report',
                'Featured listing option',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 py-2.5 border-b border-gray-700 last:border-0">
                  <CheckCircle size={14} className="text-green-400 shrink-0" />
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-10 md:py-20 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-3">FAQ</p>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Frequently asked questions
            </h2>
            <p className="text-gray-500">Can't find your answer? <Link to="/contact" className="text-green-700 hover:underline font-medium">Contact us</Link> and we'll help.</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 px-6 shadow-sm">
            {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="py-10 md:py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Start your school search today — it's free.
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Join over 10,000 families who found their ideal school or university placement through Naija & Overseas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register"
              className="bg-green-700 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-800 transition text-base shadow-sm">
              Create Free Account →
            </Link>
            <Link to="/study-abroad"
              className="border border-gray-200 text-gray-700 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition text-base">
              Explore Study Abroad
            </Link>
          </div>
          <p className="text-gray-400 text-sm mt-4">No credit card required. Free forever for students and parents.</p>
        </div>
      </section>

    </div>
  );
}
