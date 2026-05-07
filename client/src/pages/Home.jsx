import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, SlidersHorizontal, CheckCircle, ArrowRight,
  Star, ChevronDown, ChevronUp, BookOpen, Globe,
  Users, BarChart3, Shield, Zap, Award, X,
  ChevronLeft, ChevronRight
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

const HERO_SLIDES = [
  {
    step: '01',
    label: 'Quality Driven',
    cardDesc: 'Naija & Overseas was founded with the promise of connecting families to the most verified, high-quality schools across Nigeria and West Africa — with smart tools to compare and decide with confidence.',
    cardBg: 'bg-white',
    cardText: 'text-gray-900',
    cardDesc2: 'text-gray-500',
    cardBadge: 'bg-red-600 text-white',
    headline: 'Find the perfect school\nfor your child.',
    highlight: 'Compare & decide.',
    subtitle: "Nigeria's smartest school discovery platform — search, filter and compare hundreds of verified schools across Nigeria and West Africa.",
    bg: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80',
    personImg: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=800&q=80',
    accent: 'from-gray-900/85 via-gray-800/60',
    bottomFade: 'from-gray-50/80',
    accentRight: 'to-black/25',
    stats: ['500+ Schools', '4 Countries', 'Free to Use'],
    cta: { label: 'Browse Schools', href: '#browse' },
    cta2: { label: 'Compare Schools', href: '/compare' },
    card: {
      title: 'Popular Searches',
      items: [
        { label: 'Best Schools in Lagos',         tag: '🏙️' },
        { label: 'Top Private Schools',            tag: '🏫' },
        { label: 'IGCSE Schools Nigeria',          tag: '📚' },
        { label: 'Federal Government Colleges',    tag: '🏛️' },
        { label: 'Boarding Schools Nigeria',       tag: '🛏️' },
      ],
    },
  },
  {
    step: '02',
    label: 'Students Focused',
    cardDesc: 'We guide school owners and parents through the listing, discovery, and enrolment process — putting students at the centre of every decision we make on this platform.',
    cardBg: 'bg-blue-800',
    cardText: 'text-white',
    cardDesc2: 'text-blue-200',
    cardBadge: 'bg-red-600 text-white',
    headline: 'Get your school in front\nof thousands of parents.',
    highlight: 'Grow your enrolment.',
    subtitle: "List your school on Nigeria's fastest-growing education platform. Reach parents actively searching for schools in your area — starting from ₦15,000.",
    bg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80',
    personImg: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    accent: 'from-blue-950/90 via-blue-900/65',
    bottomFade: 'from-blue-800/85',
    accentRight: 'to-black/30',
    stats: ['500+ Schools Listed', '₦15,000 One-Time', 'Live in 48 hrs'],
    cta: { label: 'List Your School', href: '/list-your-school' },
    cta2: { label: 'See How It Works', href: '#how' },
    card: {
      title: 'What You Get',
      items: [
        { label: 'Verified school profile page',  tag: '✅' },
        { label: 'Appear in parent searches',      tag: '🔍' },
        { label: 'JAMB & WAEC result showcase',    tag: '🏆' },
        { label: 'Photo gallery & achievements',   tag: '🖼️' },
        { label: 'Direct parent enquiries',        tag: '📞' },
      ],
    },
  },
  {
    step: '03',
    label: 'Global Sourcing',
    cardDesc: 'We are the pioneers in overseas education consultancy for West Africa, placing students in leading universities across the UK, Canada, USA, Australia, Germany, and more.',
    cardBg: 'bg-red-600',
    cardText: 'text-white',
    cardDesc2: 'text-red-100',
    cardBadge: 'bg-white text-red-600',
    headline: 'Get into a top university\nabroad.',
    highlight: 'Your future starts here.',
    subtitle: "Expert guidance for Nigerian students seeking admission in the UK, Canada, USA, Australia, Germany and more. 95% visa success rate — end-to-end support.",
    bg: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
    personImg: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    accent: 'from-red-950/90 via-red-900/65',
    bottomFade: 'from-red-600/85',
    accentRight: 'to-black/30',
    stats: ['2,000+ Students Placed', '95% Visa Success', '8 Countries'],
    cta: { label: 'Start Your Application', href: '/study-abroad' },
    cta2: { label: 'View Destinations', href: '/study-abroad#destinations' },
    card: {
      title: 'Top Destinations',
      items: [
        { label: 'United Kingdom',   tag: '🇬🇧' },
        { label: 'Canada',           tag: '🇨🇦' },
        { label: 'United States',    tag: '🇺🇸' },
        { label: 'Germany',          tag: '🇩🇪' },
        { label: 'Australia',        tag: '🇦🇺' },
      ],
    },
  },
];

