import { Link } from 'react-router-dom';
import {
  Target, Eye, Users, Globe, School, CheckCircle, ArrowRight,
  BookOpen, Plane, MapPin, Mail, Phone, Zap, Heart, TrendingUp,
} from 'lucide-react';

const STATS = [
  { n: '500+',    label: 'Schools Listed',      sub: 'Verified & up to date',   icon: School,     color: 'text-green-600',  bg: 'bg-green-50'  },
  { n: '10,000+', label: 'Families Helped',     sub: 'Across West Africa',       icon: Users,      color: 'text-blue-600',   bg: 'bg-blue-50'   },
  { n: '4',       label: 'Countries Active',    sub: 'NG · GH · GM · CM',        icon: Globe,      color: 'text-purple-600', bg: 'bg-purple-50' },
  { n: '50+',     label: 'Partner Universities',sub: 'UK, Canada, EU & more',    icon: BookOpen,   color: 'text-orange-600', bg: 'bg-orange-50' },
];

const VALUES = [
  {
    icon: Target,
    title: 'Our Mission',
    color: 'bg-green-700',
    desc: 'To simplify school discovery and international university admissions for every student and family across West Africa — removing information barriers and levelling the playing field.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    color: 'bg-blue-700',
    desc: 'A future where every Nigerian and West African student can access quality education — locally and internationally — without barriers, confusion, or unnecessary cost.',
  },
  {
    icon: Heart,
    title: 'Our Values',
    color: 'bg-purple-700',
    desc: 'Transparency, trust, and genuine care for every family. We only recommend what we believe in, and we hold every school and counsellor on our platform to that same standard.',
  },
];

const MILESTONES = [
  { year: '2022', event: 'Naija & Overseas founded in Lagos, Nigeria by Yusuf Abdullahi', badge: '01' },
  { year: '2023', event: '100+ schools listed, first 1,000 families served across Nigeria', badge: '02' },
  { year: '2024', event: 'Study Abroad placement service launched — first overseas offers secured', badge: '03' },
  { year: '2025', event: 'Expanded to Ghana, The Gambia & Cameroon — 10,000+ families reached', badge: '04' },
  { year: '2026', event: 'Tutor marketplace launched — 1-on-1 learning from anywhere', badge: '05' },
];

const SERVICES = [
  {
    icon: School,
    title: 'Smart School Comparison',
    desc: 'Search and compare hundreds of verified schools across Nigeria and West Africa — fees, facilities, curriculum, and location — all in one place, free forever.',
    link: '/',
    label: 'Browse Schools',
    color: 'bg-green-700',
  },
  {
    icon: Plane,
    title: 'Study Abroad Placement',
    desc: 'End-to-end support: university selection, personal statement coaching, application strategy, and visa guidance for the UK, Canada, Australia, and more.',
    link: '/study-abroad',
    label: 'Learn More',
    color: 'bg-blue-700',
  },
  {
    icon: BookOpen,
    title: 'Private Tutoring',
    desc: 'Connect with verified tutors for WAEC, JAMB, GCSE, A-Level, SAT, IELTS and more. 1-on-1 sessions online or in-person, at a rate you set.',
    link: '/find-tutoring',
    label: 'Find a Tutor',
    color: 'bg-purple-700',
  },
];

const TEAM = [
  { name: 'Yusuf Abdullahi', role: 'Founder & CEO', init: 'YA', color: 'bg-green-700',  note: 'Lagos, Nigeria'  },
  { name: 'Amara Osei',      role: 'Head of Admissions', init: 'AO', color: 'bg-blue-700',   note: 'Accra, Ghana'    },
  { name: 'Fatima Diallo',   role: 'Lead Counsellor', init: 'FD', color: 'bg-purple-700', note: 'Abuja, Nigeria'  },
  { name: 'Emeka Chukwu',    role: 'Technology Lead', init: 'EC', color: 'bg-orange-600', note: 'Lagos, Nigeria'  },
];

const COUNTRIES = [
  { code: 'ng', name: 'Nigeria',     count: '400+ schools' },
  { code: 'gh', name: 'Ghana',       count: '60+ schools'  },
  { code: 'gm', name: 'The Gambia',  count: '20+ schools'  },
  { code: 'cm', name: 'Cameroon',    count: '20+ schools'  },
];

