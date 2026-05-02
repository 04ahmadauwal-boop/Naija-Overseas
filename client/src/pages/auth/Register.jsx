import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { GraduationCap, Eye, EyeOff, User, Users, School, CheckCircle } from 'lucide-react';

const COUNTRIES = ['Nigeria', 'Ghana', 'The Gambia', 'Cameroon'];

const ROLES = [
  { value: 'student', label: 'Student', sub: 'Find schools & study abroad', icon: User, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'parent', label: 'Parent / Guardian', sub: 'Research schools for my child', icon: Users, color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { value: 'school-owner', label: 'School Owner', sub: 'List & manage my school', icon: School, color: 'bg-green-50 border-green-200 text-green-700' },
];

const BENEFITS = [
  'Access 500+ verified school profiles',
  'Compare schools side by side for free',
  'Get matched with study abroad counsellors',
  'Receive personalised school recommendations',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student', phone: '', country: 'Nigeria',
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition';

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT BRAND PANEL ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-5/12 bg-green-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-56 h-56 bg-green-700 rounded-full opacity-30 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-800 rounded-full opacity-40 translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Naija<span className="text-green-400">&</span>Overseas
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Start your education<br />journey today.
          </h2>
          <p className="text-green-300 text-sm leading-relaxed mb-8">
            Join 10,000+ students, parents and school owners already using our platform across West Africa.
          </p>

          <div className="space-y-3">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-3">
                <CheckCircle size={15} className="text-green-400 shrink-0" />
                <p className="text-green-200 text-sm">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex gap-6 text-center">
          {[['500+', 'Schools'], ['10k+', 'Families'], ['4', 'Countries']].map(([n, l]) => (
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

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Naija<span className="text-green-600">&</span>Overseas</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Create account</h1>
          <p className="text-gray-500 mb-7">Free forever for students and parents.</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">I am a</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, sub, icon: Icon, color }) => (
                  <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition ${
                      form.role === value
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}>
                    {form.role === value && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={10} className="text-white" />
                      </div>
                    )}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${form.role === value ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Icon size={16} className={form.role === value ? 'text-green-700' : 'text-gray-500'} />
                    </div>
                    <p className={`text-xs font-semibold leading-tight ${form.role === value ? 'text-green-900' : 'text-gray-700'}`}>{label}</p>
                    <p className="text-[10px] text-gray-400 leading-tight hidden sm:block">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inp} placeholder="Your full name" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address <span className="text-red-500">*</span></label>
                <input type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inp} placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone number</label>
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inp} placeholder="+234 800 000 0000" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inp}>
                  {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={inp + ' pr-12'} placeholder="At least 6 characters" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-green-700 text-white py-4 rounded-xl font-bold hover:bg-green-800 transition disabled:opacity-60 text-sm flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              ) : 'Create Free Account →'}
            </button>

            <p className="text-center text-xs text-gray-400">
              By signing up you agree to our{' '}
              <a href="#" className="text-green-700 hover:underline">Terms of Service</a>{' '}
              and{' '}
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
