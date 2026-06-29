import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordSection from '../../components/ChangePasswordSection';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, BookOpen, Star, Settings, Menu, X,
  LogOut, ExternalLink, CheckCircle, Clock, Video, MapPin,
  ChevronLeft, ChevronRight, Users, User, TrendingUp, GraduationCap,
  Edit2, Save, AlertCircle, CalendarCheck, Camera, HelpCircle, Plus, Trash2,
  DollarSign, Wallet, Building2, ShieldCheck, BadgeCheck,
} from 'lucide-react';
import { TodayScheduleBanner, ClassStartButton } from '../../components/ClassSchedule';

const CURRENCY_SYMBOLS = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€', GHS: 'GH₵',
  KES: 'KSh', ZAR: 'R', CAD: 'CA$', AUD: 'A$', INR: '₹', ZMW: 'ZK',
};

const CURRENCIES = [
  { value: 'NGN', label: 'Nigerian Naira (₦)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GHS', label: 'Ghanaian Cedi (GH₵)' },
  { value: 'KES', label: 'Kenyan Shilling (KSh)' },
  { value: 'ZAR', label: 'South African Rand (R)' },
  { value: 'CAD', label: 'Canadian Dollar (CA$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
];

const WORLD_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania', 'Rwanda',
  'Cameroon', 'Senegal', 'Ethiopia', 'Zimbabwe', 'Zambia', 'Ivory Coast',
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany',
  'France', 'Netherlands', 'Ireland', 'New Zealand', 'UAE', 'Qatar',
  'Saudi Arabia', 'India', 'Pakistan', 'Malaysia', 'Singapore', 'Other',
];

const ALL_SUBJECTS = [
  'Mathematics', 'Further Mathematics', 'English Language', 'Literature in English',
  'Physics', 'Chemistry', 'Biology', 'Agricultural Science', 'Economics', 'Government',
  'Geography', 'History', 'Commerce', 'Financial Accounting', 'JAMB Prep', 'WAEC Prep',
  'NECO Prep', 'IELTS', 'TOEFL', 'SAT', 'ACT', 'GCSE Mathematics', 'GCSE English',
  'A-Level Mathematics', 'A-Level Physics', 'A-Level Chemistry', 'A-Level Biology',
  'Computer Science', 'Web Development', 'Python', 'Data Science',
  'French', 'Spanish', 'Arabic', 'Yoruba', 'Igbo', 'Hausa',
  'Music', 'Fine Arts',
];

const ALL_LEVELS = [
  { value: 'primary', label: 'Primary School' },
  { value: 'jss', label: 'Junior Secondary (JSS)' },
  { value: 'sss', label: 'Senior Secondary (SSS)' },
  { value: 'waec', label: 'WAEC Preparation' },
  { value: 'jamb', label: 'JAMB / UTME' },
  { value: 'neco', label: 'NECO Preparation' },
  { value: 'gcse', label: 'GCSE / IGCSE' },
  { value: 'a-level', label: 'A-Level' },
  { value: 'sat', label: 'SAT / ACT' },
  { value: 'ib', label: 'IB Programme' },
  { value: 'university', label: 'University Level' },
  { value: 'adult', label: 'Adult Learning' },
];

const TABS = [
  { id: 'overview',     label: 'Overview',        icon: LayoutDashboard },
  { id: 'bookings',     label: 'Bookings',        icon: BookOpen },
  { id: 'subscribers',  label: 'Subscribers',     icon: Users },
  { id: 'calendar',     label: 'Calendar',        icon: CalendarCheck },
  { id: 'quiz',         label: 'Quiz Questions',  icon: HelpCircle },
  { id: 'profile',      label: 'My Profile',      icon: Edit2 },
  { id: 'reviews',      label: 'Reviews',         icon: Star },
  { id: 'earnings',     label: 'Earnings',        icon: DollarSign },
  { id: 'settings',     label: 'Settings',        icon: Settings },
];

const BOTTOM_TABS = [
  { id: 'overview',     label: 'Home',        icon: LayoutDashboard },
  { id: 'bookings',     label: 'Bookings',    icon: BookOpen },
  { id: 'quiz',         label: 'Quiz',        icon: HelpCircle },
  { id: 'profile',      label: 'Profile',     icon: Edit2 },
  { id: 'reviews',      label: 'Reviews',     icon: Star },
  { id: 'settings',     label: 'Settings',    icon: Settings },
];