const WHY = [
  { icon: CheckCircle, label: 'Free to search — always', color: 'text-green-500' },
  { icon: CheckCircle, label: 'Every school manually verified', color: 'text-green-500' },
  { icon: CheckCircle, label: 'Real counsellors, not algorithms', color: 'text-green-500' },
  { icon: CheckCircle, label: 'Pay in Naira, Cedis, Dalasi', color: 'text-green-500' },
  { icon: CheckCircle, label: 'Serving 4 countries & growing', color: 'text-green-500' },
  { icon: CheckCircle, label: 'Discounted first tutor session', color: 'text-green-500' },
];

export default function About() {
  return (
    <div className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-110 sm:min-h-130 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-linear-to-br from-green-950/92 via-green-900/85 to-green-950/90" />
        <div className="relative max-w-5xl mx-auto px-4 text-center py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5 sm:mb-6">
            <Globe size={12} className="text-green-300" /> West Africa's Education Platform
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-5 tracking-tight leading-[1.1]">
            Transforming Education<br className="hidden sm:block" />
            <span className="text-green-300"> Access in West Africa</span>
          </h1>
          <p className="text-green-100 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
            From finding the perfect school in Lagos to landing a place at a top UK university — we&apos;re the one platform built for West African students and families.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="bg-white text-green-900 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition text-sm shadow-lg">
              Browse Schools →
            </Link>
            <Link to="/contact" className="border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition text-sm">
              Talk to Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 -mt-10 sm:-mt-12 relative z-10 p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0">
          {STATS.map(({ n, label, sub, icon: Icon, color, bg }, i) => (
            <div key={label} className={`text-center px-3 sm:px-6 py-2 ${i < 3 ? 'sm:border-r sm:border-gray-100' : ''}`}>
              <div className={`w-9 h-9 sm:w-10 sm:h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon size={16} className={color} />
              </div>
              <div className={`text-2xl sm:text-3xl font-extrabold ${color}`}>{n}</div>
              <div className="text-xs font-bold text-gray-700 mt-0.5">{label}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR STORY ─────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-14 sm:py-20">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-14 items-center">
          <div>
            <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">Our Story</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-5 leading-tight">Built by educators,<br className="hidden sm:block" /> for families</h2>
            <div className="space-y-3 sm:space-y-4 text-gray-500 leading-relaxed text-sm">
              <p>
                Naija &amp; Overseas was born from a frustration every Nigerian parent knows: finding the right school required weeks of research, phone calls, and site visits — with no guarantee the information was accurate.
              </p>
              <p>
                Founder Yusuf Abdullahi set out to build something different — a platform where parents could search, compare, and decide with confidence, completely free. Starting in Lagos, the platform grew to cover hundreds of schools across Nigeria.
              </p>
              <p>
                Students asked for help abroad too. So we built a study abroad service with real counsellors who have placed students in universities across the UK, Canada, Australia, Germany, and more.
              </p>
              <p>
                In 2026 we launched our tutor marketplace — making expert, one-on-one learning accessible to every student, wherever they are in the world. Today, Naija &amp; Overseas serves families across four countries. We&apos;re just getting started.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {WHY.map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                  <Icon size={13} className={`${color} shrink-0 mt-0.5`} /> {label}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white">
            <h3 className="text-base sm:text-lg font-bold text-white mb-6 sm:mb-8">Our Journey</h3>
            <div className="space-y-0">
              {MILESTONES.map(({ year, event, badge }, i) => (
                <div key={year} className="flex gap-4 sm:gap-5 pb-6 sm:pb-8 last:pb-0 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-[10px] sm:text-xs font-extrabold shrink-0 z-10 ring-4 ring-green-900">
                      {badge}
                    </div>
                    {i < MILESTONES.length - 1 && (
                      <div className="w-px bg-linear-to-b from-green-700 to-green-900/30 flex-1 mt-1" />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className="text-green-400 text-[11px] font-extrabold tracking-widest uppercase mb-1">{year}</p>
                    <p className="text-gray-300 text-xs sm:text-sm leading-snug">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION / VISION / VALUES ─────────────────────────────── */}
      <section className="bg-gray-950 py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <span className="inline-block text-green-400 text-[11px] font-extrabold uppercase tracking-[0.2em] mb-3">What Drives Us</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">The principles behind everything we build</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {VALUES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-7 hover:border-gray-700 transition">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 ${color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-extrabold text-white mb-2 sm:mb-3 text-sm sm:text-base">{title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-10">
          <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">What We Do</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Three ways we help</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-lg mx-auto">Every service built around one goal: giving West African students a fair shot at a great education.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {SERVICES.map(({ icon: Icon, title, desc, link, label, color }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition group flex flex-col">
              <div className={`w-11 h-11 sm:w-12 sm:h-12 ${color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5`}>
                <Icon size={20} className="text-white" />
              </div>
              <h3 className="font-extrabold text-gray-900 mb-2 text-sm sm:text-base">{title}</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-5 flex-1">{desc}</p>
              <Link to={link}
                className="inline-flex items-center gap-1.5 text-green-700 text-sm font-bold group-hover:gap-2.5 transition-all mt-auto">
                {label} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">The Team</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Meet the people behind it</h2>
            <p className="text-gray-500 mt-2 text-sm">Education experts passionate about transforming access for West African students.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {TEAM.map(({ name, role, init, color, note }) => (
              <div key={name} className="bg-white rounded-2xl p-5 sm:p-6 text-center border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 ${color} rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl font-extrabold mx-auto mb-3 sm:mb-4`}>
                  {init}
                </div>
                <h4 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight">{name}</h4>
                <p className="text-green-700 text-[10px] sm:text-xs font-semibold mt-0.5">{role}</p>
                <p className="text-gray-400 text-[10px] mt-1 hidden sm:block">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHERE WE SERVE ────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-10 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 sm:mb-8">Countries we currently serve</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {COUNTRIES.map(({ code, name, count }) => (
              <div key={name} className="flex flex-col items-center bg-gray-50 border border-gray-100 px-4 py-5 rounded-2xl text-center hover:border-green-200 hover:bg-green-50/30 transition">
                <img src={`https://flagcdn.com/w80/${code}.png`} alt={name} className="w-10 sm:w-12 h-auto rounded-md shadow-sm mb-3" />
                <p className="font-bold text-gray-900 text-xs sm:text-sm">{name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{count}</p>
                <CheckCircle size={12} className="text-green-500 mt-2" />
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4 sm:mt-6">
            More countries coming soon — <Link to="/contact" className="text-green-700 font-semibold hover:underline">get notified</Link>
          </p>
        </div>
      </section>

      {/* ── CONTACT STRIP ─────────────────────────────────────────── */}
      <section className="bg-gray-50 py-10 sm:py-12 px-4 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Find us online</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: Globe, label: 'Website',  value: 'www.naijaandoverseas.com',    href: 'https://naijaandoverseas.com',       color: 'bg-green-100 text-green-700'  },
              { icon: Mail,  label: 'Email',    value: 'info@naijaandoverseas.com',   href: 'mailto:info@naijaandoverseas.com',  color: 'bg-blue-100 text-blue-700'    },
              { icon: MapPin,label: 'HQ',       value: 'Lagos, Nigeria',              href: null,                                color: 'bg-orange-100 text-orange-700' },
            ].map(({ icon: Icon, label, value, href, color }) => (
              <div key={label} className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-4 sm:px-5 py-4 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                  {href ? (
                    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                      className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-green-700 transition truncate block">{value}</a>
                  ) : (
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="bg-green-900 text-white py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-green-400 text-[11px] font-extrabold uppercase tracking-[0.2em] mb-3">Get Started</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 leading-tight">
            Ready to make a better<br className="hidden sm:block" /> education decision?
          </h2>
          <p className="text-green-200 mb-8 sm:mb-10 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Join thousands of families already using Naija &amp; Overseas to search schools, explore study abroad, and find the perfect tutor.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/"
              className="bg-white text-green-900 font-bold px-7 py-3.5 rounded-xl hover:bg-green-50 transition text-sm shadow-lg">
              Compare Schools →
            </Link>
            <Link to="/study-abroad"
              className="border border-white/30 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white/10 transition text-sm">
              Study Abroad
            </Link>
            <Link to="/find-tutoring"
              className="border border-white/30 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white/10 transition text-sm">
              Find a Tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
