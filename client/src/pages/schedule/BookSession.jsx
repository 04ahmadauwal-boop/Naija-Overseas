import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  CalendarCheck, Clock, ChevronLeft, ChevronRight, CheckCircle,
  Globe, GraduationCap, Star, Zap, LogIn,
} from 'lucide-react';

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

export default function BookSession() {
  const { tutorId } = useParams();
  const navigate    = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const studentTz   = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [tutor,  setTutor]  = useState(null);
  const [avail,  setAvail]  = useState(null);
  const [step,   setStep]   = useState(1); // 1 date · 2 time · 3 confirm · 4 success

  // Calendar navigation
  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);

  // Availability data
  const [availDates,   setAvailDates]   = useState(new Set());
  const [datesLoading, setDatesLoading] = useState(false);

  // Selected date & slots
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots,        setSlots]        = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Only notes remain — everything else comes from the logged-in user
  const [notes,      setNotes]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/tutors/${tutorId}`)
      .then(({ data }) => setTutor(data.tutor || data.profile))
      .catch(() => {});
    api.get(`/schedule/availability/${tutorId}`)
      .then(({ data }) => setAvail(data.availability))
      .catch(() => {});
  }, [tutorId]);

  const loadDates = useCallback(async (y, m) => {
    setDatesLoading(true);
    try {
      const month = `${y}-${String(m).padStart(2, '0')}`;
      const { data } = await api.get(`/schedule/available-dates/${tutorId}`, { params: { month } });
      setAvailDates(new Set(data.availableDates || []));
    } catch {
      setAvailDates(new Set());
    } finally {
      setDatesLoading(false);
    }
  }, [tutorId]);

  useEffect(() => { loadDates(viewYear, viewMonth); }, [viewYear, viewMonth, loadDates]);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    api.get(`/schedule/slots/${tutorId}`, { params: { date: selectedDate, timezone: studentTz } })
      .then(({ data }) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, tutorId, studentTz]);

  const prevMonth = () => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDateSelect = (dateStr) => {
    if (!availDates.has(dateStr)) return;
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/schedule/book', {
        tutorId,
        slotUTC:    selectedSlot.utc,
        timezone:   studentTz,
        notes,
        recurrence: 'none',
        isTrial:    true,
      });
      setStep(4);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const firstDay    = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const todayStr    = now.toISOString().split('T')[0];
  const tutorName   = tutor?.displayName || tutor?.name || 'Tutor';

  // ── Auth gate ────────────────────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center space-y-5">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
            <LogIn size={24} className="text-green-700" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">Sign in to book</h2>
            <p className="text-sm text-gray-500">
              You need a free account to book a session with{' '}
              <strong>{tutorName}</strong>.
            </p>
          </div>
          <div className="space-y-2">
            <Link
              to={`/login?redirect=/book/${tutorId}`}
              className="block w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition text-sm"
            >
              Log In
            </Link>
            <Link
              to={`/register?redirect=/book/${tutorId}`}
              className="block w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm"
            >
              Create a Free Account
            </Link>
          </div>
          <Link to={`/tutors/${tutorId}`} className="text-xs text-gray-400 hover:underline">
            ← Back to tutor profile
          </Link>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-xl mx-auto space-y-4">

        {/* Brand strip */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 bg-green-700 rounded-lg flex items-center justify-center">
            <GraduationCap size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-700">Naija &amp; Overseas</span>
        </div>

        {/* Trial banner */}
        <div className="bg-green-700 text-white rounded-2xl px-4 py-3 flex items-center gap-2">
          <Zap size={16} className="shrink-0" />
          <div>
            <p className="text-sm font-bold">Book a Free Trial Session</p>
            <p className="text-xs text-green-200">Try before you subscribe — one session, no commitment.</p>
          </div>
        </div>

        {/* Tutor card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-extrabold text-xl shrink-0 overflow-hidden">
            {tutor?.profilePhoto
              ? <img src={tutor.profilePhoto} alt="" className="w-full h-full object-cover" />
              : tutorName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-extrabold text-gray-900">{tutorName}</h1>
            {tutor?.headline && <p className="text-xs text-gray-500 mt-0.5 truncate">{tutor.headline}</p>}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {tutor?.subjects?.slice(0, 3).map(s => (
                <span key={s} className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">{s}</span>
              ))}
              {tutor?.rating > 0 && (
                <span className="text-[11px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                  <Star size={10} fill="currentColor" /> {tutor.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-extrabold text-gray-900">{avail?.sessionDuration || 60} min</div>
            <div className="text-[11px] text-gray-400">per session</div>
          </div>
        </div>

        {/* Step progress */}
        {step < 4 && (
          <div className="flex items-center gap-2 px-1">
            {[
              { n: 1, label: 'Pick Date' },
              { n: 2, label: 'Pick Time' },
              { n: 3, label: 'Confirm' },
            ].map(({ n, label }) => (
              <div key={n} className="flex items-center gap-2 shrink-0">
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= n ? 'text-green-700' : 'text-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                    step > n  ? 'bg-green-600 text-white'
                    : step === n ? 'bg-green-700 text-white'
                    : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step > n ? '✓' : n}
                  </div>
                  {label}
                </div>
                {n < 3 && <div className="w-6 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

          {/* ── Step 1: Date picker ─────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">Select a Date</h2>

              <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition">
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <span className="font-bold text-gray-900 text-sm">
                  {MONTHS[viewMonth - 1]} {viewYear}
                </span>
                <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition">
                  <ChevronRight size={18} className="text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d       = i + 1;
                  const dateStr = `${viewYear}-${String(viewMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                  const isAvail = availDates.has(dateStr);
                  const isPast  = dateStr <= todayStr;
                  const isSel   = dateStr === selectedDate;

                  return (
                    <button key={d} onClick={() => handleDateSelect(dateStr)}
                      disabled={!isAvail || isPast || datesLoading}
                      className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition ${
                        isSel                ? 'bg-green-700 text-white ring-2 ring-green-300'
                        : isAvail && !isPast ? 'bg-green-50 text-green-800 hover:bg-green-100 font-semibold border border-green-200'
                        : 'text-gray-300 cursor-default'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border border-green-200 bg-green-50" />
                  Available
                </div>
                <div className="flex items-center gap-1">
                  <Globe size={11} /> {studentTz}
                </div>
              </div>

              {datesLoading && (
                <p className="text-xs text-center text-gray-400 mt-3 animate-pulse">Loading availability…</p>
              )}
            </div>
          )}

          {/* ── Step 2: Time slot picker ─────────────────────────────────── */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition">
                <ChevronLeft size={15} /> Back
              </button>

              <h2 className="font-bold text-gray-900 mb-0.5">
                {new Date(selectedDate + 'T12:00:00Z').toDateString()}
              </h2>
              <p className="text-xs text-gray-400 mb-4">Times shown in <strong>{studentTz}</strong></p>

              {slotsLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Clock size={32} className="mx-auto mb-2 text-gray-200" />
                  <p className="font-medium text-gray-600">No slots available</p>
                  <button onClick={() => setStep(1)} className="mt-2 text-xs text-green-700 font-semibold hover:underline">
                    Choose another date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map(slot => (
                    <button key={slot.utc}
                      onClick={() => { setSelectedSlot(slot); setStep(3); }}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition ${
                        selectedSlot?.utc === slot.utc
                          ? 'bg-green-700 text-white border-green-700'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      {slot.studentTime || slot.tutorTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Confirm ──────────────────────────────────────────── */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button type="button" onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition">
                <ChevronLeft size={15} /> Back
              </button>

              {/* Session summary */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={14} className="text-green-700" />
                  <span className="text-xs font-semibold text-green-800">
                    {new Date(selectedDate + 'T12:00:00Z').toDateString()} &nbsp;·&nbsp; {selectedSlot?.studentTime || selectedSlot?.tutorTime}
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-0.5 ml-5">
                  {avail?.sessionDuration || 60}-min <strong>trial session</strong> with {tutorName}
                </p>
              </div>

              {/* Logged-in user card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <span className="text-[11px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">You</span>
              </div>

              {/* Trial note */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-start gap-2">
                <Zap size={13} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  This is a <strong>one-time trial session</strong>. Afterwards you'll be invited to subscribe for regular weekly classes.
                </p>
              </div>

              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Topics to cover, your current level, or any questions for the tutor (optional)"
                rows={3}
                className={`${inp} resize-none`}
              />

              <button type="submit" disabled={submitting}
                className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-800 transition disabled:opacity-60"
              >
                {submitting ? 'Booking…' : 'Confirm Trial Session'}
              </button>
            </form>
          )}

          {/* ── Step 4: Success ──────────────────────────────────────────── */}
          {step === 4 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">Trial Session Booked!</h2>
                <p className="text-sm text-gray-500">
                  A confirmation has been sent to <strong>{user.email}</strong>.
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {tutorName} will confirm your session shortly.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={15} className="text-green-700" />
                  <span className="text-sm font-bold text-green-800">Want regular sessions?</span>
                </div>
                <p className="text-xs text-green-700 mb-3">
                  After your trial, subscribe for weekly classes with {tutorName} — pick your schedule and pay monthly.
                </p>
                <a href={`/subscribe/${tutorId}`}
                  className="inline-flex items-center gap-1.5 bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-800 transition">
                  Subscribe Now →
                </a>
              </div>

              <a href="/" className="inline-block text-xs text-gray-400 hover:text-gray-600 hover:underline transition">
                Back to Home
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
