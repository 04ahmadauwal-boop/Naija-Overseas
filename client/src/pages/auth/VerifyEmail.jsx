import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import Logo from '../../components/Logo';

function getRedirectPath(role, goal) {
  if (role === 'tutor')        return '/become-a-tutor';
  if (role === 'school-owner') return '/list-your-school';
  if (role === 'student') {
    if (goal === 'study-abroad') return '/study-abroad';
    return '/student-onboarding';
  }
  return '/';
}

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('No verification token found.'); return; }

    api.get(`/auth/verify-email/${token}`)
      .then(({ data }) => {
        loginWithToken(data.token, data.user);
        setUserName(data.user.name?.split(' ')[0] || 'there');
        setStatus('success');
        // Redirect after 3 seconds
        setTimeout(() => navigate(getRedirectPath(data.user.role, data.user.goal)), 3000);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'Verification failed. The link may have expired.');
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">

        {/* Brand */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Loader size={28} className="text-gray-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your email…</h2>
            <p className="text-gray-400 text-sm">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Email verified!</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Welcome to Education Naija & Overseas, <strong>{userName}</strong>! 🎉<br/>
              Your account is now active. Redirecting you now…
            </p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-[progress_3s_linear_forwards]" style={{ width: '100%', animation: 'none' }} />
            </div>
            <p className="text-xs text-gray-400 mt-3">Redirecting in 3 seconds…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Verification failed</h2>
            <p className="text-red-500 text-sm leading-relaxed mb-6">{errorMsg}</p>
            <p className="text-gray-500 text-xs mb-6">
              The link may have expired (24 hours) or already been used.<br/>
              You can request a new verification email from the login page.
            </p>
            <Link to="/login"
              className="block w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition text-sm">
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