const EMPTY_FILTERS = { search: '', state: '', type: '', level: '', curriculum: '', minFee: '', maxFee: '' };

const BUDGET_OPTIONS = [
  { label: 'Below ₦100k',     min: '',        max: '100000'  },
  { label: '₦100k – ₦300k',   min: '100000',  max: '300000'  },
  { label: '₦300k – ₦500k',   min: '300000',  max: '500000'  },
  { label: '₦500k – ₦1M',     min: '500000',  max: '1000000' },
  { label: 'Above ₦1M',       min: '1000000', max: ''        },
];

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

  // Hero slider
  const [slide, setSlide] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const SLIDE_DURATION = 6000;
  const TOTAL_TICKS = SLIDE_DURATION / 50;

  const goToSlide = (i) => { setSlide(i); setHeroProgress(0); };
  const heroPrev = () => goToSlide((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const heroNext = () => goToSlide((slide + 1) % HERO_SLIDES.length);

  useEffect(() => {
    if (heroPaused) return;
    const t = setTimeout(() => {
      setSlide((s) => (s + 1) % HERO_SLIDES.length);
      setHeroProgress(0);
    }, SLIDE_DURATION);
    return () => clearTimeout(t);
  }, [heroPaused, slide]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (heroPaused) return;
    const t = setInterval(() => setHeroProgress((p) => Math.min(p + 100 / TOTAL_TICKS, 100)), 50);
    return () => clearInterval(t);
  }, [slide, heroPaused]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    doFetch(1, next);
  };

  const setBudget = (min, max) => {
    const already = filters.minFee === min && filters.maxFee === max;
    const next = { ...filters, minFee: already ? '' : min, maxFee: already ? '' : max };
    setFilters(next);
    doFetch(1, next);
  };

  const clearFilters = () => { setFilters(EMPTY_FILTERS); doFetch(1, EMPTY_FILTERS); };

  const activeCount = [
    filters.state, filters.type, filters.level, filters.curriculum,
    filters.minFee || filters.maxFee,
  ].filter(Boolean).length;

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col overflow-hidden min-h-[92vh]"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        {/* Background slides */}
        {HERO_SLIDES.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            {/* Full background image — fully visible */}
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${s.bg}')` }} />
            {/* Left overlay — tinted to match bottom card colour so text stays readable */}
            <div className={`absolute inset-0 bg-gradient-to-r ${s.accent} to-transparent`} />
            {/* Bottom fade — bleeds into the card colour below */}
            <div className={`absolute inset-0 bg-gradient-to-t ${s.bottomFade} via-transparent to-black/10`} />
          </div>
        ))}

        {/* Foreground person image — right side, on top of background */}
        <div className="absolute inset-y-0 right-0 w-[45%] z-20 hidden lg:block pointer-events-none overflow-hidden">
          {HERO_SLIDES.map((s, i) => (
            <img
              key={i}
              src={s.personImg}
              alt=""
              className={`absolute bottom-0 right-0 h-full w-full object-cover object-top transition-opacity duration-1000 ${
                i === slide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 25%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 25%)' }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-20 flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 lg:w-[55%] lg:mx-0 lg:ml-[4%]">

            {/* LEFT: headline + search/CTA */}
            <div>
              {/* <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
                <span className="text-green-400">{HERO_SLIDES[slide].step}.</span>
                {HERO_SLIDES[slide].label}
              </div> */}

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white tracking-tight leading-[1.08] mb-4 drop-shadow-lg">
                {HERO_SLIDES[slide].headline.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
                <br />
                <span className="text-green-400">{HERO_SLIDES[slide].highlight}</span>
              </h1>

              <p className="text-white/75 text-sm sm:text-base max-w-lg mb-6 leading-relaxed">
                {HERO_SLIDES[slide].subtitle}
              </p>

              {/* Stats chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {HERO_SLIDES[slide].stats.map((stat) => (
                  <span key={stat} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    <CheckCircle size={11} className="text-green-400" /> {stat}
                  </span>
                ))}
              </div>

              {/* Slide 0 — Search bar */}
              {slide === 0 && (
                <div ref={heroRef} className="relative max-w-xl mb-5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                      <input
                        type="text"
                        value={heroQuery}
                        onChange={(e) => setHeroQuery(e.target.value)}
                        onFocus={() => dropdownResults.length > 0 && setShowDropdown(true)}
                        placeholder="Search by school name or location..."
                        className="w-full pl-11 pr-9 py-3.5 rounded-xl text-gray-800 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg"
                      />
                      {heroQuery && (
                        <button onClick={() => { setHeroQuery(''); setDropdownResults([]); setShowDropdown(false); }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <X size={15} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => { const f = { ...filters, search: heroQuery }; setFilters(f); doFetch(1, f); setShowDropdown(false); }}
                      className="bg-green-600 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-green-700 transition shadow-lg whitespace-nowrap text-sm">
                      Search →
                    </button>
                  </div>
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
                              <Link to={`/schools/${s.slug || s._id}`}
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
                                  <span className="text-xs font-semibold text-green-700 shrink-0">₦{Number(s.fees.tuition).toLocaleString()}/yr</span>
                                )}
                              </Link>
                            </li>
                          ))}
                          <li>
                            <button onClick={() => { const f = { ...filters, search: heroQuery }; setFilters(f); doFetch(1, f); setShowDropdown(false); }}
                              className="w-full text-center text-xs text-green-700 font-semibold py-3 hover:bg-green-50 transition">
                              View all results for "{heroQuery}" →
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3">
                {slide === 0 ? (
                  <>
                    <Link to="/#browse"
                      onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
                      className="flex items-center gap-2 bg-green-600 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-green-700 transition shadow-lg text-sm">
                      Browse Schools <ArrowRight size={15} />
                    </Link>
                    <Link to="/compare"
                      className="flex items-center gap-2 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition text-sm">
                      Compare Schools
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={HERO_SLIDES[slide].cta.href}
                      className="flex items-center gap-2 bg-green-600 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-green-700 transition shadow-lg text-sm">
                      {HERO_SLIDES[slide].cta.label} <ArrowRight size={15} />
                    </Link>
                    <Link to={HERO_SLIDES[slide].cta2.href}
                      className="flex items-center gap-2 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition text-sm">
                      {HERO_SLIDES[slide].cta2.label}
                    </Link>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Slide progress + arrow controls */}
        <div className="relative z-20 max-w-7xl mx-auto px-5 sm:px-8 pb-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            {HERO_SLIDES.map((s, i) => (
              <button key={i} onClick={() => goToSlide(i)}
                className={`relative h-1 rounded-full overflow-hidden transition-all ${i === slide ? 'w-14 sm:w-16 bg-white/30' : 'w-7 sm:w-8 bg-white/20 hover:bg-white/40'}`}>
                {i === slide && (
                  <div className="absolute inset-y-0 left-0 bg-green-400 rounded-full"
                    style={{ width: `${heroProgress}%`, transition: 'width 0.05s linear' }} />
                )}
              </button>
            ))}
            <span className="text-white/50 text-xs ml-1">{slide + 1} / {HERO_SLIDES.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={heroPrev}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition">
              <ChevronLeft size={16} />
            </button>
            <button onClick={heroNext}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 transition">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Three content cards at the bottom */}
        <div className="relative z-20 mx-4 sm:mx-6 lg:mx-10 mb-4 sm:mb-6 rounded-2xl overflow-hidden grid grid-cols-3 shadow-xl">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`${s.cardBg} text-left px-5 sm:px-8 py-5 sm:py-7 transition-all duration-300 relative
                ${i === slide ? 'opacity-100' : 'opacity-80 hover:opacity-95'}
                ${i < HERO_SLIDES.length - 1 ? 'border-r border-white/10' : ''}
              `}
            >
              {/* Step badge */}
              <span className={`inline-block text-xs font-extrabold px-2 py-0.5 rounded mb-2 sm:mb-3 ${s.cardBadge}`}>
                {s.step}.
              </span>

              {/* Active indicator dot */}
              {i === slide && (
                <span className="absolute top-4 right-4 sm:top-5 sm:right-5 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}

              <h3 className={`font-extrabold text-sm sm:text-base md:text-lg leading-snug mb-1.5 sm:mb-2 ${s.cardText}`}>
                {s.label}
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed line-clamp-3 sm:line-clamp-4 ${s.cardDesc2}`}>
                {s.cardDesc}
              </p>
            </button>
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

      {/* ── EXPLORE TOP SCHOOLS ───────────────────────────────────── */}
      <section className="py-10 md:py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-green-600 font-semibold text-sm uppercase tracking-wider mb-3">Explore Schools</p>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Nigeria's Top 100 Schools
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Browse by state, type, or curriculum — updated from verified listings across Nigeria and West Africa.
            </p>
          </div>

          {/* State cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {[
              { state: 'Lagos',   emoji: '🏙️', title: 'Best in Lagos',        sub: "Nigeria's education capital" },
              { state: 'FCT',     emoji: '🏛️', title: 'Abuja Schools',        sub: 'Federal Capital Territory'   },
              { state: 'Kano',    emoji: '🌾', title: 'Kano Top Schools',     sub: 'Northern Nigeria\'s finest'   },
              { state: 'Rivers',  emoji: '🛢️', title: 'Port Harcourt',        sub: 'South-South excellence'       },
              { state: 'Ogun',    emoji: '🌲', title: 'Ogun Schools',         sub: 'Gateway to quality edu'       },
              { state: 'Enugu',   emoji: '⛏️', title: 'Enugu Schools',        sub: 'Coal City\'s top picks'       },
              { state: 'Oyo',     emoji: '🏯', title: 'Ibadan & Oyo',         sub: 'South-West academic hub'      },
              { state: 'Delta',   emoji: '🌊', title: 'Delta State',          sub: 'Niger Delta excellence'       },
            ].map(({ state, emoji, title, sub }) => (
              <Link key={state} to={`/?state=${state}`}
                className="group flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-white hover:border-green-300 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <span className="text-3xl shrink-0">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight group-hover:text-green-700 transition truncate">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-green-500 transition shrink-0" />
              </Link>
            ))}
          </div>

          {/* Quick-filter chips */}
          <div className="flex flex-wrap gap-2.5 justify-center">
            {[
              { label: 'Top Private Schools',        href: '/?type=private'       },
              { label: 'Federal Gov\'t Colleges',    href: '/?type=federal'       },
              { label: 'IGCSE Schools',              href: '/?curriculum=IGCSE'   },
              { label: 'Cambridge Curriculum',       href: '/?curriculum=Cambridge'},
              { label: 'IB Schools',                 href: '/?curriculum=IB'      },
              { label: 'Primary Schools',            href: '/?level=primary'      },
              { label: 'Secondary Schools',          href: '/?level=secondary'    },
              { label: 'International Schools',      href: '/?type=international' },
            ].map(({ label, href }) => (
              <Link key={href} to={href}
                className="px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-700 hover:bg-green-50 bg-white transition">
                {label}
              </Link>
            ))}
          </div>
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
      <section id="browse" className="bg-gray-50 py-8 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Browse Schools</h2>
              <p className="text-gray-500 text-sm mt-1">{total > 0 ? `${total} schools available` : 'Loading schools...'}</p>
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className="self-start sm:self-auto flex items-center gap-2 text-sm font-semibold border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:border-green-500 hover:text-green-700 transition shadow-sm">
              <SlidersHorizontal size={15} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              {activeCount > 0 && (
                <span className="bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* ── PRO FILTER PANEL ── */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">

              {/* Active filter chips row */}
              {activeCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap px-5 py-3 bg-green-50 border-b border-green-100">
                  <span className="text-xs text-green-700 font-bold shrink-0">Active:</span>
                  {filters.state && (
                    <button onClick={() => updateFilter('state', '')}
                      className="flex items-center gap-1 bg-white border border-green-300 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition">
                      {filters.state} <X size={10} />
                    </button>
                  )}
                  {filters.type && (
                    <button onClick={() => updateFilter('type', '')}
                      className="flex items-center gap-1 bg-white border border-green-300 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition capitalize">
                      {filters.type} <X size={10} />
                    </button>
                  )}
                  {filters.level && (
                    <button onClick={() => updateFilter('level', '')}
                      className="flex items-center gap-1 bg-white border border-green-300 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition capitalize">
                      {filters.level} <X size={10} />
                    </button>
                  )}
                  {filters.curriculum && (
                    <button onClick={() => updateFilter('curriculum', '')}
                      className="flex items-center gap-1 bg-white border border-green-300 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition">
                      {filters.curriculum} <X size={10} />
                    </button>
                  )}
                  {(filters.minFee || filters.maxFee) && (
                    <button onClick={() => setBudget('', '')}
                      className="flex items-center gap-1 bg-white border border-green-300 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition">
                      {filters.minFee ? `₦${Number(filters.minFee).toLocaleString()}` : '₦0'}
                      {' – '}
                      {filters.maxFee ? `₦${Number(filters.maxFee).toLocaleString()}` : 'Any'}
                      <X size={10} />
                    </button>
                  )}
                  <button onClick={clearFilters}
                    className="ml-auto text-xs text-red-500 font-semibold hover:text-red-700 transition shrink-0">
                    Clear all
                  </button>
                </div>
              )}

              <div className="p-5 space-y-6">

                {/* Location */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Location / State</p>
                  <div className="flex flex-col gap-3">
                    <select value={filters.state} onChange={(e) => updateFilter('state', e.target.value)}
                      className="w-full sm:w-64 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white transition">
                      <option value="">All States</option>
                      {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <div className="flex flex-wrap gap-1.5">
                      {['Lagos', 'FCT', 'Kano', 'Rivers', 'Ogun', 'Oyo'].map((s) => (
                        <button key={s} onClick={() => updateFilter('state', filters.state === s ? '' : s)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition ${
                            filters.state === s
                              ? 'bg-green-600 border-green-600 text-white shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 bg-white'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Type + Level row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">School Type</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'private',       label: 'Private'       },
                        { value: 'public',        label: 'Public'        },
                        { value: 'federal',       label: 'Federal'       },
                        { value: 'international', label: 'International' },
                      ].map(({ value, label }) => {
                        const active = filters.type === value;
                        return (
                          <button key={value} onClick={() => updateFilter('type', active ? '' : value)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                              active
                                ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                                : 'border-gray-200 text-gray-600 hover:border-green-300 bg-white'
                            }`}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">School Level</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'primary',   label: 'Primary'   },
                        { value: 'secondary', label: 'Secondary' },
                        { value: 'both',      label: 'All Levels'},
                      ].map(({ value, label }) => {
                        const active = filters.level === value;
                        return (
                          <button key={value} onClick={() => updateFilter('level', active ? '' : value)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                              active
                                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                : 'border-gray-200 text-gray-600 hover:border-blue-300 bg-white'
                            }`}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Curriculum */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Curriculum</p>
                  <div className="flex flex-wrap gap-2">
                    {['WAEC', 'NECO', 'IGCSE', 'IB', 'Cambridge', 'BECE'].map((c) => {
                      const active = filters.curriculum === c;
                      return (
                        <button key={c} onClick={() => updateFilter('curriculum', active ? '' : c)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                            active
                              ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-purple-300 bg-white'
                          }`}>
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Budget */}
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Annual Fee Budget</p>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_OPTIONS.map(({ label, min, max }) => {
                      const active = filters.minFee === min && filters.maxFee === max;
                      return (
                        <button key={label} onClick={() => setBudget(min, max)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                            active
                              ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-orange-300 bg-white'
                          }`}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Filter footer */}
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  {loading ? 'Searching…' : `${total} school${total !== 1 ? 's' : ''} match your filters`}
                </p>
                {activeCount > 0 && (
                  <button onClick={clearFilters}
                    className="text-xs text-red-500 font-semibold hover:text-red-700 transition">
                    Clear all filters
                  </button>
                )}
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
