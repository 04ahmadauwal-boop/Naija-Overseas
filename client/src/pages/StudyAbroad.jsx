import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, BookOpen, Plane, FileText, CheckCircle, Star,
  Clock, X, ArrowRight, ChevronLeft, ChevronRight,
  Users, Award, Shield, Zap, Phone, Mail,
  GraduationCap, MapPin, TrendingUp, Heart, ChevronDown
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { initializePaystack } from '../utils/paystack';

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
  { icon: Users, title: '100+ Students Placed', desc: 'Since 2022, we have successfully placed over 2,000 Nigerian students in universities across 8 countries worldwide.' },
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

/* ─── MAIN COMPONENT ────────────────────────────────────────── */

export default function StudyAbroad() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [, setPayRef] = useState('');
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', destinationCountry: '', program: '',
    educationLevel: '', consultDate: '', consultTime: '',
  });
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [coupon, setCoupon] = useState(null); // { type, value, discountAmount, finalAmount, message }
  const [couponError, setCouponError] = useState('');

  const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];
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

  const handleStep1 = async (e) => {
    e.preventDefault();
    if (!form.consultDate) { toast.error('Please select a consultation date.'); return; }
    if (!form.consultTime) { toast.error('Please select a consultation time.'); return; }
    setLoading(true);
    try {
      await api.post('/study-abroad/check-email', { email: form.email });
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError('');
    setCoupon(null);
    try {
      const { data } = await api.post('/coupons/validate', { code });
      setCoupon(data);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const saveBooking = async (reference, finalAmount) => {
    setPayRef(reference);
    await api.post('/study-abroad/consultation', {
      ...form,
      reference,
      couponCode: coupon ? couponInput.trim().toUpperCase() : undefined,
      finalAmount,
    });
  };

  const handlePayment = async () => {
    const finalAmount = coupon ? coupon.finalAmount : 10000;

    // Free booking — skip Paystack entirely
    if (finalAmount === 0) {
      setLoading(true);
      try {
        await saveBooking(`FREE-${couponInput.trim().toUpperCase()}-${Date.now()}`, 0);
        setSubmitted(true);
      } catch (err) {
        console.error('Booking save error:', err);
        toast.error(err.response?.data?.message || 'Booking failed. Please contact us.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Paid booking — go through Paystack
    initializePaystack({
      email: form.email,
      amount: finalAmount,
      metadata: {
        name: form.fullName,
        phone: form.phone,
        educationLevel: form.educationLevel,
        destination: form.destinationCountry,
        program: form.program,
        consultDate: form.consultDate,
        consultTime: form.consultTime,
        couponCode: coupon ? couponInput.trim().toUpperCase() : undefined,
      },
      onSuccess: async (reference) => {
        setLoading(true);
        try {
          await saveBooking(reference, finalAmount);
          setSubmitted(true);
        } catch (err) {
          console.error('Booking save error:', err);
          toast.error(
            err.response?.data?.message ||
            'Payment received but booking record failed. Contact us with reference: ' + reference
          );
        } finally {
          setLoading(false);
        }
      },
      onClose: () => {},
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setSubmitted(false);
    setStep(1);
    setPayRef('');
    setForm({ fullName: '', email: '', phone: '', destinationCountry: '', program: '', educationLevel: '', consultDate: '', consultTime: '' });
    setCouponInput('');
    setCoupon(null);
    setCouponError('');
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 transition';
  const current = HERO_SLIDES[slide];

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — HERO SLIDER
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col overflow-hidden"
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
        <div className="relative z-20">
          <div className="max-w-7xl mx-auto px-6 pt-14 pb-6 sm:pt-16 sm:pb-8 md:pt-20 md:pb-12 w-full grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT: Country info */}
            <div>
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
                {/* <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Clock size={11} className="text-yellow-400" /> Intakes: {current.intakes}
                </span> */}
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
                <div className="space-y-1.5">
                  {current.universities.map(({ name, rank }, i) => (
                    <div key={name} className="flex items-center gap-4 bg-white/10 rounded-xl px-3 py-2">
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
                  Book Consultation <ArrowRight size={15} />
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
            ['100+', 'Students Successfully Placed'],
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
              { n: '100+', l: 'Students Placed', color: 'bg-green-700' },
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

                  {/* Bottom content — glassy frosted card */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="relative overflow-hidden rounded-xl p-4 bg-white/10 backdrop-blur-xl border border-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
                      {/* Glossy diagonal sheen */}
                      <div className="pointer-events-none absolute -inset-x-12 -top-1/2 h-[220%] rotate-12 bg-linear-to-b from-white/30 via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-10" />
                      {/* Inner top highlight edge */}
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-white/60 via-white/10 to-transparent" />

                      <h3 className="relative text-white font-extrabold text-xl leading-tight mb-1">{country}</h3>
                      <p className="relative text-white/70 text-xs mb-3">{highlight}</p>
                      <span className="relative inline-flex items-center gap-1.5 bg-green-600 group-hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                        Read More <ArrowRight size={12} />
                      </span>
                    </div>
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
      <section className="bg-gray-950 py-14 sm:py-20 px-4 relative overflow-hidden">
        {/* Subtle dot grid */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-green-500/40 to-transparent" />

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block text-green-400 text-[11px] font-extrabold uppercase tracking-[0.2em] mb-3">Simple Process</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight">
              How It Works
            </h2>
            <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">4 steps from first call to university offer.</p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4 sm:gap-0 relative">
            {/* Horizontal connector — desktop only */}
            <div className="hidden sm:block absolute top-[30px] left-[calc(12.5%+8px)] right-[calc(12.5%+8px)] h-px bg-linear-to-r from-green-800 via-green-600 to-green-800 z-0" />

            {[
              { icon: FileText, badge: '01', time: 'Day 1',       title: 'Free Consultation',       desc: 'Profile review by a senior counsellor within 48 hrs.'       },
              { icon: BookOpen, badge: '02', time: '24–48 hrs',   title: 'University Shortlist',    desc: '5–10 universities matched to your goals and budget.'        },
              { icon: Globe,    badge: '03', time: '2–4 weeks',   title: 'Apply & Document',        desc: 'Personal statement, documents, and applications handled.'   },
              { icon: Plane,    badge: '04', time: 'Offer stage', title: 'Visa & Departure',        desc: 'Visa support, pre-departure prep, first semester guidance.' },
            ].map(({ icon: Icon, badge, time, title, desc }) => (
              <div key={title} className="relative z-10 flex flex-col items-center text-center px-2 sm:px-4 group">
                {/* Icon bubble */}
                <div className="relative mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-green-800 border border-green-700 flex items-center justify-center shadow-lg shadow-green-950 ring-4 ring-green-900/60 group-hover:bg-green-700 transition-colors duration-200">
                    <Icon size={20} className="text-green-300" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 text-gray-900 text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md">
                    {badge}
                  </span>
                </div>
                {/* Time chip */}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-900/50 border border-green-800 px-2 py-0.5 rounded-full mb-2.5">
                  <Clock size={8} /> {time}
                </span>
                <h3 className="font-extrabold text-white text-xs sm:text-sm mb-1.5 leading-snug">{title}</h3>
                <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-10 sm:mt-14">
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-7 sm:px-8 py-3 sm:py-3.5 rounded-full transition shadow-lg shadow-green-900/40 text-sm">
              Start My Application <ArrowRight size={15} />
            </button>
            <p className="text-gray-600 text-xs mt-3">Free assessment · No upfront commitment</p>
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
                Everything you need to know about studying abroad with us.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold text-sm px-5 py-2.5 rounded-full transition shadow-lg shadow-green-900/30"
              >
                Talk to a counsellor <ArrowRight size={14} />
              </button>
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
              {FAQS.map(({ q, a }) => <FAQItem key={q} q={q} a={a} />)}
            </div>
          </div>
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
                { icon: Mail, text: 'info@visiteno.com' },
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
          CONSULTATION BOOKING MODAL
      ══════════════════════════════════════════════════════════ */}
      {showForm && (() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const calYear = calMonth.getFullYear();
        const calMonthIdx = calMonth.getMonth();
        const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate();
        const firstDay = new Date(calYear, calMonthIdx, 1).getDay();
        const canGoPrev = calMonth > new Date(today.getFullYear(), today.getMonth(), 1);
        const fmtDate = (ds) => {
          if (!ds) return '';
          const [y, m, d] = ds.split('-');
          return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        };

        return (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
            <div className={`bg-white rounded-3xl w-full my-auto shadow-2xl overflow-hidden ${step === 1 ? 'max-w-2xl' : 'max-w-md'}`}>

              {/* Header */}
              <div className="bg-green-900 px-7 py-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    {submitted ? 'Booking Confirmed!' : step === 1 ? 'Book a Consultation' : 'Review & Pay'}
                  </h2>
                  <p className="text-green-300 text-xs mt-0.5">
                    {submitted ? 'Your slot is reserved' : step === 1 ? 'Pick a date and time that works for you' : 'Consultation fee — ₦10,000'}
                  </p>
                </div>
                <button onClick={resetForm}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-800 text-green-300 hover:bg-green-700 transition">
                  <X size={16} />
                </button>
              </div>

              {/* Step indicator */}
              {!submitted && (
                <div className="flex border-b border-gray-100">
                  {['Your Details', 'Confirm & Pay'].map((label, i) => (
                    <div key={label} className={`flex-1 py-2.5 text-center text-xs font-semibold transition
                      ${step === i + 1 ? 'text-green-700 border-b-2 border-green-600' : 'text-gray-400'}`}>
                      {i + 1}. {label}
                    </div>
                  ))}
                </div>
              )}

              {/* ── SUCCESS ── */}
              {submitted && (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">Consultation Booked!</h3>
                  <p className="text-gray-500 text-sm mb-1">Thank you, <strong>{form.fullName}</strong>.</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Your consultation is scheduled for<br />
                    <strong className="text-gray-800">{fmtDate(form.consultDate)} at {form.consultTime}</strong>.
                  </p>
                  <p className="text-gray-400 text-xs mb-6">A confirmation has been sent to <strong>{form.email}</strong> and via WhatsApp to <strong>{form.phone}</strong>. Our counsellor will reach out shortly before your slot.</p>
                  <button onClick={resetForm}
                    className="bg-green-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-800 transition text-sm">
                    Done
                  </button>
                </div>
              )}

              {/* ── STEP 1: Details + Calendar ── */}
              {!submitted && step === 1 && (
                <form onSubmit={handleStep1} className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">

                    {/* Left — personal info */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Your Information</p>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input type="text" required value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inp} placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <input type="email" required value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} placeholder="you@email.com" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                        <input type="tel" required value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} placeholder="+234 800..." />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Destination <span className="text-red-500">*</span></label>
                        <select required value={form.destinationCountry}
                          onChange={(e) => setForm({ ...form, destinationCountry: e.target.value })} className={inp}>
                          <option value="">Select a country</option>
                          {DESTINATIONS.map(({ country }) => <option key={country}>{country}</option>)}
                          <option>Others</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Program / Course</label>
                        <input value={form.program}
                          onChange={(e) => setForm({ ...form, program: e.target.value })} className={inp} placeholder="e.g. Computer Science" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Highest Level of Education <span className="text-red-500">*</span></label>
                        <select required value={form.educationLevel}
                          onChange={(e) => setForm({ ...form, educationLevel: e.target.value })} className={inp}>
                          <option value="">Select education level</option>
                          <option>WAEC / SSCE (Secondary School)</option>
                          <option>OND (Ordinary National Diploma)</option>
                          <option>HND (Higher National Diploma)</option>
                          <option>B.Sc / B.A (Bachelor's Degree)</option>
                          <option>M.Sc / M.A (Master's Degree)</option>
                          <option>PhD</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Right — calendar + time slots */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pick a Date <span className="text-red-500">*</span></p>

                      {/* Month nav */}
                      <div className="flex items-center justify-between mb-2">
                        <button type="button" onClick={() => setCalMonth(new Date(calYear, calMonthIdx - 1, 1))}
                          disabled={!canGoPrev}
                          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition">
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-bold text-gray-800">
                          {calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button" onClick={() => setCalMonth(new Date(calYear, calMonthIdx + 1, 1))}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* Day headers */}
                      <div className="grid grid-cols-7 mb-1">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
                        ))}
                      </div>

                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-0.5">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const day = i + 1;
                          const date = new Date(calYear, calMonthIdx, day);
                          const isPast = date < today;
                          const dateStr = `${calYear}-${String(calMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const isSelected = form.consultDate === dateStr;
                          return (
                            <button key={day} type="button" disabled={isPast}
                              onClick={() => setForm({ ...form, consultDate: dateStr, consultTime: '' })}
                              className={`aspect-square rounded-lg text-xs font-medium transition flex items-center justify-center
                                ${isPast ? 'text-gray-300 cursor-not-allowed' : isSelected ? 'bg-green-600 text-white font-bold shadow' : 'hover:bg-green-50 text-gray-700'}`}>
                              {day}
                            </button>
                          );
                        })}
                      </div>

                      {/* Time slots */}
                      {form.consultDate && (
                        <div className="mt-4">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pick a Time <span className="text-red-500">*</span></p>
                          <div className="grid grid-cols-4 gap-1.5">
                            {TIME_SLOTS.map((t) => (
                              <button key={t} type="button"
                                onClick={() => setForm({ ...form, consultTime: t })}
                                className={`py-2 rounded-xl text-xs font-semibold border transition
                                  ${form.consultTime === t ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'}`}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={resetForm}
                      className="flex-1 border border-gray-200 rounded-xl py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 bg-green-700 text-white rounded-xl py-3.5 text-sm font-bold hover:bg-green-800 disabled:opacity-60 transition flex items-center justify-center gap-2">
                      {loading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking…</>
                        : <>Continue <ArrowRight size={15} /></>}
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP 2: Review & Pay ── */}
              {!submitted && step === 2 && (
                <div className="p-7">
                  <div className="bg-gray-50 rounded-2xl p-5 mb-5 space-y-3 border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Booking Summary</p>
                    {[
                      ['Name', form.fullName],
                      ['Email', form.email],
                      ['Phone', form.phone],
                      ['Education Level', form.educationLevel || '—'],
                      ['Destination', form.destinationCountry || '—'],
                      ['Program', form.program || '—'],
                      ['Date', fmtDate(form.consultDate)],
                      ['Time', form.consultTime],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-semibold text-gray-800 text-right max-w-[60%]">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Coupon code */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Coupon Code <span className="normal-case font-normal text-gray-400">(optional)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCoupon(null); setCouponError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && applyCoupon()}
                        className={`flex-1 border rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 transition
                          ${coupon ? 'border-green-400 bg-green-50 focus:ring-green-400' : couponError ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-200 bg-gray-50 focus:ring-green-500'}`}
                        placeholder="ENTER CODE"
                        disabled={!!coupon}
                      />
                      {coupon ? (
                        <button type="button" onClick={() => { setCoupon(null); setCouponInput(''); setCouponError(''); }}
                          className="px-4 py-2.5 text-xs font-bold border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100 transition">
                          Remove
                        </button>
                      ) : (
                        <button type="button" onClick={applyCoupon} disabled={couponLoading || !couponInput.trim()}
                          className="px-4 py-2.5 text-xs font-bold bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:opacity-40 transition">
                          {couponLoading ? '...' : 'Apply'}
                        </button>
                      )}
                    </div>
                    {coupon && (
                      <p className="mt-1.5 text-xs font-semibold text-green-700 flex items-center gap-1">
                        <CheckCircle size={12} /> {coupon.message}
                      </p>
                    )}
                    {couponError && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">{couponError}</p>
                    )}
                  </div>

                  {/* Fee breakdown */}
                  <div className={`rounded-2xl p-4 mb-5 border ${coupon ? 'bg-green-50 border-green-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Consultation Fee</span>
                      <span className={`text-sm font-semibold ${coupon ? 'line-through text-gray-400' : 'text-gray-800'}`}>₦10,000</span>
                    </div>
                    {coupon && coupon.discountAmount > 0 && (
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-green-700">Discount ({coupon.type === 'full' ? '100%' : coupon.value + '%'})</span>
                        <span className="text-sm font-semibold text-green-700">− ₦{coupon.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-green-200 mt-2">
                      <span className="text-sm font-bold text-green-900">Total</span>
                      <span className="text-xl font-extrabold text-green-700">
                        {coupon && coupon.finalAmount === 0 ? 'FREE' : `₦${(coupon ? coupon.finalAmount : 10000).toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex-1 border border-gray-200 rounded-xl py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1.5">
                      <ChevronLeft size={15} /> Back
                    </button>
                    <button type="button" onClick={handlePayment} disabled={loading}
                      className="flex-1 bg-green-700 text-white rounded-xl py-3.5 text-sm font-bold hover:bg-green-800 disabled:opacity-60 transition flex items-center justify-center gap-2">
                      {loading
                        ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                        : coupon && coupon.finalAmount === 0
                          ? <>Confirm Free Booking <ArrowRight size={15} /></>
                          : <>Pay ₦{(coupon ? coupon.finalAmount : 10000).toLocaleString()} <ArrowRight size={15} /></>}
                    </button>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-3">
                    {coupon && coupon.finalAmount === 0 ? 'No payment required — coupon covers full fee' : 'Secured by Paystack · SSL encrypted'}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
