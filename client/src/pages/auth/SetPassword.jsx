import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function SetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => navigate('/dashboard/student', { replace: true }), 2000);
      return () => clearTimeout(timer);
    }
  }, [done, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/auth/set-password/${token}`, { password: form.password });
      loginWithToken(data.token, data.user);
      toast.success('Password set! Welcome to Naija & Overseas.');
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'This link is invalid or has expired. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 transition pr-12';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">

        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 bg-green-100 rounded-2xl items-center justify-center mb-3 text-2xl">🔐</div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {done ? 'You\'re all set!' : 'Choose Your Password'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {done
              ? 'Your account is active. Redirecting to your dashboard…'
              : 'Create a password to access your Naija & Overseas account.'}
          </p>
        </div>

        {done ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <p className="text-gray-600 text-sm">Taking you to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={show.password ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inp}
                  placeholder="Min. 6 characters"
                />
                <button type="button" onClick={() => setShow({ ...show, password: !show.password })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show.password ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={show.confirm ? 'text' : 'password'}
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  className={`${inp} ${form.confirm && form.confirm !== form.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  placeholder="Repeat your password"
                />
                <button type="button" onClick={() => setShow({ ...show, confirm: !show.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            {form.password && (
              <div className="flex gap-1.5 items-center">
                {[6, 8, 12].map((len, i) => (
                  <div key={len} className={`h-1 flex-1 rounded-full transition-colors ${
                    form.password.length >= len
                      ? i === 0 ? 'bg-red-400' : i === 1 ? 'bg-yellow-400' : 'bg-green-500'
                      : 'bg-gray-200'
                  }`} />
                ))}
                <span className="text-xs text-gray-400 ml-1">
                  {form.password.length < 6 ? 'Too short' : form.password.length < 8 ? 'Weak' : form.password.length < 12 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.password || !form.confirm}
              className="w-full bg-green-700 text-white py-3.5 rounded-xl font-bold hover:bg-green-800 disabled:opacity-60 transition text-sm flex items-center justify-center gap-2 mt-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting password…</>
                : 'Set Password & Log In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
