import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { useFadeIn, useSlideIn, useScrollAnimation } from '../hooks/useGsapAnimations';
import {
  Search, SlidersHorizontal, CheckCircle, ArrowRight,
  Star, ChevronDown, BookOpen, Globe, BarChart3, Shield, X,
  ChevronLeft, ChevronRight, MessageSquare, GraduationCap, LayoutDashboard,
  Clock, Eye, MapPin, Building2, Wallet,
} from 'lucide-react';
import api from '../utils/api';
import SchoolCard from '../components/SchoolCard';
import toast from 'react-hot-toast';
import heroQualityDriven from '../assets/hero/global-sourcing.png';
import heroStudentsFocused from '../assets/hero/students-focused.png';
import heroGlobalSourcing from '../assets/hero/global-sourcing.png';
import { NIGERIAN_STATES, NIGERIAN_LGAS, BUDGET_OPTIONS, EMPTY_FILTERS } from '../utils/schoolFilters';


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
        className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 text-left gap-4"
      >
        <span className="font-semibold text-white text-[12px] sm:text-[15px] leading-snug pr-2"
          style={{ fontFamily: "'Poppins', 'Georgia', sans-serif" }}>
          {q}
        </span>
        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${open ? 'bg-green-600 text-white rotate-180' : 'bg-gray-800 text-gray-500'}`}>
          <ChevronDown size={13} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-gray-400 text-[11px] sm:text-sm leading-relaxed border-t border-white/5 pt-3">
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
    cardDesc: 'Education Naija & Overseas was founded with the promise of connecting families to the most verified, high-quality schools across Nigeria and West Africa — with smart tools to compare and decide with confidence.',
    cardBg: 'bg-white',
    cardText: 'text-gray-900',
    cardDesc2: 'text-gray-500',
    cardBadge: 'bg-emerald-700 text-white',
    headline: 'Find the perfect school\nfor your child.',
    highlight: 'Compare & decide.',
    subtitle: "Nigeria's smartest school discovery platform — search, filter and compare hundreds of verified schools across Nigeria and West Africa.",
    // African students studying together — warm, relatable, community feel
    bg: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1920&q=80',
    personImg: heroQualityDriven,
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
    personImg: heroStudentsFocused,
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
    // Graduation moment — caps thrown, global academic success
    bg: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1920&q=80',
    personImg: heroGlobalSourcing,
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

// Compact spotlight card used right under the hero — "top choice near you" / "featured pick"
function SpotlightCard({ kicker, icon: Icon, accent, loading, school }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="h-32 sm:h-40 bg-gray-200 animate-pulse" />
        <div className="p-4 space-y-2.5">
          <div className="h-3 w-24 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <Link to="/schools" className="rounded-2xl border border-gray-100 bg-gray-50 p-6 flex flex-col items-center justify-center text-center gap-2 hover:shadow-md hover:bg-gray-100 transition min-h-52">
        <Icon size={22} className="text-gray-400" />
        <p className="text-sm font-semibold text-gray-600">More schools coming to this list soon</p>
        <span className="text-xs text-green-700 font-bold inline-flex items-center gap-1">
          Browse all schools <ArrowRight size={11} />
        </span>
      </Link>
    );
  }

  const href = `/schools/${school.slug || school._id}`;
  const place = [school.city, school.state].filter(Boolean).join(', ');

  return (
    <Link
      to={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-32 sm:h-40 overflow-hidden bg-linear-to-br from-emerald-50 to-green-100 shrink-0">
        {school.images?.[0] ? (
          <img
            src={school.images[0]}
            alt={school.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={26} className="text-green-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/5 to-transparent" />
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 bg-linear-to-r ${accent} text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md`}>
          <Icon size={11} /> {kicker}
        </span>
        {place && (
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1 text-white text-[11px] font-semibold">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{place}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-4 flex-1">
        <h3 className="font-extrabold text-gray-900 text-[14px] sm:text-[15px] leading-snug line-clamp-1 group-hover:text-green-700 transition">
          {school.name}
        </h3>
        {school.fees?.tuition ? (
          <p className="text-xs text-gray-500">
            <span className="font-bold text-gray-900">₦{Number(school.fees.tuition).toLocaleString()}</span> / year
          </p>
        ) : (
          <p className="text-xs text-gray-400 capitalize">{school.type ? `${school.type} school` : 'Verified school'}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-green-700 group-hover:gap-2 transition-all">
          View Profile <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}

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
  const [featureSlide, setFeatureSlide] = useState(0);
  const [featuredSchools, setFeaturedSchools] = useState([]);
  const [featuredSchoolSlide, setFeaturedSchoolSlide] = useState(0);
  const [featuredPaused, setFeaturedPaused] = useState(false);
  const [showAllMobile, setShowAllMobile] = useState(false);

  // Spotlight row (right under hero) — top choice near you, featured pick, many more
  const [setDetectedState] = useState('');
  const [setDetectedLga] = useState('');
  const [spotlightNear, setSpotlightNear] = useState(null);
  const [spotlightFeatured, setSpotlightFeatured] = useState(null);
  const [spotlightLoading, setSpotlightLoading] = useState(true);
  const [editorSlide, setEditorSlide] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const matchState = (region) => {
      const r = region.toLowerCase();
      if (r.includes('abuja') || r.includes('federal capital')) return 'FCT';
      return NIGERIAN_STATES.find((s) => r.includes(s.toLowerCase()) || s.toLowerCase().includes(r)) || '';
    };

    // 1. Ask the browser for precise GPS coordinates (user gets a permission prompt).
    const requestGPS = () => new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      const timer = setTimeout(() => resolve(null), 8000);
      navigator.geolocation.getCurrentPosition(
        (pos) => { clearTimeout(timer); resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }); },
        () => { clearTimeout(timer); resolve(null); },
        { timeout: 7000, maximumAge: 10 * 60 * 1000 }
      );
    });

    // 2. Reverse-geocode those coordinates down to state + local government area.
    const reverseGeocode = async ({ lat, lon }) => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
          { signal: controller.signal }
        );
        clearTimeout(timer);
        const data = await res.json();
        if ((data.countryCode || '').toUpperCase() !== 'NG') return { state: '', lga: '' };
        const state = matchState(data.principalSubdivision || '');
        const lgaEntry = (data.localityInfo?.administrative || [])
          .find((a) => (a.description || '').toLowerCase().includes('local government'));
        const lga = (lgaEntry?.name || data.locality || '').trim();
        return { state, lga };
      } catch {
        return { state: '', lga: '' };
      }
    };

    // 3. Fallback if GPS is denied/unavailable — coarser IP-based state/city guess.
    const detectViaIP = async () => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('https://ipwho.is/', { signal: controller.signal });
        clearTimeout(timer);
        const geo = await res.json();
        if (geo?.success === false || geo?.country_code !== 'NG') return { state: '', lga: '' };
        return { state: matchState(geo.region || ''), lga: (geo.city || '').trim() };
      } catch {
        return { state: '', lga: '' };
      }
    };

    const detectLocation = async () => {
      const gps = await requestGPS();
      if (gps) {
        const geo = await reverseGeocode(gps);
        if (geo.state) return geo;
      }
      return detectViaIP();
    };

    (async () => {
      const { state: userState, lga: userLga } = await detectLocation();
      if (cancelled) return;
      setDetectedState(userState);
      setDetectedLga(userLga);

      try {
        // Near You — only schools actually in the user's detected state/LGA. No cross-state fallback.
        let near = null;
        if (userState) {
          if (userLga) {
            const lgaRes = await api.get('/schools', { params: { state: userState, lga: userLga, limit: 1 } });
            near = lgaRes.data.schools?.[0] || null;
            if (!near) {
              const cityRes = await api.get('/schools', { params: { state: userState, city: userLga, limit: 1 } });
              near = cityRes.data.schools?.[0] || null;
            }
          }
          if (!near) {
            const stateRes = await api.get('/schools', { params: { state: userState, limit: 1 } });
            near = stateRes.data.schools?.[0] || null;
          }
        }
        if (cancelled) return;
        setSpotlightNear(near);

        // Featured — if nothing is admin-featured, fall back to the highest-rated, most-reviewed school.
        const featuredRes = await api.get('/schools', { params: { featured: 'true', limit: 2 } });
        let featuredList = featuredRes.data.schools || [];
        if (featuredList.length === 0) {
          const topRated = await api.get('/schools', { params: { sort: 'rating', limit: 2 } });
          featuredList = (topRated.data.schools || []).filter((s) => s.rating > 0);
        }
        if (cancelled) return;
        const featuredPick = featuredList.find((s) => s._id !== near?._id) || featuredList[0] || null;
        setSpotlightFeatured(featuredPick);
      } catch {
        /* silent — spotlight cards fall back to their empty state */
      } finally {
        if (!cancelled) setSpotlightLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Featured blog post (admin-chosen) + 4 most recent
  const [featuredPost, setFeaturedPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  useEffect(() => {
    api.get('/blog/featured').then(({ data }) => setFeaturedPost(data.post || null)).catch(() => {});
    api.get('/blog', { params: { limit: 3 } }).then(({ data }) => setRecentPosts(data.posts || [])).catch(() => {});
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

  // Hero — single static slide
  const hero = HERO_SLIDES[0];

  // Hero live-search dropdown
  const [heroQuery, setHeroQuery] = useState('');
  const [dropdownResults, setDropdownResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [stateExplPage, setStateExplPage] = useState(1);
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
      if (f.lga) params.lga = f.lga;
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
      lga:        sp.get('lga')        || '',
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
  }, [location.search]);

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
    if (key === 'state') next.lga = '';
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

  useEffect(() => {
    api.get('/schools', { params: { featured: 'true', limit: 8 } })
      .then(({ data }) => setFeaturedSchools(data.schools || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (featuredPaused || featuredSchools.length <= 1) return;
    const t = setInterval(() => setFeaturedSchoolSlide((s) => (s + 1) % featuredSchools.length), 3500);
    return () => clearInterval(t);
  }, [featuredPaused, featuredSchools.length]);

  const activeCount = [
    filters.state, filters.lga, filters.type, filters.level, filters.curriculum,
    filters.minFee || filters.maxFee,
  ].filter(Boolean).length;

  // Animation refs
  const heroHeadingRef = useFadeIn(0.8, 0.2);
  useSlideIn('up', 0.8, 0.4);
  const ctaRef = useSlideIn('up', 0.8, 0.5);
  useScrollAnimation('fadeIn', { duration: 0.8 });
  //const featuresRef = useScrollAnimation('slideUp', { duration: 0.8 });

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative flex flex-col overflow-hidden">
        {/* Background — cinematic multi-layer */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat sm:hidden hero-bg-animate"
            style={{ backgroundImage: `url('${hero.bg.split('?')[0]}?auto=format&fit=crop&w=800&h=600&crop=focalpoint&q=80')` }}
          />
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden sm:block hero-bg-animate"
            style={{ backgroundImage: `url('${hero.bg}')` }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className={`absolute inset-0 bg-linear-to-r ${hero.accent} to-transparent`} />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 90% at 15% 55%, transparent 35%, rgba(0,0,0,0.35) 100%)' }} />
        </div>

        {/* Foreground person — desktop XL only */}
        <div className="absolute bottom-0 right-0 w-[44%] z-20 hidden xl:block pointer-events-none overflow-hidden h-[85%]">
          <img
            src={hero.personImg}
            alt=""
            className="absolute bottom-0 right-0 h-full w-full object-contain object-bottom"
          />
        </div>

        {/* Main content */}
        <div className="relative z-20">
          <div className="w-full xl:w-[56%] xl:ml-[6%] px-4 sm:px-8 lg:px-14 xl:px-0 pt-6 pb-4 sm:pt-8 sm:pb-6 md:pt-10 md:pb-8 flex flex-col items-center sm:items-start">

            {/* Headline */}
            <h1
              ref={heroHeadingRef}
              className="font-inter text-[1.85rem] xs:text-[2.1rem] sm:text-[2.6rem] lg:text-[3.1rem] xl:text-[3.6rem] font-bold text-white leading-[1.12] mb-3 sm:mb-4 text-center sm:text-left tracking-tight"
              style={{ textShadow: '0 2px 30px rgba(0,0,0,0.35)' }}
            >
              {hero.headline.split('\n').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
              <span className="text-green-300">{hero.highlight}</span>
            </h1>

            {/* Search bar */}
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

            {/* Stats row — simplified on mobile */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-5 mb-3 sm:mb-5">
              {hero.stats.map((stat, i) => (
                <div key={stat} className="flex items-center gap-1.5">
                  {i > 0 && <span className="w-px h-3 bg-white/20 shrink-0 hidden sm:block" />}
                  <CheckCircle size={10} className="text-green-400 shrink-0" />
                  <span className="text-white/80 text-[11px] sm:text-[13px] font-medium">{stat}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div ref={ctaRef} className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition shadow-lg shadow-green-900/30 text-[12px] sm:text-[13px]">
                Browse Schools <ArrowRight size={13} />
              </button>
              <Link to="/compare"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/25 hover:bg-white/20 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition text-[12px] sm:text-[13px]">
                Compare Schools
              </Link>
            </div>

          </div>
        </div>

        {/* ── FEATURE STRIP ─────────────────────────────────────────── */}
        <div className="relative z-20 px-3 sm:px-6 lg:px-10 pb-5 sm:pb-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            {[
              {
                step: '01', label: 'Quality Driven',
                desc: 'Connecting families to verified, high-quality schools across Nigeria and West Africa — with smart tools to compare and decide.',
                icon: Shield, accent: 'from-green-400 to-emerald-300',
                href: '#browse', active: true,
              },
              {
                step: '02', label: 'Students Focused',
                desc: 'We guide school owners and parents through listing, discovery, and enrolment — putting students at the centre of every decision.',
                icon: GraduationCap, accent: 'from-blue-400 to-sky-300',
                href: '/list-your-school', active: false,
              },
              {
                step: '03', label: 'Global Sourcing',
                desc: 'Pioneers in overseas education for West Africa — placing students in top universities across the UK, Canada, USA, Australia and more.',
                icon: Globe, accent: 'from-violet-400 to-purple-300',
                href: '/study-abroad', active: false,
              },
            ].map(({ step, label, desc, icon: Icon, accent, href, active }) => (
              <Link
                key={step}
                to={href}
                onClick={href === '#browse' ? (e) => { e.preventDefault(); document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth' }); } : undefined}
                className={`group relative flex flex-col gap-1.5 sm:gap-3 px-3 sm:px-5 lg:px-6 py-3 sm:py-5 rounded-xl sm:rounded-2xl border backdrop-blur-xl transition-all duration-300 overflow-hidden
                  ${active
                    ? 'bg-white/12 border-green-400/40 shadow-lg shadow-green-950/30'
                    : 'bg-white/4 border-white/[0.07] hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/20'}`}
              >
                {/* Top gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r ${accent} transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />

                {/* Step + icon row */}
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] sm:text-[10px] font-black tracking-[0.22em] uppercase tabular-nums ${active ? 'text-green-400' : 'text-white/25 group-hover:text-white/45 transition-colors'}`}>
                    {step}
                  </span>
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300
                    ${active ? 'bg-green-400/15 text-green-400' : 'bg-white/5 text-white/20 group-hover:bg-white/10 group-hover:text-white/40'}`}>
                    <Icon size={12} className="sm:hidden" />
                    <Icon size={16} className="hidden sm:block" />
                  </div>
                </div>

                {/* Title */}
                <h3 className={`font-bold text-[11px] sm:text-sm leading-tight transition-colors duration-300
                  ${active ? 'text-white' : 'text-white/40 group-hover:text-white/70'}`}>
                  {label}
                </h3>

                {/* Description — hidden on mobile */}
                <p className={`hidden sm:block text-[11px] leading-relaxed line-clamp-2 lg:line-clamp-3 transition-colors duration-300
                  ${active ? 'text-white/55' : 'text-white/20 group-hover:text-white/40'}`}>
                  {desc}
                </p>

                {/* CTA arrow — desktop only */}
                <div className={`hidden lg:flex items-center gap-1 mt-auto text-[10px] font-semibold transition-all duration-300
                  ${active ? 'text-green-400' : 'text-white/20 group-hover:text-white/50'}`}>
                  Learn more <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Active pulse dot */}
                {active && <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
              </Link>
            ))}
          </div>
        </div>

      </section>

      {/* ── POPULAR LISTINGS ─────────────────────────────────────────── */}
      <section className="px-4 pt-8 sm:pt-12 pb-8 sm:pb-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-5 sm:mb-7">
            <div>
              <p className="text-green-600 font-semibold text-[11px] sm:text-xs uppercase tracking-widest mb-1">Editor's Choice</p>
              <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 tracking-tight">Popular Listings</h2>
              <p className="text-gray-400 text-xs mt-1">Hand-picked schools by our editorial team</p>
            </div>
            <Link to="/schools?featured=true"
              className="text-xs font-semibold text-green-700 hover:text-green-800 hover:underline transition whitespace-nowrap">
              View all →
            </Link>
          </div>

          {spotlightLoading ? (
            <>
              {/* Mobile skeleton: single card */}
              <div className="lg:hidden rounded-2xl bg-gray-100 animate-pulse h-64" />
              {/* Desktop skeleton: 4 cards */}
              <div className="hidden lg:grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-64" />
                ))}
              </div>
            </>
          ) : (() => {
            const editorCards = [spotlightNear, spotlightFeatured].filter(Boolean)
              .concat(featuredSchools.filter(s =>
                s._id !== spotlightNear?._id && s._id !== spotlightFeatured?._id
              ))
              .slice(0, 4);

            const CardItem = ({ school, idx }) => school ? (
              <Link to={`/schools/${school.slug || school._id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white hover:border-green-200 hover:shadow-md transition-all duration-200 h-full">
                <div className="relative h-48 overflow-hidden bg-green-50 shrink-0">
                  {school.images?.[0] ? (
                    <img src={school.images[0]} alt={school.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-5xl font-black text-white
                      ${['bg-green-700','bg-emerald-600','bg-teal-600','bg-green-800'][idx % 4]}`}>
                      {school.name?.[0] || '?'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Popular
                  </span>
                  {school.rating > 0 && (
                    <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 text-amber-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      <Star size={10} fill="currentColor" /> {school.rating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="flex-1 p-4 flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
                    {school.name}
                  </h3>
                  {(school.lga || school.state) && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin size={10} className="shrink-0" />
                      {[school.lga, school.state].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {school.type && (
                    <span className="self-start mt-1 text-[10px] font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                      {school.type}
                    </span>
                  )}
                </div>
              </Link>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 h-64 flex items-center justify-center">
                <p className="text-xs text-gray-300 text-center px-3">No school selected yet</p>
              </div>
            );

            const allSlots = [
              ...editorCards,
              ...Array.from({ length: Math.max(0, 4 - editorCards.length) }, () => null),
            ];

            return (
              <>
                {/* ── Mobile: single-card slideshow ── */}
                <div className="lg:hidden">
                  <div className="relative">
                    <div className="overflow-hidden rounded-2xl">
                      <CardItem school={allSlots[editorSlide]} idx={editorSlide} />
                    </div>

                    {/* Prev button */}
                    <button
                      onClick={() => setEditorSlide(i => (i - 1 + allSlots.length) % allSlots.length)}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-green-700 transition"
                      aria-label="Previous">
                      <ChevronLeft size={16} />
                    </button>

                    {/* Next button */}
                    <button
                      onClick={() => setEditorSlide(i => (i + 1) % allSlots.length)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:text-green-700 transition"
                      aria-label="Next">
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Dot indicators */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {allSlots.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setEditorSlide(i)}
                        className={`transition-all duration-200 rounded-full ${i === editorSlide ? 'w-5 h-2 bg-green-600' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Desktop: 4-column grid ── */}
                <div className="hidden lg:grid grid-cols-4 gap-4">
                  {allSlots.map((school, idx) => (
                    <CardItem key={school?._id || `empty-${idx}`} school={school} idx={idx} />
                  ))}
                </div>
              </>
            );
          })()}
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
            <div className="mb-8">

              {/* Active chips bar */}
              {activeCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap mb-4 px-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Active:</span>
                  {filters.state && (
                    <button onClick={() => updateFilter('state', '')}
                      className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      <MapPin size={10} /> {filters.state} <X size={9} />
                    </button>
                  )}
                  {filters.lga && (
                    <button onClick={() => updateFilter('lga', '')}
                      className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      <Building2 size={10} /> {filters.lga} <X size={9} />
                    </button>
                  )}
                  {filters.type && (
                    <button onClick={() => updateFilter('type', '')}
                      className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition capitalize">
                      <LayoutDashboard size={10} /> {filters.type} <X size={9} />
                    </button>
                  )}
                  {filters.level && (
                    <button onClick={() => updateFilter('level', '')}
                      className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition capitalize">
                      <GraduationCap size={10} /> {filters.level} <X size={9} />
                    </button>
                  )}
                  {filters.curriculum && (
                    <button onClick={() => updateFilter('curriculum', '')}
                      className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      <BookOpen size={10} /> {filters.curriculum} <X size={9} />
                    </button>
                  )}
                  {(filters.minFee || filters.maxFee) && (
                    <button onClick={() => setBudget('', '')}
                      className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition">
                      <Wallet size={10} />
                      {filters.minFee ? `₦${Number(filters.minFee).toLocaleString()}` : '₦0'}
                      {' – '}
                      {filters.maxFee ? `₦${Number(filters.maxFee).toLocaleString()}` : 'Any'}
                      <X size={9} />
                    </button>
                  )}
                  <button onClick={clearFilters}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-red-500 font-semibold hover:text-red-700 transition shrink-0">
                    <X size={12} /> Clear all
                  </button>
                </div>
              )}

              {/* 6-card filter grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* ── Card 1: State ── */}
                <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.state ? 'border-emerald-300 shadow-emerald-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <MapPin size={15} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Location</p>
                      <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                        {filters.state || 'All States'}
                      </p>
                    </div>
                    {filters.state && (
                      <button onClick={() => updateFilter('state', '')}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <select
                      value={filters.state}
                      onChange={(e) => updateFilter('state', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-gray-50 text-gray-700 transition appearance-none cursor-pointer">
                      <option value="">All States</option>
                      {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <div className="flex flex-wrap gap-1.5">
                      {['Lagos', 'FCT', 'Kano', 'Rivers', 'Ogun', 'Oyo'].map((s) => (
                        <button key={s} onClick={() => updateFilter('state', filters.state === s ? '' : s)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                            filters.state === s
                              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Card 2: LGA ── */}
                <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.lga ? 'border-teal-300 shadow-teal-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                      <Building2 size={15} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Local Gov. Area</p>
                      <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                        {filters.lga || (filters.state ? `All LGAs` : 'Select state first')}
                      </p>
                    </div>
                    {filters.lga && (
                      <button onClick={() => updateFilter('lga', '')}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <div className="p-4">
                    {!filters.state ? (
                      <div className="flex flex-col items-center justify-center py-5 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                          <MapPin size={18} className="text-gray-200" />
                        </div>
                        <p className="text-xs text-gray-400 leading-snug">Select a state first to<br />filter by local government</p>
                      </div>
                    ) : (
                      <select
                        value={filters.lga}
                        onChange={(e) => updateFilter('lga', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 bg-gray-50 text-gray-700 transition appearance-none cursor-pointer">
                        <option value="">All LGAs in {filters.state}</option>
                        {(NIGERIAN_LGAS[filters.state] || []).map((l) => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* ── Card 3: School Type ── */}
                <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.type ? 'border-blue-300 shadow-blue-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <LayoutDashboard size={15} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">School Type</p>
                      <p className="text-sm font-bold text-gray-800 leading-tight truncate capitalize">
                        {filters.type || 'Any Type'}
                      </p>
                    </div>
                    {filters.type && (
                      <button onClick={() => updateFilter('type', '')}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-2">
                    {[
                      { value: 'private',       label: 'Private',       emoji: '🏛️' },
                      { value: 'public',        label: 'Public',        emoji: '🏫' },
                      { value: 'federal',       label: 'Federal',       emoji: '🏦' },
                      { value: 'international', label: 'International', emoji: '🌍' },
                    ].map(({ value, label, emoji }) => {
                      const active = filters.type === value;
                      return (
                        <button key={value} onClick={() => updateFilter('type', active ? '' : value)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 transition ${
                            active
                              ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                              : 'border-gray-100 text-gray-600 hover:border-blue-200 hover:bg-blue-50/40 bg-gray-50/80'
                          }`}>
                          <span className="text-sm">{emoji}</span>
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Card 4: School Level ── */}
                <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.level ? 'border-violet-300 shadow-violet-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                      <GraduationCap size={15} className="text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">School Level</p>
                      <p className="text-sm font-bold text-gray-800 leading-tight truncate capitalize">
                        {filters.level === 'both' ? 'All Levels' : filters.level || 'Any Level'}
                      </p>
                    </div>
                    {filters.level && (
                      <button onClick={() => updateFilter('level', '')}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    {[
                      { value: 'primary',   label: 'Primary School',   sub: 'JSS 1 – 3' },
                      { value: 'secondary', label: 'Secondary School', sub: 'SS 1 – 3' },
                      { value: 'both',      label: 'All Levels',       sub: 'Primary + Secondary' },
                    ].map(({ value, label, sub }) => {
                      const active = filters.level === value;
                      return (
                        <button key={value} onClick={() => updateFilter('level', active ? '' : value)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs border-2 transition ${
                            active
                              ? 'bg-violet-50 border-violet-400 text-violet-800 shadow-sm'
                              : 'border-gray-100 text-gray-600 hover:border-violet-200 hover:bg-violet-50/40 bg-gray-50/80'
                          }`}>
                          <span className="font-semibold">{label}</span>
                          <span className={`text-[10px] ${active ? 'text-violet-500' : 'text-gray-400'}`}>{sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Card 5: Curriculum ── */}
                <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${filters.curriculum ? 'border-orange-300 shadow-orange-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                      <BookOpen size={15} className="text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Curriculum</p>
                      <p className="text-sm font-bold text-gray-800 leading-tight">
                        {filters.curriculum || 'Any Curriculum'}
                      </p>
                    </div>
                    {filters.curriculum && (
                      <button onClick={() => updateFilter('curriculum', '')}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-2">
                    {[
                      { value: 'WAEC',      color: 'bg-green-600'  },
                      { value: 'NECO',      color: 'bg-blue-600'   },
                      { value: 'IGCSE',     color: 'bg-purple-600' },
                      { value: 'IB',        color: 'bg-red-600'    },
                      { value: 'Cambridge', color: 'bg-indigo-600' },
                      { value: 'BECE',      color: 'bg-teal-600'   },
                    ].map(({ value, color }) => {
                      const active = filters.curriculum === value;
                      return (
                        <button key={value} onClick={() => updateFilter('curriculum', active ? '' : value)}
                          className={`relative py-2.5 rounded-xl text-xs font-bold border-2 transition text-center overflow-hidden ${
                            active
                              ? 'border-orange-400 text-orange-800 bg-orange-50 shadow-sm'
                              : 'border-gray-100 text-gray-600 hover:border-orange-200 hover:bg-orange-50/40 bg-gray-50/80'
                          }`}>
                          {active && <span className={`absolute top-0 left-0 right-0 h-0.5 ${color}`} />}
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Card 6: Budget ── */}
                <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all duration-200 ${(filters.minFee || filters.maxFee) ? 'border-rose-300 shadow-rose-50' : 'border-gray-100'}`}>
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                      <Wallet size={15} className="text-rose-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Annual Fee Budget</p>
                      <p className="text-sm font-bold text-gray-800 leading-tight truncate">
                        {(filters.minFee || filters.maxFee)
                          ? `${filters.minFee ? `₦${Number(filters.minFee).toLocaleString()}` : '₦0'} – ${filters.maxFee ? `₦${Number(filters.maxFee).toLocaleString()}` : 'Any'}`
                          : 'Any Budget'}
                      </p>
                    </div>
                    {(filters.minFee || filters.maxFee) && (
                      <button onClick={() => setBudget('', '')}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition shrink-0">
                        <X size={11} />
                      </button>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-2">
                    {BUDGET_OPTIONS.map(({ label, min, max }) => {
                      const active = filters.minFee === min && filters.maxFee === max;
                      return (
                        <button key={label} onClick={() => setBudget(min, max)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border-2 transition ${
                            active
                              ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-sm'
                              : 'border-gray-100 text-gray-600 hover:border-rose-200 hover:bg-rose-50/40 bg-gray-50/80'
                          }`}>
                          <span>{label}</span>
                          {active && <CheckCircle size={13} className="text-rose-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Footer summary */}
              <div className="mt-4 flex items-center justify-between px-1">
                <p className="text-sm text-gray-500">
                  {loading
                    ? <span className="text-gray-400">Searching…</span>
                    : <><span className="font-bold text-gray-900">{total.toLocaleString()}</span> school{total !== 1 ? 's' : ''} match your filters</>
                  }
                </p>
                {activeCount > 0 && (
                  <button onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-sm text-red-500 font-semibold hover:text-red-700 transition">
                    <X size={13} /> Clear all filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── MOBILE: featured schools carousel ─────────────────── */}
          <div className="sm:hidden">
            {!showAllMobile ? (
              <>
                {/* Carousel */}
                {featuredSchools.length === 0 ? (
                  <div className="bg-white rounded-2xl h-72 skeleton-shimmer border border-gray-100" />
                ) : (
                  <div
                    onMouseEnter={() => setFeaturedPaused(true)}
                    onMouseLeave={() => setFeaturedPaused(false)}
                    onTouchStart={() => setFeaturedPaused(true)}
                    onTouchEnd={() => setFeaturedPaused(false)}
                  >
                    {/* Sliding track */}
                    <div className="overflow-hidden rounded-2xl">
                      <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${featuredSchoolSlide * 100}%)` }}
                      >
                        {featuredSchools.map((school) => (
                          <div key={school._id} className="w-full shrink-0">
                            <SchoolCard school={school} onCompare={handleCompare}
                              isSelected={!!selected.find((s) => s._id === school._id)} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prev / Next arrows */}
                    <div className="flex items-center justify-between mt-3 px-1">
                      <button
                        onClick={() => { setFeaturedSchoolSlide((s) => (s - 1 + featuredSchools.length) % featuredSchools.length); setFeaturedPaused(true); }}
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-700 transition"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {/* Dot indicators */}
                      <div className="flex items-center gap-1.5">
                        {featuredSchools.map((_, i) => (
                          <button key={i} onClick={() => { setFeaturedSchoolSlide(i); setFeaturedPaused(true); }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${i === featuredSchoolSlide ? 'w-5 bg-green-600' : 'w-1.5 bg-gray-300'}`} />
                        ))}
                      </div>

                      <button
                        onClick={() => { setFeaturedSchoolSlide((s) => (s + 1) % featuredSchools.length); setFeaturedPaused(true); }}
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-700 transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* View All Schools button */}
                <button
                  onClick={() => setShowAllMobile(true)}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-green-600 text-green-700 font-bold text-sm hover:bg-green-50 transition"
                >
                  View All Schools <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <>
                {/* Back link */}
                <button
                  onClick={() => setShowAllMobile(false)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-green-700 mb-4 transition"
                >
                  <ChevronLeft size={15} /> Back to Featured
                </button>

                {/* All schools list */}
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl h-64 skeleton-shimmer border border-gray-100" />
                    ))}
                  </div>
                ) : schools.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <BookOpen size={36} className="mx-auto mb-3 opacity-40" />
                    <p className="font-medium text-gray-600 text-sm">No schools found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schools.map((school) => (
                      <SchoolCard key={school._id} school={school} onCompare={handleCompare}
                        isSelected={!!selected.find((s) => s._id === school._id)} />
                    ))}
                  </div>
                )}
                <Pagination page={currentPage} pages={pages} onPage={fetchSchools} />
              </>
            )}
          </div>

          {/* ── DESKTOP: full grid ─────────────────────────────────── */}
          {loading ? (
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 skeleton-shimmer border border-gray-100" />
              ))}
            </div>
          ) : schools.length === 0 ? (
            <div className="hidden sm:block text-center py-20 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium text-gray-600">No schools found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {schools.map((school) => (
                <div key={school._id}>
                  <SchoolCard school={school} onCompare={handleCompare}
                    isSelected={!!selected.find((s) => s._id === school._id)} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination — desktop only */}
          <div className="hidden sm:block">
            <Pagination page={currentPage} pages={pages} onPage={fetchSchools} />
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
                <span className="sm:hidden">Reviews &amp; Perspectives</span>
                <span className="hidden sm:inline">Parent Reviews &amp; Educator Perspectives</span>
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

      {/* ── EXPLORE TOP SCHOOLS ───────────────────────────────────── */}
      {(() => {
        const ALL_STATES = [
          { state: 'Lagos',      emoji: '🏙️', title: 'Best in Lagos',       sub: "Nigeria's education capital",    color: 'from-orange-50 to-amber-50',    border: 'border-orange-100',  hover: 'hover:border-orange-300 hover:shadow-orange-100'   },
          { state: 'FCT',        emoji: '🏛️', title: 'Abuja Schools',       sub: 'Federal Capital Territory',      color: 'from-blue-50 to-sky-50',        border: 'border-blue-100',    hover: 'hover:border-blue-300 hover:shadow-blue-100'       },
          { state: 'Kano',       emoji: '🌾', title: 'Kano Schools',        sub: "Northern Nigeria's finest",      color: 'from-yellow-50 to-lime-50',     border: 'border-yellow-100',  hover: 'hover:border-yellow-300 hover:shadow-yellow-100'   },
          { state: 'Rivers',     emoji: '🛢️', title: 'Port Harcourt',      sub: 'South-South excellence',         color: 'from-teal-50 to-emerald-50',    border: 'border-teal-100',    hover: 'hover:border-teal-300 hover:shadow-teal-100'       },
          { state: 'Ogun',       emoji: '🌲', title: 'Ogun Schools',        sub: 'Gateway to quality edu',         color: 'from-green-50 to-emerald-50',   border: 'border-green-100',   hover: 'hover:border-green-300 hover:shadow-green-100'     },
          { state: 'Enugu',      emoji: '⛏️', title: 'Enugu Schools',      sub: "Coal City's top picks",          color: 'from-stone-50 to-gray-50',      border: 'border-stone-100',   hover: 'hover:border-stone-300 hover:shadow-stone-100'     },
          { state: 'Oyo',        emoji: '🏯', title: 'Ibadan & Oyo',        sub: 'South-West academic hub',        color: 'from-purple-50 to-violet-50',   border: 'border-purple-100',  hover: 'hover:border-purple-300 hover:shadow-purple-100'   },
          { state: 'Delta',      emoji: '🌊', title: 'Delta State',         sub: 'Niger Delta excellence',         color: 'from-cyan-50 to-blue-50',       border: 'border-cyan-100',    hover: 'hover:border-cyan-300 hover:shadow-cyan-100'       },
          { state: 'Anambra',    emoji: '🏙️', title: 'Anambra Schools',    sub: 'Southeastern academic hub',      color: 'from-red-50 to-rose-50',        border: 'border-red-100',     hover: 'hover:border-red-300 hover:shadow-red-100'         },
          { state: 'Imo',        emoji: '🌿', title: 'Imo Schools',         sub: 'Eastern Nigeria excellence',     color: 'from-lime-50 to-green-50',      border: 'border-lime-100',    hover: 'hover:border-lime-300 hover:shadow-lime-100'       },
          { state: 'Kaduna',     emoji: '🏙️', title: 'Kaduna Schools',     sub: 'North-West education hub',       color: 'from-indigo-50 to-blue-50',     border: 'border-indigo-100',  hover: 'hover:border-indigo-300 hover:shadow-indigo-100'   },
          { state: 'Edo',        emoji: '🏛️', title: 'Edo Schools',        sub: 'Ancient city, modern learning',  color: 'from-amber-50 to-yellow-50',    border: 'border-amber-100',   hover: 'hover:border-amber-300 hover:shadow-amber-100'     },
          { state: 'Akwa Ibom',  emoji: '🛳️', title: 'Akwa Ibom',          sub: 'Oil-rich South-South state',     color: 'from-sky-50 to-blue-50',        border: 'border-sky-100',     hover: 'hover:border-sky-300 hover:shadow-sky-100'         },
          { state: 'Kwara',      emoji: '🏞️', title: 'Kwara Schools',      sub: 'State of harmony',               color: 'from-emerald-50 to-teal-50',    border: 'border-emerald-100', hover: 'hover:border-emerald-300 hover:shadow-emerald-100' },
          { state: 'Cross River',emoji: '🌿', title: 'Cross River',         sub: 'Nature and education combined',  color: 'from-green-50 to-lime-50',      border: 'border-green-100',   hover: 'hover:border-green-300 hover:shadow-green-100'     },
          { state: 'Abia',       emoji: '🏭', title: 'Abia Schools',        sub: 'Backbone of the East',           color: 'from-rose-50 to-pink-50',       border: 'border-rose-100',    hover: 'hover:border-rose-300 hover:shadow-rose-100'       },
          { state: 'Katsina',    emoji: '🕌', title: 'Katsina Schools',     sub: 'Historic northern state',        color: 'from-yellow-50 to-amber-50',    border: 'border-yellow-100',  hover: 'hover:border-yellow-300 hover:shadow-yellow-100'   },
          { state: 'Osun',       emoji: '🏛️', title: 'Osun Schools',       sub: 'State of the living spring',     color: 'from-violet-50 to-purple-50',   border: 'border-violet-100',  hover: 'hover:border-violet-300 hover:shadow-violet-100'   },
          { state: 'Plateau',    emoji: '🏔️', title: 'Plateau Schools',    sub: 'Home of peace and tourism',      color: 'from-slate-50 to-gray-50',      border: 'border-slate-100',   hover: 'hover:border-slate-300 hover:shadow-slate-100'     },
          { state: 'Benue',      emoji: '🌾', title: 'Benue Schools',       sub: 'Food basket of the nation',      color: 'from-lime-50 to-yellow-50',     border: 'border-lime-100',    hover: 'hover:border-lime-300 hover:shadow-lime-100'       },
          { state: 'Bauchi',     emoji: '🦁', title: 'Bauchi Schools',      sub: 'Pearl of the North',             color: 'from-orange-50 to-red-50',      border: 'border-orange-100',  hover: 'hover:border-orange-300 hover:shadow-orange-100'   },
          { state: 'Ondo',       emoji: '🌿', title: 'Ondo Schools',        sub: 'Sunshine state of learning',     color: 'from-yellow-50 to-green-50',    border: 'border-yellow-100',  hover: 'hover:border-yellow-300 hover:shadow-yellow-100'   },
          { state: 'Kogi',       emoji: '⛰️', title: 'Kogi Schools',       sub: 'Confluence state',               color: 'from-red-50 to-orange-50',      border: 'border-red-100',     hover: 'hover:border-red-300 hover:shadow-red-100'         },
          { state: 'Niger',      emoji: '🌊', title: 'Niger Schools',       sub: 'Power state of Nigeria',         color: 'from-blue-50 to-indigo-50',     border: 'border-blue-100',    hover: 'hover:border-blue-300 hover:shadow-blue-100'       },
          { state: 'Ekiti',      emoji: '🏔️', title: 'Ekiti Schools',      sub: 'Fountain of knowledge',          color: 'from-teal-50 to-cyan-50',       border: 'border-teal-100',    hover: 'hover:border-teal-300 hover:shadow-teal-100'       },
          { state: 'Ebonyi',     emoji: '⛰️', title: 'Ebonyi Schools',     sub: 'Salt of the nation',             color: 'from-gray-50 to-slate-50',      border: 'border-gray-100',    hover: 'hover:border-gray-300 hover:shadow-gray-100'       },
          { state: 'Nasarawa',   emoji: '🌲', title: 'Nasarawa Schools',    sub: 'Home of solid minerals',         color: 'from-green-50 to-teal-50',      border: 'border-green-100',   hover: 'hover:border-green-300 hover:shadow-green-100'     },
          { state: 'Adamawa',    emoji: '🌄', title: 'Adamawa Schools',     sub: 'Land of beauty',                 color: 'from-amber-50 to-orange-50',    border: 'border-amber-100',   hover: 'hover:border-amber-300 hover:shadow-amber-100'     },
          { state: 'Sokoto',     emoji: '🕌', title: 'Sokoto Schools',      sub: 'Seat of the Caliphate',          color: 'from-yellow-50 to-orange-50',   border: 'border-yellow-100',  hover: 'hover:border-yellow-300 hover:shadow-yellow-100'   },
          { state: 'Bayelsa',    emoji: '🌊', title: 'Bayelsa Schools',     sub: 'Glory of all lands',             color: 'from-cyan-50 to-sky-50',        border: 'border-cyan-100',    hover: 'hover:border-cyan-300 hover:shadow-cyan-100'       },
          { state: 'Taraba',     emoji: '🌿', title: 'Taraba Schools',      sub: "Nature's treasure of Nigeria",   color: 'from-emerald-50 to-green-50',   border: 'border-emerald-100', hover: 'hover:border-emerald-300 hover:shadow-emerald-100' },
          { state: 'Kebbi',      emoji: '🌊', title: 'Kebbi Schools',       sub: 'Land of equity',                 color: 'from-blue-50 to-cyan-50',       border: 'border-blue-100',    hover: 'hover:border-blue-300 hover:shadow-blue-100'       },
          { state: 'Gombe',      emoji: '🌾', title: 'Gombe Schools',       sub: 'Jewel in the Savannah',          color: 'from-lime-50 to-amber-50',      border: 'border-lime-100',    hover: 'hover:border-lime-300 hover:shadow-lime-100'       },
          { state: 'Jigawa',     emoji: '🌾', title: 'Jigawa Schools',      sub: 'The new world',                  color: 'from-orange-50 to-yellow-50',   border: 'border-orange-100',  hover: 'hover:border-orange-300 hover:shadow-orange-100'   },
          { state: 'Yobe',       emoji: '🏜️', title: 'Yobe Schools',       sub: 'Pride of the northeast',         color: 'from-stone-50 to-amber-50',     border: 'border-stone-100',   hover: 'hover:border-stone-300 hover:shadow-stone-100'     },
          { state: 'Zamfara',    emoji: '🌾', title: 'Zamfara Schools',     sub: 'Farming and learning state',     color: 'from-yellow-50 to-lime-50',     border: 'border-yellow-100',  hover: 'hover:border-yellow-300 hover:shadow-yellow-100'   },
          { state: 'Borno',      emoji: '🕌', title: 'Borno Schools',       sub: 'Home of peace and culture',      color: 'from-red-50 to-orange-50',      border: 'border-red-100',     hover: 'hover:border-red-300 hover:shadow-red-100'         },
        ];
        const PER_PAGE = 8;
        const totalPages = Math.ceil(ALL_STATES.length / PER_PAGE);
        const pageStates = ALL_STATES.slice((stateExplPage - 1) * PER_PAGE, stateExplPage * PER_PAGE);
        return (
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6 sm:mb-8">
                {pageStates.map(({ state, emoji, title, sub, color, border, hover }, idx) => (
                  <Link
                    key={state}
                    to={`/schools/state/${state}`}
                    className={`group relative flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl border bg-linear-to-br ${color} ${border} ${hover} hover:shadow-md hover:-translate-y-0.5 transition-all duration-200${idx >= 6 ? ' hidden sm:flex' : ''}`}
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

              {/* Pagination */}
              <Pagination page={stateExplPage} pages={totalPages} onPage={setStateExplPage} />
            </div>
          </section>
        );
      })()}

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

      {/* ── WHY NAIJA & OVERSEAS ──────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg,#050d08 0%,#071a0e 55%,#0b2415 100%)' }}
      >
        {/* Background dot grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,#4ade80 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        {/* Glow orbs */}
        <div className="absolute -bottom-40 right-1/3 w-125 h-125 rounded-full bg-green-700/10 blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-900/15 blur-3xl pointer-events-none" />
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-green-500/30 to-transparent" />

        <div className="relative z-10 flex flex-col lg:flex-row">

          {/* ── LEFT PANEL ── */}
          <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-12 sm:py-16 lg:py-20 lg:w-[40%] shrink-0 border-b lg:border-b-0 lg:border-r border-white/6">

            <span className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-[0.18em] px-3.5 py-1.5 rounded-full mb-6 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Why Education Naija &amp; Overseas
            </span>

            <h2 className="text-white font-extrabold text-3xl sm:text-4xl lg:text-[2.6rem] leading-[1.12] tracking-tight mb-4">
              Everything you need,<br />
              <span className="text-green-400">in one platform.</span>
            </h2>

            <p className="text-white/40 text-sm sm:text-base leading-relaxed mb-10 max-w-sm">
              Built for West African families — powerful tools for parents, students and school owners, all under one roof.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-px bg-white/6 rounded-2xl overflow-hidden mb-10 border border-white/6">
              {[
                { value: '500+', label: 'Verified Schools',  color: 'text-green-400' },
                { value: '10K+', label: 'Families Helped',   color: 'text-white' },
                { value: '95%',  label: 'Visa Success Rate', color: 'text-green-400' },
                { value: '8',    label: 'Countries Covered', color: 'text-white' },
              ].map(({ value, label, color }) => (
                <div key={label} className="bg-white/3 flex flex-col items-center justify-center py-5 px-4 text-center">
                  <div className={`text-2xl sm:text-3xl font-extrabold leading-none ${color}`}>{value}</div>
                  <div className="text-white/30 text-[11px] sm:text-xs mt-1.5 font-medium">{label}</div>
                </div>
              ))}
            </div>

            <Link to="/register"
              className="flex items-center justify-center gap-2 sm:inline-flex bg-green-600 hover:bg-green-500 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition shadow-lg shadow-green-950/60 sm:w-fit active:scale-95">
              Get Started Free <ArrowRight size={14} />
            </Link>
          </div>

          {/* ── RIGHT PANEL — feature cards ── */}
          <div className="flex-1 p-6 sm:p-8 lg:p-10 flex items-center">
            {/* Mobile: slideshow (1 card at a time) */}
            <div className="sm:hidden w-full">
              {(() => {
                const f = FEATURES[featureSlide];
                const Icon = f.icon;
                return (
                  <div className="group relative rounded-2xl border border-white/[0.07] bg-white/3 p-5 flex flex-col overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r ${f.accent}`} />
                    <span className="absolute -top-2 -right-1 text-[64px] leading-none font-black text-white/[0.035] select-none pointer-events-none">{f.num}</span>
                    <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-4 shrink-0`}>
                      <Icon size={18} className={f.iconFg} />
                    </div>
                    <h3 className="text-white/90 font-bold text-sm leading-snug mb-2 pr-6">{f.title}</h3>
                    <p className="text-white/35 text-xs leading-relaxed flex-1">{f.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/6 text-white/40 border border-white/8 w-fit shrink-0">
                      <CheckCircle size={8} className="text-green-400" />{f.badge}
                    </span>
                  </div>
                );
              })()}
              {/* Dot navigation */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <button onClick={() => setFeatureSlide((s) => Math.max(0, s - 1))} disabled={featureSlide === 0}
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/50 disabled:opacity-20 hover:border-green-400 transition">
                  <ChevronLeft size={13} />
                </button>
                {FEATURES.map((_, i) => (
                  <button key={i} onClick={() => setFeatureSlide(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === featureSlide ? 'bg-green-400 w-4' : 'bg-white/20'}`} />
                ))}
                <button onClick={() => setFeatureSlide((s) => Math.min(FEATURES.length - 1, s + 1))} disabled={featureSlide === FEATURES.length - 1}
                  className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white/50 disabled:opacity-20 hover:border-green-400 transition">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
            {/* SM+: grid */}
            <div className="hidden sm:grid w-full sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map(({ num, icon: Icon, title, desc, badge, accent, iconBg, iconFg }) => (
                <div key={title}
                  className="group relative rounded-2xl border border-white/[0.07] bg-white/3 hover:bg-white/[0.07] hover:border-white/15 p-5 flex flex-col transition-all duration-300 overflow-hidden cursor-default">
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <span className="absolute -top-2 -right-1 text-[64px] leading-none font-black text-white/[0.035] select-none pointer-events-none">{num}</span>
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4 shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={18} className={iconFg} />
                  </div>
                  <h3 className="text-white/90 font-bold text-sm leading-snug mb-2 pr-6">{title}</h3>
                  <p className="text-white/35 text-xs leading-relaxed flex-1 line-clamp-3">{desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/6 text-white/40 border border-white/8 w-fit shrink-0">
                    <CheckCircle size={8} className="text-green-400" />{badge}
                  </span>
                </div>
              ))}
            </div>
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

          {/* Right scrolling review area */}
          <div className="flex-1 overflow-hidden">

            {/* Mobile: horizontal left-to-right scroll strip */}
            <div className="sm:hidden overflow-hidden py-4 px-3">
              <div className="flex gap-3 animate-[scroll-left_28s_linear_infinite] w-max">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, j) => (
                  <div key={j} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm w-56 shrink-0">
                    <div className="flex items-start gap-2">
                      <div className={`w-7 h-7 rounded-full ${t.color} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}>{t.initials}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-0.5 mb-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={8} className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                          ))}
                        </div>
                        <p className="font-bold text-gray-900 text-[10px] leading-tight">{t.category}</p>
                        <p className="text-gray-500 text-[9px] leading-snug mt-0.5 line-clamp-3">{t.text}</p>
                        <p className="text-gray-400 text-[8px] mt-1 font-medium truncate">{t.name} · {t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SM+: vertical columns */}
            <div
              className="hidden sm:flex relative gap-2 sm:gap-2.5 px-3 sm:px-4 pt-0 pb-5 lg:py-8"
              style={{ height: 'clamp(160px, 40vw, 520px)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-8 sm:h-12 bg-linear-to-b from-[#0b0f0e] to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 bg-linear-to-t from-[#0b0f0e] to-transparent z-10 pointer-events-none" />
              {[0, 1, 2, 3].map((colIdx) => {
                const col = TESTIMONIALS.filter((_, i) => i % 4 === colIdx);
                const isDown = colIdx % 2 === 1;
                const colClass =
                  colIdx === 1 ? 'flex-1 overflow-hidden min-w-0'
                : colIdx === 2 ? 'hidden md:block flex-1 overflow-hidden min-w-0'
                : colIdx === 3 ? 'hidden lg:block flex-1 overflow-hidden min-w-0'
                : 'flex-1 overflow-hidden min-w-0';
                return (
                  <div key={colIdx} className={colClass}>
                    <div className={isDown ? 'marquee-down' : 'marquee-up'}>
                      {[...col, ...col].map((t, j) => (
                        <div key={j} className="bg-white rounded-xl p-3 sm:p-3.5 mb-2 sm:mb-2.5 border border-gray-100 shadow-sm">
                          <div className="flex items-start gap-2">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${t.color} text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center shrink-0`}>{t.initials}</div>
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
      <section className="bg-gray-950 py-10 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-16 items-start">

            {/* Left — sticky header */}
            <div className="lg:sticky lg:top-24">
              <span className="inline-block text-green-400 text-[11px] font-extrabold uppercase tracking-[0.2em] mb-4">FAQ</span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight mb-3 sm:mb-4"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Got questions?<br />
                <em className="text-green-400 not-italic">We have answers.</em>
              </h2>
              <p className="text-gray-500 text-xs sm:text-base leading-relaxed mb-4 sm:mb-6 max-w-xs">
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

      {/* ── FEATURED BLOG ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" aria-label="Featured Blog">
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,#021a0e 0%,#042f1e 55%,#064e3b 100%)' }} />
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-green-500/35 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 py-7 md:py-10">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-green-900/60 border border-green-700/40 text-green-300 text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                Featured
              </div>
              <h2 className="text-white font-extrabold text-base sm:text-lg">From the Blog</h2>
            </div>
            <Link to="/blog"
              className="hidden sm:flex items-center gap-1 text-green-400/70 hover:text-green-300 text-xs font-semibold transition">
              All articles <ArrowRight size={12} />
            </Link>
          </div>

          {/* Body — stacks on mobile, side-by-side on lg+ */}
          <div className="flex flex-col lg:flex-row gap-3 lg:items-stretch lg:max-h-70">

            {/* ── LEFT: 3 recent posts ── */}
            <div className="order-2 lg:order-1 lg:w-65 xl:w-70 shrink-0 flex flex-col">
              <p className="text-white/25 text-[9px] font-bold uppercase tracking-widest mb-2">
                Recent Articles
              </p>
              <div className="flex-1 flex flex-col divide-y divide-white/5">
                {recentPosts.length > 0 ? recentPosts.slice(0, 3).map((post) => (
                  <Link key={post._id} to={`/blog/${post.slug}`}
                    className="group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 hover:opacity-90 transition-opacity">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-green-950/80">
                      {post.coverImage
                        ? <img src={post.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                        : <div className="w-full h-full flex items-center justify-center"><BookOpen size={12} className="text-green-800" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-green-400/55 font-bold uppercase tracking-wide">{post.category}</span>
                      <p className="text-white/75 text-[11px] font-semibold leading-snug line-clamp-2 group-hover:text-white transition mt-0.5">{post.title}</p>
                      {post.readTime && (
                        <span className="flex items-center gap-1 text-white/20 text-[9px] mt-1">
                          <Clock size={7} /> {post.readTime} min
                        </span>
                      )}
                    </div>
                    <ArrowRight size={11} className="text-green-500/0 group-hover:text-green-500/70 shrink-0 transition-colors" />
                  </Link>
                )) : (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 first:pt-0">
                      <div className="w-12 h-12 rounded-lg bg-white/4 skeleton-shimmer shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2 bg-white/4 rounded skeleton-shimmer w-16" />
                        <div className="h-3 bg-white/4 rounded skeleton-shimmer w-full" />
                        <div className="h-3 bg-white/4 rounded skeleton-shimmer w-3/4" />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Link to="/blog"
                className="mt-3 flex items-center gap-1 text-green-400/50 hover:text-green-400 text-[11px] font-semibold transition lg:hidden">
                View all <ArrowRight size={10} />
              </Link>
            </div>

            {/* Vertical divider — desktop only */}
            <div className="hidden lg:block w-px bg-white/6 shrink-0 self-stretch" />

            {/* ── RIGHT: Featured post ── */}
            <div className="order-1 lg:order-2 flex-1 min-w-0">
              {featuredPost ? (
                <Link to={`/blog/${featuredPost.slug}`}
                  className="group relative block rounded-xl overflow-hidden h-full shadow-xl hover:shadow-green-950/60 transition-shadow duration-500">
                  <div className="relative h-40 sm:h-44 lg:h-full lg:min-h-0">
                    {featuredPost.coverImage ? (
                      <img src={featuredPost.coverImage} alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-green-900/60 flex items-center justify-center">
                        <BookOpen className="text-green-700/50" size={48} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-gray-950/95 via-gray-950/30 to-transparent" />
                    {/* Featured badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 bg-yellow-400/95 text-gray-950 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                        <Star size={8} fill="currentColor" /> Featured
                      </span>
                    </div>
                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <span className="inline-flex items-center text-[10px] bg-white/10 backdrop-blur-sm border border-white/15 text-white/70 font-semibold px-2 py-0.5 rounded-full mb-2">
                        {featuredPost.category}
                      </span>
                      <h3 className="text-white font-extrabold text-base sm:text-lg md:text-xl leading-snug mb-1.5 group-hover:text-green-300 transition line-clamp-2">
                        {featuredPost.title}
                      </h3>
                      {featuredPost.excerpt && (
                        <p className="text-white/40 text-xs leading-relaxed mb-2.5 hidden sm:block line-clamp-1">
                          {featuredPost.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white/35 text-[10px]">
                          {featuredPost.readTime && (
                            <span className="flex items-center gap-1"><Clock size={9} />{featuredPost.readTime} min read</span>
                          )}
                          {featuredPost.views > 0 && (
                            <span className="flex items-center gap-1"><Eye size={9} />{featuredPost.views.toLocaleString()}</span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-green-400 font-bold text-xs group-hover:gap-2 transition-all whitespace-nowrap">
                          Read <ArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full min-h-35 rounded-xl border border-white/6 bg-white/15 p-6">
                  <Star size={22} className="text-green-800/60 mb-2" />
                  <p className="text-white/25 text-xs font-medium">No featured article set</p>
                  <p className="text-white/15 text-[10px] mt-0.5">Admin → Blog → click ★ on any post</p>
                </div>
              )}
            </div>

          </div>

          {/* Footer strip */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3.5 border-t border-white/[0.07]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {['10,000+ Families', '500+ Schools', '95% Visa Success', 'Always Free'].map((t, i) => (
                <div key={t} className="flex items-center gap-1">
                  {i > 0 && <span className="w-px h-3 bg-green-900 hidden sm:block" />}
                  <CheckCircle size={9} className="text-green-500 shrink-0" />
                  <span className="text-green-400/40 text-[10px] font-medium">{t}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/register"
                className="bg-white text-green-950 font-bold px-4 py-2 rounded-lg text-xs hover:bg-green-50 transition shadow-md">
                Get Started Free →
              </Link>
              <Link to="/blog"
                className="border border-green-700/40 text-green-400/60 font-semibold px-4 py-2 rounded-lg text-xs hover:bg-green-900/30 transition sm:flex hidden items-center gap-1">
                <BookOpen size={11} /> All Articles
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
