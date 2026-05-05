import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, BookOpen, Plane, FileText, CheckCircle, Star,
  Clock, X, ArrowRight, ChevronLeft, ChevronRight,
  Users, Award, Shield, Zap, Phone, Mail,
  GraduationCap, MapPin, TrendingUp, Heart, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

/* ─── DATA ──────────────────────────────────────────────────── */

function FlagImg({ code, w = 40, className = '' }) {
  return (
    <img
      src={`https://flagcdn.com/w${w}/${code}.png`}
      alt={code}
      className={`inline-block ${className}`}
    />
  );
}

const HERO_SLIDES = [
  {
    country: 'United Kingdom',
    code: 'gb',
    tagline: 'World-Class Education, Centuries of Excellence',
    subtitle: 'Study at some of the world\'s most prestigious universities. 3-year undergraduate degrees, globally recognised qualifications, and a vibrant multicultural campus life.',
    bg: 'https://images.unsplash.com/photo-1549918864-48ac978761a4?auto=format&fit=crop&w=1920&q=80',
    accent: 'from-blue-950/90 via-blue-900/75',
    badge: 'bg-blue-600',
    universities: [
      { name: 'University of Oxford', rank: '#1 World Ranking' },
      { name: 'University of Cambridge', rank: '#2 World Ranking' },
      { name: 'Imperial College London', rank: 'Top 10 Globally' },
      { name: 'University College London', rank: 'Top 15 Globally' },
      { name: 'London School of Economics', rank: 'Top Social Sciences' },
    ],
    stats: ['130+ Universities', '3-Year Degrees', 'Post-Study Work Visa'],
    intakes: 'September & January',
  },
  {
    country: 'Canada',
    code: 'ca',
    tagline: 'Quality Education with Post-Study Work Rights',
    subtitle: 'Canada offers world-class education at affordable costs, with pathways to permanent residency. Enjoy up to 3 years of post-graduation work permit after your degree.',
    bg: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1920&q=80',
    accent: 'from-red-950/90 via-red-900/75',
    badge: 'bg-red-600',
    universities: [
      { name: 'University of Toronto', rank: '#21 World Ranking' },
      { name: 'UBC Vancouver', rank: '#34 World Ranking' },
      { name: 'McGill University', rank: '#37 World Ranking' },
      { name: 'McMaster University', rank: 'Top 100 Globally' },
      { name: 'University of Waterloo', rank: 'Top Tech School' },
    ],
    stats: ['100+ Universities', 'PGWP up to 3 Years', 'PR Pathway'],
    intakes: 'January, May & September',
  },
  {
    country: 'United States',
    code: 'us',
    tagline: 'Home to the World\'s Most Prestigious Universities',
    subtitle: 'Study at Ivy League institutions and state universities with world-leading research facilities, strong alumni networks, and life-changing scholarship opportunities.',
    bg: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80',
    accent: 'from-indigo-950/90 via-indigo-900/75',
    badge: 'bg-indigo-600',
    universities: [
      { name: 'Harvard University', rank: '#3 World Ranking' },
      { name: 'Massachusetts Institute of Technology', rank: '#1 World Ranking' },
      { name: 'Stanford University', rank: '#5 World Ranking' },
      { name: 'Yale University', rank: 'Top 20 Globally' },
      { name: 'Columbia University', rank: 'Top 25 Globally' },
    ],
    stats: ['4,000+ Universities', 'OPT/CPT Work', 'F-1 Student Visa'],
    intakes: 'August & January',
  },
];

