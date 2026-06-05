import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  CalendarCheck, Clock, Calendar, ChevronLeft, Copy, Check,
  CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink,
  GraduationCap, LogOut, Globe, Settings,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const COMMON_TIMEZONES = [
  'Africa/Lagos', 'Africa/Accra', 'Africa/Nairobi', 'Africa/Johannesburg',
  'Africa/Dar_es_Salaam', 'Africa/Cairo',
  'Europe/London', 'Europe/Berlin', 'Europe/Paris',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Toronto',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore',
  'Australia/Sydney', 'Pacific/Auckland',
];

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500';

// ── Session status badge ─────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    confirmed: 'bg-green-100 text-green-700',
    pending:   'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${map[status] || map.pending}`}>
      {status}
    </span>
  );
}

// ── Sessions tab (calendar of booked sessions) ───────────────────────────────

function SessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('upcoming');

  const fetchSessions = (f) => {
    setLoading(true);
    const params = f === 'upcoming' ? { from: new Date().toISOString() }
                 : f === 'past'    ? { to:   new Date().toISOString() }
                 : {};
    api.get('/schedule/sessions', { params })
      .then(({ data }) => setSessions(data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSessions(filter); }, [filter]);

  const handleAction = async (id, action) => {
    try {
      const { data } = await api.patch(`/bookings/${id}/tutor-action`, { action });
      setSessions(prev => prev.map(s => s._id === id ? { ...s, status: data.booking.status, callLink: data.booking.callLink } : s));
      toast.success(action === 'confirm' ? 'Session confirmed — student notified!' : 'Session declined.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold text-gray-900">Tutoring Sessions</h2>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {['upcoming', 'all', 'past'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${filter === f ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CalendarCheck size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-700 mb-1">No sessions found</p>
          <p className="text-sm text-gray-400">Sessions booked through your link appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <CalendarCheck size={17} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">
                      {session.name || session.user?.name || 'Student'}
                    </p>
                    <StatusBadge status={session.status} />
                  </div>
                  <p className="text-xs text-gray-400">{session.email || session.user?.email}</p>

                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <CalendarCheck size={11} className="text-gray-400" />
                      {new Date(session.date).toDateString()}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={11} className="text-gray-400" />
                      {session.timeSlot}
                    </span>
                    {session.recurrence && session.recurrence !== 'none' && (
                      <span className="text-xs text-purple-600 flex items-center gap-1 font-medium">
                        <RefreshCw size={11} /> {session.recurrence} × {session.recurrenceCount}
                      </span>
                    )}
                  </div>

                  {session.notes && (
                    <p className="text-xs text-gray-400 mt-1 italic">"{session.notes}"</p>
                  )}

                  {session.status === 'pending' && (
                    <div className="flex gap-2 mt-2.5">
                      <button onClick={() => handleAction(session._id, 'confirm')}
                        className="flex items-center gap-1 text-xs font-semibold bg-green-700 text-white px-3 py-1.5 rounded-lg hover:bg-green-800 transition">
                        <CheckCircle size={12} /> Confirm
                      </button>
                      <button onClick={() => handleAction(session._id, 'decline')}
                        className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition">
                        <XCircle size={12} /> Decline
                      </button>
                    </div>
                  )}

                  {session.callLink && session.status === 'confirmed' && (
                    <a href={session.callLink} target="_blank" rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 transition">
                      <ExternalLink size={12} /> Join Class
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Availability tab ─────────────────────────────────────────────────────────

const DEFAULT_AVAIL = {
  timezone:        'Africa/Lagos',
  sessionDuration: 60,
  bufferMinutes:   15,
  maxDaysAhead:    30,
  weeklySlots:     [],
  blockedDates:    [],
};

function AvailabilityTab({ tutorProfile, profileLoading, onProfileCreated }) {
  const [avail,        setAvail]        = useState(null);
  const [availLoading, setAvailLoading] = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [copied,       setCopied]       = useState(false);

  const bookingUrl = tutorProfile
    ? `${window.location.origin}/book/${tutorProfile._id}`
    : '';

  useEffect(() => {
    // Wait until the parent has finished fetching the tutor profile
    if (profileLoading) return;

    // No profile — show the form with defaults so the tutor can still save
    if (!tutorProfile) {
      setAvail({ ...DEFAULT_AVAIL });
      setAvailLoading(false);
      return;
    }

    setAvailLoading(true);
    api.get(`/schedule/availability/${tutorProfile._id}`)
      .then(({ data }) => {
        setAvail(data.availability || {
          ...DEFAULT_AVAIL,
          timezone: tutorProfile.timezone || DEFAULT_AVAIL.timezone,
        });
      })
      .catch(() => {
        // Availability not set yet — use defaults
        setAvail({ ...DEFAULT_AVAIL, timezone: tutorProfile.timezone || DEFAULT_AVAIL.timezone });
      })
      .finally(() => setAvailLoading(false));
  }, [tutorProfile, profileLoading]);

  const toggleDay = (day) => {
    setAvail(prev => {
      const has = prev.weeklySlots.some(s => s.day === day);
      return {
        ...prev,
        weeklySlots: has
          ? prev.weeklySlots.filter(s => s.day !== day)
          : [...prev.weeklySlots, { day, startTime: '09:00', endTime: '17:00' }]
              .sort((a, b) => a.day - b.day),
      };
    });
  };

  const updateSlot = (day, field, value) => {
    setAvail(prev => ({
      ...prev,
      weeklySlots: prev.weeklySlots.map(s => s.day === day ? { ...s, [field]: value } : s),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/schedule/availability', avail);
      toast.success('Availability saved!');
      // If the server auto-created a profile, propagate it to the parent
      if (data.profile && !tutorProfile) {
        onProfileCreated?.(data.profile);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Booking link copied!');
  };

  if (availLoading) {
    return (
      <div className="space-y-3 max-w-2xl">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Booking link card */}
      {tutorProfile ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-green-800 mb-0.5">Your Booking Link</p>
          <p className="text-xs text-green-700 mb-3">Share this with students so they can book directly with you.</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-white border border-green-200 rounded-xl px-3 py-2 text-xs text-gray-500 font-mono truncate">
              {bookingUrl}
            </div>
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 bg-green-700 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-green-800 transition whitespace-nowrap">
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <a href={bookingUrl} target="_blank" rel="noreferrer"
              className="p-2 border border-gray-200 bg-white rounded-xl text-gray-500 hover:text-gray-700 transition">
              <ExternalLink size={15} />
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-start gap-2">
          <Globe size={14} className="text-gray-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">
            Save your availability below to generate your personal booking link.
          </p>
        </div>
      )}

      {/* Session settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <Settings size={15} className="text-gray-400" /> Session Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
              <Globe size={12} /> Timezone
            </label>
            <select value={avail.timezone}
              onChange={e => setAvail(p => ({ ...p, timezone: e.target.value }))}
              className={inp}>
              {COMMON_TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Session Duration</label>
            <select value={avail.sessionDuration}
              onChange={e => setAvail(p => ({ ...p, sessionDuration: Number(e.target.value) }))}
              className={inp}>
              {[30, 45, 60, 90, 120].map(d => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Buffer Between Sessions</label>
            <select value={avail.bufferMinutes}
              onChange={e => setAvail(p => ({ ...p, bufferMinutes: Number(e.target.value) }))}
              className={inp}>
              {[0, 5, 10, 15, 30].map(b => (
                <option key={b} value={b}>{b === 0 ? 'No buffer' : `${b} min`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Accept bookings up to</label>
            <select value={avail.maxDaysAhead}
              onChange={e => setAvail(p => ({ ...p, maxDaysAhead: Number(e.target.value) }))}
              className={inp}>
              {[7, 14, 21, 30, 60, 90].map(d => (
                <option key={d} value={d}>{d} days ahead</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Weekly schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-1">Weekly Availability</h3>
        <p className="text-xs text-gray-400 mb-4">Toggle days and set your working hours for each day.</p>

        <div className="space-y-2">
          {DAYS_FULL.map((dayName, day) => {
            const slot     = avail.weeklySlots.find(s => s.day === day);
            const isActive = !!slot;

            return (
              <div key={day}
                className={`rounded-xl border transition-colors ${isActive ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center gap-3 px-3 py-2.5 flex-wrap">
                  {/* Toggle */}
                  <button type="button" onClick={() => toggleDay(day)}
                    className={`w-10 h-5 rounded-full relative shrink-0 transition-colors ${isActive ? 'bg-green-600' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? 'left-5' : 'left-0.5'}`} />
                  </button>

                  <span className={`text-sm font-semibold w-24 shrink-0 ${isActive ? 'text-green-900' : 'text-gray-400'}`}>
                    {dayName}
                  </span>

                  {isActive ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <select value={slot.startTime}
                        onChange={e => updateSlot(day, 'startTime', e.target.value)}
                        className="bg-white border border-green-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500">
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <span className="text-xs text-gray-400">to</span>
                      <select value={slot.endTime}
                        onChange={e => updateSlot(day, 'endTime', e.target.value)}
                        className="bg-white border border-green-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-500">
                        {TIME_OPTIONS.filter(t => t > slot.startTime).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Unavailable</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-800 transition disabled:opacity-60">
        {saving ? 'Saving…' : 'Save Availability'}
      </button>
    </div>
  );
}

// ── Google Calendar tab ──────────────────────────────────────────────────────

function GCalTab() {
  const [connected,   setConnected]   = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [connecting,  setConnecting]  = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    api.get('/gcalendar/status')
      .then(({ data }) => setConnected(data.connected))
      .catch(() => {})
      .finally(() => setLoading(false));

    const gcal = searchParams.get('gcal');
    if (gcal === 'connected') toast.success('Google Calendar connected!');
    if (gcal === 'error')     toast.error('Google Calendar connection failed. Check server config.');
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { data } = await api.get('/gcalendar/auth');
      window.location.href = data.url;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not start Google Calendar auth');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.delete('/gcalendar/disconnect');
      setConnected(false);
      toast.success('Google Calendar disconnected');
    } catch {
      toast.error('Disconnect failed');
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Calendar size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Google Calendar Sync</h3>
            <p className="text-xs text-gray-400">Auto-add sessions to your Google Calendar</p>
          </div>
        </div>

        {loading ? (
          <div className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        ) : connected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
              <CheckCircle size={15} /> Connected — confirmed sessions sync automatically
            </div>
            <button onClick={handleDisconnect}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition">
              Disconnect Google Calendar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="space-y-2">
              {[
                'Sessions automatically appear in your Google Calendar',
                'Students receive calendar invites via email',
                '24-hour and 30-minute popup reminders',
                'One-click join from Google Calendar',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                  <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button onClick={handleConnect} disabled={connecting}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:border-blue-400 hover:text-blue-700 transition disabled:opacity-60">
              <img src="https://www.google.com/favicon.ico" alt="G" className="w-4 h-4" />
              {connecting ? 'Redirecting to Google…' : 'Connect Google Calendar'}
            </button>
          </div>
        )}
      </div>

      {/* Setup note */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-2">
        <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-800">Admin Setup Required</p>
          <p className="text-xs text-amber-700 mt-1">
            Google Calendar requires <code className="bg-amber-100 px-1 rounded">GOOGLE_CLIENT_ID</code>, <code className="bg-amber-100 px-1 rounded">GOOGLE_CLIENT_SECRET</code>, and <code className="bg-amber-100 px-1 rounded">GOOGLE_REDIRECT_URI</code> in the server environment.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main SchedulePage ────────────────────────────────────────────────────────

const TABS = [
  { id: 'sessions',     label: 'Sessions',        icon: CalendarCheck },
  { id: 'availability', label: 'Availability',    icon: Clock         },
  { id: 'gcal',         label: 'Google Calendar', icon: Calendar      },
];

export default function SchedulePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab,      setActiveTab]      = useState('sessions');
  const [tutorProfile,   setTutorProfile]   = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    api.get('/tutors/my-profile')
      .then(({ data }) => setTutorProfile(data.profile || null))
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Tutor';

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-gray-950 text-white min-h-screen flex-col shrink-0 fixed left-0 top-0 bottom-0 z-30">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-sm leading-tight">Naija &amp; Overseas</p>
            <p className="text-gray-500 text-[10px] uppercase tracking-wider">Schedule</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === id ? 'bg-green-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}>
              <Icon size={17} />
              {label}
              {activeTab === id && <span className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full" />}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-800">
            <button onClick={() => navigate('/dashboard/tutor')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800 transition-all text-left">
              <ChevronLeft size={17} /> Tutor Dashboard
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="bg-gray-900 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-0.5">Logged in as</p>
            <p className="text-sm text-white font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Schedule — {firstName}</p>
          </div>

          {/* Mobile tab switcher */}
          <div className="flex lg:hidden gap-1 bg-gray-100 p-1 rounded-xl">
            {TABS.map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`p-2 rounded-lg transition ${activeTab === id ? 'bg-white text-green-700 shadow-sm' : 'text-gray-400'}`}>
                <Icon size={17} />
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 pb-10">
          {activeTab === 'sessions'     && <SessionsTab     tutorProfile={tutorProfile} />}
          {activeTab === 'availability' && <AvailabilityTab tutorProfile={tutorProfile} profileLoading={profileLoading} onProfileCreated={setTutorProfile} />}
          {activeTab === 'gcal'         && <GCalTab />}
        </main>
      </div>
    </div>
  );
}