function formatDate(d) {
  if (!d) return '';
  try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function StarRow({ rating, size = 13 }) {
  return (
    <div className="flex items-center gap-px">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size} className={n <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    upcoming: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
    </span>
  );
}

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────
function OverviewTab({ profile, bookings, setActiveTab }) {
  const upcomingBookings = bookings.filter(b => !['completed','cancelled'].includes(b.status));

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-linear-to-r from-green-800 via-green-700 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${profile?.isVerified ? 'bg-white/20' : 'bg-orange-500/30'}`}>
            {profile?.isVerified ? <><CheckCircle size={12} /> Verified Tutor</> : <><AlertCircle size={12} /> Awaiting Verification</>}
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold">
            {profile?.isActive ? 'Your profile is live!' : 'Profile under review'}
          </h1>
          <p className="text-green-200 text-sm mt-1">
            {profile?.isActive
              ? 'Students can find and book sessions with you.'
              : 'We\'ll notify you by email once your profile is approved.'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
        {[
          { label: 'Rating',        value: profile?.rating > 0 ? profile.rating.toFixed(1) : '—', icon: Star,        color: 'bg-yellow-100 text-yellow-600' },
          { label: 'Reviews',       value: profile?.reviewCount || 0,                               icon: Users,       color: 'bg-blue-100 text-blue-600' },
          { label: 'Total Sessions',value: profile?.totalSessions || bookings.length,               icon: BookOpen,    color: 'bg-green-100 text-green-600' },
          { label: 'Upcoming',      value: upcomingBookings.length,                                 icon: TrendingUp,  color: 'bg-purple-100 text-purple-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{value}</div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Today's scheduled sessions — smart countdown + start button */}
      <TodayScheduleBanner sessions={upcomingBookings} role="tutor" />

      {/* Ad-hoc class launch — no booking needed */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
          <Video size={18} className="text-green-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">Start an Ad-hoc Class</p>
          <p className="text-gray-400 text-xs mt-0.5">Whiteboard · Files · Homework — no booking needed</p>
        </div>
        <button
          onClick={() => {
            const roomId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
            window.open(`/learning?session=${roomId}`, '_blank');
          }}
          className="shrink-0 bg-green-700 text-white font-bold px-4 py-2 rounded-xl hover:bg-green-800 transition text-xs flex items-center gap-1.5">
          <Video size={13} /> Start
        </button>
      </div>

      {/* Learning Hub CTA */}
      <Link to="/learning"
        className="w-full bg-linear-to-r from-purple-700 to-purple-600 rounded-2xl p-5 flex items-center gap-4 text-white hover:opacity-95 transition">
        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <GraduationCap size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-base leading-tight">Learning Hub</p>
          <p className="text-purple-200 text-xs mt-0.5">Upload notes · Create quizzes · Track progress · Chat with students</p>
        </div>
        <ChevronRight size={18} className="text-white/60 shrink-0" />
      </Link>

      {/* Profile completeness */}
      {(() => {
        const fields = [profile?.headline, profile?.bio, profile?.subjects?.length, profile?.levels?.length, profile?.hourlyRateNaira];
        const done = fields.filter(Boolean).length;
        const pct = Math.round((done / fields.length) * 100);
        return pct < 100 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-gray-900">Profile Completeness</p>
              <span className="text-sm font-bold text-green-700">{pct}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div className="bg-green-600 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-gray-500">Complete your profile to get more bookings. <button onClick={() => setActiveTab('profile')} className="text-green-700 font-semibold hover:underline">Edit profile →</button></p>
          </div>
        ) : null;
      })()}

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">Recent Bookings</h2>
          <button onClick={() => setActiveTab('bookings')} className="text-xs text-green-700 font-semibold hover:underline flex items-center gap-1">
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {bookings.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              <BookOpen size={28} className="text-gray-200 mx-auto mb-2" />
              No bookings yet. Share your profile to get started!
            </div>
          ) : (
            bookings.slice(0, 4).map(b => (
              <div key={b._id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen size={14} className="text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{b.name || 'Student'}</p>
                  <p className="text-xs text-gray-400">{formatDate(b.date)} · {b.timeSlot}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BOOKINGS TAB ────────────────────────────────────────────────────────────
function BookingsTab({ bookings: initialBookings, loading }) {
  const [filter, setFilter]           = useState('all');
  const [bookings, setBookings]       = useState(initialBookings);
  const [acting, setActing]           = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [linkInputs, setLinkInputs]   = useState({});   // bookingId → typed URL
  const [settingLink, setSettingLink] = useState(null);  // bookingId being saved

  // Keep in sync when parent re-fetches
  useEffect(() => { setBookings(initialBookings); }, [initialBookings]);

  const handleSetLink = async (bookingId) => {
    const url = (linkInputs[bookingId] || '').trim();
    if (!url) return toast.error('Please enter a meeting link');
    setSettingLink(bookingId);
    try {
      const { data } = await api.patch(`/bookings/${bookingId}/set-link`, { callLink: url });
      setBookings(prev => prev.map(b => b._id === bookingId ? data.booking : b));
      setLinkInputs(prev => ({ ...prev, [bookingId]: '' }));
      toast.success('Meeting link saved — student notified by email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save link');
    } finally {
      setSettingLink(null);
    }
  };

  const filters = [
    { value: 'all',       label: 'All' },
    { value: 'pending',   label: `Pending${initialBookings.filter(b => b.status === 'pending').length > 0 ? ` (${initialBookings.filter(b => b.status === 'pending').length})` : ''}` },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Declined' },
  ];

  const filtered = filter === 'all' ? bookings : bookings.filter(b => {
    if (filter === 'confirmed') return b.status === 'confirmed';
    return b.status === filter;
  });

  const handleAction = async (bookingId, action) => {
    setActing(bookingId);
    try {
      const { data } = await api.patch(`/bookings/${bookingId}/tutor-action`, { action });
      setBookings(prev => prev.map(b => b._id === bookingId ? data.booking : b));
      toast.success(action === 'confirm' ? 'Session confirmed — student notified!' : 'Session declined.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">My Bookings</h2>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 font-bold text-xs px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {pendingCount} awaiting your approval
          </span>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === f.value ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading bookings…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <BookOpen size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}</p>
          <p className="text-gray-400 text-sm mt-1">Bookings from students will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <div key={b._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition ${
              b.status === 'pending' ? 'border-amber-200' : 'border-gray-100'
            }`}>
              {/* Pending banner */}
              {b.status === 'pending' && (
                <div className="bg-amber-50 border-b border-amber-100 px-5 py-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <p className="text-xs font-bold text-amber-700">Awaiting your approval — confirm or decline below</p>
                </div>
              )}

              <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Student info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0 text-green-700 font-bold text-sm">
                    {(b.name || 'S')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">{b.user?.name || b.name || 'Student'}</p>
                      {b.isTrial && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Discounted</span>
                      )}
                      {b.subscriptionId && (
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Paid · ₦{(b.subscriptionId.monthlyRate || 0).toLocaleString()}/mo</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{b.user?.email || b.email}</p>
                    {b.phone && <p className="text-xs text-gray-400">{b.phone}</p>}
                  </div>
                </div>

                {/* Session details */}
                <div className="flex flex-col gap-1 sm:min-w-40">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock size={11} className="text-gray-400" />
                    <span className="font-semibold">{formatDate(b.date)}</span>
                  </div>
                  <p className="text-xs text-gray-500 pl-4">{b.timeSlot}</p>
                  {b.notes && (
                    <p className="text-xs text-gray-400 pl-4 truncate max-w-xs">{b.notes.slice(0, 80)}</p>
                  )}
                </div>

                {/* Status + actions */}
                <div className="flex flex-col gap-2 sm:items-end sm:min-w-45">
                  <StatusBadge status={b.status} />

                  {/* Action buttons for pending */}
                  {b.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(b._id, 'decline')}
                        disabled={acting === b._id}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition disabled:opacity-50">
                        {acting === b._id ? '…' : 'Decline'}
                      </button>
                      <button
                        onClick={() => handleAction(b._id, 'confirm')}
                        disabled={acting === b._id}
                        className="px-4 py-1.5 text-xs font-bold bg-green-700 text-white hover:bg-green-800 rounded-xl transition disabled:opacity-50 flex items-center gap-1">
                        {acting === b._id
                          ? <><span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> Confirming…</>
                          : <><CheckCircle size={12} /> Confirm</>
                        }
                      </button>
                    </div>
                  )}

                  {/* Confirmed session — link management */}
                  {b.status === 'confirmed' && (
                    b.callLink ? (
                      /* Link already set — show Start button + change option */
                      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                        <ClassStartButton callLink={b.callLink} date={b.date} timeSlot={b.timeSlot} />
                        <button
                          onClick={() => setLinkInputs(prev => ({ ...prev, [b._id]: b.callLink }))}
                          className="text-[10px] text-gray-400 hover:text-green-700 font-semibold underline text-right transition">
                          Change link
                        </button>
                        {/* Inline edit field (appears when "Change link" clicked) */}
                        {linkInputs[b._id] !== undefined && linkInputs[b._id] !== '' && (
                          <div className="flex gap-1.5 mt-1">
                            <input
                              value={linkInputs[b._id]}
                              onChange={e => setLinkInputs(prev => ({ ...prev, [b._id]: e.target.value }))}
                              placeholder="New meeting link…"
                              className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-0"
                            />
                            <button
                              onClick={() => handleSetLink(b._id)}
                              disabled={settingLink === b._id}
                              className="text-xs font-bold bg-green-700 text-white px-3 py-1.5 rounded-lg hover:bg-green-800 transition disabled:opacity-50 shrink-0">
                              {settingLink === b._id ? '…' : 'Save'}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* No link yet — prompt tutor to set one */
                      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          <AlertCircle size={12} className="text-amber-600 shrink-0" />
                          <span className="text-[11px] text-amber-700 font-semibold">No meeting link set</span>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            value={linkInputs[b._id] || ''}
                            onChange={e => setLinkInputs(prev => ({ ...prev, [b._id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleSetLink(b._id)}
                            placeholder="Paste Google Meet / Zoom link…"
                            className="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-0"
                          />
                          <button
                            onClick={() => handleSetLink(b._id)}
                            disabled={settingLink === b._id}
                            className="text-xs font-bold bg-green-700 text-white px-3 py-1.5 rounded-lg hover:bg-green-800 transition disabled:opacity-50 shrink-0 flex items-center gap-1">
                            {settingLink === b._id
                              ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                              : <Video size={11} />}
                            {settingLink === b._id ? '…' : 'Set Link'}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400">Student will be notified by email instantly.</p>
                      </div>
                    )
                  )}

                  {/* Mark as Done */}
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => handleAction(b._id, 'complete')}
                      disabled={acting === b._id}
                      className="px-3 py-1.5 text-xs font-bold text-gray-700 border border-gray-300 hover:bg-gray-100 rounded-xl transition disabled:opacity-50 flex items-center gap-1">
                      {acting === b._id ? '…' : <><CheckCircle size={12} className="text-gray-500" /> Mark Done</>}
                    </button>
                  )}

                  {/* View student details */}
                  <button onClick={() => setSelectedBooking(b)}
                    className="px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-green-300 rounded-xl transition flex items-center gap-1">
                    <User size={11} /> View Student
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <StudentDetailModal
          booking={selectedBooking}
          allBookings={bookings}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}

// ─── SUBSCRIBERS TAB ─────────────────────────────────────────────────────────
function SubscribersTab() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/subscriptions/tutor')
      .then(({ data }) => setSubs(data.subscriptions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = subs.filter(s => s.status === 'active');

  const STATUS_COLORS = {
    active:    'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    expired:   'bg-gray-100 text-gray-500',
    pending:   'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Subscribers</h2>
        {active.length > 0 && (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
            {active.length} active
          </span>
        )}
      </div>

      {/* Monthly revenue card */}
      {active.length > 0 && (
        <div className="bg-linear-to-r from-green-800 to-green-700 rounded-2xl p-5 text-white">
          <p className="text-xs text-green-300 font-semibold uppercase tracking-wider mb-1">Monthly Subscription Revenue</p>
          <p className="text-3xl font-extrabold">
            ₦{active.reduce((sum, s) => sum + (s.monthlyRate || 0), 0).toLocaleString()}
          </p>
          <p className="text-green-300 text-sm mt-1">{active.length} active subscriber{active.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading subscribers…</p>
        </div>
      ) : subs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Users size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No subscribers yet</p>
          <p className="text-gray-400 text-sm mt-1">Students who subscribe after their trial appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map(sub => (
            <div key={sub._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0 text-green-700 font-bold text-sm">
                  {(sub.student?.name || 'S')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{sub.student?.name || 'Student'}</p>
                      <p className="text-xs text-gray-400">{sub.student?.email}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[sub.status] || 'bg-gray-100 text-gray-500'}`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">₦{(sub.monthlyRate || 0).toLocaleString()}<span className="font-normal text-gray-400">/mo</span></span>
                    <span>{sub.timesPerWeek}× per week</span>
                    <span>{sub.sessionDuration} min sessions</span>
                    {sub.renewalDate && (
                      <span>Renews {new Date(sub.renewalDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
function ProfileTab({ profile, onRefresh }) {
  const [form, setForm] = useState({
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    yearsExperience: profile?.yearsExperience || '',
    subjects: profile?.subjects || [],
    levels: profile?.levels || [],
    teachingMode: profile?.teachingMode || [],
    country: profile?.country || 'Nigeria',
    state: profile?.state || '',
    city: profile?.city || '',
    currency: profile?.currency || 'NGN',
    hourlyRateNaira: profile?.hourlyRateNaira || '',
    groupRateNaira: profile?.groupRateNaira || '',
    trialAvailable: profile?.trialAvailable !== false,
    trialDurationMins: profile?.trialDurationMins || 30,
    trialDiscountPercent: profile?.trialDiscountPercent ?? 50,
    responseTime: profile?.responseTime || 'Within 24 hours',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k, v) => {
    const arr = form[k];
    set(k, arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/tutors/me', {
        ...form,
        hourlyRateNaira: form.hourlyRateNaira ? Number(form.hourlyRateNaira) : undefined,
        groupRateNaira: form.groupRateNaira ? Number(form.groupRateNaira) : undefined,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : 0,
      });
      toast.success('Profile updated!');
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide';
  const sym = CURRENCY_SYMBOLS[form.currency] || '₦';

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">My Profile</h2>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition disabled:opacity-60">
          {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Basic */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Basic Information</p>
        <div>
          <label className={labelClass}>Headline</label>
          <input value={form.headline} onChange={e => set('headline', e.target.value)} maxLength={120}
            placeholder="e.g. Expert WAEC Mathematics Tutor with 8 years experience"
            className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Bio</label>
          <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={5}
            placeholder="Tell students about yourself, teaching style, and achievements..."
            className={`${inputClass} resize-none`} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Years of Experience</label>
            <input type="number" min="0" value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Response Time</label>
            <select value={form.responseTime} onChange={e => set('responseTime', e.target.value)} className={inputClass}>
              <option>Within 1 hour</option>
              <option>Within 3 hours</option>
              <option>Within 24 hours</option>
              <option>Within 48 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Subjects ({form.subjects.length} selected)</p>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {ALL_SUBJECTS.map(s => (
            <button key={s} type="button" onClick={() => toggle('subjects', s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                form.subjects.includes(s) ? 'bg-green-700 border-green-700 text-white' : 'border-gray-200 text-gray-600 hover:border-green-400 bg-white'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Levels */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Student Levels</p>
        <div className="flex flex-wrap gap-2">
          {ALL_LEVELS.map(({ value, label }) => (
            <button key={value} type="button" onClick={() => toggle('levels', value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                form.levels.includes(value) ? 'bg-green-700 border-green-700 text-white' : 'border-gray-200 text-gray-600 hover:border-green-400 bg-white'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Mode & Location */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Teaching Mode & Location</p>
        <div className="flex gap-3">
          {[{ value: 'online', label: '💻 Online' }, { value: 'in-person', label: '📍 In-Person' }].map(({ value, label }) => (
            <button key={value} type="button" onClick={() => toggle('teachingMode', value)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition ${
                form.teachingMode.includes(value) ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300'
              }`}>{label}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Country</label>
            <select value={form.country} onChange={e => set('country', e.target.value)} className={inputClass}>
              {WORLD_COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>State / Region</label>
            <input value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. Lagos" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Lekki" className={inputClass} />
          </div>
        </div>
      </div>

      {/* Rates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rates & Pricing</p>
        <div>
          <label className={labelClass}>Currency</label>
          <select value={form.currency} onChange={e => set('currency', e.target.value)} className={`${inputClass} max-w-xs`}>
            {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>1-on-1 Rate ({sym}/hr)</label>
            <input type="number" min="0" value={form.hourlyRateNaira} onChange={e => set('hourlyRateNaira', e.target.value)} className={inputClass} placeholder="e.g. 4000" />
          </div>
          <div>
            <label className={labelClass}>Group Rate ({sym}/hr) <span className="text-gray-300 font-normal normal-case">(optional)</span></label>
            <input type="number" min="0" value={form.groupRateNaira} onChange={e => set('groupRateNaira', e.target.value)} className={inputClass} placeholder="e.g. 2000" />
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
          <div>
            <p className="text-sm font-bold text-gray-900">Discounted First Session</p>
            <p className="text-xs text-gray-500">Students get a discount on their first class with you</p>
          </div>
          <button type="button" onClick={() => set('trialAvailable', !form.trialAvailable)}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.trialAvailable ? 'bg-green-600' : 'bg-gray-300'}`}>
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.trialAvailable ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
        {form.trialAvailable && (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Session Duration</p>
              <div className="flex gap-2">
                {[30, 45, 60].map(m => (
                  <button key={m} type="button" onClick={() => set('trialDurationMins', m)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                      form.trialDurationMins === m ? 'bg-green-700 border-green-700 text-white' : 'border-gray-200 text-gray-600 hover:border-green-400'
                    }`}>{m} min</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Discount — student pays {100 - form.trialDiscountPercent}% of your rate
              </p>
              <div className="flex gap-2 flex-wrap">
                {[10, 20, 30, 50, 70].map(pct => (
                  <button key={pct} type="button" onClick={() => set('trialDiscountPercent', pct)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${
                      form.trialDiscountPercent === pct ? 'bg-green-700 border-green-700 text-white' : 'border-gray-200 text-gray-600 hover:border-green-400'
                    }`}>{pct}% off</button>
                ))}
              </div>
              {form.hourlyRateNaira > 0 && (
                <p className="text-xs text-green-700 mt-2 font-semibold">
                  Student pays ≈ ₦{Math.round(Number(form.hourlyRateNaira) * (1 - form.trialDiscountPercent / 100) * (form.trialDurationMins / 60)).toLocaleString()} for the first session
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-green-800 transition disabled:opacity-60">
        {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : <><Save size={14} /> Save All Changes</>}
      </button>
    </div>
  );
}

// ─── REVIEWS TAB ─────────────────────────────────────────────────────────────
function ReviewsTab({ profile, reviews, loadingReviews }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">My Reviews</h2>
        {profile?.reviewCount > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 px-3 py-1.5 rounded-xl">
            <StarRow rating={profile.rating} size={14} />
            <span className="font-bold text-gray-900 text-sm">{profile.rating.toFixed(1)}</span>
            <span className="text-gray-400 text-xs">({profile.reviewCount})</span>
          </div>
        )}
      </div>

      {loadingReviews ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading reviews…</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Star size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No reviews yet</p>
          <p className="text-gray-400 text-sm mt-1">After your first session, ask students to leave a review</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                    {(r.student?.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.student?.name || 'Student'}</p>
                    {r.subject && <p className="text-xs text-gray-400">{r.subject}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <StarRow rating={r.rating} size={12} />
                  <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
                </div>
              </div>
              {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ user: userProp, profile }) {
  const { updateUser } = useAuth();
  const user = userProp;
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);
    try {
      const { data } = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ profilePhoto: data.profilePhoto });
      toast.success('Profile photo updated!');
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Account Settings</h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
          {/* Avatar with upload button */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-green-700 flex items-center justify-center text-white font-extrabold text-xl">
              {user?.profilePhoto
                ? <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" />
                : (user?.name || 'T').charAt(0).toUpperCase()
              }
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              title="Change photo"
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-700 border-2 border-white rounded-full flex items-center justify-center text-white hover:bg-green-800 transition disabled:opacity-50"
            >
              {uploading
                ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                : <Camera size={11} />
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          <div>
            <p className="font-bold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Tutor Account</span>
              {profile?.isVerified && <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle size={10} /> Verified</span>}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-2 text-xs text-green-700 font-semibold hover:underline disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Change profile photo'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Profile Status</p>
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${profile?.isActive ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
              <div className={`w-3 h-3 rounded-full ${profile?.isActive ? 'bg-green-500' : 'bg-orange-400'} animate-pulse`} />
              <div>
                <p className={`text-sm font-bold ${profile?.isActive ? 'text-green-800' : 'text-orange-800'}`}>
                  {profile?.isActive ? 'Profile is Live' : 'Awaiting Review'}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.isActive ? 'Students can find and book you.' : 'Our team reviews profiles within 24–48 hours.'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Tutor Profile</p>
            {profile?.isActive ? (
              <Link to={`/tutors/${profile._id}`} target="_blank"
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition">
                <span className="text-sm font-semibold text-gray-700">View Public Profile</span>
                <ExternalLink size={14} className="text-gray-400" />
              </Link>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 text-center">
                Your public profile will appear here once approved
              </div>
            )}
          </div>
        </div>
      </div>

      <ChangePasswordSection />
    </div>
  );
}

// ─── STUDENT DETAIL MODAL ────────────────────────────────────────────────────
function StudentDetailModal({ booking, allBookings, onClose }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const studentId = booking.user?._id || booking.user;

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    api.get(`/users/${studentId}/student-profile`)
      .then(({ data }) => setStudent(data.student))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  // All bookings this student has with this tutor
  const studentBookings = allBookings.filter(b =>
    (b.user?._id || b.user)?.toString() === studentId?.toString()
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Parse notes: "Tutor: X | Subject: Y | Type: Z | Message: W"
  const subject = booking.notes?.match(/Subject: ([^|]+)/)?.[1]?.trim() || null;
  const message = booking.notes?.match(/Message: (.+)/)?.[1]?.trim() || null;

  const name = booking.user?.name || booking.name || 'Student';
  const email = booking.user?.email || booking.email || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-extrabold text-gray-900">Student Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Identity */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-extrabold text-xl shrink-0">
              {name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-900 text-lg leading-tight">{name}</p>
              <p className="text-sm text-gray-400">{email}</p>
              {(booking.phone || student?.phone) && (
                <p className="text-sm text-gray-500 mt-0.5">{booking.phone || student?.phone}</p>
              )}
              {student?.country && (
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={11} /> {student.country}
                </p>
              )}
            </div>
          </div>

          {/* Tutoring requirements */}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
              Loading student profile…
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">What They Need</p>

              <div className="grid grid-cols-2 gap-3">
                {(subject || (student?.subjects?.length > 0)) && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase">Subject</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {subject || student?.subjects?.slice(0, 2).join(', ')}
                    </p>
                  </div>
                )}
                {student?.classLevel && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase">Level</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{student.classLevel}</p>
                  </div>
                )}
                {student?.preferredLanguage && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase">Preferred Language</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{student.preferredLanguage}</p>
                  </div>
                )}
                {student?.learningStyle && (
                  <div>
                    <p className="text-[11px] font-semibold text-gray-400 uppercase">Learning Style</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{student.learningStyle}</p>
                  </div>
                )}
              </div>

              {student?.preferredSchedule?.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1.5">Preferred Schedule</p>
                  <div className="flex flex-wrap gap-1.5">
                    {student.preferredSchedule.map(s => (
                      <span key={s} className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {message && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">Message</p>
                  <p className="text-sm text-gray-700 bg-white rounded-xl p-3 border border-gray-100 leading-relaxed">{message}</p>
                </div>
              )}

              {student?.tutoringGoal && (
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">Goal</p>
                  <p className="text-sm text-gray-700">{student.tutoringGoal}</p>
                </div>
              )}
            </div>
          )}

          {/* Quiz Results — shown when the booking that was clicked is a trial with quiz data */}
          {booking.isTrial && booking.quizResults?.answers?.length > 0 && (() => {
            const qr      = booking.quizResults;
            const pct     = Math.round((qr.score / qr.total) * 100);
            const barColor = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-500';
            const weakTopics = [...new Set(
              qr.answers.filter(a => !a.isCorrect).map(a => a.topic).filter(Boolean)
            )];
            const LABELS = ['A','B','C','D','E'];
            return (
              <div className="border border-blue-200 rounded-2xl overflow-hidden">
                {/* Score header */}
                <div className="bg-blue-700 px-5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">Pre-Session Quiz</p>
                    <p className="text-white font-extrabold text-base mt-0.5">{qr.subject}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-extrabold text-white">{pct}%</p>
                    <p className="text-xs text-blue-200">{qr.score} / {qr.total} correct</p>
                  </div>
                </div>

                {/* Score bar */}
                <div className="px-5 pt-3 pb-1 bg-blue-50">
                  <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Weak areas */}
                {weakTopics.length > 0 && (
                  <div className="mx-5 mt-2 mb-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">Areas needing attention</p>
                    <div className="flex flex-wrap gap-1">
                      {weakTopics.map(t => (
                        <span key={t} className="text-[11px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question-by-question breakdown */}
                <div className="divide-y divide-gray-100 pb-2">
                  {qr.answers.map((a, i) => (
                    <div key={i} className={`px-5 py-3 ${a.isCorrect ? '' : 'bg-red-50/60'}`}>
                      <div className="flex items-start gap-2 mb-1.5">
                        <span className={`text-base shrink-0 leading-none mt-0.5 ${a.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                          {a.isCorrect ? '✅' : '❌'}
                        </span>
                        <div className="flex-1 min-w-0">
                          {a.topic && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full mr-1.5">{a.topic}</span>
                          )}
                          <p className="text-xs font-semibold text-gray-800 mt-1 leading-relaxed">{a.question}</p>
                        </div>
                      </div>
                      <div className="ml-6 space-y-0.5">
                        <p className={`text-[11px] flex items-center gap-1 ${a.isCorrect ? 'text-green-700 font-semibold' : 'text-red-600'}`}>
                          <span className="font-bold">{LABELS[a.chosen] || '?'}:</span>
                          {a.options?.[a.chosen] || '—'}
                          <span className="ml-1 text-[10px] font-bold text-gray-400">(student's answer)</span>
                        </p>
                        {!a.isCorrect && (
                          <p className="text-[11px] text-green-700 font-semibold flex items-center gap-1">
                            <span className="font-bold">{LABELS[a.correct]}:</span>
                            {a.options?.[a.correct] || '—'}
                            <span className="ml-1 text-[10px] font-bold text-gray-400">(correct)</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Booking history with this tutor */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Sessions with You ({studentBookings.length})
            </p>
            {studentBookings.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No bookings yet</p>
            ) : (
              <div className="space-y-2">
                {studentBookings.map(b => (
                  <div key={b._id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-gray-700">
                          {b.date ? new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                        </p>
                        {b.timeSlot && <span className="text-xs text-gray-400">· {b.timeSlot}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {b.isTrial && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Trial</span>}
                        {b.subscriptionId && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Paid</span>}
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CALENDAR TAB ────────────────────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function CalendarTab({ bookings: initialBookings, loading }) {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(null);
  const [localBookings, setLocalBookings] = useState(initialBookings);
  const [acting, setActing] = useState(null);
  const [modalBooking, setModalBooking] = useState(null);

  useEffect(() => { setLocalBookings(initialBookings); }, [initialBookings]);

  const year = current.getFullYear();
  const month = current.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const dayKey = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  const byDate = useMemo(() => {
    const map = {};
    localBookings.forEach(b => {
      if (!b.date) return;
      const d = new Date(b.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [localBookings]);

  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const selectedBookings = selected ? [...(byDate[selected] || [])].sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || '')) : [];

  const handleAction = async (bookingId, action) => {
    setActing(bookingId);
    try {
      const { data } = await api.patch(`/bookings/${bookingId}/tutor-action`, { action });
      setLocalBookings(prev => prev.map(b => b._id === bookingId ? data.booking : b));
      toast.success(action === 'confirm' ? 'Session confirmed — student notified!' : 'Session declined.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Booking Calendar</h2>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading calendar…</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Monthly grid ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setCurrent(new Date(year, month - 1, 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition text-gray-600">
                <ChevronLeft size={16} />
              </button>
              <h3 className="font-extrabold text-gray-900 text-base">{MONTH_NAMES[month]} {year}</h3>
              <button onClick={() => setCurrent(new Date(year, month + 1, 1))}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition text-gray-600">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                if (!day) return <div key={`blank-${i}`} />;
                const key = dayKey(day);
                const dayBookings = byDate[key] || [];
                const isToday = key === todayStr;
                const isSelected = key === selected;
                const activeBookings    = dayBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
                const completedBookings = dayBookings.filter(b => b.status === 'completed');
                const trialCount = activeBookings.filter(b => b.isTrial).length;
                const paidCount  = activeBookings.filter(b => !b.isTrial).length;

                return (
                  <button key={key} onClick={() => setSelected(isSelected ? null : key)}
                    className={`relative flex flex-col items-center justify-start pt-1.5 pb-1 gap-0.5 rounded-xl border-2 transition text-sm font-semibold min-h-11
                      ${isSelected ? 'bg-green-700 border-green-700 text-white' : isToday ? 'border-green-500 bg-green-50 text-green-700' : 'border-transparent hover:bg-gray-50 text-gray-700'}
                    `}>
                    <span className="leading-none text-sm">{day}</span>
                    {dayBookings.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {trialCount > 0 && (
                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full leading-none ${isSelected ? 'bg-amber-300/60 text-white' : 'bg-amber-100 text-amber-700'}`}>
                            {trialCount}T
                          </span>
                        )}
                        {paidCount > 0 && (
                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full leading-none ${isSelected ? 'bg-white/25 text-white' : 'bg-green-100 text-green-700'}`}>
                            {paidCount}
                          </span>
                        )}
                        {completedBookings.length > 0 && (
                          <span className={`text-[9px] font-bold px-1 py-0.5 rounded-full leading-none ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            ✓{completedBookings.length}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-4 h-4 rounded-lg border-2 border-green-500 bg-green-50 inline-block" /> Today
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold">2T</span> Discounted
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-bold">3</span> Paid
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold">✓1</span> Done
              </div>
            </div>
          </div>

          {/* ── Day detail panel ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            {!selected ? (
              <div className="flex flex-col items-center justify-center flex-1 min-h-75 p-6 text-center">
                <CalendarCheck size={36} className="text-gray-200 mb-3" />
                <p className="text-sm font-semibold text-gray-400">Tap a day to see sessions</p>
                <p className="text-xs text-gray-300 mt-1">Days with bookings show a number badge</p>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                  <p className="font-extrabold text-gray-900 text-sm">
                    {new Date(selected + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedBookings.length === 0 ? 'No sessions' : `${selectedBookings.length} session${selectedBookings.length !== 1 ? 's' : ''}`}
                  </p>
                </div>

                <div className="divide-y divide-gray-50 overflow-y-auto flex-1" style={{ maxHeight: 460 }}>
                  {selectedBookings.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-gray-400">
                      <Clock size={24} className="text-gray-200 mx-auto mb-2" />
                      No sessions on this day
                    </div>
                  ) : (
                    selectedBookings.map(b => (
                      <div key={b._id} className={`px-5 py-4 ${b.status === 'pending' ? 'bg-amber-50' : b.status === 'completed' ? 'bg-gray-50 opacity-80' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0 text-green-700 font-bold text-sm">
                            {(b.user?.name || b.name || 'S')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-sm font-bold text-gray-900 truncate">{b.user?.name || b.name || 'Student'}</p>
                              {b.isTrial && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Discounted</span>}
                              {b.subscriptionId && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Paid</span>}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                              <Clock size={10} className="text-gray-300" /> {b.timeSlot || 'Time TBD'}
                            </p>
                            <div className="mt-1.5">
                              <StatusBadge status={b.status} />
                            </div>
                            {b.status === 'pending' && (
                              <div className="flex gap-2 mt-2">
                                <button onClick={() => handleAction(b._id, 'decline')} disabled={acting === b._id}
                                  className="px-3 py-1 text-[11px] font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
                                  Decline
                                </button>
                                <button onClick={() => handleAction(b._id, 'confirm')} disabled={acting === b._id}
                                  className="px-3 py-1 text-[11px] font-bold bg-green-700 text-white hover:bg-green-800 rounded-lg transition disabled:opacity-50 flex items-center gap-1">
                                  {acting === b._id ? '…' : <><CheckCircle size={10} /> Confirm</>}
                                </button>
                              </div>
                            )}
                            {b.status === 'confirmed' && b.callLink && (
                              <div className="mt-2">
                                <ClassStartButton callLink={b.callLink} date={b.date} timeSlot={b.timeSlot} />
                              </div>
                            )}
                            {b.status === 'confirmed' && (
                              <button onClick={() => handleAction(b._id, 'complete')} disabled={acting === b._id}
                                className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-gray-600 border border-gray-300 hover:bg-gray-100 px-2.5 py-1 rounded-lg transition disabled:opacity-50 w-fit">
                                {acting === b._id ? '…' : <><CheckCircle size={10} className="text-gray-500" /> Mark Done</>}
                              </button>
                            )}
                            <button onClick={() => setModalBooking(b)}
                              className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-gray-500 border border-gray-200 hover:border-green-300 hover:text-green-700 px-2.5 py-1 rounded-lg transition w-fit">
                              <User size={10} /> View Student
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {modalBooking && (
        <StudentDetailModal
          booking={modalBooking}
          allBookings={localBookings}
          onClose={() => setModalBooking(null)}
        />
      )}
    </div>
  );
}

// ─── QUIZ QUESTIONS TAB ──────────────────────────────────────────────────────
function QuizTab({ profile }) {
  const [questions,    setQuestions]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editId,       setEditId]       = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(null);
  const [subjectFilter, setSubjectFilter] = useState('all');

  const emptyForm = {
    subject: profile?.subjects?.[0] || '',
    topic: '',
    question: '',
    options: ['', '', '', '', ''],
    correctIndex: 0,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tutor-quiz/my/questions');
      setQuestions(data.questions || []);
    } catch {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const subjects  = ['all', ...new Set(questions.map(q => q.subject))];
  const filtered  = subjectFilter === 'all' ? questions : questions.filter(q => q.subject === subjectFilter);

  const handleSave = async () => {
    const { subject, topic, question, options, correctIndex } = form;
    if (!subject || !question.trim()) return toast.error('Subject and question are required');
    const filledOpts = options.filter(o => o.trim());
    if (filledOpts.length < 2) return toast.error('At least 2 options are required');
    if (correctIndex >= filledOpts.length) return toast.error('Select a valid correct answer option');

    setSaving(true);
    try {
      const body = {
        subject,
        topic:        topic.trim(),
        question:     question.trim(),
        options:      filledOpts,
        correctIndex: Number(correctIndex),
      };
      if (editId) {
        const { data } = await api.patch(`/tutor-quiz/my/questions/${editId}`, body);
        setQuestions(prev => prev.map(q => q._id === editId ? data.question : q));
        toast.success('Question updated!');
      } else {
        const { data } = await api.post('/tutor-quiz/my/questions', body);
        setQuestions(prev => [data.question, ...prev]);
        toast.success('Question added!');
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (q) => {
    const opts = [...q.options, '', '', '', '', ''].slice(0, 5);
    setForm({ subject: q.subject, topic: q.topic || '', question: q.question, options: opts, correctIndex: q.correctIndex });
    setEditId(q._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    setDeleting(id);
    try {
      await api.delete(`/tutor-quiz/my/questions/${id}`);
      setQuestions(prev => prev.filter(q => q._id !== id));
      toast.success('Question deleted');
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const LABELS = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Quiz Questions</h2>
          <p className="text-sm text-gray-400 mt-0.5">{questions.length} / 30 questions · Students answer these before booking a discounted session</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(s => !s); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={15} /> Add Question
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <HelpCircle size={18} className="text-blue-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-blue-900">How This Works</p>
          <p className="text-xs text-blue-700 mt-0.5">
            When a student books a discounted session with you, they'll answer up to 30 of your questions (one at a time). Their answers and score are sent only to you by email — the student won't see a score. Use this to understand their level before you meet.
          </p>
        </div>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">{editId ? 'Edit Question' : 'New Question'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
              className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject *</label>
              <select
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(profile?.subjects?.length > 0 ? profile.subjects : [form.subject]).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Topic (optional)</label>
              <input
                value={form.topic}
                onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                placeholder="e.g. Algebra, Photosynthesis, Past Tense"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Question text */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Question *</label>
            <textarea
              value={form.question}
              onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
              placeholder="Enter the question text…"
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Options A-E with correct answer selector */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Options &amp; Correct Answer</label>
            <div className="space-y-2">
              {LABELS.map((label, i) => (
                <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 transition ${form.correctIndex === i ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="correctIndex"
                    checked={form.correctIndex === i}
                    onChange={() => setForm(f => ({ ...f, correctIndex: i }))}
                    className="w-4 h-4 text-green-600 shrink-0 accent-green-600"
                  />
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${form.correctIndex === i ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {label}
                  </span>
                  <input
                    value={form.options[i]}
                    onChange={e => setForm(f => {
                      const opts = [...f.options];
                      opts[i] = e.target.value;
                      return { ...f, options: opts };
                    })}
                    placeholder={i < 2 ? `Option ${label} (required)` : `Option ${label} (optional)`}
                    className="flex-1 bg-transparent text-sm focus:outline-none text-gray-800 placeholder-gray-400"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">Click the radio button next to the correct answer. Leave optional options blank.</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : editId ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </div>
      )}

      {/* Subject filter pills */}
      {!loading && questions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {subjects.map(s => (
            <button key={s} onClick={() => setSubjectFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                subjectFilter === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
              }`}>
              {s === 'all' ? `All (${questions.length})` : `${s} (${questions.filter(q => q.subject === s).length})`}
            </button>
          ))}
        </div>
      )}

      {/* Questions list */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading questions…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <HelpCircle size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{questions.length === 0 ? 'No questions yet' : 'No questions for this subject'}</p>
          <p className="text-gray-400 text-sm mt-1">
            {questions.length === 0
              ? 'Add questions to quiz students before their discounted session.'
              : 'Switch to a different subject filter.'}
          </p>
          {questions.length === 0 && (
            <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
              className="mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition">
              Add First Question
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, i) => (
            <div key={q._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 bg-blue-50 text-blue-600 text-[11px] font-extrabold rounded-full flex items-center justify-center border border-blue-100 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">{q.subject}</span>
                  {q.topic && <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">{q.topic}</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(q)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(q._id)} disabled={deleting === q._id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                    {deleting === q._id
                      ? <span className="w-3 h-3 border border-gray-200 border-t-red-500 rounded-full animate-spin block" />
                      : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-2.5 leading-relaxed">{q.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {q.options.map((opt, oi) => (
                  <div key={oi} className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg ${oi === q.correctIndex ? 'bg-green-50 border border-green-100 text-green-800 font-semibold' : 'text-gray-500'}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${oi === q.correctIndex ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {LABELS[oi]}
                    </span>
                    <span className="leading-snug">{opt}</span>
                    {oi === q.correctIndex && <CheckCircle size={11} className="text-green-600 ml-auto shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EARNINGS TAB ─────────────────────────────────────────────────────────────

const NIGERIAN_BANKS = [
  'Access Bank', 'Citibank Nigeria', 'Ecobank Nigeria', 'Fidelity Bank', 'First Bank of Nigeria',
  'First City Monument Bank (FCMB)', 'Globus Bank', 'Guaranty Trust Bank (GTBank)', 'Heritage Bank',
  'Jaiz Bank', 'Keystone Bank', 'Kuda Bank', 'Moniepoint MFB', 'Opay', 'Palmpay',
  'Parallex Bank', 'Polaris Bank', 'Premium Trust Bank', 'Providus Bank', 'Signature Bank',
  'Stanbic IBTC Bank', 'Standard Chartered Bank', 'Sterling Bank', 'SunTrust Bank', 'Titan Trust Bank',
  'Union Bank of Nigeria', 'United Bank for Africa (UBA)', 'Unity Bank', 'Wema Bank', 'Zenith Bank',
  'Other',
];

const PAYROLL_STATUS_STYLES = {
  pending_review:   { badge: 'bg-yellow-100 text-yellow-700',  label: 'Pending Review'   },
  review_submitted: { badge: 'bg-blue-100 text-blue-700',      label: 'Under Review'     },
  approved:         { badge: 'bg-purple-100 text-purple-700',  label: 'Approved'         },
  disbursed:        { badge: 'bg-emerald-100 text-emerald-700',label: 'Paid Out'         },
  on_hold:          { badge: 'bg-red-100 text-red-600',        label: 'On Hold'          },
};

function EarningsTab({ profile }) {
  const [records, setRecords]         = useState([]);
  const [totals, setTotals]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Bank details form
  const [bankForm, setBankForm] = useState({
    accountName:   profile?.bankDetails?.accountName  || '',
    accountNumber: profile?.bankDetails?.accountNumber || '',
    bankName:      profile?.bankDetails?.bankName     || '',
    accountType:   profile?.bankDetails?.accountType  || 'savings',
  });
  const [savingBank, setSavingBank] = useState(false);
  const bankDetails = profile?.bankDetails;

  useEffect(() => {
    api.get('/tutors/me/earnings')
      .then(({ data }) => {
        setRecords(data.records || []);
        setTotals(data.totals || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveBank = async () => {
    if (!bankForm.accountName || !bankForm.accountNumber || !bankForm.bankName) {
      toast.error('Account name, number, and bank are required'); return;
    }
    setSavingBank(true);
    try {
      await api.patch('/tutors/me/bank-details', bankForm);
      toast.success('Bank details saved! Admin will verify shortly.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save bank details');
    } finally {
      setSavingBank(false);
    }
  };

  const sym = CURRENCY_SYMBOLS[profile?.currency || 'NGN'] || '₦';
  const getTotal = (status) => totals.find(t => t._id === status)?.total || 0;
  const disbursed = getTotal('disbursed');
  const pending   = getTotal('pending_review') + getTotal('review_submitted') + getTotal('approved');

  const filtered = statusFilter === 'all' ? records : records.filter(r => r.status === statusFilter);

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Earnings & Payouts</h2>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Paid Out', value: `${sym}${disbursed.toLocaleString()}`, color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
          { label: 'Pending',        value: `${sym}${pending.toLocaleString()}`,   color: 'bg-yellow-50 text-yellow-700',   icon: Clock },
          { label: 'Total Sessions', value: totals.reduce((a, t) => a + t.count, 0), color: 'bg-blue-50 text-blue-700',  icon: BookOpen },
          { label: 'Bank Status',    value: bankDetails?.isVerified ? 'Verified' : bankDetails?.accountNumber ? 'Pending' : 'Not Set', color: bankDetails?.isVerified ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500', icon: Building2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Bank Account Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
          <Building2 size={15} className="text-gray-500" />
          <p className="font-bold text-gray-800 text-sm">Payout Bank Account</p>
          {bankDetails?.isVerified && (
            <span className="ml-auto flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <BadgeCheck size={11} /> Verified
            </span>
          )}
          {bankDetails?.accountNumber && !bankDetails?.isVerified && (
            <span className="ml-auto text-[11px] font-bold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">Pending Verification</span>
          )}
        </div>
        <div className="p-5 space-y-4">
          {bankDetails?.isVerified && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">{bankDetails.bankName}</p>
                <p className="text-xs text-emerald-700">{bankDetails.accountName} · {bankDetails.accountNumber}</p>
                <p className="text-xs text-emerald-600 capitalize">{bankDetails.accountType} account · Verified by admin</p>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Account Name <span className="text-red-500">*</span></label>
              <input value={bankForm.accountName} onChange={e => setBankForm(f => ({ ...f, accountName: e.target.value }))}
                placeholder="As it appears on your bank account"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Account Number <span className="text-red-500">*</span></label>
              <input value={bankForm.accountNumber} onChange={e => setBankForm(f => ({ ...f, accountNumber: e.target.value }))}
                placeholder="10-digit NUBAN" maxLength={10}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 font-mono tracking-widest" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Bank Name <span className="text-red-500">*</span></label>
              <select value={bankForm.bankName} onChange={e => setBankForm(f => ({ ...f, bankName: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                <option value="">Select bank…</option>
                {NIGERIAN_BANKS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">Account Type</label>
              <select value={bankForm.accountType} onChange={e => setBankForm(f => ({ ...f, accountType: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="domiciliary">Domiciliary (foreign)</option>
              </select>
            </div>
          </div>

          <button onClick={handleSaveBank} disabled={savingBank}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2">
            <Save size={14} /> {savingBank ? 'Saving…' : 'Save Bank Details'}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Your bank details are stored securely and only used for payment disbursements. Admin must verify before funds are released.
          </p>
        </div>
      </div>

      {/* Earnings History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
          <div className="flex items-center gap-2">
            <Wallet size={15} className="text-gray-500" />
            <p className="font-bold text-gray-800 text-sm">Earnings History</p>
          </div>
          <div className="ml-auto flex gap-1.5 flex-wrap">
            {['all', 'pending_review', 'review_submitted', 'approved', 'disbursed'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition ${
                  statusFilter === s ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {s === 'all' ? 'All' : (PAYROLL_STATUS_STYLES[s]?.label || s)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No earnings yet</p>
            <p className="text-xs text-gray-400 mt-1">Completed sessions will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(r => {
              const st = PAYROLL_STATUS_STYLES[r.status] || { badge: 'bg-gray-100 text-gray-500', label: r.status };
              return (
                <div key={r._id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.description || 'Session'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Student: {r.student?.name || 'N/A'}
                        {r.booking?.date && ` · ${new Date(r.booking.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      </p>
                      {r.studentReview?.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} size={11} className={n <= r.studentReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                          ))}
                          {r.studentReview.comment && <span className="text-[11px] text-gray-400 ml-1">"{r.studentReview.comment.slice(0, 40)}{r.studentReview.comment.length > 40 ? '…' : ''}"</span>}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-gray-900">{r.currency || sym}{r.netAmount?.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">{r.platformFeePercent}% fee deducted</p>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${st.badge}`}>{st.label}</span>
                    </div>
                  </div>
                  {r.adminNote && (
                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                      <strong>Admin note:</strong> {r.adminNote}
                    </p>
                  )}
                  {r.disbursementRef && (
                    <p className="text-xs text-emerald-700 mt-1">Payment ref: <strong>{r.disbursementRef}</strong></p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TutorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const { data } = await api.get('/tutors/me');
      setProfile(data.profile);
    } catch (err) {
      if (err?.response?.status === 404) {
        toast.error('No tutor profile found. Please register as a tutor first.');
        navigate('/become-a-tutor');
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const { data } = await api.get('/tutors/me/bookings');
      setBookings(data.bookings || []);
    } catch {
      // silently ignore
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchReviews = async (profileId) => {
    if (!profileId) return;
    setLoadingReviews(true);
    try {
      const { data } = await api.get(`/tutors/${profileId}`);
      setReviews(data.reviews || []);
    } catch {
      // silently ignore
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile?._id) fetchReviews(profile._id);
  }, [profile?._id]);

  const handleLogout = () => { logout(); navigate('/'); toast.success('Logged out'); };

  const handleTabChange = id => { setActiveTab(id); setSidebarOpen(false); };

  const renderContent = () => {
    if (loadingProfile) return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );

    switch (activeTab) {
      case 'overview':     return <OverviewTab profile={profile} bookings={bookings} reviews={reviews} setActiveTab={setActiveTab} />;
      case 'bookings':     return <BookingsTab bookings={bookings} loading={loadingBookings} />;
      case 'subscribers':  return <SubscribersTab />;
      case 'calendar':     return <CalendarTab bookings={bookings} loading={loadingBookings} />;
      case 'quiz':         return <QuizTab profile={profile} />;
      case 'profile':      return <ProfileTab profile={profile} onRefresh={fetchProfile} />;
      case 'reviews':      return <ReviewsTab profile={profile} reviews={reviews} loadingReviews={loadingReviews} />;
      case 'earnings':     return <EarningsTab profile={profile} />;
      case 'settings':     return <SettingsTab user={user} profile={profile} />;
      default:             return <OverviewTab profile={profile} bookings={bookings} reviews={reviews} setActiveTab={setActiveTab} />;
    }
  };

  const SidebarContent = () => (
    <aside className="w-64 bg-gray-950 text-white min-h-full flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap size={17} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-sm leading-tight">Tutor Dashboard</p>
            <p className="text-gray-400 text-xs truncate max-w-30">{user?.name || 'Tutor'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-0.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => handleTabChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
              activeTab === id ? 'bg-green-700 text-white shadow-lg shadow-green-900/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}>
            <Icon size={16} />
            {label}
            {activeTab === id && <div className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full" />}
          </button>
        ))}

        <div className="pt-4 mt-4 border-t border-gray-800">
          <button
            onClick={() => {
              const roomId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
              window.open(`/learning?session=${roomId}`, '_blank');
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-400 hover:text-white hover:bg-green-700/40 transition">
            <Video size={16} /> Start a Class
          </button>
          <Link to="/learning"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-400 hover:text-white hover:bg-purple-700/40 transition">
            <GraduationCap size={16} /> Learning Hub
          </Link>
          <Link to="/schedule"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-teal-400 hover:text-white hover:bg-teal-700/40 transition">
            <CalendarCheck size={16} /> Schedule
          </Link>
          <Link to="/find-tutoring"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800 transition">
            <ExternalLink size={16} /> Find Tutoring Page
          </Link>
          <Link to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800 transition">
            <ExternalLink size={16} /> Back to Site
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-900 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(user?.name || 'T').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Logged in as</p>
            <p className="text-sm text-white font-semibold truncate">{user?.name?.split(' ')[0]}</p>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition p-1 rounded-lg hover:bg-gray-800" title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 flex flex-col h-full"><SidebarContent /></div>
          <button onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition">
            <X size={17} />
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">

        {/* Mobile top bar */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition">
            <Menu size={21} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-700 rounded-lg flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Tutor Dashboard</span>
          </div>
          <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {(user?.name || 'T').charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex bg-white border-b border-gray-100 px-8 py-5 items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {TABS.find(t => t.id === activeTab)?.label || 'Overview'}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {activeTab === 'overview'  && `Welcome back, ${user?.name?.split(' ')[0] || 'Tutor'}`}
              {activeTab === 'bookings'     && 'Track all session bookings from students'}
              {activeTab === 'subscribers' && 'Students subscribed to recurring sessions with you'}
              {activeTab === 'calendar'   && 'View all your sessions by date — confirm or decline pending bookings'}
              {activeTab === 'profile'     && 'Update your tutor profile and rates'}
              {activeTab === 'reviews'   && 'Reviews left by your students'}
              {activeTab === 'settings'  && 'Manage your account settings'}
            </p>
          </div>
          {profile?.isActive && (
            <Link to={`/tutors/${profile._id}`} target="_blank"
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:border-green-300 hover:text-green-700 transition">
              <ExternalLink size={14} /> View Public Profile
            </Link>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {renderContent()}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex">
        {BOTTOM_TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => handleTabChange(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 px-1 transition-colors ${activeTab === id ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'}`}>
            <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 1.8} />
            <span className={`text-[10px] font-semibold ${activeTab === id ? 'text-green-700' : 'text-gray-400'}`}>{label}</span>
            {activeTab === id && <span className="absolute bottom-0 w-6 h-0.5 bg-green-600 rounded-full" />}
          </button>
        ))}
      </div>
    </div>
  );
}
