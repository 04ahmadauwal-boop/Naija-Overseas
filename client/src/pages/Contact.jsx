import { useState } from 'react';
import {
  Mail, Phone, MapPin, MessageSquare, Clock, Send,
  CheckCircle, Globe, Zap, Shield, ArrowRight,
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CONTACT_CARDS = [
  {
    icon: Mail,
    label: 'Email Us',
    value: 'info@naijaandoverseas.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:info@naijaandoverseas.com',
    color: 'bg-blue-700',
  },
  {
    icon: Phone,
    label: 'Call Us',
    value: '+234 701 234 5678',
    sub: 'Mon–Fri, 8 AM – 6 PM (WAT)',
    href: 'tel:+2347012345678',
    color: 'bg-green-700',
  },
  {
    icon: MessageSquare,
    label: 'WhatsApp',
    value: '+234 701 234 5678',
    sub: 'Chat with us any time',
    href: 'https://wa.me/2347012345678',
    color: 'bg-emerald-700',
  },
  {
    icon: MapPin,
    label: 'Headquarters',
    value: 'Lagos, Nigeria',
    sub: 'Also serving GH · GM · CM',
    href: null,
    color: 'bg-orange-600',
  },
];

const SUBJECTS = [
  'General Enquiry',
  'School Listing Help',
  'Study Abroad Services',
  'Find a Tutor',
  'Partnership & Advertising',
  'Technical Support',
  'Other',
];

const TRUST = [
  {
    icon: Zap,
    title: 'Fast Response',
    desc: 'All messages replied to within 24 hours on weekdays.',
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    desc: 'Your details are never shared with third parties.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Globe,
    title: 'Multi-Country',
    desc: 'We support enquiries from Nigeria, Ghana, Gambia & Cameroon.',
    color: 'bg-green-100 text-green-700',
  },
];

const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 sm:py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white placeholder-gray-400';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      toast.success('Message sent!');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative bg-gray-950 py-14 sm:py-20 px-4 overflow-hidden">
        {/* Dot-grid background */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-green-500/40 to-transparent" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <MessageSquare size={12} className="text-green-400" /> We&apos;re here to help
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 sm:mb-4 leading-tight tracking-tight">
            Let&apos;s <em className="text-green-400 not-italic">Talk</em>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
            Have a question about school listings, study abroad, tutoring, or anything else?
            We&apos;d love to hear from you.
          </p>

          {/* Quick contact pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            <a href="mailto:info@naijaandoverseas.com"
              className="flex items-center gap-2 text-xs font-semibold bg-white/10 hover:bg-white/15 border border-white/15 text-white px-3 py-2 rounded-full transition">
              <Mail size={12} className="text-green-400" /> info@naijaandoverseas.com
            </a>
            <a href="https://wa.me/2347012345678" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-xs font-semibold bg-white/10 hover:bg-white/15 border border-white/15 text-white px-3 py-2 rounded-full transition">
              <MessageSquare size={12} className="text-green-400" /> WhatsApp us →
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTACT CARDS ─────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 -mt-5 sm:-mt-6 relative z-10 mb-8 sm:mb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CONTACT_CARDS.map(({ icon: Icon, label, value, sub, href, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                {href ? (
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                    className="text-[11px] sm:text-xs font-bold text-gray-900 hover:text-green-700 transition break-all leading-snug block">{value}</a>
                ) : (
                  <p className="text-[11px] sm:text-xs font-bold text-gray-900 leading-snug">{value}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1 leading-snug hidden sm:block">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN: INFO + FORM ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-14 sm:pb-20">
        <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 items-start">

          {/* LEFT: Extra info */}
          <div className="lg:col-span-2 space-y-4">

            {/* Office hours */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Clock size={16} className="text-gray-600" />
                </div>
                <p className="font-bold text-gray-900 text-sm">Office Hours</p>
              </div>
              <div className="space-y-2.5 text-sm text-gray-600">
                {[
                  { day: 'Mon – Fri', hours: '8:00 AM – 6:00 PM (WAT)' },
                  { day: 'Saturday',  hours: '9:00 AM – 2:00 PM (WAT)' },
                  { day: 'Sunday',    hours: 'Closed' },
                ].map(({ day, hours }) => (
                  <div key={day} className="flex items-center justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                    <span className="font-semibold text-gray-800 text-xs sm:text-sm">{day}</span>
                    <span className={`text-[11px] sm:text-xs ${hours === 'Closed' ? 'text-gray-400' : 'text-gray-500'}`}>{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Where we are */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
              <p className="font-bold text-gray-900 text-sm mb-4">Where We Are</p>
              <div className="space-y-3">
                {[
                  { code: 'ng', country: 'Nigeria',    city: 'Lagos (HQ)',  active: true  },
                  { code: 'gh', country: 'Ghana',      city: 'Accra',       active: true  },
                  { code: 'gm', country: 'The Gambia', city: 'Banjul',      active: true  },
                  { code: 'cm', country: 'Cameroon',   city: 'Douala',      active: true  },
                ].map(({ code, country, city }) => (
                  <div key={country} className="flex items-center gap-3">
                    <img src={`https://flagcdn.com/w40/${code}.png`} alt={country}
                      className="w-6 h-auto rounded-sm shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 leading-none">{country}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{city}</p>
                    </div>
                    <CheckCircle size={12} className="text-green-500 ml-auto shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a href="https://wa.me/2347012345678" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white py-3.5 sm:py-4 rounded-2xl font-bold transition shadow-lg shadow-green-100 text-sm">
              <MessageSquare size={18} /> Chat on WhatsApp →
            </a>

            {/* Social / website */}
            <div className="bg-gray-950 rounded-2xl p-5 sm:p-6">
              <p className="text-white font-bold text-sm mb-3">Naija &amp; Overseas</p>
              <a href="https://naijaandoverseas.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-green-400 text-xs font-semibold hover:underline mb-4">
                <Globe size={13} /> naijaandoverseas.com
              </a>
              <p className="text-gray-500 text-xs leading-relaxed">
                West Africa&apos;s smartest school discovery and education platform. Free to use for parents and students.
              </p>
            </div>
          </div>

          {/* RIGHT: Contact form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-sm">
              {sent ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">
                    We&apos;ll get back to you within 24 hours. Check your email for a confirmation.
                  </p>
                  <button onClick={() => setSent(false)}
                    className="inline-flex items-center gap-2 bg-green-700 text-white px-7 py-3 rounded-xl font-semibold hover:bg-green-800 transition text-sm">
                    <ArrowRight size={14} /> Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">Send us a message</h3>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">We read every message and reply personally.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input required value={form.name} onChange={e => set('name', e.target.value)}
                          className={inp} placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input type="email" required value={form.email} onChange={e => set('email', e.target.value)}
                          className={inp} placeholder="you@example.com" />
                      </div>
                    </div>

                    {/* Phone + Subject */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                        <input value={form.phone} onChange={e => set('phone', e.target.value)}
                          className={inp} placeholder="+234 800 000 0000" />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Topic</label>
                        <select value={form.subject} onChange={e => set('subject', e.target.value)} className={inp}>
                          <option value="">Select a topic</option>
                          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea required value={form.message} onChange={e => set('message', e.target.value)}
                        className={inp + ' resize-none'} rows={6}
                        placeholder="Tell us how we can help — the more detail, the better." />
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                      className="w-full bg-green-700 text-white py-3.5 sm:py-4 rounded-xl font-bold hover:bg-green-800 active:scale-[0.99] transition disabled:opacity-60 text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-100">
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                      ) : (
                        <><Send size={15} /> Send Message</>
                      )}
                    </button>

                    <p className="text-center text-[11px] text-gray-400">
                      Prefer WhatsApp?{' '}
                      <a href="https://wa.me/2347012345678" target="_blank" rel="noreferrer"
                        className="text-green-700 font-semibold hover:underline">
                        Message us directly →
                      </a>
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-10 sm:py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {TRUST.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-start sm:flex-col sm:items-center sm:text-center gap-4 sm:gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-5 sm:p-6">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-0.5 sm:mb-1">{title}</h4>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
