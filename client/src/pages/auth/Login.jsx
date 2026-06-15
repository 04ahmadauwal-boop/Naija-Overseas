import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { GraduationCap, Eye, EyeOff, CheckCircle, Mail, RefreshCw } from 'lucide-react';

const PERKS = [
  'Compare 500+ verified schools side by side',
  'Get expert study abroad placement guidance',
  'Free for students and parents — always',
  'Trusted by 10,000+ families across West Africa',
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const sessionExpired = searchParams.get('session') === 'expired';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUnverified(false);
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (redirectTo) { navigate(redirectTo); return; }
      const dest = {
        admin:         '/admin',
        tutor:         '/dashboard/tutor',
        student:       '/dashboard/student',
        parent:        '/dashboard/parent',
        'school-owner':'/dashboard/school-owner',
      }[user.role] ?? '/';
      navigate(dest);
    } catch (err) {
      if (err.response?.data?.unverified) {
        setUnverified(true);
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT BRAND PANEL ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-green-900 relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-700 rounded-full opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-800 rounded-full opacity-40 translate-y-1/2 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-green-600 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Naija<span className="text-green-400">&</span>Overseas
            </span>
          </div>

          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Your education<br />journey starts here.
          </h2>
          <p className="text-green-300 text-base leading-relaxed mb-10">
            West Africa's smartest school discovery and international admissions platform.
          </p>

          <div className="space-y-4">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-700 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle size={13} className="text-green-300" />
                </div>
                <p className="text-green-200 text-sm">{perk}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-green-800/50 backdrop-blur-sm rounded-2xl p-5 border border-green-700/50">
            <p className="text-green-200 text-sm italic leading-relaxed">
              "Naija &amp; Overseas helped me compare schools in Lagos and Abuja in minutes. Found the perfect school for my daughter."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">AB</div>
              <div>
                <p className="text-white text-sm font-semibold">Mrs. Aisha Bello</p>
                <p className="text-green-400 text-xs">Parent · Abuja</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Naija<span className="text-green-600">&</span>Overseas</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 mb-6">Sign in to your account to continue</p>
          {sessionExpired && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 font-medium">
              Your session expired. Please log in again to continue.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link to="/forgot-password" className="text-sm text-green-700 hover:underline font-medium">Forgot password?</Link>
              </div>
            </div>

            {/* Unverified email banner */}
            {unverified && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800">Email not verified</p>
                    <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                      Please check your inbox for the verification link we sent to <strong>{form.email}</strong>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition disabled:opacity-60"
                >
                  <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
                  {resending ? 'Sending…' : 'Resend verification email'}
                </button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-green-700 text-white py-4 rounded-xl font-bold hover:bg-green-800 transition disabled:opacity-60 text-sm flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-green-700 font-bold hover:underline">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
