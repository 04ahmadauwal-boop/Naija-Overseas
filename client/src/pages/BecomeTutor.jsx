import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, CheckCircle, ChevronRight, ChevronLeft,
  Plus, Trash2, ArrowRight, Banknote, Globe, Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const WORLD_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania', 'Rwanda',
  'Cameroon', 'Senegal', 'Ethiopia', 'Zimbabwe', 'Zambia', 'Ivory Coast',
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany',
  'France', 'Netherlands', 'Ireland', 'New Zealand', 'UAE', 'Qatar',
  'Saudi Arabia', 'India', 'Pakistan', 'Malaysia', 'Singapore', 'Other',
];

const CURRENCIES = [
  { value: 'NGN', label: 'Nigerian Naira (₦)', symbol: '₦' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GHS', label: 'Ghanaian Cedi (GH₵)', symbol: 'GH₵' },
  { value: 'KES', label: 'Kenyan Shilling (KSh)', symbol: 'KSh' },
  { value: 'ZAR', label: 'South African Rand (R)', symbol: 'R' },
  { value: 'CAD', label: 'Canadian Dollar (CA$)', symbol: 'CA$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
];

const ALL_SUBJECTS = [
  'Mathematics', 'Further Mathematics', 'English Language', 'Literature in English',
  'Physics', 'Chemistry', 'Biology', 'Agricultural Science',
  'Economics', 'Government', 'Geography', 'History', 'Commerce',
  'Financial Accounting', 'Civic Education', 'Technical Drawing',
  'Basic Science', 'Basic Technology', 'Social Studies',
  'Verbal Reasoning', 'Quantitative Reasoning', 'Phonics & Reading',
  'JAMB Prep', 'WAEC Prep', 'NECO Prep', 'BECE Prep', 'IELTS', 'TOEFL',
  'SAT', 'ACT', 'GCSE Mathematics', 'GCSE English', 'A-Level Mathematics',
  'A-Level Physics', 'A-Level Chemistry', 'A-Level Biology', 'A-Level Economics',
  'Computer Science', 'Web Development', 'Python', 'Data Science', 'Microsoft Office',
  'Yoruba', 'Igbo', 'Hausa', 'French', 'Spanish', 'Arabic', 'Mandarin',
  'Music', 'Fine Arts', 'Christian Religious Studies', 'Islamic Studies',
];

const ALL_LEVELS = [
  { value: 'primary',    label: 'Primary School' },
  { value: 'jss',        label: 'Junior Secondary (JSS 1–3)' },
  { value: 'sss',        label: 'Senior Secondary (SSS 1–3)' },
  { value: 'waec',       label: 'WAEC Preparation' },
  { value: 'jamb',       label: 'JAMB / UTME Preparation' },
  { value: 'neco',       label: 'NECO Preparation' },
  { value: 'gcse',       label: 'GCSE / IGCSE' },
  { value: 'a-level',    label: 'A-Level' },
  { value: 'sat',        label: 'SAT / ACT' },
  { value: 'ib',         label: 'IB Programme' },
  { value: 'university', label: 'University Level' },
  { value: 'adult',      label: 'Adult Learning' },
];

const AVAILABILITY_OPTIONS = [
  'Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings',
  'Weekend Mornings', 'Weekend Afternoons', 'Weekend Evenings', 'Flexible',
];

const TEACHING_STYLE_OPTIONS = [
  { value: 'patient',      label: 'Patient & Supportive', desc: "I go at the student's pace and explain gently" },
  { value: 'structured',   label: 'Structured Lessons',   desc: 'Clear plans, notes, and defined learning path' },
  { value: 'interactive',  label: 'Interactive & Fun',    desc: 'Engaging examples, keeps students motivated' },
  { value: 'exam-focused', label: 'Exam-Focused',         desc: 'Past questions, time management, exam technique' },
];

const SPECIALIZATION_OPTIONS = [
  'WAEC Revision', 'JAMB Preparation', 'NECO Preparation', 'BECE Preparation',
  'Post-UTME Coaching', 'Common Entrance Prep', 'Scholarship Exam Prep',
  'IELTS Coaching', 'TOEFL Preparation', 'SAT Coaching', 'A-Level Support',
  'Coding & Tech Skills', 'Science Lab Practicals', 'Exam Time Management',
];

const STEPS = ['About You', 'What You Teach', 'Rates & Setup'];

function ToggleChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition ${
        active
          ? 'bg-green-700 border-green-700 text-white shadow-sm'
          : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 bg-white'
      }`}
    >
      {active && <CheckCircle size={12} className="inline mr-1.5" />}
      {label}
    </button>
  );
}

export default function BecomeTutor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    headline: '',
    bio: '',
    yearsExperience: '',
    qualifications: [{ title: '', institution: '', year: '' }],
    languages: ['English'],
    subjects: [],
    levels: [],
    specializations: [],
    teachingMode: [],
    country: 'Nigeria',
    state: '',
    city: '',
    currency: 'NGN',
    hourlyRateNaira: '',
    groupRateNaira: '',
    trialAvailable: true,
    trialDurationMins: 30,
    responseTime: 'Within 24 hours',
    availability: [],
    teachingStyle: [],
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleArr = (key, val) => {
    const arr = form[key];
    set(key, arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const addQual = () => set('qualifications', [...form.qualifications, { title: '', institution: '', year: '' }]);
  const removeQual = (i) => set('qualifications', form.qualifications.filter((_, idx) => idx !== i));
  const updateQual = (i, field, val) => {
    const next = [...form.qualifications];
    next[i] = { ...next[i], [field]: val };
    set('qualifications', next);
  };

  const canNext = () => {
    if (step === 0) return form.headline.trim().length >= 10 && form.bio.trim().length >= 50;
    if (step === 1) return form.subjects.length >= 1 && form.levels.length >= 1 && form.teachingMode.length >= 1;
    if (step === 2) return form.hourlyRateNaira > 0 || form.hourlyRateNaira === '';
    return true;
  };

  const handleSubmit = async () => {
    if (!user) { toast.error('Please log in first'); navigate('/login'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        country: form.country || 'Nigeria',
        currency: form.currency || 'NGN',
        hourlyRateNaira: form.hourlyRateNaira ? Number(form.hourlyRateNaira) : undefined,
        groupRateNaira: form.groupRateNaira ? Number(form.groupRateNaira) : undefined,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : 0,
        qualifications: form.qualifications.filter((q) => q.title.trim()),
      };
      await api.post('/tutors/register', payload);
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <GraduationCap size={40} className="text-green-600 mx-auto mb-4" />
        <h2 className="font-bold text-gray-900 text-xl mb-2">Log in to register as a tutor</h2>
        <p className="text-gray-500 text-sm mb-6">You need a free account to apply as a tutor on Naija & Overseas.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition text-sm">Log In</Link>
          <Link to="/register" className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition text-sm">Create Account</Link>
        </div>
      </div>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md bg-white rounded-3xl p-10 border border-gray-100 shadow-xl">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="font-extrabold text-gray-900 text-2xl mb-3">Application Submitted!</h2>
        <p className="text-gray-500 leading-relaxed mb-6">
          Thank you for applying! Our team will review your profile within <strong>24–48 hours</strong>.
          Once approved, your profile will go live and students can start booking sessions with you.
        </p>
        <p className="text-sm text-gray-400 mb-6">We'll send a confirmation to <strong>{user.email}</strong></p>
        <div className="flex gap-3 justify-center">
          <Link to="/find-tutoring" className="bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition text-sm">
            Browse Tutors
          </Link>
          <Link to="/" className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 transition text-sm">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto py-4 flex items-center justify-between">
          <Link to="/find-tutoring" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition font-medium">
            <ChevronLeft size={16} /> Back
          </Link>
          <span className="font-bold text-gray-900">Become a Tutor</span>
          <span className="text-sm text-gray-400">Step {step + 1} of {STEPS.length}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                i === step
                  ? 'bg-green-700 text-white shadow-md'
                  : i < step
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? <CheckCircle size={14} /> : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-black">{i + 1}</span>}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-linear-to-r from-green-700 to-green-600 h-1.5" />
          <div className="p-8">

            {/* ── STEP 0: About You ──────────────────────────────────── */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1">About You</h2>
                  <p className="text-gray-500 text-sm">Tell students who you are and why you're a great tutor.</p>
                </div>

                {/* Greeting */}
                <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Headline <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.headline}
                    onChange={(e) => set('headline', e.target.value)}
                    maxLength={120}
                    placeholder="e.g. Experienced WAEC Mathematics & Further Maths Tutor"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.headline.length}/120 characters · Min. 10 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">About You / Bio <span className="text-red-500">*</span></label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => set('bio', e.target.value)}
                    rows={5}
                    maxLength={2000}
                    placeholder="Tell students about your background, teaching style, achievements, and what makes you stand out. Min. 50 characters."
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.bio.length}/2000 · Min. 50 characters</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Years of Experience</label>
                    <input type="number" min="0" max="50" value={form.yearsExperience}
                      onChange={(e) => set('yearsExperience', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Response Time</label>
                    <select value={form.responseTime} onChange={(e) => set('responseTime', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition">
                      <option>Within 1 hour</option>
                      <option>Within 3 hours</option>
                      <option>Within 24 hours</option>
                      <option>Within 48 hours</option>
                    </select>
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Teaching Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {['English', 'Yoruba', 'Igbo', 'Hausa', 'Pidgin', 'French'].map((lang) => (
                      <ToggleChip key={lang} label={lang} active={form.languages.includes(lang)} onClick={() => toggleArr('languages', lang)} />
                    ))}
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-bold text-gray-700">Qualifications / Credentials</label>
                    <button type="button" onClick={addQual}
                      className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-100 transition">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.qualifications.map((q, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <input
                          type="text" value={q.title} placeholder="Degree / Certificate *"
                          onChange={(e) => updateQual(i, 'title', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-white"
                        />
                        <input
                          type="text" value={q.institution} placeholder="Institution (optional)"
                          onChange={(e) => updateQual(i, 'institution', e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-white"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text" value={q.year} placeholder="Year (e.g. 2020)"
                            onChange={(e) => updateQual(i, 'year', e.target.value)}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-white"
                          />
                          {form.qualifications.length > 1 && (
                            <button type="button" onClick={() => removeQual(i)}
                              className="w-9 h-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition shrink-0">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: What You Teach ─────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1">What You Teach</h2>
                  <p className="text-gray-500 text-sm">Select the subjects, levels, and how you teach.</p>
                </div>

                {/* Subjects */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Subjects <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-400 mb-3">Select all subjects you teach ({form.subjects.length} selected)</p>
                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
                    {ALL_SUBJECTS.map((s) => (
                      <ToggleChip key={s} label={s} active={form.subjects.includes(s)} onClick={() => toggleArr('subjects', s)} />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Levels */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Student Levels <span className="text-red-500">*</span></label>
                  <p className="text-xs text-gray-400 mb-3">Which levels of students can you teach? ({form.levels.length} selected)</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_LEVELS.map(({ value, label }) => (
                      <ToggleChip key={value} label={label} active={form.levels.includes(value)} onClick={() => toggleArr('levels', value)} />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Teaching mode */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Teaching Mode <span className="text-red-500">*</span></label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { value: 'online', label: '💻 Online', desc: 'Via Zoom, Google Meet, WhatsApp Video, etc.' },
                      { value: 'in-person', label: '📍 In-Person', desc: 'Visit student at home or agreed location' },
                    ].map(({ value, label, desc }) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => toggleArr('teachingMode', value)}
                        className={`text-left p-4 rounded-2xl border-2 transition ${
                          form.teachingMode.includes(value)
                            ? 'bg-green-50 border-green-500'
                            : 'border-gray-200 hover:border-green-300 bg-white'
                        }`}
                      >
                        <p className={`font-bold text-sm mb-0.5 ${form.teachingMode.includes(value) ? 'text-green-700' : 'text-gray-800'}`}>{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country always shown; City & State for in-person */}
                <div className={`rounded-xl p-4 border ${form.teachingMode.includes('in-person') ? 'bg-purple-50 border-purple-100' : 'bg-gray-50 border-gray-100'}`}>
                  <p className="text-sm font-bold text-gray-700 mb-3">Your Location</p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Country <span className="text-red-500">*</span></label>
                      <select value={form.country} onChange={(e) => set('country', e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white">
                        {WORLD_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">State / Region</label>
                      <input type="text" value={form.state} onChange={(e) => set('state', e.target.value)}
                        placeholder="e.g. Lagos, London, Ontario"
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">City / Area</label>
                      <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
                        placeholder="e.g. Lekki, Manchester"
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white" />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Your Availability <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-3">Select the times you're generally free to teach — this powers our matching system</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.map((slot) => (
                      <ToggleChip key={slot} label={slot} active={form.availability.includes(slot)} onClick={() => toggleArr('availability', slot)} />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Teaching style */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Your Teaching Style <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-3">How would you describe your teaching approach? Students filter by this</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {TEACHING_STYLE_OPTIONS.map(({ value, label, desc }) => (
                      <button type="button" key={value}
                        onClick={() => toggleArr('teachingStyle', value)}
                        className={`text-left p-4 rounded-2xl border-2 transition ${
                          form.teachingStyle.includes(value)
                            ? 'bg-green-50 border-green-500'
                            : 'border-gray-200 hover:border-green-300 bg-white'
                        }`}>
                        <p className={`font-bold text-sm mb-0.5 ${form.teachingStyle.includes(value) ? 'text-green-700' : 'text-gray-800'}`}>{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Specializations */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Specializations <span className="text-gray-400 font-normal">(optional)</span></label>
                  <p className="text-xs text-gray-400 mb-3">Highlight what you're particularly good at</p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATION_OPTIONS.map((s) => (
                      <ToggleChip key={s} label={s} active={form.specializations.includes(s)} onClick={() => toggleArr('specializations', s)} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Rates & Setup ──────────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Rates & Setup</h2>
                  <p className="text-gray-500 text-sm">Set your pricing. You can always update this later from your dashboard.</p>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Your Currency</label>
                  <select value={form.currency} onChange={(e) => set('currency', e.target.value)}
                    className="w-full sm:w-64 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 bg-white transition">
                    {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Students will see your rate in this currency</p>
                </div>

                {/* Pricing tip */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-blue-700">
                  <strong>💡 Pricing tip:</strong> Set a competitive rate for your country and subject. A free trial gets you 3× more first bookings.
                </div>

                {/* Rates */}
                {(() => {
                  const sym = CURRENCIES.find(c => c.value === form.currency)?.symbol || '₦';
                  return (
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">1-on-1 Hourly Rate ({sym})</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">{sym}</span>
                          <input type="number" min="0" value={form.hourlyRateNaira} onChange={(e) => set('hourlyRateNaira', e.target.value)}
                            placeholder="e.g. 4000"
                            className="w-full pl-10 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Per hour for 1-on-1 sessions</p>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Group Rate ({sym}) <span className="text-gray-400 font-normal">(optional)</span></label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">{sym}</span>
                          <input type="number" min="0" value={form.groupRateNaira} onChange={(e) => set('groupRateNaira', e.target.value)}
                            placeholder="e.g. 2000"
                            className="w-full pl-10 border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Per person per hour (group sessions)</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Trial session */}
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Offer a Free Trial Session?</p>
                      <p className="text-xs text-gray-500 mt-0.5">Tutors with free trials get 3× more bookings</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => set('trialAvailable', !form.trialAvailable)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${form.trialAvailable ? 'bg-green-600' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.trialAvailable ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {form.trialAvailable && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Trial Duration</label>
                      <div className="flex gap-2">
                        {[30, 45, 60].map((mins) => (
                          <button
                            type="button"
                            key={mins}
                            onClick={() => set('trialDurationMins', mins)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                              form.trialDurationMins === mins
                                ? 'bg-green-700 border-green-700 text-white'
                                : 'border-gray-200 text-gray-600 hover:border-green-400 bg-white'
                            }`}
                          >
                            {mins} min
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary preview */}
                <div className="bg-gray-900 rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-base mb-4 text-gray-300 uppercase tracking-wider text-xs">Your Profile Preview</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{user.name}</p>
                      <p className="text-gray-400 text-xs">{form.headline || 'Your headline will appear here'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.subjects.slice(0, 4).map((s) => (
                      <span key={s} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">{s}</span>
                    ))}
                    {form.subjects.length > 4 && <span className="text-xs text-gray-500">+{form.subjects.length - 4} more</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {form.teachingMode.includes('online') && <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">💻 Online</span>}
                      {form.teachingMode.includes('in-person') && <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded-full">📍 In-Person</span>}
                    </div>
                    <p className="font-extrabold text-white">
                      {form.hourlyRateNaira ? `${CURRENCIES.find(c => c.value === form.currency)?.symbol || '₦'}${Number(form.hourlyRateNaira).toLocaleString()}/hr` : 'Rate TBD'}
                    </p>
                  </div>
                </div>

                {/* Agreement */}
                <p className="text-xs text-gray-400 leading-relaxed">
                  By submitting, you confirm that all information provided is accurate. Your profile will be reviewed within <strong className="text-gray-600">24–48 hours</strong> and you'll receive an email confirmation once approved. Naija & Overseas reserves the right to reject profiles that don't meet our quality standards.
                </p>
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-white hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ChevronLeft size={16} /> Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => canNext() && setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-green-800 transition text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-green-700 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-green-800 transition text-sm shadow-sm disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Submit Application'} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Benefits strip */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8">
          {[
            { icon: Banknote, label: 'Set Your Own Rate', desc: 'You decide what you charge per hour' },
            { icon: Globe, label: 'Reach More Students', desc: 'Get discovered by thousands of parents daily' },
            { icon: Shield, label: 'Verified & Trusted', desc: 'Our badge builds student confidence in you' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3 bg-white rounded-2xl p-4 border border-gray-100">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={16} className="text-green-700" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
