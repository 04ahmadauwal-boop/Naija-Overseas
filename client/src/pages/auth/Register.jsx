import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  GraduationCap, Eye, EyeOff, User, Users, School,
  CheckCircle, Globe, BookOpen, ChevronRight, Mail, RefreshCw,
} from 'lucide-react';
import Logo from '../../components/Logo';

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom',
  'United States', 'Canada', 'Australia', 'The Gambia', 'Cameroon', 'Other',
];

// Top-level account types
const ACCOUNT_TYPES = [
  {
    value: 'student',
    label: 'Student',
    sub: 'I want to learn — tutoring or study abroad',
    icon: User,
  },
  {
    value: 'tutor',
    label: 'Tutor',
    sub: 'I want to teach and earn from my knowledge',
    icon: GraduationCap,
  },
  {
    value: 'parent',
    label: 'Parent / Guardian',
    sub: 'Finding tutors or schools for my child',
    icon: Users,
  },
  {
    value: 'school-owner',
    label: 'School Owner',
    sub: 'List and manage my school',
    icon: School,
  },
];

// Student sub-goals — shown only when 'student' is selected
const STUDENT_GOALS = [
  {
    value: 'tutoring',
    label: 'Find a Tutor',
    desc: 'Get 1:1 help for WAEC, JAMB, GCSE, A-Level, SAT and more',
    icon: BookOpen,
    color: 'blue',
  },
  {
    value: 'study-abroad',
    label: 'Study Abroad',
    desc: 'Apply to universities in the UK, US, Canada, Australia & more',
    icon: Globe,
    color: 'purple',
  },
  {
    value: 'both',
    label: 'Both',
    desc: 'I want tutoring and study abroad guidance',
    icon: CheckCircle,
    color: 'green',
  },
];

const GOAL_COLOR = {
  blue:   { border: 'border-blue-500 bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   text: 'text-blue-900'   },
  purple: { border: 'border-purple-500 bg-purple-50', icon: 'bg-purple-100 text-purple-600', text: 'text-purple-900' },
  green:  { border: 'border-green-600 bg-green-50',  icon: 'bg-green-100 text-green-700',  text: 'text-green-900'  },
};

function getRedirectPath(role, goal) {
  if (role === 'tutor')       return '/become-a-tutor';
  if (role === 'school-owner') return '/list-your-school';
  if (role === 'student') {
    if (goal === 'tutoring')     return '/student-onboarding';
    if (goal === 'both')         return '/student-onboarding';
    if (goal === 'study-abroad') return '/study-abroad';
  }
  return '/';
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [role, setRole] = useState('student');
  const [goal, setGoal] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', country: 'Nigeria' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [registered, setRegistered] = useState(false); // show "check email" screen
  const [resending, setResending] = useState(false);

  const needsGoal = role === 'student';
  const canSubmit = !needsGoal || goal !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (needsGoal && !goal) { toast.error('Please choose what you\'re looking for'); return; }
    setLoading(true);
    try {
      const payload = { ...form, role, goal: needsGoal ? goal : 'both' };
      await register(payload);
      setRegistered(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      toast.success('Verification email resent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  // ── "Check your email" screen ──────────────────────────────────────────────
  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={36} className="text-green-700" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            We sent a verification link to
          </p>
          <p className="font-bold text-gray-800 text-sm mb-6 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 inline-block">
            {form.email}
          </p>
          <p className="text-gray-400 text-xs leading-relaxed mb-8">
            Click the link in the email to activate your account. The link expires in 24 hours.
            Check your spam or junk folder if you don't see it.
          </p>
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center justify-center gap-2 w-full border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition disabled:opacity-60 text-sm"
          >
            <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
            {resending ? 'Resending…' : 'Resend verification email'}
          </button>
          <p className="text-center text-sm text-gray-400 mt-5">
            Already verified?{' '}
            <Link to="/login" className="text-green-700 font-bold hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    );
  }

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white';

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT BRAND PANEL ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 bg-green-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-56 h-56 bg-green-700 rounded-full opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-800 rounded-full opacity-40 translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="mb-10">
            <Logo variant="dark" />
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Your education<br />journey starts here.
          </h2>
          <p className="text-green-300 text-sm leading-relaxed mb-8">
            Join thousands of students, tutors, parents and schools across Africa and beyond.
          </p>

          <div className="space-y-4">
            {[
              { icon: BookOpen, label: 'Find expert tutors for any subject', color: 'text-blue-400' },
              { icon: Globe,    label: 'Apply to universities worldwide',    color: 'text-purple-400' },
              { icon: GraduationCap, label: 'Earn as a verified tutor',       color: 'text-yellow-400' },
              { icon: School,   label: 'List and grow your school',          color: 'text-green-400' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={15} className={`${color} shrink-0`} />
                <p className="text-green-200 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex gap-6 text-center">
          {[['500+', 'Schools'], ['50+', 'Tutors'], ['30+', 'Countries']].map(([n, l]) => (
            <div key={l}>
              <div className="text-2xl font-extrabold text-white">{n}</div>
              <div className="text-green-400 text-xs mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ──────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 bg-white overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 mb-7">Free forever · Takes less than a minute</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── STEP 1: Account type ──────────────────────── */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-2">
                {ACCOUNT_TYPES.map(({ value, label, sub, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => { setRole(value); setGoal(''); }}
                    className={`relative flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition ${
                      role === value
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                    {role === value && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle size={10} className="text-white" />
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${role === value ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Icon size={15} className={role === value ? 'text-green-700' : 'text-gray-500'} />
                    </div>
                    <div className="min-w-0 pr-4">
                      <p className={`text-xs font-bold leading-tight ${role === value ? 'text-green-900' : 'text-gray-800'}`}>{label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── STEP 2: Student goal (only shown for students) ── */}
            {needsGoal && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  What are you looking for? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {STUDENT_GOALS.map(({ value, label, desc, icon: Icon, color }) => {
                    const c = GOAL_COLOR[color];
                    const active = goal === value;
                    return (
                      <button key={value} type="button" onClick={() => setGoal(value)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition ${
                          active ? c.border : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? c.icon : 'bg-gray-100 text-gray-400'}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${active ? c.text : 'text-gray-800'}`}>{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
                        </div>
                        {active && <CheckCircle size={16} className="text-green-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tutor info banner */}
            {role === 'tutor' && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-start gap-3">
                <GraduationCap size={18} className="text-green-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-800">You're registering as a Tutor</p>
                  <p className="text-xs text-green-600 mt-0.5">After creating your account, you'll set up your tutor profile — subjects, rates, and availability. Your profile goes live after a quick review by our team.</p>
                </div>
              </div>
            )}

            {/* ── Personal details ──────────────────────────── */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input type="text" required value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={inp} placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Email address <span className="text-red-500">*</span></label>
                <input type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={inp} placeholder="you@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className={inp} placeholder="+234 800 000 000" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Country</label>
                  <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={inp}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className={inp + ' pr-12'} placeholder="At least 6 characters" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading || !canSubmit}
              className="w-full bg-green-700 text-white py-4 rounded-xl font-bold hover:bg-green-800 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
              ) : (
                <>
                  {role === 'tutor' ? 'Create Account & Set Up Profile' : 'Create Free Account'}
                  <ChevronRight size={16} />
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              By signing up you agree to our{' '}
              <a href="#" className="text-green-700 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-green-700 hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-green-700 font-bold hover:underline">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
