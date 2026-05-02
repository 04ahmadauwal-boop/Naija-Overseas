import { Link } from 'react-router-dom';
import { Target, Eye, Users, Globe, School, CheckCircle, ArrowRight, BookOpen, Plane } from 'lucide-react';

const STATS = [
  { n: '500+', label: 'Schools Listed', icon: School },
  { n: '10,000+', label: 'Students Helped', icon: Users },
  { n: '4', label: 'Countries Served', icon: Globe },
  { n: '50+', label: 'Partner Universities', icon: BookOpen },
];

const VALUES = [
  { icon: Target, title: 'Our Mission', color: 'bg-green-100 text-green-700', desc: 'To simplify school discovery and international university admissions for every student and family across West Africa — removing information barriers and levelling the playing field.' },
  { icon: Eye, title: 'Our Vision', color: 'bg-blue-100 text-blue-700', desc: 'A future where every Nigerian and West African student can access quality education — locally and internationally — without barriers, without confusion, without unnecessary cost.' },
  { icon: Users, title: 'Our People', color: 'bg-purple-100 text-purple-700', desc: 'A passionate team of education enthusiasts, tech professionals, and international admissions experts, united by a belief that the right school can change a life.' },
];

const MILESTONES = [
  { year: '2022', event: 'Naija & Overseas founded in Lagos, Nigeria' },
  { year: '2023', event: '100+ schools listed, first 1,000 families served' },
  { year: '2024', event: 'Study Abroad placement service launched' },
  { year: '2025', event: 'Expanded to Ghana, The Gambia & Cameroon' },
];

const SERVICES = [
  { icon: School, title: 'Smart School Comparison', desc: 'Our intelligent tool lets parents and students evaluate schools side by side — fees, facilities, curriculum, and location — before making a decision.', link: '/', label: 'Compare Schools' },
  { icon: Plane, title: 'Study Abroad Placement', desc: 'End-to-end support: university selection, application strategy, personal statement coaching, and visa guidance for top universities worldwide.', link: '/study-abroad', label: 'Learn More' },
  { icon: Globe, title: 'School Listing Platform', desc: 'School owners list their institutions, reach a wider audience, and manage their online presence easily through our verified listing process.', link: '/list-your-school', label: 'List Your School' },
];

const TEAM = [
  { name: 'Yusuf Abdullahi', role: 'Founder & CEO', init: 'YA', color: 'bg-green-700' },
  { name: 'Amara Osei', role: 'Head of Admissions', init: 'AO', color: 'bg-blue-700' },
  { name: 'Fatima Diallo', role: 'Lead Counsellor', init: 'FD', color: 'bg-purple-700' },
  { name: 'Emeka Chukwu', role: 'Technology Lead', init: 'EC', color: 'bg-orange-600' },
];

const COUNTRIES = [
  { flag: '🇳🇬', name: 'Nigeria' },
  { flag: '🇬🇭', name: 'Ghana' },
  { flag: '🇬🇲', name: 'The Gambia' },
  { flag: '🇨🇲', name: 'Cameroon' },
];

export default function About() {
  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-110 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-linear-to-b from-green-950/85 via-green-900/75 to-green-950/85" />
        <div className="relative max-w-4xl mx-auto px-4 text-center py-24">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Globe size={12} /> West Africa's Education Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-5 tracking-tight leading-tight">
            Transforming Education<br />Access in West Africa
          </h1>
          <p className="text-green-200 text-lg max-w-2xl mx-auto leading-relaxed">
            We&apos;re on a mission to make quality education accessible for every student — from finding the right school in Nigeria to landing a spot at a top international university.
          </p>
        </div>
      </section>

      {/* ── STATS BAR (overlapping hero) ──────────────────────── */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 -mt-12 relative z-10 p-6 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-100">
          {STATS.map(({ n, label, icon: Icon }) => (
            <div key={label} className="text-center px-6 py-2">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Icon size={18} className="text-green-700" />
              </div>
              <div className="text-3xl font-extrabold text-green-800">{n}</div>
              <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUR STORY ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">Our Story</div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-5">Built by educators, for families</h2>
            <div className="space-y-4 text-gray-500 leading-relaxed text-sm">
              <p>
                Naija &amp; Overseas was born out of a frustration we heard from parents everywhere: finding the right school in Nigeria required weeks of research, phone calls, and site visits — with no guarantee the information was accurate or up to date.
              </p>
              <p>
                We set out to build something different. A platform where parents could search, compare, and make confident decisions about their children's education — all in one place, completely free.
              </p>
              <p>
                As we grew, we heard a second challenge: Nigerian students wanting to study abroad but not knowing where to start, who to trust, or how to navigate the complex admissions process. So we built a study abroad service too — with real counsellors who care.
              </p>
              <p>
                Today, Naija &amp; Overseas serves families across Nigeria, Ghana, The Gambia, and Cameroon. We&apos;re just getting started.
              </p>
            </div>
          </div>

          <div className="bg-gray-950 rounded-3xl p-8 text-white">
            <h3 className="text-lg font-bold text-white mb-6">Our Journey</h3>
            <div className="space-y-0">
              {MILESTONES.map(({ year, event }, i) => (
                <div key={year} className="flex gap-5 pb-8 last:pb-0 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10">
                      {year.slice(2)}
                    </div>
                    {i < MILESTONES.length - 1 && <div className="w-px bg-green-900 flex-1 mt-1" />}
                  </div>
                  <div className="pt-2">
                    <p className="text-green-400 text-xs font-semibold mb-0.5">{year}</p>
                    <p className="text-gray-300 text-sm">{event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-gray-900">What Drives Us</h2>
            <p className="text-gray-500 mt-2 text-sm">The principles behind everything we build and every decision we make.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-gray-900">What We Do</h2>
          <p className="text-gray-500 mt-2 text-sm">Three ways we help students and families across West Africa.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map(({ icon: Icon, title, desc, link, label }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition group">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
                <Icon size={22} className="text-green-700" />
              </div>
              <h3 className="font-extrabold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{desc}</p>
              <Link to={link}
                className="inline-flex items-center gap-1.5 text-green-700 text-sm font-bold group-hover:gap-2.5 transition-all">
                {label} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-gray-900">Meet the Team</h2>
            <p className="text-gray-500 mt-2 text-sm">Education experts passionate about transforming access for West African students.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TEAM.map(({ name, role, init, color }) => (
              <div key={name} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white text-xl font-extrabold mx-auto mb-4`}>
                  {init}
                </div>
                <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
                <p className="text-gray-400 text-xs mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COUNTRIES BAR ─────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs text-gray-400 font-semibold uppercase tracking-wider mb-5">Currently serving</p>
          <div className="flex flex-wrap justify-center gap-6">
            {COUNTRIES.map(({ flag, name }) => (
              <div key={name} className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 px-5 py-3 rounded-full">
                <span className="text-2xl">{flag}</span>
                <span className="font-semibold text-gray-700 text-sm">{name}</span>
                <CheckCircle size={14} className="text-green-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="bg-green-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-3">Ready to Get Started?</h2>
          <p className="text-green-200 mb-8 max-w-xl mx-auto">
            Join thousands of families already using Naija &amp; Overseas to make better education decisions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/" className="bg-white text-green-900 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition">
              Compare Schools →
            </Link>
            <Link to="/study-abroad" className="border border-white/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-green-800 transition">
              Study Abroad
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
