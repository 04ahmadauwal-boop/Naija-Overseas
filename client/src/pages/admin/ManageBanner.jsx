import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdminNav } from './Dashboard';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const THEMES = [
  { value: 'dark',  label: 'Dark',  color: '#111827' },
  { value: 'green', label: 'Green', color: '#064e3b' },
  { value: 'blue',  label: 'Blue',  color: '#1e3a5f' },
];

const DEFAULT_FORM = {
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

function Field({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        {hint && <span className="text-[10px] text-gray-600 font-normal normal-case">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function ManageBanner() {
  const [form, setForm]       = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    api.get('/banner')
      .then(({ data }) => {
        const b = data.banner || {};
        setForm({
          badge:    b.badge    || DEFAULT_FORM.badge,
          headline: b.headline || DEFAULT_FORM.headline,
          body:     b.body     || DEFAULT_FORM.body,
          ctaLabel: b.ctaLabel || DEFAULT_FORM.ctaLabel,
          ctaLink:  b.ctaLink  || DEFAULT_FORM.ctaLink,
          stats:    b.stats?.length   ? b.stats   : DEFAULT_FORM.stats,
          bullets:  b.bullets?.length ? b.bullets : DEFAULT_FORM.bullets,
          bgTheme:  b.bgTheme  || DEFAULT_FORM.bgTheme,
          bgImage:  b.bgImage  || '',
        });
      })
      .catch(() => toast.error('Could not load current banner'))
      .finally(() => setLoading(false));
  }, []);

  const set       = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setStat   = (i, key, val) => setForm(f => { const s = [...f.stats]; s[i] = { ...s[i], [key]: val }; return { ...f, stats: s }; });
  const setBullet = (i, val)      => setForm(f => { const b = [...f.bullets]; b[i] = val; return { ...f, bullets: b }; });
  const addBullet    = ()  => setForm(f => ({ ...f, bullets: [...f.bullets, ''] }));
  const removeBullet = (i) => setForm(f => ({ ...f, bullets: f.bullets.filter((_, j) => j !== i) }));

  const save = async () => {
    if (!form.headline.trim() || !form.ctaLabel.trim()) {
      toast.error('Headline and CTA label are required');
      return;
    }
    setSaving(true);
    try {
      await api.put('/banner', form);
      toast.success('Banner saved — changes are live on the home page!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      toast.error(`Failed to save banner: ${msg}`);
      console.error('Banner save error:', err.response?.data || err.message);
    } finally {
      setSaving(false);
    }
  };

  const inp = 'w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 transition';
  const box = 'bg-gray-900 rounded-2xl p-5 sm:p-6 border border-gray-800';
  const sep = 'text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5 pb-3 border-b border-gray-800';

  if (loading) return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminNav />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminNav />

      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 lg:py-10">

          {/* Header */}
          <div className="flex items-start justify-between mb-8 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Home Page Banner</h1>
              <p className="text-gray-500 text-sm mt-1">Changes publish instantly to the home page.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/" target="_blank"
                className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-700 px-3 py-2 rounded-xl hover:bg-gray-800 transition whitespace-nowrap">
                <ExternalLink size={13} /> Preview
              </Link>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl transition text-sm shadow-lg shadow-green-900/30 whitespace-nowrap">
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          <div className="space-y-5">

            {/* Content */}
            <div className={box}>
              <p className={sep}>Banner Content</p>
              <div className="space-y-4">
                <Field label="Badge / Tag">
                  <input value={form.badge} onChange={e => set('badge', e.target.value)}
                    className={inp} placeholder="e.g. For School Owners" />
                </Field>
                <Field label="Headline">
                  <textarea value={form.headline} onChange={e => set('headline', e.target.value)}
                    rows={2} className={`${inp} resize-none`}
                    placeholder="Main headline — keep it short and punchy" />
                </Field>
                <Field label="Body Text">
                  <textarea value={form.body} onChange={e => set('body', e.target.value)}
                    rows={3} className={`${inp} resize-none`}
                    placeholder="Supporting description for the headline" />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="CTA Button Label">
                    <input value={form.ctaLabel} onChange={e => set('ctaLabel', e.target.value)}
                      className={inp} placeholder="e.g. List Your School" />
                  </Field>
                  <Field label="CTA Button Link">
                    <input value={form.ctaLink} onChange={e => set('ctaLink', e.target.value)}
                      className={inp} placeholder="e.g. /list-your-school" />
                  </Field>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className={box}>
              <p className={sep}>Appearance</p>
              <div className="space-y-4">
                <Field label="Colour Theme">
                  <div className="flex flex-wrap gap-2.5">
                    {THEMES.map(t => (
                      <button key={t.value} onClick={() => set('bgTheme', t.value)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                          form.bgTheme === t.value
                            ? 'border-green-500 text-white bg-gray-800 shadow-lg shadow-green-900/20'
                            : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                        }`}>
                        <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ background: t.color }} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Background Image URL" hint="(optional — overrides colour theme)">
                  <input value={form.bgImage} onChange={e => set('bgImage', e.target.value)}
                    className={inp} placeholder="https://images.unsplash.com/photo-..." />
                  {form.bgImage && (
                    <div className="mt-2 rounded-xl overflow-hidden h-20 border border-gray-700">
                      <img src={form.bgImage} alt="bg preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                    </div>
                  )}
                </Field>
              </div>
            </div>

            {/* Stats */}
            <div className={box}>
              <p className={sep}>Stats (4 items)</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {form.stats.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-24 shrink-0">
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-1">Value</p>
                      <input value={s.value} onChange={e => setStat(i, 'value', e.target.value)}
                        className={inp} placeholder="3x" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-1">Label</p>
                      <input value={s.label} onChange={e => setStat(i, 'label', e.target.value)}
                        className={inp} placeholder="More enquiries on average" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bullets */}
            <div className={box}>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-800">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">"What You Get" List</p>
                {form.bullets.length < 8 && (
                  <button onClick={addBullet}
                    className="flex items-center gap-1.5 text-green-400 hover:text-green-300 text-xs font-bold transition">
                    <Plus size={13} /> Add Item
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {form.bullets.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-5 text-center text-gray-700 text-[11px] font-bold shrink-0">{i + 1}</span>
                    <input value={b} onChange={e => setBullet(i, e.target.value)}
                      className={`${inp} flex-1`} placeholder="Feature or benefit..." />
                    <button onClick={() => removeBullet(i)}
                      className="w-8 h-9 flex items-center justify-center text-gray-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom save */}
          <div className="flex justify-end mt-6 pb-6">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-7 py-3 rounded-xl transition text-sm shadow-lg shadow-green-900/30">
              {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Saving Changes…' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
