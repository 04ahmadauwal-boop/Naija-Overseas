import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Building2, School, GraduationCap, Globe,
  MapPin, BookOpen, DollarSign, CheckCircle,
  ChevronLeft, ChevronRight, Search, Check,
  ArrowRight, AlertCircle
} from 'lucide-react';
import api from '../utils/api';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara',
];

const SCHOOL_TYPES = [
  { value: 'private',       label: 'Private',       icon: Building2,    bg: 'bg-blue-50',    ic: 'text-blue-600',   desc: 'Independent school' },
  { value: 'public',        label: 'Public',         icon: School,       bg: 'bg-green-50',   ic: 'text-green-600',  desc: 'State government' },
  { value: 'federal',       label: 'Federal',        icon: GraduationCap,bg: 'bg-purple-50',  ic: 'text-purple-600', desc: 'Federal government' },
  { value: 'international', label: 'International',  icon: Globe,        bg: 'bg-orange-50',  ic: 'text-orange-600', desc: 'International curriculum' },
];

const LEVELS = [
  { value: 'primary',   label: 'Primary',   desc: 'Ages 6–11',  icon: BookOpen,       ic: 'text-teal-600',   bg: 'bg-teal-50' },
  { value: 'secondary', label: 'Secondary', desc: 'Ages 12–18', icon: GraduationCap,  ic: 'text-blue-600',   bg: 'bg-blue-50' },
  { value: 'both',      label: 'Both',      desc: 'All levels', icon: School,         ic: 'text-green-600',  bg: 'bg-green-50' },
];

const BUDGETS = [
  { label: 'Below ₦100,000',         min: '',        max: '100000'  },
  { label: '₦100,000 – ₦300,000',    min: '100000',  max: '300000'  },
  { label: '₦300,000 – ₦500,000',    min: '300000',  max: '500000'  },
  { label: '₦500,000 – ₦1,000,000',  min: '500000',  max: '1000000' },
  { label: 'Above ₦1,000,000',        min: '1000000', max: ''        },
];

const CURRICULA = ['WAEC', 'NECO', 'IGCSE', 'IB', 'Cambridge', 'BECE'];

const STEPS = [
  { id: 'type',       icon: Building2,    label: 'School Type' },
  { id: 'location',   icon: MapPin,       label: 'Location'    },
  { id: 'level',      icon: GraduationCap,label: 'Level'       },
  { id: 'budget',     icon: DollarSign,   label: 'Budget'      },
  { id: 'curriculum', icon: BookOpen,     label: 'Curriculum'  },
];
const TOTAL = STEPS.length;

