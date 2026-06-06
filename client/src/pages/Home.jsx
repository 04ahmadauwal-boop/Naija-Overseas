import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFadeIn, useSlideIn, useScrollAnimation } from '../hooks/useGsapAnimations';
import {
  Search, SlidersHorizontal, CheckCircle, ArrowRight,
  Star, ChevronDown, ChevronUp, BookOpen, Globe,
  Users, BarChart3, Shield, Zap, Award, X,
  ChevronLeft, ChevronRight, MessageSquare, GraduationCap, LayoutDashboard,
  Flame, Clock, Eye, TrendingUp,
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


const FEATURES = [
  {
    num: '01', icon: BarChart3,
    title: 'Smart Comparison Tool',
    desc: 'Compare multiple schools side-by-side across fees, curriculum, WAEC results, facilities and more — clear data, zero guesswork.',
    badge: '10+ comparison criteria',
    accent: 'from-emerald-500 to-teal-500',
    card: 'from-emerald-50/80 to-teal-50/60',
    border: 'border-emerald-100 hover:border-emerald-300',
    iconBg: 'bg-emerald-100', iconFg: 'text-emerald-700',
    numFg: 'text-emerald-100', badgeBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    num: '02', icon: Globe,
    title: 'Study Abroad Placement',
    desc: 'We place Nigerian students in leading universities in the UK, Canada, USA, Australia and Germany — with a 95% visa success rate.',
    badge: '8 countries covered',
    accent: 'from-blue-500 to-indigo-500',
    card: 'from-blue-50/80 to-indigo-50/60',
    border: 'border-blue-100 hover:border-blue-300',
    iconBg: 'bg-blue-100', iconFg: 'text-blue-700',
    numFg: 'text-blue-100', badgeBg: 'bg-blue-100 text-blue-700',
  },
  {
    num: '03', icon: Shield,
    title: 'Verified School Listings',
    desc: 'Every school is manually reviewed by our team before going live. No fake listings, no outdated profiles — guaranteed.',
    badge: '500+ verified schools',
    accent: 'from-violet-500 to-purple-500',
    card: 'from-violet-50/80 to-purple-50/60',
    border: 'border-violet-100 hover:border-violet-300',
    iconBg: 'bg-violet-100', iconFg: 'text-violet-700',
    numFg: 'text-violet-100', badgeBg: 'bg-violet-100 text-violet-700',
  },
  {
    num: '04', icon: LayoutDashboard,
    title: 'Parent Tools',
    desc: 'Save schools, compare shortlists, set fee alerts and get tailored school recommendations — all in your personal dashboard.',
    badge: 'Free for all parents',
    accent: 'from-orange-500 to-amber-500',
    card: 'from-orange-50/80 to-amber-50/60',
    border: 'border-orange-100 hover:border-orange-300',
    iconBg: 'bg-orange-100', iconFg: 'text-orange-700',
    numFg: 'text-orange-100', badgeBg: 'bg-orange-100 text-orange-700',
  },
  {
    num: '05', icon: MessageSquare,
    title: 'Consultation with Expert',
    desc: 'Book a one-on-one session with our certified education counsellors — for school selection, study abroad decisions or visa guidance.',
    badge: 'Free 30-min session',
    accent: 'from-rose-500 to-pink-500',
    card: 'from-rose-50/80 to-pink-50/60',
    border: 'border-rose-100 hover:border-rose-300',
    iconBg: 'bg-rose-100', iconFg: 'text-rose-700',
    numFg: 'text-rose-100', badgeBg: 'bg-rose-100 text-rose-700',
  },
  {
    num: '06', icon: GraduationCap,
    title: 'Admission Placement',
    desc: 'From school selection to final offer letter — our admissions team handles every step, for both local Nigerian schools and overseas universities.',
    badge: 'End-to-end support',
    accent: 'from-sky-500 to-cyan-500',
    card: 'from-sky-50/80 to-cyan-50/60',
    border: 'border-sky-100 hover:border-sky-300',
    iconBg: 'bg-sky-100', iconFg: 'text-sky-700',
    numFg: 'text-sky-100', badgeBg: 'bg-sky-100 text-sky-700',
  },
];

const TESTIMONIALS = [
  { name: 'Mrs. Aisha Bello',        role: 'Parent · Abuja',              category: 'Teaching Quality',            text: 'The teachers here are exceptional — patient, knowledgeable, and genuinely invested in each child. My son went from struggling in Maths to loving it.',          rating: 5, initials: 'AB', color: 'bg-green-600'   },
  { name: 'Chukwuemeka Obi',         role: 'Student · Lagos',             category: 'Teaching Quality',            text: 'My Physics teacher makes every lesson feel like a discovery. I scored a B3 in WAEC after years of failing. This school changed everything for me.',              rating: 5, initials: 'CO', color: 'bg-blue-600'    },
  { name: 'Principal F. Danjuma',    role: 'School Owner · Kano',         category: 'Fee Structure',               text: 'The fees are transparent and well-structured. Parents appreciate that there are no hidden charges, and the instalment plan really helps families manage costs.',  rating: 4, initials: 'FD', color: 'bg-yellow-600'  },
  { name: 'Mr. Kofi Mensah',         role: 'Parent · Accra, Ghana',       category: 'Communication',               text: 'The school sends weekly updates via WhatsApp and email. I always know exactly how my children are doing — test scores, behaviour, everything.',                  rating: 5, initials: 'KM', color: 'bg-purple-600'  },
  { name: 'Ngozi Adeyemi',           role: 'Parent · Ibadan',             category: 'Infrastructure',              text: 'The campus is stunning — modern classrooms, a well-stocked library, and a proper ICT lab. Walking in feels like stepping into a university.',                    rating: 5, initials: 'NA', color: 'bg-teal-600'    },
  { name: 'Emeka Nwosu',             role: 'Student · Port Harcourt',     category: 'Extracurricular Activities',  text: 'I joined the robotics club and the football team. We won two state competitions this year. The school truly supports talents outside the classroom.',             rating: 5, initials: 'EN', color: 'bg-indigo-600'  },
  { name: 'Hauwa Suleiman',          role: 'Parent · Kaduna',             category: 'Discipline',                  text: 'The school strikes a perfect balance — firm rules but never harsh. My children are respectful, punctual, and responsible in ways I have never seen before.',     rating: 5, initials: 'HS', color: 'bg-rose-600'    },
  { name: 'Biodun Alabi',            role: 'Parent · Lagos',              category: 'Transport Facilities',        text: 'The school bus arrives within five minutes of schedule every single day. The drivers are vetted, professional, and my daughter feels completely safe.',           rating: 5, initials: 'BA', color: 'bg-cyan-600'    },
  { name: 'Dr. Tunde Fashola',       role: 'Parent · Abuja',              category: 'Student-Teacher Ratio',       text: 'With only 20 students per class, teachers actually know my kids by name. The one-on-one attention has transformed their confidence and results completely.',      rating: 5, initials: 'TF', color: 'bg-orange-600'  },
  { name: 'Chidinma Eze',            role: 'Parent · Enugu',              category: 'Environment',                 text: 'The grounds are immaculate, the classrooms are airy, and the school has a genuine sense of community. My children wake up every morning excited to attend.',     rating: 5, initials: 'CE', color: 'bg-lime-600'    },
  { name: 'Bello Adamu',             role: 'Parent · Kano',               category: 'Academic Results',            text: 'My son improved from the bottom quartile to top 5 in his class in a single term. The teachers identified his learning gaps and addressed them individually.',    rating: 5, initials: 'BA', color: 'bg-sky-600'     },
  { name: 'Mrs. Olusegun Bright',    role: 'Parent · Abeokuta, Ogun',     category: 'Communication',               text: 'The school portal is brilliant. I track my child\'s attendance, homework submissions, and test scores in real time. Communication is completely transparent.',   rating: 5, initials: 'OB', color: 'bg-gray-700'    },
  { name: 'James Nkrumah',           role: 'Parent · Kumasi, Ghana',      category: 'Fee Structure',               text: 'Slightly expensive compared to others nearby, but every pesewa is justified. The quality of teaching, facilities, and pastoral care is worth every cedi.',      rating: 4, initials: 'JN', color: 'bg-emerald-600' },
  { name: 'Seun Okafor',             role: 'SS3 Student · Lagos',         category: 'Academic Results',            text: 'I scored 8 A1s in WAEC and just got offered a scholarship to study Engineering in Canada. My school pushed me to be the best version of myself.',                rating: 5, initials: 'SO', color: 'bg-violet-600'  },
  { name: 'Mrs. Adeola Taiwo',       role: 'Parent · Ibadan',             category: 'Infrastructure',              text: 'The new science laboratories are world-class. My daughter says every Biology practical lesson feels like real research. The investment in equipment shows.',        rating: 5, initials: 'AT', color: 'bg-fuchsia-600' },
  { name: 'Musa Garba',              role: 'Parent · Katsina',            category: 'Academic Results',            text: 'Both my daughters secured federal government scholarship placements after sitting JAMB here. The school\'s preparation programme is thorough and effective.',      rating: 5, initials: 'MG', color: 'bg-green-700'   },
  { name: 'Adaeze Okonkwo',          role: 'Student · Onitsha, Anambra',  category: 'Extracurricular Activities',  text: 'I captained the debate team to a national semifinal this year. The teachers coach us after school hours voluntarily. The support is genuinely overwhelming.',     rating: 5, initials: 'AO', color: 'bg-blue-700'    },
  { name: 'Deola Bankole',           role: 'Parent · Lekki, Lagos',       category: 'Student-Teacher Ratio',       text: 'The 18:1 class ratio means no child is left behind. My son\'s Form teacher calls me monthly with specific updates. It feels like a partnership, not a service.', rating: 5, initials: 'DB', color: 'bg-teal-700'    },
  { name: 'Emmanuel Ofori',          role: 'Parent · Accra, Ghana',       category: 'Environment',                 text: 'Security is tight, the grounds are spotless, and the canteen serves healthy food. The school has thought about every detail of the student experience.',          rating: 5, initials: 'EO', color: 'bg-amber-600'   },
  { name: 'Amina Yusuf',             role: 'Parent · Sokoto',             category: 'Teaching Quality',            text: 'The English and Maths teachers are extraordinary. My daughter reads novels for fun now — something I never imagined possible after her struggles last year.',      rating: 5, initials: 'AY', color: 'bg-pink-600'    },
  { name: 'Gideon Acheampong',       role: 'Parent · Takoradi, Ghana',    category: 'Fee Structure',               text: 'The school offers a sibling discount that saved our family significantly. The fee schedule is sent in September so we can plan the whole year in advance.',       rating: 4, initials: 'GA', color: 'bg-lime-700'    },
  { name: 'Blessing Okafor',         role: 'Parent · Owerri, Imo',        category: 'Discipline',                  text: 'My son used to be disruptive in class. Six months here and his behaviour has completely transformed. The pastoral care team is phenomenal.',                     rating: 5, initials: 'BO', color: 'bg-red-600'     },
  { name: 'Alhaji Sani Umar',        role: 'Parent · Maiduguri, Borno',   category: 'Transport Facilities',        text: 'We live 12 km from school and the bus service has never once let us down. Tracking the bus live on the app gives me peace of mind every single morning.',        rating: 5, initials: 'SU', color: 'bg-sky-700'     },
  { name: 'Ifeoma Chukwu',           role: 'JS2 Student · Enugu',         category: 'Extracurricular Activities',  text: 'The art and drama club here is incredible. I performed in two school productions this term and discovered I want to study theatre arts at university.',           rating: 5, initials: 'IC', color: 'bg-purple-700'  },
  { name: 'Mrs. Folake Adegoke',     role: 'Parent · Osogbo, Osun',       category: 'Academic Results',            text: 'My twin boys both made five credits including English and Maths on their first WAEC attempt. This school\'s exam prep is second to none in the state.',          rating: 5, initials: 'FA', color: 'bg-green-800'   },
  { name: 'Kwame Asante',            role: 'Parent · Cape Coast, Ghana',  category: 'Communication',               text: 'The headmistress calls parents personally when there is an issue — not just a generic letter. That level of personal attention is rare and deeply reassuring.',  rating: 5, initials: 'KA', color: 'bg-indigo-700'  },
  { name: 'Oluwakemi Adeniyi',       role: 'Parent · Akure, Ondo',        category: 'Infrastructure',              text: 'The school just opened a new 400-seat multipurpose hall and a solar-powered computer lab. They are constantly reinvesting in the student experience.',            rating: 5, initials: 'OA', color: 'bg-teal-800'    },
  { name: 'Fatima Ibrahim',          role: 'Parent · Ilorin, Kwara',      category: 'Student-Teacher Ratio',       text: 'My daughter\'s class has 22 students and three teachers rotating. The individualised feedback on every piece of written work is astonishing.',                   rating: 5, initials: 'FI', color: 'bg-orange-700'  },
  { name: 'Victor Nwachukwu',        role: 'Parent · Asaba, Delta',       category: 'Environment',                 text: 'The school recently installed CCTV, a biometric entry system, and a medical bay. My children have never felt safer anywhere else in their lives.',               rating: 5, initials: 'VN', color: 'bg-cyan-700'    },
  { name: 'Hajiya Ramatu Aliyu',     role: 'Parent · Jos, Plateau',       category: 'Teaching Quality',            text: 'The science department is the best I have seen at secondary level in Nigeria. My son came home explaining concepts I learnt in university. Truly impressive.',    rating: 5, initials: 'RA', color: 'bg-emerald-700' },
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
    <div className={`rounded-xl border transition-all duration-200 overflow-hidden ${open ? 'border-green-700/50 bg-green-950/20' : 'border-gray-800 bg-gray-900/60 hover:border-gray-700'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
      >
        <span className="font-semibold text-white text-[14px] sm:text-[15px] leading-snug pr-2"
          style={{ fontFamily: "'Poppins', 'Georgia', sans-serif" }}>
          {q}
        </span>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${open ? 'bg-green-600 text-white rotate-180' : 'bg-gray-800 text-gray-500'}`}>
          <ChevronDown size={14} />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 text-gray-400 text-[13px] sm:text-sm leading-relaxed border-t border-white/5 pt-3">
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
    cardBadge: 'bg-emerald-700 text-white',
    headline: 'Find the perfect school\nfor your child.',
    highlight: 'Compare & decide.',
    subtitle: "Nigeria's smartest school discovery platform — search, filter and compare hundreds of verified schools across Nigeria and West Africa.",
    // Warm, inviting classroom — children learning, bright natural light
    bg: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1920&q=80',
    personImg: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    // Deep forest-green gradient left → transparent right
    accent: 'from-emerald-950 via-green-900/75',
    bottomFade: 'from-emerald-950/60',
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
    cardBg: 'bg-blue-900',
    cardText: 'text-white',
    cardDesc2: 'text-blue-200',
    cardBadge: 'bg-blue-500 text-white',
    headline: 'Get your school in front\nof thousands of parents.',
    highlight: 'Grow your enrolment.',
    subtitle: "List your school on Nigeria's fastest-growing education platform. Reach parents actively searching for schools in your area — starting from ₦15,000.",
    // Prestigious school building exterior — architecture, blue sky, sunlight
    bg: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
    personImg: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=800&q=80',
    // Deep navy gradient left → transparent right
    accent: 'from-slate-950 via-blue-950/80',
    bottomFade: 'from-slate-950/60',
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
    cardBg: 'bg-violet-900',
    cardText: 'text-white',
    cardDesc2: 'text-violet-200',
    cardBadge: 'bg-amber-400 text-violet-950',
    headline: 'Get into a top university\nabroad.',
    highlight: 'Your future starts here.',
    subtitle: "Expert guidance for Nigerian students seeking admission in the UK, Canada, USA, Australia, Germany and more. 95% visa success rate — end-to-end support.",
    // World-class university campus — grand architecture, aspirational
    bg: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80',
    personImg: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    // Deep royal violet/indigo gradient left → transparent right
    accent: 'from-violet-950 via-indigo-950/80',
    bottomFade: 'from-violet-950/60',
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

const DEFAULT_BANNER = {
  badge:    'For School Owners',
  headline: 'Reach thousands of parents actively searching for schools right now.',
  body:     "List your school on Nigeria's fastest-growing education platform. Get verified, get discovered, and fill your admission slots faster than ever before.",
  ctaLabel: 'List Your School',
  ctaLink:  '/list-your-school',
  stats: [
    { value: '3x',   label: 'More enquiries on average' },
    { value: '24h',  label: 'Approval turnaround'       },
    { value: '₦15k', label: 'One-time listing fee'      },
    { value: '10k+', label: 'Monthly active parents'    },
  ],
  bullets: [
    'Full school profile page',
    'Search & comparison visibility',
    'Direct enquiry routing',
    'Admin management tools',
    'Monthly performance report',
    'Featured listing option',
  ],
  bgTheme: 'dark',
  bgImage: '',
};

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

  // Trending blog posts
  const [trendingPosts, setTrendingPosts] = useState([]);
  useEffect(() => {
    api.get('/blog/trending').then(({ data }) => setTrendingPosts(data.posts || [])).catch(() => {});
  }, []);

  // Review videos for the scrolling section
  const [reviewVideos, setReviewVideos] = useState([]);
  useEffect(() => {
    api.get('/videos', { params: { limit: 12 } })
      .then(({ data }) => setReviewVideos(data.videos || []))
      .catch(() => {});
  }, []);

  // Home banner — fetched from admin-controlled API
  const [banner, setBanner] = useState(DEFAULT_BANNER);
  useEffect(() => {
    api.get('/banner')
      .then(({ data }) => { if (data.banner && data.banner.headline) setBanner({ ...DEFAULT_BANNER, ...data.banner }); })
      .catch(() => {});
  }, []);

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
  }, [heroPaused, slide]);

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

  // Animation refs
  const heroHeadingRef = useFadeIn(0.8, 0.2);
  useSlideIn('up', 0.8, 0.4);
  const ctaRef = useSlideIn('up', 0.8, 0.5);
  useScrollAnimation('fadeIn', { duration: 0.8 });
  const featuresRef = useScrollAnimation('slideUp', { duration: 0.8 });

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col overflow-hidden h-[60dvh] sm:h-dvh"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
      >
        {/* Background — cinematic multi-layer */}
        {HERO_SLIDES.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1400 ease-in-out ${i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            {/* Photo — portrait crop on mobile, landscape on desktop */}
            <div
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat sm:hidden ${i === slide ? 'hero-bg-animate' : ''}`}
              style={{ backgroundImage: `url('${s.bg.split('?')[0]}?auto=format&fit=crop&w=800&h=600&crop=focalpoint&q=80')` }}
            />
            <div
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat hidden sm:block ${i === slide ? 'hero-bg-animate' : ''}`}
              style={{ backgroundImage: `url('${s.bg}')` }}
            />
            {/* Base dark scrim — let photo breathe a bit */}
            <div className="absolute inset-0 bg-black/40" />
            {/* Rich colour gradient from left — full strength, no opacity reduction */}
            <div className={`absolute inset-0 bg-linear-to-r ${s.accent} to-transparent`} />
            {/* Strong bottom fade for text legibility */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
            {/* Subtle radial vignette for editorial depth */}
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 90% at 15% 55%, transparent 35%, rgba(0,0,0,0.35) 100%)' }} />
          </div>
        ))}

        {/* Foreground person — desktop XL only */}
        <div className="absolute inset-y-0 right-0 w-[40%] z-20 hidden xl:block pointer-events-none overflow-hidden">
          {HERO_SLIDES.map((s, i) => (
            <img
              key={i}
              src={s.personImg}
              alt=""
              className={`absolute bottom-0 right-0 h-full w-full object-cover object-top transition-opacity duration-1000 ${i === slide ? 'opacity-90' : 'opacity-0'}`}
              style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 32%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 32%)' }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-20 flex-1 flex items-center p-0 m-0">
          <div className="w-full xl:w-[56%] xl:ml-[6%] px-4 sm:px-8 lg:px-14 xl:px-0 py-6 sm:py-10 lg:py-14 flex flex-col items-center sm:items-start">

            {/* Headline */}
            <h1
              ref={heroHeadingRef}
              className="text-[1.85rem] xs:text-[2.1rem] sm:text-[2.6rem] lg:text-[3.1rem] xl:text-[3.6rem] font-bold text-white leading-[1.12] mb-3 sm:mb-4 text-center sm:text-left"
              style={{ textShadow: '0 2px 30px rgba(0,0,0,0.35)' }}
            >
              {HERO_SLIDES[slide].headline.split('\n').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              <span className="text-green-400 italic">{HERO_SLIDES[slide].highlight}</span>
            </h1>

            {/* Search bar — glass morphism (slide 0), centered on mobile */}
            {slide === 0 && (
              <div ref={heroRef} className="relative w-full max-w-xl mb-1 sm:mb-5">
                <div className="flex items-center bg-white rounded-full sm:rounded-xl overflow-hidden shadow-2xl">
                  <Search className="text-gray-400 shrink-0 ml-4" size={16} />
                  <input
                    type="text"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                    onFocus={() => dropdownResults.length > 0 && setShowDropdown(true)}
                    placeholder="Search schools, cities, curriculum..."
                    className="flex-1 px-3 py-3.5 sm:py-3 bg-transparent text-gray-800 placeholder-gray-400 text-[13px] border-0 focus:outline-none min-w-0"
                  />
                  {heroQuery && (
                    <button onClick={() => { setHeroQuery(''); setDropdownResults([]); setShowDropdown(false); }}
                      className="text-gray-400 hover:text-gray-600 transition mr-1 shrink-0">
                      <X size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => { const f = { ...filters, search: heroQuery }; setFilters(f); doFetch(1, f); setShowDropdown(false); document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="bg-green-600 hover:bg-green-500 transition text-white font-semibold px-4 py-3.5 sm:py-3 text-[13px] whitespace-nowrap flex items-center gap-1.5 shrink-0 rounded-full sm:rounded-none mr-0.5 sm:mr-0">
                    <Search size={15} />
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

            {/* Stats row — simplified on mobile */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-5 mb-3 sm:mb-5">
              {HERO_SLIDES[slide].stats.map((stat, i) => (
                <div key={stat} className="flex items-center gap-1.5">
                  {i > 0 && <span className="w-px h-3 bg-white/20 shrink-0 hidden sm:block" />}
                  <CheckCircle size={10} className="text-green-400 shrink-0" />
                  <span className="text-white/80 text-[11px] sm:text-[13px] font-medium">{stat}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons — full-width pair on mobile, auto on sm+ */}
            <div ref={ctaRef} className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              {slide === 0 ? (
                <>
                  <Link to="/#browse"
                    onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition shadow-lg shadow-green-900/30 text-[12px] sm:text-[13px]">
                    Browse Schools <ArrowRight size={13} />
                  </Link>
                  <Link to="/compare"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/25 hover:bg-white/20 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition text-[12px] sm:text-[13px]">
                    Compare
                  </Link>
                </>
              ) : (
                <>
                  <Link to={HERO_SLIDES[slide].cta.href}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition shadow-lg shadow-green-900/30 text-[12px] sm:text-[13px]">
                    {HERO_SLIDES[slide].cta.label} <ArrowRight size={13} />
                  </Link>
                  <Link to={HERO_SLIDES[slide].cta2.href}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/25 hover:bg-white/20 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition text-[12px] sm:text-[13px]">
                    {HERO_SLIDES[slide].cta2.label}
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Slide navigation */}
        <div className="relative z-20 px-4 sm:px-8 lg:px-14 pb-2 sm:pb-3 w-full flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            {HERO_SLIDES.map((s, i) => (
              <button key={i} onClick={() => goToSlide(i)} className="flex flex-col gap-1 sm:gap-1.5 group text-left">
                {/* Label hidden on mobile, visible sm+ */}
                <span className={`hidden sm:block text-[11px] font-semibold tracking-wider uppercase transition-colors leading-none ${i === slide ? 'text-white' : 'text-white/30 group-hover:text-white/55'}`}>
                  {s.label}
                </span>
                <div className={`h-px rounded-full overflow-hidden transition-all duration-300 ${i === slide ? 'w-8 sm:w-14 bg-white/30' : 'w-4 sm:w-7 bg-white/15'}`}>
                  {i === slide && (
                    <div className="h-full bg-green-400" style={{ width: `${heroProgress}%`, transition: 'width 0.05s linear' }} />
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button onClick={heroPrev}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/15 transition backdrop-blur-sm">
              <ChevronLeft size={14} />
            </button>
            <button onClick={heroNext}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-500 text-white transition shadow-lg">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Bottom feature strip */}
        <div className="relative z-20 mx-2 sm:mx-6 lg:mx-10 mb-2 sm:mb-3 grid grid-cols-3 overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-2xl bg-black/30 shadow-2xl">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`relative text-left px-2.5 sm:px-5 lg:px-7 py-2 sm:py-4 transition-all duration-300 border-r border-white/10 last:border-0 ${i === slide ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <span className={`block text-[8px] sm:text-[10px] font-extrabold tracking-[0.18em] uppercase mb-0.5 sm:mb-1 transition-colors ${i === slide ? 'text-green-400' : 'text-white/35'}`}>
                {s.step}
              </span>
              {i === slide && <span className="absolute top-2 right-2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-400 animate-pulse" />}
              <h3 className={`font-semibold text-[10px] sm:text-[13px] leading-tight transition-colors ${i === slide ? 'text-white' : 'text-white/45'}`}>
                {s.label}
              </h3>
              <p className={`hidden lg:block text-[11px] leading-snug mt-1.5 line-clamp-2 transition-colors ${i === slide ? 'text-white/55' : 'text-white/25'}`}>
                {s.cardDesc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      {/* <section className="border-y border-gray-100 bg-gray-50">
        <div ref={statsItemsRef} className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-extrabold text-gray-900 mb-0.5">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section> */}

      {/* ── EXPLORE TOP SCHOOLS ───────────────────────────────────── */}
      <section className="py-8 sm:py-10 md:py-16 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-10">
            <p className="text-green-600 font-semibold text-[11px] sm:text-sm uppercase tracking-widest mb-2 sm:mb-3">Explore Schools</p>
            <h2 className="text-lg sm:text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2 sm:mb-4">
              Nigeria's Top 100 Schools
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              Browse by state, type, or curriculum — updated from verified listings across Nigeria and West Africa.
            </p>
          </div>

          {/* State cards */}
          {(() => {
            const states = [
              { state: 'Lagos',   emoji: '🏙️', title: 'Best in Lagos',    sub: "Nigeria's education capital", color: 'from-orange-50 to-amber-50',   border: 'border-orange-100',  hover: 'hover:border-orange-300 hover:shadow-orange-100' },
              { state: 'FCT',     emoji: '🏛️', title: 'Abuja Schools',    sub: 'Federal Capital Territory',   color: 'from-blue-50 to-sky-50',       border: 'border-blue-100',    hover: 'hover:border-blue-300 hover:shadow-blue-100'   },
              { state: 'Kano',    emoji: '🌾', title: 'Kano Schools',     sub: "Northern Nigeria's finest",   color: 'from-yellow-50 to-lime-50',    border: 'border-yellow-100',  hover: 'hover:border-yellow-300 hover:shadow-yellow-100'},
              { state: 'Rivers',  emoji: '🛢️', title: 'Port Harcourt',   sub: 'South-South excellence',      color: 'from-teal-50 to-emerald-50',   border: 'border-teal-100',    hover: 'hover:border-teal-300 hover:shadow-teal-100'   },
              { state: 'Ogun',    emoji: '🌲', title: 'Ogun Schools',    sub: 'Gateway to quality edu',      color: 'from-green-50 to-emerald-50',  border: 'border-green-100',   hover: 'hover:border-green-300 hover:shadow-green-100' },
              { state: 'Enugu',   emoji: '⛏️', title: 'Enugu Schools',   sub: "Coal City's top picks",       color: 'from-stone-50 to-gray-50',     border: 'border-stone-100',   hover: 'hover:border-stone-300 hover:shadow-stone-100' },
              { state: 'Oyo',     emoji: '🏯', title: 'Ibadan & Oyo',    sub: 'South-West academic hub',     color: 'from-purple-50 to-violet-50',  border: 'border-purple-100',  hover: 'hover:border-purple-300 hover:shadow-purple-100'},
              { state: 'Delta',   emoji: '🌊', title: 'Delta State',     sub: 'Niger Delta excellence',      color: 'from-cyan-50 to-blue-50',      border: 'border-cyan-100',    hover: 'hover:border-cyan-300 hover:shadow-cyan-100'   },
            ];
            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6 sm:mb-8">
                {states.map(({ state, emoji, title, sub, color, border, hover }, idx) => (
                  <Link
                    key={state}
                    to={`/schools/state/${state}`}
                    className={`group relative flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl border bg-linear-to-br ${color} ${border} ${hover} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${idx >= 4 ? 'hidden sm:flex' : 'flex'}`}
                  >
                    <span className="text-2xl sm:text-3xl leading-none">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-[13px] sm:text-sm leading-snug group-hover:text-green-700 transition">{title}</p>
                      <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 leading-tight">{sub}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{state}</span>
                      <ArrowRight size={12} className="text-gray-300 group-hover:text-green-500 transition shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            );
          })()}

          {/* View all link on mobile */}
          <div className="flex justify-center sm:hidden">
            <Link to="/#browse" onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-1.5 text-green-700 font-semibold text-sm border border-green-200 bg-green-50 px-5 py-2.5 rounded-full hover:bg-green-100 transition">
              View all states <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PARENT REVIEWS & INSIGHTS ─────────────────────────────── */}
      {(() => {
        const getThumb = (v) => {
          if (v.thumbnail) return v.thumbnail;
          try {
            let id = null;
            const url = v.videoUrl || '';
            if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1]?.split('?')[0];
            else if (url.includes('youtube.com/embed/')) id = url.split('youtube.com/embed/')[1]?.split('?')[0];
            else if (url.includes('youtube.com/watch')) id = new URL(url).searchParams.get('v');
            if (id) return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
          } catch { /* invalid URL */ }
          return null;
        };
        const cards = reviewVideos.length > 0 ? reviewVideos : [];
        const fill = (arr) => arr.length >= 3 ? arr : [...arr, ...arr, ...arr].slice(0, Math.max(3, arr.length));
        const row1 = fill(cards.slice(0, 4));
        const row2 = fill(cards.slice(4, 8));
        const row3 = fill(cards.slice(8, 12));
        const badgeColor = (cat) => {
          if (cat === 'Parent Review') return 'bg-green-500 text-white';
          if (cat === 'Principal Interview') return 'bg-emerald-700 text-white';
          if (cat === 'Study Abroad') return 'bg-blue-600 text-white';
          if (cat === 'School Review') return 'bg-green-200 text-green-900';
          return 'bg-gray-600 text-white';
        };
        const CardItem = ({ card }) => {
          const thumb = getThumb(card);
          return (
            <Link to="/videos" className="relative rounded-xl overflow-hidden shrink-0 w-44 sm:w-56 group cursor-pointer shadow-xl border border-white/5 block">
              {thumb
                ? <img src={thumb} alt={card.title} className="w-full h-24 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-500" />
                : <div className="w-full h-24 sm:h-32 bg-gray-800 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-600"><path d="M8 5v14l11-7z"/></svg>
                  </div>
              }
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-9 h-9 rounded-full bg-green-600/90 flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${badgeColor(card.category)}`}>{card.category}</span>
              </div>
              {card.duration && (
                <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{card.duration}</div>
              )}
              <div className="absolute bottom-2 left-2 right-10">
                <p className="text-white font-bold text-[11px] leading-tight truncate">{card.school || card.title}</p>
              </div>
            </Link>
          );
        };
        return (
          <section className="bg-gray-950 overflow-hidden">
            {/* Section title with green accent line */}
            <div className="flex flex-col items-center pt-5 pb-4 px-4 gap-1.5">
              <span className="w-8 h-0.5 bg-green-500 rounded-full block" />
              <p className="text-center text-white font-extrabold text-sm sm:text-base md:text-xl tracking-tight">
                Parent Reviews &amp; Educator Perspectives
              </p>
            </div>
            <div className="flex flex-col lg:flex-row">
              {/* Left panel */}
              <div className="relative lg:w-[38%] shrink-0 flex flex-col justify-center px-6 sm:px-10 py-5 lg:py-8 z-10"
                style={{ background: 'linear-gradient(to right, #030712 60%, transparent 100%)' }}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="w-5 h-px bg-green-500 block" />
                  <span className="text-green-400 text-[11px] font-bold tracking-[0.2em] uppercase">Verified Reviews</span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-3 max-w-sm">
                  Honest reviews on schools and insights from <span className="text-green-400">educators.</span>
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-5 max-w-xs">
                  Real parents. Real principals. Unfiltered stories about Nigerian schools — so you can choose with confidence.
                </p>
                <Link
                  to="/videos"
                  className="self-start flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-full text-sm transition shadow-lg shadow-green-900/40"
                >
                  Watch Videos <ArrowRight size={13} />
                </Link>
              </div>

              {/* Right — scrolling card rows */}
              <div className="flex-1 min-w-0 flex flex-col gap-2.5 py-4 lg:py-6 overflow-hidden">
                {row1.length > 0 && (
                  <div className="flex gap-3 animate-[scroll-left_28s_linear_infinite] hover:[animation-play-state:paused] w-max px-3">
                    {[...row1, ...row1].map((c, i) => <CardItem key={i} card={c} />)}
                  </div>
                )}
                {row2.length > 0 && (
                  <div className="hidden sm:flex gap-3 animate-[scroll-right_32s_linear_infinite] hover:[animation-play-state:paused] w-max px-3">
                    {[...row2, ...row2].map((c, i) => <CardItem key={i} card={c} />)}
                  </div>
                )}
                {row3.length > 0 && (
                  <div className="hidden sm:flex gap-3 animate-[scroll-left_36s_linear_infinite] hover:[animation-play-state:paused] w-max px-3">
                    {[...row3, ...row3].map((c, i) => <CardItem key={i} card={c} />)}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })()}

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
                <div key={i} className="bg-white rounded-2xl h-72 skeleton-shimmer border border-gray-100" />
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
              {schools.map((school, idx) => (
                <div key={school._id} className={idx >= 4 ? 'hidden sm:block' : ''}>
                  <SchoolCard school={school} onCompare={handleCompare}
                    isSelected={!!selected.find((s) => s._id === school._id)} />
                </div>
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
      <section className="min-h-[80vh] flex flex-col justify-center py-12 md:py-20 px-4 bg-white relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(#f3f4f6_1px,transparent_1px),linear-gradient(to_right,#f3f4f6_1px,transparent_1px)] bg-size-[36px_36px] opacity-60 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              Why Naija &amp; Overseas
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
              Everything you need,<br className="hidden sm:block" /> in one platform.
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Built for West African families — powerful tools for parents, students, and school owners all under one roof.
            </p>
          </div>

          <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map(({ num, icon: Icon, title, desc, badge, accent, card, border, iconBg, iconFg, numFg, badgeBg }) => (
              <div
                key={title}
                className={`group relative overflow-hidden rounded-2xl border ${border} bg-linear-to-br ${card} p-5 sm:p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
              >
                {/* Gradient accent bar on hover */}
                <div className={`absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Large faded number in background */}
                <span className={`absolute -top-3 -right-1 text-[80px] leading-none font-black select-none pointer-events-none ${numFg} opacity-60`}>
                  {num}
                </span>

                {/* Icon */}
                <div className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${iconBg} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-105 transition-transform duration-200 shadow-sm`}>
                  <Icon size={20} className={iconFg} />
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-gray-900 text-[15px] sm:text-base mb-2 leading-snug pr-10">{title}</h3>

                {/* Description */}
                <p className="text-gray-500 text-[13px] sm:text-sm leading-relaxed mb-4 sm:mb-5">{desc}</p>

                {/* Badge */}
                <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeBg}`}>
                  <CheckCircle size={10} />
                  {badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STUDY ABROAD BANNER ─────────────────────────────────────
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
      </section> */}

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="overflow-hidden bg-[#0b0f0e]">
        <div className="flex flex-col lg:flex-row">

          {/* Left CTA panel */}
          <div className="lg:w-[36%] shrink-0 flex flex-col justify-center px-6 sm:px-10 lg:px-14 pt-10 pb-6 sm:pt-12 sm:pb-8 lg:py-16 relative z-10">
            <p className="text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3">Reviews</p>
            <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Find <span className="text-emerald-400">Reviews.</span><br />
              Make the Right Choice
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-xs">
              Real ratings from parents and students across Nigeria and West Africa — on teaching, fees, facilities and more.
            </p>
            <Link
              to="/reviews"
              className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-emerald-400 transition-colors w-fit shadow-lg shadow-emerald-900/30"
            >
              View Reviews
            </Link>
          </div>

          {/* Right scrolling review columns */}
          <div
            className="flex-1 overflow-hidden relative flex gap-2 sm:gap-2.5 px-3 sm:px-4 pt-0 pb-5 lg:py-8"
            style={{ height: 'clamp(160px, 40vw, 520px)' }}
          >
            {/* Top / bottom fades */}
            <div className="absolute top-0 left-0 right-0 h-8 sm:h-12 bg-linear-to-b from-[#0b0f0e] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 bg-linear-to-t from-[#0b0f0e] to-transparent z-10 pointer-events-none" />

            {[0, 1, 2, 3].map((colIdx) => {
              const col = TESTIMONIALS.filter((_, i) => i % 4 === colIdx);
              const isDown = colIdx % 2 === 1;
              /* mobile → 1 col | sm → 2 cols | md → 3 cols | lg → 4 cols */
              const colClass =
                colIdx === 1 ? 'hidden sm:block flex-1 overflow-hidden min-w-0'
              : colIdx === 2 ? 'hidden md:block flex-1 overflow-hidden min-w-0'
              : colIdx === 3 ? 'hidden lg:block flex-1 overflow-hidden min-w-0'
              : 'flex-1 overflow-hidden min-w-0';

              return (
                <div key={colIdx} className={colClass}>
                  <div className={isDown ? 'marquee-down' : 'marquee-up'}>
                    {[...col, ...col].map((t, j) => (
                      <div
                        key={j}
                        className="bg-white rounded-xl p-3 sm:p-3.5 mb-2 sm:mb-2.5 border border-gray-100 shadow-sm"
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${t.color} text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center shrink-0`}>
                            {t.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-0.5 mb-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} size={8} className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                              ))}
                            </div>
                            <p className="font-bold text-gray-900 text-[10px] sm:text-[11px] leading-tight">{t.category}</p>
                            <p className="text-gray-500 text-[9px] sm:text-[10px] leading-snug mt-0.5 line-clamp-2 sm:line-clamp-3">{t.text}</p>
                            <p className="text-gray-400 text-[8px] sm:text-[9px] mt-1 font-medium truncate">{t.name} · {t.role}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── HOME BANNER (admin-controlled) ────────────────────────── */}
      {(() => {
        const b = banner;
        const isExternal = /^https?:\/\//.test(b.ctaLink);

        const themeGradient =
          b.bgTheme === 'green' ? 'linear-gradient(135deg,#042f1e 0%,#064e3b 45%,#065f46 100%)'
          : b.bgTheme === 'blue' ? 'linear-gradient(135deg,#0c1a2e 0%,#1e3a5f 50%,#1e40af 100%)'
          : 'linear-gradient(135deg,#0f172a 0%,#1e293b 55%,#111827 100%)';

        const accentText =
          b.bgTheme === 'green' ? 'text-yellow-300'
          : b.bgTheme === 'blue'  ? 'text-cyan-300'
          : 'text-yellow-400';

        const badgeCls =
          b.bgTheme === 'green' ? 'bg-yellow-300 text-emerald-900'
          : b.bgTheme === 'blue'  ? 'bg-cyan-400 text-blue-900'
          : 'bg-yellow-400 text-gray-900';

        const checkCls =
          b.bgTheme === 'green' ? 'text-yellow-300'
          : b.bgTheme === 'blue'  ? 'text-cyan-400'
          : 'text-green-400';

        return (
          <section className="py-6 md:py-10 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <div
                className="relative rounded-3xl overflow-hidden"
                style={b.bgImage ? undefined : { background: themeGradient }}
              >
                {/* Background image */}
                {b.bgImage && (
                  <>
                    <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${b.bgImage})` }} />
                    <div className="absolute inset-0 bg-black/65" />
                    <div className="absolute inset-0"
                      style={{ background: 'linear-gradient(135deg,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.3) 60%,transparent 100%)' }} />
                  </>
                )}

                {/* Dot pattern texture */}
                <div className="absolute inset-0 opacity-[0.045] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '18px 18px' }} />

                {/* Decorative glows */}
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-white/4 blur-2xl pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12 p-5 sm:p-7 md:p-8 lg:p-10">

                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    {/* Badge */}
                    <div className={`inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-5 ${badgeCls}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {b.badge}
                    </div>

                    {/* Headline */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-[1.15] mb-4 max-w-xl">
                      {b.headline}
                    </h2>

                    {/* Body */}
                    <p className="text-white/55 text-sm sm:text-base leading-relaxed mb-7 max-w-lg">
                      {b.body}
                    </p>

                    {/* Stats */}
                    {b.stats?.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                        {b.stats.map((s, i) => (
                          <div key={i} className="rounded-2xl px-4 py-3.5 border border-white/10"
                            style={{ background: 'rgba(255,255,255,0.07)' }}>
                            <div className={`text-2xl sm:text-3xl font-extrabold leading-none mb-1 ${accentText}`}>{s.value}</div>
                            <div className="text-white/40 text-[11px] leading-snug">{s.label}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    {isExternal
                      ? <a href={b.ctaLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-white text-gray-900 font-extrabold px-7 py-3.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-xl text-sm sm:text-base">
                          {b.ctaLabel} <ArrowRight size={16} />
                        </a>
                      : <Link to={b.ctaLink}
                          className="inline-flex items-center gap-2 bg-white text-gray-900 font-extrabold px-7 py-3.5 rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-xl text-sm sm:text-base">
                          {b.ctaLabel} <ArrowRight size={16} />
                        </Link>
                    }
                  </div>

                  {/* Right — "What you get" glass card */}
                  {b.bullets?.filter(Boolean).length > 0 && (
                    <div
                      className="shrink-0 w-full lg:w-68 xl:w-72 rounded-2xl p-5 sm:p-6 border border-white/12 backdrop-blur-md"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      <p className="font-extrabold text-white text-sm mb-4 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${accentText.replace('text-', 'bg-')}`} />
                        What you get
                      </p>
                      <div>
                        {b.bullets.filter(Boolean).map((item, i) => (
                          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/8 last:border-0">
                            <CheckCircle size={14} className={`${checkCls} shrink-0`} />
                            <span className="text-white/70 text-sm leading-snug">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="bg-gray-950 py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-16 items-start">

            {/* Left — sticky header */}
            <div className="lg:sticky lg:top-24">
              <span className="inline-block text-green-400 text-[11px] font-extrabold uppercase tracking-[0.2em] mb-4">FAQ</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Got questions?<br />
                <em className="text-green-400 not-italic">We have answers.</em>
              </h2>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6 max-w-xs">
                Everything you need to know about schools, listings, study abroad and more.
              </p>
              <Link to="/contact"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold text-sm px-5 py-2.5 rounded-full transition shadow-lg shadow-green-900/30">
                Ask a question <ArrowRight size={14} />
              </Link>

              {/* Decorative stat */}
              <div className="mt-10 gap-6 hidden lg:flex">
                {[['6', 'Common topics'], ['< 1 min', 'Avg. read time']].map(([v, l]) => (
                  <div key={l}>
                    <div className="text-2xl font-extrabold text-white">{v}</div>
                    <div className="text-gray-600 text-xs mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — accordion */}
            <div className="space-y-2">
              {FAQS.map((faq) => <FAQItem key={faq.q} {...faq} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRENDING TOPICS ───────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '70vh' }}
        aria-label="Trending Topics">
        {/* Dark background with dot grid */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,#021a0e 0%,#042f1e 50%,#064e3b 100%)' }} />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-green-500/40 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-175 h-100 rounded-full bg-green-700/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-14 flex flex-col" style={{ minHeight: '70vh' }}>
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-green-900/60 border border-green-700/40 text-green-300 text-[11px] font-bold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full">
                <Flame size={11} className="text-orange-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Trending Topics
              </div>
              <h2 className="text-white font-extrabold text-xl sm:text-2xl">
                What students are reading
              </h2>
            </div>
            <Link to="/blog"
              className="hidden sm:flex items-center gap-1.5 text-green-400 hover:text-green-300 text-sm font-semibold transition">
              View all articles <ArrowRight size={14} />
            </Link>
          </div>

          {/* Posts grid */}
          {trendingPosts.length > 0 ? (
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Large featured card */}
              {trendingPosts[0] && (
                <Link to={`/blog/${trendingPosts[0].slug}`}
                  className="group col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer">
                  <div className="absolute inset-0">
                    {trendingPosts[0].coverImage ? (
                      <img src={trendingPosts[0].coverImage} alt={trendingPosts[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-green-900" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-gray-950/95 via-gray-950/50 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {trendingPosts[0].category}
                      </span>
                      <span className="flex items-center gap-1 text-white/40 text-[10px]">
                        <TrendingUp size={9} /> #1 trending
                      </span>
                    </div>
                    <h3 className="text-white font-extrabold text-lg leading-snug mb-2 group-hover:text-green-300 transition line-clamp-3">
                      {trendingPosts[0].title}
                    </h3>
                    <div className="flex items-center gap-3 text-white/40 text-xs">
                      {trendingPosts[0].readTime && <span className="flex items-center gap-1"><Clock size={10} />{trendingPosts[0].readTime} min</span>}
                      {trendingPosts[0].views > 0 && <span className="flex items-center gap-1"><Eye size={10} />{trendingPosts[0].views.toLocaleString()}</span>}
                    </div>
                  </div>
                </Link>
              )}

              {/* Smaller cards */}
              {trendingPosts.slice(1, 8).map((post, i) => (
                <Link key={post._id} to={`/blog/${post.slug}`}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer min-h-35">
                  <div className="absolute inset-0">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-green-900 to-green-950" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-gray-950/90 via-gray-950/40 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-[9px] text-green-400/70 font-bold uppercase tracking-wider">#{i + 2}</span>
                    <h4 className="text-white text-xs font-bold leading-snug line-clamp-2 group-hover:text-green-300 transition mt-0.5">
                      {post.title}
                    </h4>
                    {post.readTime && (
                      <span className="flex items-center gap-1 text-white/30 text-[10px] mt-1">
                        <Clock size={9} />{post.readTime} min
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Fallback CTA when no posts loaded yet */
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="inline-flex items-center gap-2 bg-green-900/60 border border-green-700/40 text-green-300 text-[11px] font-bold uppercase tracking-[0.18em] px-4 py-2 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Free for students &amp; parents
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-5"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Start your school search today —{' '}
                <em className="text-green-400">it&apos;s free.</em>
              </h2>
              <p className="text-green-200/60 text-sm mb-8 max-w-md mx-auto">
                Join over 10,000 families who found their ideal school or university placement.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register"
                  className="bg-white text-green-950 font-extrabold px-8 py-4 rounded-2xl hover:bg-green-50 transition text-sm shadow-xl">
                  Create Free Account →
                </Link>
                <Link to="/blog"
                  className="border border-green-600/50 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-green-800/30 transition text-sm">
                  Read Our Blog
                </Link>
              </div>
            </div>
          )}

          {/* Bottom CTA strip */}
          {trendingPosts.length > 0 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {['10,000+ Families', '500+ Schools', '95% Visa Success', 'Always Free'].map((t, i) => (
                  <div key={t} className="flex items-center gap-1.5">
                    {i > 0 && <span className="w-px h-3 bg-green-800 hidden sm:block" />}
                    <CheckCircle size={11} className="text-green-400 shrink-0" />
                    <span className="text-green-300/60 text-xs font-medium">{t}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link to="/register"
                  className="bg-white text-green-950 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-green-50 transition shadow-lg">
                  Get Started Free →
                </Link>
                <Link to="/blog"
                  className="border border-green-600/40 text-green-300 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-green-800/30 transition sm:flex hidden items-center gap-1.5">
                  <BookOpen size={13} /> All Articles
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
