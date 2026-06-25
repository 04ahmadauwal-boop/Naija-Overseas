import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  User, GraduationCap, Users, School,
  BookOpen, Globe, CheckCircle,
  Eye, EyeOff, RefreshCw, ShieldCheck,
} from 'lucide-react';
import Logo from '../../components/Logo';

// ── Static data ───────────────────────────────────────────────────────────────

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United Kingdom',
  'United States', 'Canada', 'Australia', 'The Gambia', 'Cameroon', 'Other',
];

const ROLES = [
  { value: 'student',      label: 'Student',          sub: 'I want to learn — tutoring or study abroad', Icon: User },
  { value: 'tutor',        label: 'Tutor',             sub: 'I want to teach and earn from my knowledge', Icon: GraduationCap },
  { value: 'parent',       label: 'Parent / Guardian', sub: 'Finding tutors or schools for my child',     Icon: Users },
  { value: 'school-owner', label: 'School Owner',      sub: 'List and manage my school on the platform',  Icon: School },
];

const STUDENT_GOALS = [
  { value: 'tutoring',     label: 'Find a Tutor',     sub: '1:1 help for WAEC, JAMB, GCSE, A-Level & more', Icon: BookOpen },
  { value: 'study-abroad', label: 'Study Abroad',     sub: 'Apply to universities in UK, US, Canada & more', Icon: Globe },
  { value: 'both',         label: 'Both',             sub: 'I want tutoring AND study abroad guidance',       Icon: CheckCircle },
];

const TOTAL_STEPS = 3;

function getRedirect(role, goal) {
  if (role === 'tutor')        return '/become-a-tutor';
  if (role === 'school-owner') return '/list-your-school';
  if (role === 'student' && goal === 'study-abroad') return '/study-abroad';
  if (role === 'student')      return '/student-onboarding';
  return '/';
}

// ── Shared UI pieces ──────────────────────────────────────────────────────────

function ProgressDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 py-5">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) =>
        i === step ? (
          <div key={i} className="w-8 h-2 rounded-full bg-green-700" />
        ) : i < step ? (
          <div key={i} className="w-2 h-2 rounded-full bg-green-600" />
        ) : (
          <div key={i} className="w-2 h-2 rounded-full bg-gray-200" />
        )
      )}
    </div>
  );
}