function SchoolResultCard({ school }) {
  const fee = school.fees?.tuition
    ? `₦${Number(school.fees.tuition).toLocaleString()}/yr`
    : 'Contact school';

  return (
    <Link
      to={`/schools/${school.slug || school._id}`}
      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 border border-gray-100 transition group"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-green-50 shrink-0 flex items-center justify-center">
        {school.images?.[0]
          ? <img src={school.images[0]} alt={school.name} className="w-full h-full object-cover" />
          : <BookOpen size={20} className="text-green-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate group-hover:text-green-700 transition">{school.name}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
          <MapPin size={10} />
          <span className="truncate">{[school.city, school.state].filter(Boolean).join(', ')}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md font-semibold capitalize">{school.type}</span>
          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-md font-semibold capitalize">{school.level}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs font-bold text-gray-700">{fee}</p>
        <ArrowRight size={14} className="text-gray-300 group-hover:text-green-600 transition mt-1 ml-auto" />
      </div>
    </Link>
  );
}

export default function FindSchoolModal({ onClose }) {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState({
    type: '', state: '', level: '',
    budget: null, curriculum: [],
  });
  const [results, setResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsTotal, setResultsTotal] = useState(0);

  const set = (k, v) => setPrefs(p => ({ ...p, [k]: p[k] === v ? '' : v }));

  const toggleCurr = (c) => setPrefs(p => ({
    ...p,
    curriculum: p.curriculum.includes(c)
      ? p.curriculum.filter(x => x !== c)
      : [...p.curriculum, c],
  }));

  const next = () => setStep(s => Math.min(s + 1, TOTAL));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const buildParams = () => {
    const p = new URLSearchParams();
    if (prefs.type)  p.set('type', prefs.type);
    if (prefs.state) p.set('state', prefs.state);
    if (prefs.level && prefs.level !== 'both') p.set('level', prefs.level);
    if (prefs.budget?.min) p.set('minFee', prefs.budget.min);
    if (prefs.budget?.max) p.set('maxFee', prefs.budget.max);
    if (prefs.curriculum.length === 1) p.set('curriculum', prefs.curriculum[0]);
    return p;
  };

  const findSchools = async () => {
    setResultsLoading(true);
    const p = buildParams();
    p.set('limit', '12');
    try {
      const { data } = await api.get('/schools', { params: Object.fromEntries(p) });
      setResults(data.schools || []);
      setResultsTotal(data.total ?? (data.schools?.length ?? 0));
    } catch {
      setResults([]);
      setResultsTotal(0);
    } finally {
      setResultsLoading(false);
    }
  };

  const isSummary = step === TOTAL;
  const showResults = results !== null;

  /* ── STEP SCREENS ─────────────────────────────────────────── */
  const screens = [

    /* 0 — School Type */
    <div key="type" className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
        <Building2 size={26} className="text-green-600" />
      </div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">What type of school?</h2>
      <p className="text-gray-400 text-sm mb-6">Choose the school category you prefer</p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {SCHOOL_TYPES.map(({ value, label, icon: Icon, bg, ic, desc }) => {
          const sel = prefs.type === value;
          return (
            <button key={value} type="button" onClick={() => set('type', value)}
              className={`relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all text-center ${
                sel ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
              }`}>
              {sel && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </div>
              )}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${sel ? 'bg-green-100' : bg}`}>
                <Icon size={20} className={sel ? 'text-green-600' : ic} />
              </div>
              <div>
                <p className={`font-bold text-sm ${sel ? 'text-green-700' : 'text-gray-800'}`}>{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-4">Skip to see all types</p>
    </div>,

    /* 1 — Location */
    <div key="location" className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
        <MapPin size={26} className="text-blue-600" />
      </div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">Which state?</h2>
      <p className="text-gray-400 text-sm mb-7">Select the state where you want the school</p>
      <select value={prefs.state} onChange={e => setPrefs(p => ({ ...p, state: e.target.value }))}
        className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-800 focus:outline-none focus:border-green-500 bg-white transition">
        <option value="">All states (show nationwide)</option>
        {NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
      </select>
    </div>,

    /* 2 — Level */
    <div key="level" className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
        <GraduationCap size={26} className="text-purple-600" />
      </div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">School level?</h2>
      <p className="text-gray-400 text-sm mb-6">What stage is your child in?</p>
      <div className="grid grid-cols-3 gap-3 w-full">
        {LEVELS.map(({ value, label, desc, icon: Icon, ic, bg }) => {
          const sel = prefs.level === value;
          return (
            <button key={value} type="button"
              onClick={() => setPrefs(p => ({ ...p, level: value }))}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                sel ? 'border-green-500 bg-green-50 shadow-lg shadow-green-100' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
              }`}>
              {sel && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sel ? 'bg-green-100' : bg}`}>
                <Icon size={18} className={sel ? 'text-green-600' : ic} />
              </div>
              <p className={`font-bold text-xs ${sel ? 'text-green-700' : 'text-gray-800'}`}>{label}</p>
              <p className="text-xs text-gray-400 leading-tight">{desc}</p>
            </button>
          );
        })}
      </div>
    </div>,

    /* 3 — Budget */
    <div key="budget" className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
        <DollarSign size={26} className="text-emerald-600" />
      </div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">Annual tuition budget?</h2>
      <p className="text-gray-400 text-sm mb-5">How much are you willing to pay per year?</p>
      <div className="flex flex-col gap-2 w-full">
        {BUDGETS.map((b) => {
          const sel = prefs.budget?.label === b.label;
          return (
            <button key={b.label} type="button"
              onClick={() => setPrefs(p => ({ ...p, budget: sel ? null : b }))}
              className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border-2 transition-all text-sm font-semibold ${
                sel
                  ? 'border-green-500 bg-green-50 text-green-700 shadow-md shadow-green-100'
                  : 'border-gray-100 bg-white text-gray-700 hover:border-gray-200 hover:shadow-sm'
              }`}>
              <span>{b.label}</span>
              {sel && <Check size={16} className="text-green-600" />}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3">Skip to see all budgets</p>
    </div>,

    /* 4 — Curriculum */
    <div key="curriculum" className="flex flex-col items-center text-center">
      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
        <BookOpen size={26} className="text-indigo-600" />
      </div>
      <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">Preferred curriculum?</h2>
      <p className="text-gray-400 text-sm mb-6">Select all that interest you</p>
      <div className="flex flex-wrap gap-2.5 justify-center">
        {CURRICULA.map(c => {
          const sel = prefs.curriculum.includes(c);
          return (
            <button key={c} type="button" onClick={() => toggleCurr(c)}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold border-2 transition-all ${
                sel
                  ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:bg-green-50'
              }`}>
              {sel && <Check size={13} />} {c}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-5">Skip to see all curricula</p>
    </div>,
  ];

  /* ── SUMMARY ITEMS ───────────────────────────────────────── */
  const summaryItems = [
    prefs.type       && { label: 'School Type', value: prefs.type.charAt(0).toUpperCase() + prefs.type.slice(1), s: 0 },
    prefs.state      && { label: 'State',       value: prefs.state,              s: 1 },
    prefs.level      && { label: 'Level',       value: prefs.level === 'both' ? 'Primary & Secondary' : prefs.level.charAt(0).toUpperCase() + prefs.level.slice(1), s: 2 },
    prefs.budget     && { label: 'Budget',      value: prefs.budget.label,       s: 3 },
    prefs.curriculum.length > 0 && { label: 'Curriculum', value: prefs.curriculum.join(' · '), s: 4 },
  ].filter(Boolean);

  /* ── RENDER ──────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-60">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Bottom-sheet on mobile → centered card on sm+ */}
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg flex flex-col overflow-hidden"
          style={{ maxHeight: 'min(92vh, 660px)' }}>

          {/* Mobile drag handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-3 sm:top-4 right-4 z-20 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition shadow-sm">
            <X size={16} />
          </button>

        {/* ── RESULTS VIEW ─────────────────────────────────── */}
        {showResults ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Results header */}
            <div className="px-5 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <Search size={17} className="text-green-700" />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900 text-lg leading-tight">
                    {resultsLoading ? 'Searching…' : `${resultsTotal} school${resultsTotal !== 1 ? 's' : ''} found`}
                  </h2>
                  <p className="text-xs text-gray-400">Based on your preferences</p>
                </div>
              </div>
            </div>

            {/* Results body */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {resultsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400 font-medium">Finding matching schools…</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <AlertCircle size={26} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-700">No schools found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your preferences to see more results</p>
                  </div>
                  <button onClick={() => setResults(null)}
                    className="text-sm text-green-700 font-semibold hover:underline">
                    Edit preferences
                  </button>
                </div>
              ) : (
                results.map(school => (
                  <div key={school._id} onClick={onClose}>
                    <SchoolResultCard school={school} />
                  </div>
                ))
              )}
            </div>

            {/* Results footer */}
            {!resultsLoading && results !== null && (
              <div className="shrink-0 border-t border-gray-100 px-4 sm:px-5 py-4 pb-6 sm:pb-4 flex items-center justify-between gap-3 bg-gray-50/80">
                <button onClick={() => setResults(null)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold hover:text-gray-800 transition">
                  <ChevronLeft size={15} /> Edit preferences
                </button>
                <Link
                  to={`/?${buildParams().toString()}`}
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-sm font-bold text-white bg-green-700 px-4 py-2.5 rounded-xl hover:bg-green-800 transition shadow-sm">
                  View all {resultsTotal > 12 ? `${resultsTotal} ` : ''}schools <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Content */}
            <div className="flex-1 px-5 sm:px-8 pt-7 sm:pt-10 pb-4 overflow-y-auto">
              {isSummary ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                    <Search size={26} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">Your preferences</h2>
                  <p className="text-gray-400 text-sm mb-5">Review and find schools matching your criteria</p>

                  {summaryItems.length === 0 ? (
                    <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center mb-4">
                      <p className="text-gray-400 text-sm">No filters selected — all schools will be shown.</p>
                    </div>
                  ) : (
                    <div className="w-full space-y-2 mb-4">
                      {summaryItems.map(({ label, value, s }) => (
                        <div key={label} className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                          <div className="text-left">
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
                            <p className="font-bold text-gray-800 text-sm mt-0.5">{value}</p>
                          </div>
                          <button onClick={() => setStep(s)}
                            className="text-xs text-green-600 font-bold hover:text-green-800 transition px-2 py-1 rounded-lg hover:bg-green-50">
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={findSchools} disabled={resultsLoading}
                    className="w-full flex items-center justify-center gap-2.5 bg-green-700 text-white py-4 rounded-2xl font-extrabold text-base hover:bg-green-800 active:scale-[0.98] transition shadow-lg shadow-green-200 disabled:opacity-70">
                    {resultsLoading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Searching…
                      </>
                    ) : (
                      <><Search size={18} /> Find Matching Schools</>
                    )}
                  </button>
                </div>
              ) : screens[step]}
            </div>

            {/* Footer nav */}
            {!isSummary && (
              <div className="shrink-0 bg-gray-50/80 border-t border-gray-100 px-4 sm:px-6 pt-4 pb-6 sm:pb-5">

                {/* Progress bar */}
                <div className="h-1.5 bg-gray-200 rounded-full mb-5 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((step + 1) / TOTAL) * 100}%` }} />
                </div>

                <div className="flex items-center justify-between gap-3">

                  {/* Previous */}
                  <button onClick={prev} disabled={step === 0}
                    className={`flex items-center gap-1 text-sm font-semibold px-4 py-2.5 rounded-xl transition ${
                      step === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                    }`}>
                    <ChevronLeft size={16} /> Back
                  </button>

                  {/* Step dots */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {STEPS.map((s, i) => {
                      const Icon = s.icon;
                      const done   = i < step;
                      const active = i === step;
                      return (
                        <div key={s.id}
                          className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                            done   ? 'w-7 h-7 sm:w-8 sm:h-8 bg-green-600 text-white shadow-sm' :
                            active ? 'w-8 h-8 sm:w-9 sm:h-9 bg-green-600 text-white ring-4 ring-green-100 shadow-md' :
                                     'w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 text-gray-400'
                          }`}>
                          {done ? <CheckCircle size={12} /> : <Icon size={12} />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Next / Finish */}
                  <button onClick={next}
                    className="flex items-center gap-1 text-sm font-bold bg-green-700 text-white px-5 py-2.5 rounded-xl hover:bg-green-800 active:scale-95 transition shadow-sm">
                    {step === TOTAL - 1 ? 'Review' : 'Next'} <ChevronRight size={16} />
                  </button>
                </div>

                <p className="text-center text-xs text-gray-400 mt-3 font-medium tracking-wide">
                  {step + 1} of {TOTAL} &mdash; {STEPS[step].label}
                </p>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