const DESTINATIONS = [
  { slug: 'united-kingdom', code: 'gb', country: 'United Kingdom', unis: '130+', highlight: 'Top-ranked universities', image: 'https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?auto=format&fit=crop&w=800&q=80' },
  { slug: 'canada', code: 'ca', country: 'Canada', unis: '100+', highlight: 'Post-study work visa & PR', image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80' },
  { slug: 'united-states', code: 'us', country: 'United States', unis: '4,000+', highlight: 'Ivy League institutions', image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80' },
  { slug: 'australia', code: 'au', country: 'Australia', unis: '40+', highlight: 'Fast student visa', image: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=800&q=80' },
  { slug: 'germany', code: 'de', country: 'Germany', unis: '380+', highlight: 'Tuition-free options', image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80' },
  { slug: 'ireland', code: 'ie', country: 'Ireland', unis: '30+', highlight: 'English-speaking EU', image: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?auto=format&fit=crop&w=800&q=80' },
  { slug: 'netherlands', code: 'nl', country: 'Netherlands', unis: '50+', highlight: '2,200+ English programs', image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80' },
  { slug: 'new-zealand', code: 'nz', country: 'New Zealand', unis: '25+', highlight: 'Safe & welcoming', image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80' },
];

const SERVICES = [
  { icon: BookOpen, title: 'University Selection', color: 'bg-green-100 text-green-700', desc: 'Personalised shortlisting of 5–10 universities based on your academic profile, budget, and career goals. We split between realistic and aspirational choices.' },
  { icon: FileText, title: 'Application Writing', color: 'bg-blue-100 text-blue-700', desc: 'Expert personal statement writing and review. We help craft compelling narratives that highlight your strengths and align with each university\'s expectations.' },
  { icon: Award, title: 'Scholarship Search', color: 'bg-yellow-100 text-yellow-700', desc: 'We identify scholarships, bursaries, and funding options you qualify for. We have helped students secure over ₦500M in scholarship funding.' },
  { icon: Shield, title: 'Visa Assistance', color: 'bg-purple-100 text-purple-700', desc: 'Full student visa consultation, document checklist, mock visa interview coaching, and embassy appointment support for all destination countries.' },
  { icon: Plane, title: 'Pre-Departure Support', color: 'bg-orange-100 text-orange-700', desc: 'Pre-departure orientation briefing covering accommodation, banking, transport, healthcare, and cultural adjustment tips for your destination country.' },
  { icon: Heart, title: 'Ongoing Support', color: 'bg-red-100 text-red-700', desc: 'We don\'t disappear after your visa approval. Our team provides ongoing support even after you arrive on campus, including semester check-ins.' },
];

const BENEFITS = [
  { icon: Globe, title: 'Globally Recognised Degree', desc: 'A degree from an international university opens doors worldwide. Employers across Africa, Europe and North America recognise and value international qualifications.' },
  { icon: TrendingUp, title: 'Career Advancement', desc: 'International graduates earn significantly more. Studies show international degrees command 30–60% higher salaries in Nigeria compared to local qualifications.' },
  { icon: Users, title: 'Global Network', desc: 'Build friendships and professional connections with students from 150+ countries. Your alumni network becomes a lifelong career asset.' },
  { icon: Zap, title: 'Personal Growth', desc: 'Living and studying abroad builds independence, cultural intelligence, and resilience — qualities employers actively seek in candidates.' },
  { icon: BookOpen, title: 'Research Opportunities', desc: 'Access world-class research facilities, laboratories, and cutting-edge academic resources that may not be available in local institutions.' },
  { icon: MapPin, title: 'Cultural Immersion', desc: 'Experience life in a new country, learn new languages, explore new places, and return home with a broader worldview and life perspective.' },
];

const WHY_US = [
  { icon: Award, title: '95% Visa Success Rate', desc: 'Our thorough preparation and document review means 95 of every 100 students we work with get their student visa approved first attempt.' },
  { icon: Users, title: '2,000+ Students Placed', desc: 'Since 2022, we have successfully placed over 2,000 Nigerian students in universities across 8 countries worldwide.' },
  { icon: GraduationCap, title: '50+ Partner Universities', desc: 'Our direct relationships with universities means faster processing times, special consideration, and in some cases, exclusive scholarship access.' },
  { icon: Shield, title: 'End-to-End Service', desc: 'From first consultation to your first day on campus — we handle every single step so you never feel alone in the process.' },
  { icon: Clock, title: '48-Hour Response Guarantee', desc: 'Every enquiry receives a personalised response from a senior counsellor within 48 hours. No automated replies, no waiting weeks.' },
  { icon: Heart, title: 'Nigerian-Focused Guidance', desc: 'Our team understands the unique challenges Nigerian students face — from credential evaluation to IELTS waivers — and knows exactly how to navigate them.' },
];

const TESTIMONIALS = [
  { name: 'Chukwuemeka Obi', dest: 'University of Toronto, Canada', course: 'MSc Computer Science', text: 'I tried applying alone twice and got rejected both times. Naija & Overseas identified exactly what was wrong with my applications, fixed my personal statement, and I got admitted with a partial scholarship. I start in September.', init: 'CO', col: 'bg-blue-700', rating: 5 },
  { name: 'Fatima Al-Hassan', dest: "King's College London, UK", course: 'LLM International Law', text: 'My visa was approved first attempt, which shocked everyone who told me getting a UK visa was hard. Their document checklist and interview coaching made all the difference. Now studying my Masters.', init: 'FA', col: 'bg-green-700', rating: 5 },
  { name: 'Adaeze Nwosu', dest: 'University of Melbourne, Australia', course: 'MBA', text: 'What impressed me most was how they found scholarships I had no idea existed. I got a partial scholarship worth AUD 8,000. Their knowledge of Australian admissions is exceptional.', init: 'AN', col: 'bg-purple-700', rating: 5 },
  { name: 'Ibrahim Musa', dest: 'TU Munich, Germany', course: 'MEng Mechanical Engineering', text: 'Germany was not even on my radar until they suggested it. Tuition-free at one of the world\'s best engineering schools — I would never have found this path without their guidance.', init: 'IM', col: 'bg-orange-600', rating: 5 },
  { name: 'Sade Ogundimu', dest: 'University of British Columbia', course: 'BSc Nursing', text: 'The team helped me navigate credential recognition, IELTS waiver eligibility, and the complex UBC application process. They responded to every WhatsApp message promptly. Highly professional.', init: 'SO', col: 'bg-teal-700', rating: 5 },
  { name: 'Emeka Eze', dest: 'NUI Galway, Ireland', course: 'MSc Data Analytics', text: 'Ireland was a great choice — affordable, English-speaking, and inside the EU. Their counsellor gave me three options that fit my budget. I got into my first choice. Amazing service.', init: 'EE', col: 'bg-red-700', rating: 5 },
];

const AFFILIATIONS = [
  { code: 'gb', name: 'University of Oxford', type: 'Consulting Partner' },
  { code: 'gb', name: 'University College London', type: 'Application Partner' },
  { code: 'ca', name: 'University of Toronto', type: 'Consulting Partner' },
  { code: 'ca', name: 'McGill University', type: 'Application Partner' },
  { code: 'us', name: 'NYU New York', type: 'Affiliated Agent' },
  { code: 'au', name: 'University of Melbourne', type: 'Consulting Partner' },
  { code: 'de', name: 'TU Munich', type: 'Application Partner' },
  { code: 'ie', name: 'University College Dublin', type: 'Affiliated Agent' },
  { code: 'nl', name: 'University of Amsterdam', type: 'Consulting Partner' },
  { code: 'nz', name: 'University of Auckland', type: 'Application Partner' },
  { code: 'gb', name: 'University of Manchester', type: 'Affiliated Agent' },
  { code: 'ca', name: 'UBC Vancouver', type: 'Consulting Partner' },
];

const FAQS = [
  { q: 'What are the requirements to study abroad?', a: 'Requirements vary by country and university but typically include: a completed secondary/tertiary qualification, English proficiency (IELTS or equivalent), a personal statement, referee letters, and financial proof. We assess your exact requirements during a free consultation.' },
  { q: 'Do I need IELTS to study abroad?', a: 'Many universities and countries now accept IELTS alternatives or offer waivers for students who studied in English-medium institutions. We will advise you on whether you need IELTS or qualify for an exemption based on your profile.' },
  { q: 'How much does it cost to study abroad?', a: 'Costs vary widely. UK tuition: £10,000–£25,000/year. Canada: CAD 15,000–35,000/year. Germany: often free or €500/semester. We help you identify affordable options and scholarships to reduce costs significantly.' },
  { q: 'How long does the application process take?', a: 'Typically 4–8 weeks from initial consultation to submitting applications. Visa processing adds 2–8 weeks depending on the country. We recommend starting at least 6 months before your intended intake.' },
  { q: 'Can I work while studying abroad?', a: 'Yes. Most countries allow international students to work part-time: UK (20 hrs/week), Canada (20 hrs/week), USA (on-campus work), Australia (48 hrs/fortnight). We brief you on work regulations for your destination.' },
  { q: 'What is a post-study work visa?', a: 'After completing your degree, many countries allow you to stay and work. UK: Graduate Visa (2 years), Canada: PGWP (up to 3 years), Australia: 2–4 years, Ireland: 2 years. This is one of the biggest advantages of studying abroad.' },
];

const PROCESS_STEPS = [
  { icon: FileText, title: 'Free Consultation', desc: 'Submit your profile for a free assessment. A senior counsellor will review your qualifications and contact you within 48 hours with personalised advice.', time: 'Day 1', badge: '01' },
  { icon: BookOpen, title: 'University Shortlisting', desc: 'We prepare a personalised list of 5–10 universities that match your academic profile, budget, career goals, and location preferences.', time: '24–48 hrs', badge: '02' },
  { icon: Globe, title: 'Application & Documents', desc: 'We help you write a compelling personal statement, prepare all required documents, and submit strong applications to your chosen universities.', time: '2–4 weeks', badge: '03' },
  { icon: Plane, title: 'Visa & Departure', desc: 'Once you receive your offer letter, we guide you through the visa application, pre-departure briefing, and provide support throughout your first semester.', time: 'Ongoing', badge: '04' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="font-semibold text-gray-900 text-sm">{q}</span>
        {open ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>
      {open && <div className="pb-5 text-gray-500 text-sm leading-relaxed">{a}</div>}
    </div>
  );
}

/* ─── MAIN COMPONENT ────────────────────────────────────────── */

export default function StudyAbroad() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', destinationCountry: '',
    university: '', program: '', intake: '', currentQualification: '', requiresVisa: true,
  });
  const intervalRef = useRef(null);
  const progressRef = useRef(null);
  const tickRef = useRef(0);

  const SLIDE_DURATION = 6000;
  const TOTAL_TICKS = SLIDE_DURATION / 50;

  const goTo = (i) => { setSlide(i); setProgress(0); };
  const prev = () => goTo((slide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const next = () => goTo((slide + 1) % HERO_SLIDES.length);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(intervalRef.current);
  }, [paused, slide]);

  useEffect(() => {
    if (paused) return;
    tickRef.current = 0;
    progressRef.current = setInterval(() => {
      tickRef.current += 1;
      setProgress(Math.min((tickRef.current / TOTAL_TICKS) * 100, 100));
    }, 50);
    return () => clearInterval(progressRef.current);
  }, [slide, paused, TOTAL_TICKS]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/study-abroad', form);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSubmitted(false);
    setForm({ fullName: '', email: '', phone: '', destinationCountry: '', university: '', program: '', intake: '', currentQualification: '', requiresVisa: true });
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 transition';
  const current = HERO_SLIDES[slide];

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO SLIDER
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex flex-col overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}>

        {/* Slides */}
        {HERO_SLIDES.map((s, i) => (
          <div key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${s.bg}')` }} />
            <div className={`absolute inset-0 bg-linear-to-r ${s.accent} to-black/30`} />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-20 flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-6 py-20 w-full grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT: Country info */}
            <div>
              {/* <div className="flex items-center gap-3 mb-6">
                <FlagImg code={current.code} w={80} className="h-12 rounded-md shadow-lg" />
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Globe size={12} /> Studying in {current.country}
                </div>
              </div> */}

              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.06] mb-5 drop-shadow-lg">
                Study in<br />
                <span className="text-green-400">{current.country}</span>
              </h1>

              <p className="text-white/80 text-base md:text-lg mb-5 leading-relaxed max-w-xl">
                {current.tagline}
              </p>
              <p className="text-white/60 text-sm mb-8 leading-relaxed max-w-lg">{current.subtitle}</p>

              {/* Stats chips */}
              <div className="flex flex-wrap gap-2 mb-8">
                {current.stats.map((stat) => (
                  <span key={stat} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    <CheckCircle size={11} className="text-green-400" /> {stat}
                  </span>
                ))}
                <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Clock size={11} className="text-yellow-400" /> Intakes: {current.intakes}
                </span>
              </div>

              <div className="flex flex-wrap gap-4">
                <button onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-green-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-700 transition shadow-lg text-sm">
                  Apply for {current.country} <ArrowRight size={16} />
                </button>
                <a href="#destinations"
                  className="flex items-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition text-sm">
                  All Destinations
                </a>
              </div>

              <p className="text-white/30 text-xs mt-4">Free consultation. No commitment required.</p>
            </div>

            {/* RIGHT: Universities card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-7 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.2em] text-green-300 font-bold mb-5">
                  Top Universities in {current.country}
                </p>
                <div className="space-y-3">
                  {current.universities.map(({ name, rank }, i) => (
                    <div key={name} className="flex items-center gap-4 bg-white/10 rounded-xl px-4 py-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xs shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{name}</p>
                        <p className="text-green-300 text-xs">{rank}</p>
                      </div>
                      <CheckCircle size={14} className="text-green-400 shrink-0" />
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowForm(true)}
                  className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2">
                  Get Free Consultation <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide controls */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 pb-10 w-full flex items-center justify-between">
          {/* Dots + progress */}
          <div className="flex items-center gap-4">
            {HERO_SLIDES.map((s, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`relative h-1 rounded-full overflow-hidden transition-all ${i === slide ? 'w-16 bg-white/30' : 'w-8 bg-white/20 hover:bg-white/40'}`}>
                {i === slide && (
                  <div className="absolute inset-y-0 left-0 bg-green-400 rounded-full"
                    style={{ width: `${progress}%`, transition: 'width 0.05s linear' }} />
                )}
              </button>
            ))}
            <span className="text-white/50 text-xs ml-2">{slide + 1} / {HERO_SLIDES.length}</span>
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button onClick={prev}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition">
              <ChevronLeft size={18} />
            </button>
            <button onClick={next}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 transition">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Country switcher tabs */}
        <div className="relative z-20 bg-black/40 backdrop-blur-md border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 flex">
            {HERO_SLIDES.map((s, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 ${
                  i === slide
                    ? 'border-green-400 text-white'
                    : 'border-transparent text-white/50 hover:text-white/80'
                }`}>
                <FlagImg code={s.code} w={40} className="h-4 rounded-sm" />
                <span className="hidden sm:inline">{s.country}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — STATS STRIP
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-green-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-green-800">
          {[
            ['2,000+', 'Students Successfully Placed'],
            ['95%', 'Visa Approval Rate'],
            ['50+', 'Partner Universities'],
            ['8', 'Countries Covered'],
          ].map(([n, l]) => (
            <div key={l} className="text-center px-6 py-2">
              <div className="text-3xl font-extrabold text-green-300 mb-1">{n}</div>
              <div className="text-xs text-green-400 font-medium">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — ABOUT OUR SERVICE
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              About Our Study Abroad Service
            </div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
              Nigeria's Most Trusted International Admissions Team
            </h2>
            <div className="space-y-4 text-gray-500 text-sm leading-relaxed">
              <p>
                Naija &amp; Overseas is West Africa's leading educational consultancy, helping Nigerian students achieve their dream of studying at world-class universities across the United Kingdom, Canada, United States, Australia, Germany, Ireland, Netherlands, and New Zealand.
              </p>
              <p>
                Since our founding, we have placed over <strong className="text-gray-800">2,000 students</strong> in top international universities, with a <strong className="text-gray-800">95% visa success rate</strong> — the highest among Nigerian consultancies. Our team of certified admissions counsellors has direct relationships with over 50 partner universities worldwide.
              </p>
              <p>
                We believe that every talented Nigerian student deserves access to the best education the world has to offer. Our job is to remove every obstacle standing between you and your dream university.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                'British Council Registered',
                'ICEF Trained Agents',
                'Official Uni Partners',
                'CISI Certified Advisors',
              ].map((text) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <CheckCircle size={16} className="text-green-600 shrink-0" /> {text}
                </div>
              ))}
            </div>
            <button onClick={() => setShowForm(true)}
              className="mt-8 flex items-center gap-2 bg-green-700 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-800 transition">
              Book Free Consultation <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { n: '2,000+', l: 'Students Placed', color: 'bg-green-700' },
              { n: '95%', l: 'Visa Success Rate', color: 'bg-blue-700' },
              { n: '8', l: 'Destinations', color: 'bg-purple-700' },
              { n: '50+', l: 'Partner Universities', color: 'bg-orange-600' },
              { n: '3 Years', l: 'Average Placement Time', color: 'bg-teal-700' },
              { n: '24/7', l: 'Student Support', color: 'bg-red-700' },
            ].map(({ n, l, color }) => (
              <div key={l} className={`${color} rounded-2xl p-5 text-white`}>
                <div className="text-2xl font-extrabold mb-1">{n}</div>
                <div className="text-xs opacity-80">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — CHOOSE YOUR DREAM DESTINATION
      ══════════════════════════════════════════════════════════ */}
      <section id="destinations" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">8 Destinations</div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 mb-4">Choose Your Dream Destination</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We support admissions to over 400 universities across 8 countries. Find your destination below.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {DESTINATIONS.map(({ slug, code, country, unis, highlight, image }) => (
              <Link key={country} to={`/study-abroad/${slug}`}
                className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 block">
                <div className="relative overflow-hidden" style={{ paddingBottom: '66%' }}>
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${image}')` }} />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-black/5 group-hover:from-black/90 transition-all duration-300" />

                  {/* Top row */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <FlagImg code={code} w={40} className="h-7 rounded shadow-lg" />
                    <span className="bg-black/40 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20">
                      {unis} Universities
                    </span>
                  </div>

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-extrabold text-xl leading-tight mb-1">{country}</h3>
                    <p className="text-white/65 text-xs mb-3">{highlight}</p>
                    <span className="inline-flex items-center gap-1.5 bg-green-600 group-hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                      Read More <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — SERVICES WE OFFER
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">What We Do</div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 mb-4">Services We Offer</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Comprehensive end-to-end support from your first enquiry to your first day on campus.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-extrabold text-gray-900 mb-3 group-hover:text-green-700 transition">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-green-700 text-white font-bold px-10 py-4 rounded-xl hover:bg-green-800 transition">
              Start with a Free Consultation <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6 — BENEFITS OF STUDYING ABROAD
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-gray-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-900 text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">Why Go Abroad?</div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white mb-4">Benefits of Studying Abroad</h2>
            <p className="text-gray-400 max-w-xl mx-auto">International education transforms careers and lives. Here's what you gain.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-7 hover:border-green-700 transition">
                <div className="w-11 h-11 bg-green-900 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} className="text-green-400" />
                </div>
                <h3 className="font-extrabold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 7 — WHY CHOOSE US
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">Our Edge</div>
              <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 mb-5">Why Choose Naija &amp; Overseas?</h2>
              <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                There are many study abroad consultancies in Nigeria. Here is why thousands of students and families trust us above the rest.
              </p>
              <div className="space-y-4">
                {WHY_US.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-green-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-0.5 text-sm">{title}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-950 rounded-3xl p-8 text-white">
              <h3 className="text-lg font-extrabold text-white mb-2">Our Track Record</h3>
              <p className="text-gray-400 text-sm mb-8">Numbers that speak for themselves.</p>
              <div className="space-y-4">
                {[
                  { label: 'Visa Approval Rate', value: 95, color: 'bg-green-500' },
                  { label: 'Students Admitted to First Choice', value: 78, color: 'bg-blue-500' },
                  { label: 'Scholarship Recipients', value: 42, color: 'bg-yellow-500' },
                  { label: 'Client Satisfaction', value: 98, color: 'bg-purple-500' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-300">{label}</span>
                      <span className="font-bold text-white">{value}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowForm(true)}
                className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-sm transition">
                Join Our Success Stories →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 8 — APPLICATION PROCESS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">Simple Process</div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">From first contact to landing at your dream university in just 4 steps.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-green-300 z-0" />
            {PROCESS_STEPS.map(({ icon: Icon, title, desc, time, badge }) => (
              <div key={title} className="relative z-10 text-center">
                <div className="relative inline-flex w-20 h-20 items-center justify-center rounded-2xl bg-green-700 text-white mb-5 mx-auto shadow-lg">
                  <Icon size={26} />
                  <span className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-yellow-400 text-gray-900 text-xs font-extrabold rounded-full flex items-center justify-center shadow">
                    {badge}
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2.5 py-1 rounded-full font-semibold mb-3">
                  <Clock size={10} /> {time}
                </div>
                <h3 className="font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-green-700 text-white font-bold px-10 py-4 rounded-xl hover:bg-green-800 transition shadow-lg">
              Start My Application <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 9 — SUCCESS STORIES
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">Testimonials</div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-gray-900 mb-4">Our Success Stories</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Real Nigerian students. Real universities. Real success.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, dest, course, text, init, col, rating }) => (
              <div key={name} className="bg-gray-50 border border-gray-100 rounded-2xl p-7 hover:shadow-md transition">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className={`w-11 h-11 rounded-xl ${col} text-white flex items-center justify-center text-sm font-extrabold shrink-0`}>
                    {init}
                  </div>
                  <div>
                    <p className="font-extrabold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-green-700 font-semibold">{dest}</p>
                    <p className="text-xs text-gray-400">{course}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 10 — INTERNATIONAL AFFILIATIONS
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">Partners</div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">International Academic Consultancy Affiliations</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We are official agents, consulting partners, or affiliates of these universities. Our relationships mean faster processing and better outcomes for our students.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AFFILIATIONS.map(({ code, name, type }) => (
              <div key={name} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-green-300 hover:shadow-md transition text-center">
                <div className="mb-3 flex justify-center"><FlagImg code={code} w={40} className="h-6 rounded shadow-sm" /></div>
                <h4 className="font-bold text-gray-900 text-sm mb-1 leading-snug">{name}</h4>
                <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">{type}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              {['British Council Registered', 'ICEF Trained Agents', 'Pie Education Network', 'AIRC Member', 'NAFSA Associate', 'CISI Certified'].map((cert) => (
                <div key={cert} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  <span className="font-medium">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 11 — FAQ
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">FAQ</div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500">Everything you need to know about studying abroad with us.</p>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-100 px-7 py-2">
            {FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Still have questions?{' '}
            <button onClick={() => setShowForm(true)} className="text-green-700 font-bold hover:underline">
              Talk to a counsellor →
            </button>
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 12 — CONTACT + FINAL CTA
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-green-900 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold mb-4">Ready to start your international journey?</h2>
            <p className="text-green-200 mb-8 leading-relaxed">
              Submit a free application today. A senior admissions counsellor will review your profile and contact you within 48 hours with a personalised university shortlist.
            </p>
            <div className="space-y-3">
              {[
                { icon: Mail, text: 'info@naijaandoverseas.com' },
                { icon: Phone, text: '+234 800 000 0000' },
                { icon: MapPin, text: 'Lagos, Nigeria (Serving all 36 states)' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-green-200 text-sm">
                  <div className="w-8 h-8 bg-green-800 rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-green-400" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
            <GraduationCap size={36} className="text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-extrabold text-white mb-2">Get Started Today — It&apos;s Free</h3>
            <p className="text-green-300 text-sm mb-6">No payment, no commitment. Just expert advice tailored to your goals.</p>
            <button onClick={() => setShowForm(true)}
              className="w-full bg-yellow-400 text-green-900 font-extrabold py-4 rounded-xl hover:bg-yellow-300 transition text-base shadow-lg">
              Start Free Application →
            </button>
            <p className="text-green-500 text-xs mt-3">Response within 48 hours guaranteed.</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          APPLICATION MODAL
      ══════════════════════════════════════════════════════════ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg my-auto shadow-2xl overflow-hidden">

            <div className="bg-green-900 px-7 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">Free Study Abroad Application</h2>
                <p className="text-green-300 text-xs mt-0.5">A counsellor will contact you within 48 hours</p>
              </div>
              <button onClick={resetForm}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-800 text-green-300 hover:bg-green-700 transition">
                <X size={16} />
              </button>
            </div>

            {submitted ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">Application Submitted!</h3>
                <p className="text-gray-500 text-sm mb-2">Thank you, <strong>{form.fullName}</strong>!</p>
                <p className="text-gray-500 text-sm mb-6">
                  A senior counsellor will review your profile and contact you at <strong>{form.email}</strong> within 48 hours with a personalised university shortlist.
                </p>
                <button onClick={resetForm}
                  className="bg-green-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-800 transition text-sm">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-7 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" required value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inp} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} placeholder="you@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
                    <input type="tel" required value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} placeholder="+234 800..." />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Destination <span className="text-red-500">*</span></label>
                    <select required value={form.destinationCountry}
                      onChange={(e) => setForm({ ...form, destinationCountry: e.target.value })} className={inp}>
                      <option value="">Select a destination country</option>
                      {DESTINATIONS.map(({ country }) => <option key={country}>{country}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Program / Course</label>
                    <input value={form.program}
                      onChange={(e) => setForm({ ...form, program: e.target.value })} className={inp} placeholder="e.g. Computer Science" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Intake</label>
                    <input value={form.intake}
                      onChange={(e) => setForm({ ...form, intake: e.target.value })} className={inp} placeholder="e.g. Sept 2025" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Highest Qualification</label>
                    <input value={form.currentQualification}
                      onChange={(e) => setForm({ ...form, currentQualification: e.target.value })} className={inp} placeholder="e.g. WAEC, BSc, HND" />
                  </div>
                </div>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer border border-gray-100">
                  <input type="checkbox" checked={form.requiresVisa}
                    onChange={(e) => setForm({ ...form, requiresVisa: e.target.checked })}
                    className="w-4 h-4 accent-green-600" />
                  <span className="text-sm text-gray-700">I need visa assistance</span>
                </label>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={resetForm}
                    className="flex-1 border border-gray-200 rounded-xl py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-green-700 text-white rounded-xl py-3.5 text-sm font-bold hover:bg-green-800 disabled:opacity-60 transition flex items-center justify-center gap-2">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
                      : 'Submit Application →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