function OptionCard({ label, sub, Icon, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition text-left ${
        active
          ? 'border-green-600 bg-green-50'
          : 'border-gray-100 bg-white hover:border-green-300 hover:bg-green-50/40'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
        active ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-500'
      }`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold leading-tight ${active ? 'text-green-900' : 'text-gray-900'}`}>{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{sub}</p>
      </div>
      {active && <CheckCircle size={16} className="text-green-600 shrink-0" />}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Register() {
  const { register, loginWithToken } = useAuth();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [step,    setStep]    = useState(0);
  const [role,    setRole]    = useState('');
  const [goal,    setGoal]    = useState('');
  const [form,    setForm]    = useState({ name: '', email: '', password: '', phone: '', country: 'Nigeria' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed,  setAgreed]  = useState(false);

  // OTP
  const [registered,  setRegistered]  = useState(false);
  const [otp,         setOtp]         = useState(['', '', '', '', '', '']);
  const [otpLoading,  setOtpLoading]  = useState(false);
  const [resending,   setResending]   = useState(false);
  const [countdown,   setCountdown]   = useState(60);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (!registered) return;
    setCountdown(60);
    const t = setInterval(() =>
      setCountdown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, [registered]);

  const canContinue = () => {
    if (step === 0) return role !== '';
    if (step === 1) return role !== 'student' && role !== 'parent' ? true : goal !== '';
    if (step === 2) return form.name.trim() && form.email.trim() && form.password.length >= 6 && agreed;
    return false;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...form, role, goal: (role === 'student' || role === 'parent') ? goal : 'both' };
      await register(payload);
      setRegistered(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (p.length === 6) { setOtp(p.split('')); otpRefs.current[5]?.focus(); }
  };
  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter all 6 digits'); return; }
    setOtpLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email: form.email, otp: code });
      loginWithToken(data.token, data.user);
      toast.success('Email verified! Welcome 🎉');
      navigate(redirectTo || getRedirect(data.user.role, data.user.goal));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally { setOtpLoading(false); }
  };
  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      toast.success('New OTP sent!');
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      otpRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally { setResending(false); }
  };

  // ── OTP screen ─────────────────────────────────────────────────────────────
  if (registered) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center px-4">
        <div className="pt-5 sm:pt-7"><Logo size="sm" /></div>
        {/* dots — all filled = done */}
        <div className="flex items-center justify-center gap-2 py-5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-green-600" />
          ))}
          <div className="w-8 h-2 rounded-full bg-green-700" />
        </div>

        <div className="w-full max-w-sm sm:max-w-md mt-2 text-center space-y-5">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck size={28} className="text-green-700" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Check your email</h2>
            <p className="text-sm text-gray-400 mt-1">We sent a 6-digit code to</p>
            <p className="text-sm font-bold text-gray-900 mt-1 bg-green-50 border border-green-100 rounded-xl px-4 py-2 inline-block">{form.email}</p>
          </div>

          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
            {otp.map((d, i) => (
              <input key={i} ref={el => otpRefs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 transition"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <p className="text-xs text-gray-400">Code expires in 10 minutes · Check spam if not found.</p>

          <div className="space-y-3">
            <button onClick={handleVerify} disabled={otpLoading || otp.join('').length < 6}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-40 transition flex items-center justify-center gap-2">
              {otpLoading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</>
                : 'Verify Email →'}
            </button>
            <button onClick={handleResend} disabled={resending || countdown > 0}
              className="w-full text-center text-sm text-gray-400 hover:text-green-700 transition py-1 flex items-center justify-center gap-1.5 disabled:opacity-40">
              <RefreshCw size={13} className={resending ? 'animate-spin' : ''} />
              {countdown > 0 ? `Resend in ${countdown}s` : resending ? 'Sending…' : 'Resend code'}
            </button>
          </div>

          <p className="text-sm text-gray-400">
            Wrong email?{' '}
            <button onClick={() => setRegistered(false)} className="font-bold text-green-700 hover:underline">Go back</button>
          </p>
        </div>
      </div>
    );
  }

  const inp = 'w-full border border-gray-200 rounded-2xl px-4 py-3 sm:py-3.5 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition bg-white';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4">

      {/* Logo */}
      <div className="pt-5 sm:pt-7"><Logo size="sm" /></div>

      {/* Progress */}
      <ProgressDots step={step} />

      {/* Content */}
      <div className="w-full max-w-sm sm:max-w-md flex-1 flex flex-col pb-10">

        {/* ── Step 0: Who are you? ──────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">Who are you?</h1>
              <p className="text-sm text-gray-400 mt-1">Select the option that best describes you.</p>
            </div>
            <div className="space-y-3">
              {ROLES.map(({ value, label, sub, Icon }) => (
                <OptionCard key={value} label={label} sub={sub} Icon={Icon}
                  active={role === value}
                  onClick={() => { setRole(value); setGoal(''); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Tell us more ──────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">Tell us more</h1>
              <p className="text-sm text-gray-400 mt-1">
                {role === 'student' || role === 'parent'
                  ? 'What are you looking for?'
                  : role === 'tutor'
                    ? 'Here\'s what happens next as a tutor.'
                    : 'Here\'s what you get as a school owner.'}
              </p>
            </div>

            {/* Summary badge */}
            <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex justify-between text-sm">
              <span className="text-green-700 font-medium">Account type</span>
              <span className="font-bold text-green-900">{ROLES.find(r => r.value === role)?.label}</span>
            </div>

            {/* Student / Parent goal picker */}
            {(role === 'student' || role === 'parent') && (
              <div className="space-y-3">
                {STUDENT_GOALS.map(({ value, label, sub, Icon }) => (
                  <OptionCard key={value} label={label} sub={sub} Icon={Icon}
                    active={goal === value} onClick={() => setGoal(value)} />
                ))}
              </div>
            )}

            {/* Tutor info */}
            {role === 'tutor' && (
              <div className="border border-gray-100 rounded-2xl p-4 sm:p-5 space-y-3 bg-gray-50">
                {[
                  'Set your own subjects, hourly rate & availability.',
                  'Your profile goes live after a quick review by our team.',
                  'Keep the majority of every session — paid to your bank monthly.',
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-[10px] font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600">{line}</p>
                  </div>
                ))}
              </div>
            )}

            {/* School-owner info */}
            {role === 'school-owner' && (
              <div className="border border-gray-100 rounded-2xl p-4 sm:p-5 space-y-3 bg-gray-50">
                {[
                  'List your school and get discovered by parents across Nigeria.',
                  'Manage visit bookings and enquiries from one dashboard.',
                  'Verified schools get a trust badge on their profile.',
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white text-[10px] font-bold">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-600">{line}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Create account ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">Create your account</h1>
              <p className="text-sm text-gray-400 mt-1">Free forever · takes less than a minute.</p>
            </div>

            {/* Summary */}
            <div className="bg-green-50 border border-green-100 rounded-2xl divide-y divide-green-100 overflow-hidden">
              <div className="flex justify-between px-4 py-2.5 text-sm">
                <span className="text-green-700">Account</span>
                <span className="font-bold text-green-900">{ROLES.find(r => r.value === role)?.label}</span>
              </div>
              {(role === 'student' || role === 'parent') && goal && (
                <div className="flex justify-between px-4 py-2.5 text-sm">
                  <span className="text-green-700">Looking for</span>
                  <span className="font-bold text-green-900">
                    {STUDENT_GOALS.find(g => g.value === goal)?.label || goal}
                  </span>
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={inp} placeholder="Your full name" autoComplete="name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <input type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={inp} placeholder="name@example.com" autoComplete="email" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Phone</label>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className={inp} placeholder="+234 800…" autoComplete="tel" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Country</label>
                  <select value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })}
                    className={inp}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className={inp + ' pr-11'} placeholder="At least 6 characters" autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-700 transition">
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy consent */}
            <button type="button" onClick={() => setAgreed(!agreed)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition ${
                agreed
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-100 bg-gray-50 hover:border-green-300'
              }`}>
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                agreed ? 'bg-green-700 border-green-700' : 'border-gray-300 bg-white'
              }`}>
                {agreed && <CheckCircle size={12} className="text-white" />}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                I agree my personal information will be used for{' '}
                <strong className="text-gray-700">educational consultancy services</strong>{' '}
                by Education Naija &amp; Overseas. I accept the{' '}
                <Link to="#" className="text-green-700 font-bold hover:underline" onClick={e => e.stopPropagation()}>
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="#" className="text-green-700 font-bold hover:underline" onClick={e => e.stopPropagation()}>
                  Privacy Policy
                </Link>.
              </p>
            </button>
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────────────────── */}
        <div className="mt-6 space-y-3">
          {step < TOTAL_STEPS - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canContinue()}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-30 transition active:scale-[.98]">
              Continue
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading || !canContinue()}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-30 transition active:scale-[.98] flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
                : 'Create Free Account →'}
            </button>
          )}

          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="w-full text-center text-sm text-gray-400 hover:text-green-700 transition py-1">
              Go back
            </button>
          ) : (
            <p className="text-center text-sm text-gray-400 py-1">
              Already have an account?{' '}
              <Link to="/login" className="text-green-700 font-bold hover:underline">Sign in →</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
