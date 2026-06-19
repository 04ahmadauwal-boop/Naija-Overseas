import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, MapPin, CheckCircle, Clock, Users, ArrowLeft,
  BookOpen, GraduationCap, Award, Video, MessageSquare,
  Shield, User, Search, Zap, TrendingUp, Monitor, Globe,
  CalendarDays, ChevronLeft, ChevronRight, Info,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getWeekDates(offset = 0) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + offset * 7 + i);
    return d;
  });
}

function fmt(date) {
  return date.toISOString().split('T')[0];
}

function AvailabilitySection({ tutorId, trialDurationMins, bookUrl }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);

  const weekDates = getWeekDates(weekOffset);
  const startLabel = `${String(weekDates[0].getDate()).padStart(2,'0')}/${String(weekDates[0].getMonth()+1).padStart(2,'0')}/${String(weekDates[0].getFullYear()).slice(-2)}`;
  const endLabel   = `${String(weekDates[6].getDate()).padStart(2,'0')}/${String(weekDates[6].getMonth()+1).padStart(2,'0')}/${String(weekDates[6].getFullYear()).slice(-2)}`;

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(
      weekDates.map(d =>
        api.get(`/schedule/slots/${tutorId}?date=${fmt(d)}`)
          .then(({ data }) => ({ date: fmt(d), slots: data.slots || [] }))
          .catch(() => ({ date: fmt(d), slots: [] }))
      )
    );
    const map = {};
    results.forEach(({ date, slots: s }) => { map[date] = s; });
    setSlots(map);
    setLoading(false);
  }, [tutorId, weekOffset]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const formatTime = (utc) => {
    const d = new Date(utc);
    let h = d.getHours(), m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  };

  const daySlots = (date) => slots[fmt(date)] || [];
  const hasAny = weekDates.some(d => daySlots(d).length > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <h2 className="font-bold text-gray-900 text-base sm:text-lg mb-4 flex items-center gap-2">
        <CalendarDays size={16} className="text-green-600 shrink-0" /> Availability
      </h2>

      {/* Info banner */}
      {trialDurationMins && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4 text-xs text-blue-700 font-medium">
          <Info size={14} className="shrink-0 text-blue-500" />
          Choose a date and time for your {trialDurationMins}-minute trial session
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => { setWeekOffset(w => Math.max(0, w - 1)); setSelectedDay(0); }}
          disabled={weekOffset === 0}
          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-bold text-gray-700">{startLabel} – {endLabel}</span>
        <button
          onClick={() => { setWeekOffset(w => w + 1); setSelectedDay(0); }}
          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day header row */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDates.map((d, i) => {
          const hasSlots = daySlots(d).length > 0;
          const isSelected = selectedDay === i;
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 transition text-center ${
                isSelected
                  ? 'bg-blue-700 border-blue-700 text-white'
                  : hasSlots
                  ? 'border-green-300 bg-white hover:bg-green-50 text-gray-700'
                  : 'border-gray-100 bg-gray-50 text-gray-400'
              }`}
            >
              {hasSlots && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mb-1" />
              )}
              <span className="text-[9px] font-bold uppercase tracking-wide leading-none">
                {DAY_ABBR[d.getDay()]}
              </span>
              <span className="text-base font-extrabold leading-tight mt-0.5">{d.getDate()}</span>
              <span className="text-[9px] leading-none mt-0.5">{MONTH_ABBR[d.getMonth()]}</span>
            </button>
          );
        })}
      </div>

      {/* Slots for selected day (mobile) / all days grid (desktop) */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      ) : !hasAny ? (
        <div className="text-center py-6 text-gray-400 text-sm">
          No availability this week. Try the next week →
        </div>
      ) : (
        <>
          {/* Mobile: selected day slots */}
          <div className="sm:hidden">
            {daySlots(weekDates[selectedDay]).length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-400">No slots available</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {daySlots(weekDates[selectedDay]).slice(0, 6).map((slot, i) => (
                  <Link key={i} to={bookUrl}
                    className="text-center text-sm font-semibold text-gray-800 border border-gray-200 rounded-xl py-2.5 hover:border-green-500 hover:bg-green-50 hover:text-green-800 transition">
                    {formatTime(slot.utc)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: all 7 days grid */}
          <div className="hidden sm:grid grid-cols-7 gap-1">
            {weekDates.map((d, i) => {
              const ds = daySlots(d);
              return (
                <div key={i} className="flex flex-col gap-1">
                  {ds.length === 0 ? (
                    <div className="text-center text-[10px] text-gray-400 bg-gray-50 rounded-lg py-2.5 font-medium">
                      Fully booked
                    </div>
                  ) : (
                    ds.slice(0, 3).map((slot, j) => (
                      <Link key={j} to={bookUrl}
                        className="text-center text-[11px] font-semibold text-gray-700 border border-gray-200 rounded-lg py-2 hover:border-green-500 hover:bg-green-50 hover:text-green-800 transition">
                        {formatTime(slot.utc)}
                      </Link>
                    ))
                  )}
                  {ds.length > 3 && (
                    <Link to={bookUrl} className="text-center text-[10px] text-green-600 font-semibold py-1 hover:underline">
                      +{ds.length - 3} more
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View full schedule */}
      <div className="mt-4 pt-4 border-t border-gray-50 text-center">
        <Link to={bookUrl}
          className="inline-block border border-gray-300 text-gray-700 font-semibold text-sm px-8 py-2.5 rounded-xl hover:border-green-600 hover:text-green-700 transition">
          View full schedule
        </Link>
      </div>
    </div>
  );
}

const HOW_IT_WORKS_VIDEO_ID = 'hT_nvWreIhg';

function Stars({ rating, size = 14, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={size}
          onClick={() => interactive && onChange?.(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`${interactive ? 'cursor-pointer' : ''} transition-colors ${
            n <= (hover || Math.round(rating))
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function TutorDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [tutor, setTutor]               = useState(null);
  const [reviews, setReviews]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm]     = useState({ rating: 5, comment: '', subject: '' });
  const [submitting, setSubmitting]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/tutors/${id}`);
        setTutor(data.tutor);
        setReviews(data.reviews || []);
        if (data.tutor.subjects?.length) {
          setReviewForm(f => ({ ...f, subject: data.tutor.subjects[0] }));
        }
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please log in to leave a review'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post(`/tutors/${id}/review`, reviewForm);
      setReviews(prev => [data.review, ...prev]);
      const all = [...reviews, data.review].map(r => r.rating);
      const avg = all.reduce((s, r) => s + r, 0) / all.length;
      setTutor(t => ({ ...t, rating: Math.round(avg * 10) / 10, reviewCount: all.length }));
      setShowReviewForm(false);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  /* ── Loading / 404 ────────────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading tutor profile…</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <GraduationCap size={40} className="text-gray-300 mx-auto mb-4" />
        <h2 className="font-bold text-gray-700 text-xl mb-2">Tutor not found</h2>
        <p className="text-gray-400 text-sm mb-6">This profile may have been removed or doesn't exist.</p>
        <Link to="/find-tutoring" className="bg-green-700 text-white font-bold px-6 py-3 rounded-xl hover:bg-green-800 transition text-sm">
          ← Back to Tutors
        </Link>
      </div>
    </div>
  );

  /* ── Derived values ───────────────────────────────────────────── */
  const name      = tutor.displayName || tutor.user?.name || 'Tutor';
  const initials  = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const since     = tutor.user?.createdAt
    ? new Date(tutor.user.createdAt).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })
    : null;
  const trialPrice = tutor.hourlyRateNaira > 0
    ? Math.round(tutor.hourlyRateNaira * (1 - (tutor.trialDiscountPercent ?? 50) / 100) * ((tutor.trialDurationMins || 60) / 60))
    : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-0">

      {/* ── STICKY MOBILE BOOKING BAR ─────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 shadow-2xl">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {tutor.hourlyRateNaira > 0 ? (
              <p className="font-extrabold text-gray-900 text-base leading-none">
                ₦{tutor.hourlyRateNaira.toLocaleString()}<span className="text-xs font-normal text-gray-400 ml-1">/hr</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500 font-semibold">Rate on request</p>
            )}
            {tutor.trialAvailable && (
              <p className="text-[11px] text-green-600 font-bold mt-0.5">
                {tutor.trialDiscountPercent ?? 50}% off first session
              </p>
            )}
          </div>
          <Link to={`/book/${id}`}
            className="shrink-0 bg-green-700 hover:bg-green-800 active:scale-95 text-white font-extrabold text-sm px-5 py-3 rounded-xl transition shadow-lg">
            Book Session →
          </Link>
        </div>
      </div>

      {/* ── BREADCRUMB ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm overflow-hidden">
          <Link to="/find-tutoring"
            className="flex items-center gap-1.5 text-gray-500 hover:text-green-700 transition font-medium shrink-0">
            <ArrowLeft size={14} /> Tutors
          </Link>
          <span className="text-gray-300 shrink-0">/</span>
          <span className="text-gray-700 font-semibold truncate">{name}</span>
        </div>
      </div>

      {/* ── PAGE BODY ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-5 sm:py-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">

        {/* ════════════════════════════════════════════════════════════
            LEFT COLUMN
        ════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-4">

          {/* ── PROFILE HERO CARD ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Banner */}
            <div className="bg-linear-to-r from-green-800 to-emerald-700 h-20 sm:h-28 relative" />

            {/* Avatar — overlapping banner */}
            <div className="px-4 sm:px-6">
              <div className="-mt-10 sm:-mt-14 mb-3 sm:mb-4 flex items-end justify-between gap-3">
                <div className="relative shrink-0">
                  {tutor.profilePhoto ? (
                    <img src={tutor.profilePhoto} alt={name}
                      className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-lg" />
                  ) : (
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-green-700 flex items-center justify-center text-white text-2xl sm:text-4xl font-extrabold border-4 border-white shadow-lg">
                      {initials}
                    </div>
                  )}
                  {tutor.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                      <CheckCircle size={12} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Desktop rate — top-right of avatar row */}
                {tutor.hourlyRateNaira > 0 && (
                  <div className="hidden sm:block text-right pb-1">
                    <p className="text-2xl font-extrabold text-gray-900 leading-none">
                      ₦{tutor.hourlyRateNaira.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">per hour</p>
                    {tutor.trialAvailable && (
                      <p className="text-xs text-green-600 font-bold mt-1">
                        {tutor.trialDiscountPercent ?? 50}% off first session
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Name + verified */}
              <div className="mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{name}</h1>
                  {tutor.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                      <Shield size={9} /> Verified
                    </span>
                  )}
                </div>
                {tutor.headline && (
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{tutor.headline}</p>
                )}
              </div>

              {/* Stars + stats */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 text-sm">
                {tutor.reviewCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Stars rating={tutor.rating} size={13} />
                    <span className="font-bold text-gray-800 text-xs">{tutor.rating.toFixed(1)}</span>
                    <span className="text-gray-400 text-xs">({tutor.reviewCount} review{tutor.reviewCount !== 1 ? 's' : ''})</span>
                  </div>
                )}
                {tutor.yearsExperience > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={11} className="text-gray-400" />
                    {tutor.yearsExperience} yr{tutor.yearsExperience !== 1 ? 's' : ''} exp
                  </span>
                )}
                {tutor.totalSessions > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Users size={11} className="text-gray-400" />
                    {tutor.totalSessions} sessions
                  </span>
                )}
                {since && (
                  <span className="text-xs text-gray-400">Joined {since}</span>
                )}
              </div>

              {/* Mode + location badges */}
              <div className="flex flex-wrap gap-1.5 pb-5 sm:pb-6">
                {tutor.teachingMode?.includes('online') && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 font-semibold px-2.5 py-1 rounded-full">
                    <Video size={10} /> Online
                  </span>
                )}
                {tutor.teachingMode?.includes('in-person') && (
                  <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-100 font-semibold px-2.5 py-1 rounded-full">
                    <MapPin size={10} /> In-Person
                  </span>
                )}
                {(tutor.city || tutor.state) && (
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">
                    <MapPin size={10} />
                    {[tutor.city, tutor.state].filter(Boolean).join(', ')}
                  </span>
                )}
                {tutor.country && (
                  <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-full">
                    <Globe size={10} /> {tutor.country}
                  </span>
                )}
                {tutor.trialAvailable && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 font-bold px-2.5 py-1 rounded-full">
                    🏷 {tutor.trialDiscountPercent ?? 50}% off first session
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Book CTA inside card (above the fold) */}
            <div className="sm:hidden border-t border-gray-50 px-4 py-4 bg-gray-50/50">
              <Link to={`/book/${id}`}
                className="flex items-center justify-center gap-2 w-full bg-green-700 text-white font-extrabold py-3.5 rounded-xl hover:bg-green-800 transition text-sm shadow-sm">
                Book Discounted Session →
              </Link>
              {tutor.trialAvailable && trialPrice && (
                <p className="text-center text-xs text-green-600 font-semibold mt-2">
                  First {tutor.trialDurationMins || 30} min · ₦{trialPrice.toLocaleString()} ({tutor.trialDiscountPercent ?? 50}% off)
                </p>
              )}
            </div>
          </div>

          {/* ── KEY FACTS STRIP ───────────────────────────────────── */}
          {(tutor.responseTime || tutor.languages?.length || tutor.teachingMode?.length) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {tutor.responseTime && (
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <MessageSquare size={14} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Response</p>
                    <p className="text-xs font-bold text-gray-900 truncate">{tutor.responseTime}</p>
                  </div>
                </div>
              )}
              {tutor.languages?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                    <BookOpen size={14} className="text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teaches in</p>
                    <p className="text-xs font-bold text-gray-900 truncate">{tutor.languages.join(', ')}</p>
                  </div>
                </div>
              )}
              {tutor.teachingMode?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <Monitor size={14} className="text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mode</p>
                    <p className="text-xs font-bold text-gray-900 capitalize truncate">{tutor.teachingMode.join(' & ')}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ABOUT ─────────────────────────────────────────────── */}
          {tutor.bio && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="font-bold text-gray-900 text-base sm:text-lg mb-3 flex items-center gap-2">
                <User size={16} className="text-green-600 shrink-0" />
                About {name.split(' ')[0]}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{tutor.bio}</p>
            </div>
          )}

          {/* ── SUBJECTS & LEVELS ─────────────────────────────────── */}
          {(tutor.subjects?.length || tutor.levels?.length || tutor.specializations?.length) > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
              <h2 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <BookOpen size={16} className="text-green-600 shrink-0" /> Subjects &amp; Levels
              </h2>
              {tutor.subjects?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Subjects Taught</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map(s => (
                      <span key={s} className="text-xs sm:text-sm bg-green-50 text-green-800 border border-green-100 font-semibold px-3 py-1.5 rounded-xl">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {tutor.levels?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Teaching Levels</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.levels.map(l => (
                      <span key={l} className="text-xs sm:text-sm bg-blue-50 text-blue-800 border border-blue-100 font-medium px-3 py-1.5 rounded-xl capitalize">{l}</span>
                    ))}
                  </div>
                </div>
              )}
              {tutor.specializations?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.specializations.map(s => (
                      <span key={s} className="text-xs sm:text-sm bg-yellow-50 text-yellow-800 border border-yellow-100 font-medium px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <Award size={11} /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── QUALIFICATIONS ────────────────────────────────────── */}
          {tutor.qualifications?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="font-bold text-gray-900 text-base sm:text-lg mb-4 flex items-center gap-2">
                <GraduationCap size={16} className="text-green-600 shrink-0" /> Qualifications
              </h2>
              <div className="space-y-3">
                {tutor.qualifications.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <Award size={14} className="text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-snug">{q.title}</p>
                      {q.institution && (
                        <p className="text-xs text-gray-400 mt-0.5">{q.institution}{q.year ? ` · ${q.year}` : ''}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SESSION RATES ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <h2 className="font-bold text-gray-900 text-base sm:text-lg mb-4 flex items-center gap-2">
              <Award size={16} className="text-green-600 shrink-0" /> Session Rates
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {tutor.trialAvailable && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-green-700">
                    {trialPrice ? `₦${trialPrice.toLocaleString()}` : `${tutor.trialDiscountPercent ?? 50}% off`}
                  </p>
                  <p className="text-xs font-bold text-green-600 mt-1">First Session</p>
                  <p className="text-[10px] text-green-500 mt-0.5">{tutor.trialDurationMins || 30} min · {tutor.trialDiscountPercent ?? 50}% off</p>
                </div>
              )}
              {tutor.hourlyRateNaira > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-gray-900">₦{tutor.hourlyRateNaira.toLocaleString()}</p>
                  <p className="text-xs font-bold text-gray-500 mt-1">1-on-1 Session</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">per hour</p>
                </div>
              )}
              {tutor.groupRateNaira > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-extrabold text-blue-700">₦{tutor.groupRateNaira.toLocaleString()}</p>
                  <p className="text-xs font-bold text-blue-600 mt-1">Group Session</p>
                  <p className="text-[10px] text-blue-400 mt-0.5">per person / hour</p>
                </div>
              )}
            </div>
          </div>

          {/* ── AVAILABILITY CALENDAR ─────────────────────────────── */}
          <AvailabilitySection
            tutorId={id}
            trialDurationMins={tutor.trialDurationMins}
            bookUrl={`/book/${id}`}
          />

          {/* ── REVIEWS ───────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              <h2 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
                <Star size={16} className="text-yellow-400 fill-yellow-400 shrink-0" />
                Reviews
                {tutor.reviewCount > 0 && (
                  <span className="text-sm font-normal text-gray-400">({tutor.reviewCount})</span>
                )}
              </h2>
              {user && !showReviewForm && (
                <button onClick={() => setShowReviewForm(true)}
                  className="text-xs sm:text-sm font-semibold text-green-700 border border-green-200 px-3 py-1.5 rounded-xl hover:bg-green-50 transition whitespace-nowrap">
                  + Write a Review
                </button>
              )}
            </div>

            {/* Review form */}
            {showReviewForm && (
              <form onSubmit={handleReview} className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm">Your Review</h3>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Rating</label>
                  <Stars rating={reviewForm.rating} size={24} interactive
                    onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                </div>
                {tutor.subjects?.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Subject</label>
                    <select value={reviewForm.subject}
                      onChange={e => setReviewForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 bg-white">
                      {tutor.subjects.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Comment (optional)</label>
                  <textarea value={reviewForm.comment}
                    onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    rows={3} placeholder="Share your experience…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={submitting}
                    className="bg-green-700 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-800 transition text-sm disabled:opacity-50">
                    {submitting ? 'Submitting…' : 'Submit'}
                  </button>
                  <button type="button" onClick={() => setShowReviewForm(false)}
                    className="border border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Star size={28} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviews.map(r => {
                  const sName = r.student?.name || 'Student';
                  const si = sName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div key={r._id} className="pb-5 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {si}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                              <span className="font-semibold text-gray-900 text-xs sm:text-sm">{sName}</span>
                              {r.subject && (
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">{r.subject}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400 shrink-0">
                              {new Date(r.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <Stars rating={r.rating} size={11} />
                          {r.comment && (
                            <p className="text-gray-600 text-xs sm:text-sm mt-1.5 leading-relaxed">{r.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            RIGHT SIDEBAR — desktop only
        ════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col gap-4 lg:sticky lg:top-6">

          {/* Book CTA card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="bg-linear-to-br from-green-800 to-green-700 p-5 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {tutor.profilePhoto
                    ? <img src={tutor.profilePhoto} alt={name} className="w-full h-full object-cover" />
                    : <span className="font-black text-base">{initials}</span>}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm truncate leading-tight">{name}</p>
                  {tutor.trialAvailable && (
                    <p className="text-green-200 text-xs mt-0.5">{tutor.trialDiscountPercent ?? 50}% off first session</p>
                  )}
                </div>
              </div>

              {tutor.hourlyRateNaira > 0 && (
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black">₦{tutor.hourlyRateNaira.toLocaleString()}</span>
                  <span className="text-green-300 text-sm">/ hr</span>
                </div>
              )}

              <Link to={`/book/${id}`}
                className="block w-full text-center bg-yellow-400 text-green-900 font-extrabold py-3.5 rounded-xl hover:bg-yellow-300 transition text-sm shadow-lg">
                Book Discounted Session →
              </Link>
              {tutor.trialAvailable && (
                <p className="text-center text-green-300 text-xs mt-2">
                  {tutor.trialDiscountPercent ?? 50}% off · {tutor.trialDurationMins || 30} min first session
                </p>
              )}
            </div>

            {/* Quick facts */}
            <div className="divide-y divide-gray-50">
              {[
                tutor.responseTime  && { icon: MessageSquare, text: `Responds ${tutor.responseTime}` },
                tutor.languages?.length && { icon: BookOpen,      text: `Teaches in ${tutor.languages.join(', ')}` },
                tutor.teachingMode?.length && { icon: Monitor,    text: `${tutor.teachingMode.join(' & ')} lessons` },
                (tutor.city || tutor.state) && { icon: MapPin,    text: [tutor.city, tutor.state].filter(Boolean).join(', ') },
              ].filter(Boolean).map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 px-5 py-3 text-xs text-gray-600">
                  <Icon size={13} className="text-gray-400 shrink-0" />
                  <span className="truncate">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How it works + video */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${HOW_IT_WORKS_VIDEO_ID}?rel=0&modestbranding=1&color=white`}
                title="How tutoring works"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">How it works</p>
              <div className="space-y-3.5">
                {[
                  { icon: Search,     bg: 'bg-green-100  text-green-700',  title: 'Browse & choose',       desc: 'Read the profile, check reviews.' },
                  { icon: Video,      bg: 'bg-blue-100   text-blue-700',   title: 'Book first session',     desc: 'Pick date & time, pay discounted rate.' },
                  { icon: Zap,        bg: 'bg-yellow-100 text-yellow-700', title: 'Subscribe & learn',      desc: 'Subscribe weekly. Pay monthly in Naira.' },
                  { icon: TrendingUp, bg: 'bg-purple-100 text-purple-700', title: 'Track progress',         desc: 'Auto-booked sessions & reminders.' },
                ].map(({ icon: Icon, bg, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <p className="text-xs font-bold text-gray-900 leading-tight">{title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50">
                <Link to={`/book/${id}`}
                  className="block w-full text-center bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition text-sm">
                  Get Started →
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
