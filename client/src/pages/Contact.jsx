import { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Clock, Send, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CONTACT_INFO = [
  { icon: Mail, label: 'Email Us', value: 'info@naijaandoverseas.com', href: 'mailto:info@naijaandoverseas.com', color: 'bg-blue-100 text-blue-700' },
  { icon: Phone, label: 'Call Us', value: '+234 800 000 0000', href: 'tel:+2348000000000', color: 'bg-green-100 text-green-700' },
  { icon: MessageSquare, label: 'WhatsApp', value: '+234 800 000 0000', href: 'https://wa.me/2348000000000', color: 'bg-emerald-100 text-emerald-700' },
  { icon: MapPin, label: 'Locations', value: 'Nigeria · Ghana · The Gambia · Cameroon', href: null, color: 'bg-orange-100 text-orange-700' },
];

const SUBJECTS = ['General Enquiry', 'School Listing Help', 'Study Abroad Services', 'Partnership & Advertising', 'Technical Support', 'Other'];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

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

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white';

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 pt-16 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <MessageSquare size={12} /> We&apos;re here to help
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-gray-900 mb-3">Let&apos;s Talk</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Have a question about our platform, school listings, or study abroad services? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* LEFT: Contact info */}
          <div className="lg:col-span-2 space-y-5">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h2>

            {CONTACT_INFO.map(({ icon: Icon, label, value, href, color }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition group">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                        className="font-semibold text-gray-900 hover:text-green-700 transition text-sm">{value}</a>
                    ) : (
                      <p className="font-semibold text-gray-900 text-sm">{value}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Clock size={15} className="text-gray-600" />
                </div>
                <p className="font-bold text-gray-900 text-sm">Office Hours</p>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600 pl-11">
                <p><span className="font-medium">Mon – Fri:</span> 8:00 AM – 6:00 PM (WAT)</p>
                <p><span className="font-medium">Saturday:</span> 9:00 AM – 2:00 PM</p>
                <p className="text-gray-400">Sunday: Closed</p>
              </div>
            </div>

            <a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-green-500 text-white py-4 rounded-2xl font-bold hover:bg-green-600 transition shadow-lg shadow-green-100">
              <MessageSquare size={18} /> Chat on WhatsApp →
            </a>
          </div>

          {/* RIGHT: Form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-6">We&apos;ll get back to you within 24 hours. Check your email for a confirmation.</p>
                  <button onClick={() => setSent(false)}
                    className="bg-green-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-800 transition text-sm">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a message</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                        <input required value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={inp} placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                        <input type="email" required value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className={inp} placeholder="you@example.com" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone number</label>
                        <input value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className={inp} placeholder="+234 800 000 0000" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                        <select value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          className={inp}>
                          <option value="">Select a topic</option>
                          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                      <textarea required value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className={inp + ' resize-none'} rows={6}
                        placeholder="Tell us how we can help you..." />
                    </div>

                    <button type="submit" disabled={loading}
                      className="w-full bg-green-700 text-white py-4 rounded-xl font-bold hover:bg-green-800 transition disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                      {loading ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                      ) : (
                        <><Send size={16} /> Send Message</>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 text-center">
          {[
            { icon: 'âš¡', title: 'Fast Response', desc: 'We reply to all messages within 24 hours on weekdays.' },
            { icon: 'ðŸ”’', title: 'Private & Secure', desc: 'Your information is never shared with third parties.' },
            { icon: 'ðŸŒ', title: 'Multi-Country', desc: 'We support enquiries from Nigeria, Ghana, Gambia & Cameroon.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="text-3xl mb-3">{icon}</div>
              <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
