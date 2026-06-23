import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { initializePaystack } from '../../utils/paystack';
import {
  CalendarCheck, Clock, ChevronLeft, ChevronRight, CheckCircle,
  Globe, GraduationCap, Star, Zap, LogIn, Tag, BookOpen,
} from 'lucide-react';

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

// Steps: 1=date · 2=time · 3=quiz · 4=confirm+pay · 5=success
const STEPS = [
  { n: 1, label: 'Pick Date' },
  { n: 2, label: 'Pick Time' },
  { n: 3, label: 'Quick Quiz' },
  { n: 4, label: 'Confirm' },
];

export default function BookSession() {
  const { tutorId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const studentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [tutor,  setTutor]  = useState(null);
  const [avail,  setAvail]  = useState(null);
  const [step,   setStep]   = useState(1);

  // Calendar navigation
  const now = new Date();
  const [viewYear,  setViewYear]  = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);

  // Availability
  const [availDates,   setAvailDates]   = useState(new Set());
  const [datesLoading, setDatesLoading] = useState(false);

  // Selected date & slots
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots,        setSlots]        = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Quiz state
  const [selectedSubject, setSelectedSubject] = useState(''); // subject student picks before quiz starts
  const [apiQuestions,    setApiQuestions]    = useState([]);  // fetched from server, no correctIndex
  const [quizLoading,     setQuizLoading]     = useState(false);
  const [currentQIdx,     setCurrentQIdx]     = useState(0);
  const [answers,         setAnswers]         = useState({});  // { [questionId]: chosenIndex }
  const [quizAnswers,     setQuizAnswers]      = useState([]); // [{questionId, chosenIndex}] built on complete

  // Booking state
  const [notes,      setNotes]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasExistingTrial, setHasExistingTrial] = useState(false);
  const [trialCheckDone,   setTrialCheckDone]   = useState(false);

  useEffect(() => {
    api.get(`/tutors/${tutorId}`)
      .then(({ data }) => setTutor(data.tutor || data.profile))
      .catch(() => {});
    api.get(`/schedule/availability/${tutorId}`)
      .then(({ data }) => setAvail(data.availability))
      .catch(() => {});
  }, [tutorId]);

  // Check for existing discounted session
  useEffect(() => {
    if (!user) return;
    api.get('/bookings/my?service=tutoring-session')
      .then(({ data }) => {
        const already = (data.bookings || []).some(b =>
          (b.tutorId?._id?.toString() || b.tutorId?.toString()) === tutorId &&
          b.isTrial && b.status !== 'cancelled'
        );
        setHasExistingTrial(already);
      })
      .catch(() => {})
      .finally(() => setTrialCheckDone(true));
  }, [user, tutorId]);

  // When entering step 3: pre-fill subject from URL param if present
  useEffect(() => {
    if (step !== 3 || !tutor) return;
    const urlSubject = searchParams.get('subject');
    if (urlSubject && !selectedSubject) setSelectedSubject(urlSubject);
    else if (!selectedSubject && tutor.subjects?.length === 1) setSelectedSubject(tutor.subjects[0]);
  }, [step, tutor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch questions once a subject is selected (and we're on step 3)
  useEffect(() => {
    if (step !== 3 || !selectedSubject || !tutorId) return;
    setApiQuestions([]);
    setCurrentQIdx(0);
    setAnswers({});
    setQuizLoading(true);
    api.get(`/tutor-quiz/${tutorId}`, { params: { subject: selectedSubject } })
      .then(({ data }) => {
        const qs = data.questions || [];
        setApiQuestions(qs);
        if (qs.length === 0) setStep(4); // auto-skip if no questions for this subject
      })
      .catch(() => setStep(4))
      .finally(() => setQuizLoading(false));
  }, [step, selectedSubject, tutorId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const quizSubject = selectedSubject;

  // Pricing
  const discountPct      = tutor?.trialDiscountPercent ?? 50;
  const sessionMins      = avail?.sessionDuration || 60;
  const hourlyRate       = tutor?.hourlyRateNaira || 0;
  const discountedAmount = hourlyRate > 0
    ? Math.round(hourlyRate * (1 - discountPct / 100) * (sessionMins / 60))
    : 0;
  const fullSessionPrice = hourlyRate > 0
    ? Math.round(hourlyRate * (sessionMins / 60))
    : 0;

  const handlePayAndBook = () => {
    if (discountedAmount === 0) { doBook(null, 0); return; }
    initializePaystack({
      email: user.email,
      amount: discountedAmount,
      metadata: { tutorId, slotUTC: selectedSlot?.utc, name: user.name },
      onSuccess: (reference) => doBook(reference, discountedAmount),
      onClose: () => toast.error('Payment was not completed.'),
    });
  };

  const doBook = async (paymentRef, paidAmount) => {
    setSubmitting(true);
    try {
      await api.post('/schedule/book', {
        tutorId,
        slotUTC:    selectedSlot.utc,
        timezone:   studentTz,
        notes,
        recurrence: 'none',
        isTrial:    true,
        paymentRef,
        paidAmount,
        quizAnswers,
        quizSubject,
      });
      setStep(5);
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
            <p className="text-sm text-gray-500">You need a free account to book a session with <strong>{tutorName}</strong>.</p>
          </div>
          <div className="space-y-2">
            <Link to={`/login?redirect=/book/${tutorId}`}
              className="block w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition text-sm">
              Log In
            </Link>
            <Link to={`/register?redirect=/book/${tutorId}`}
              className="block w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm">
              Create a Free Account
            </Link>
          </div>
          <Link to={`/tutors/${tutorId}`} className="text-xs text-gray-400 hover:underline">← Back to tutor profile</Link>
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

  if (trialCheckDone && hasExistingTrial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center space-y-5">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
            <Zap size={24} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">Discounted Session Used</h2>
            <p className="text-sm text-gray-500">
              You've already booked a discounted session with <strong>{tutorName}</strong>. Subscribe to continue.
            </p>
          </div>
          <Link to={`/subscribe/${tutorId}`}
            className="block w-full bg-green-700 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition text-sm">
            Subscribe Now →
          </Link>
          <Link to={`/tutors/${tutorId}`} className="text-xs text-gray-400 hover:underline">← Back to tutor profile</Link>
        </div>
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
          <span className="text-sm font-bold text-gray-700">Education Naija &amp; Overseas</span>
        </div>

        {/* Discounted session banner */}
        <div className="bg-green-700 text-white rounded-2xl px-4 py-3 flex items-center gap-2">
          <Tag size={16} className="shrink-0" />
          <div>
            <p className="text-sm font-bold">Book a Discounted First Session</p>
            <p className="text-xs text-green-200">{discountPct}% off your first session — includes a quick subject quiz.</p>
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
            <div className="text-sm font-extrabold text-gray-900">{sessionMins} min</div>
            <div className="text-[11px] text-gray-400">per session</div>
            {hourlyRate > 0 && <div className="text-[11px] text-green-600 font-bold mt-0.5">{discountPct}% off</div>}
          </div>
        </div>

        {/* Step progress */}
        {step < 5 && (
          <div className="flex items-center gap-1.5 px-1 overflow-x-auto pb-1">
            {STEPS.map(({ n, label }) => (
              <div key={n} className="flex items-center gap-1.5 shrink-0">
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= n ? 'text-green-700' : 'text-gray-300'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                    step > n ? 'bg-green-600 text-white' : step === n ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step > n ? '✓' : n}
                  </div>
                  {label}
                </div>
                {n < 4 && <div className="w-4 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
        )}

        {/* ── Main card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

          {/* ── STEP 1: Date picker ──────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 className="font-bold text-gray-900 mb-4">Select a Date</h2>
              <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition">
                  <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <span className="font-bold text-gray-900 text-sm">{MONTHS[viewMonth - 1]} {viewYear}</span>
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
                    >{d}</button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded border border-green-200 bg-green-50" /> Available
                </div>
                <div className="flex items-center gap-1">
                  <Globe size={11} /> {studentTz}
                </div>
              </div>
              {datesLoading && <p className="text-xs text-center text-gray-400 mt-3 animate-pulse">Loading availability…</p>}
            </div>
          )}

          {/* ── STEP 2: Time slot picker ─────────────────────────────────── */}
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
              ) : slots.filter(s => !s.booked).length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Clock size={32} className="mx-auto mb-2 text-gray-200" />
                  <p className="font-medium text-gray-600">All slots are booked for this day</p>
                  <button onClick={() => setStep(1)} className="mt-2 text-xs text-green-700 font-semibold hover:underline">
                    Choose another date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map(slot =>
                    slot.booked ? (
                      <div key={slot.utc}
                        className="py-2.5 rounded-xl text-xs font-semibold border border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed text-center leading-tight px-1"
                      >
                        <div>{slot.studentTime || slot.tutorTime}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-0.5">Booked</div>
                      </div>
                    ) : (
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
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Subject Quiz ─────────────────────────────────────── */}
          {step === 3 && (
            <div>
              {/* Back — goes to subject picker (if multi-subject) or step 2 on first question */}
              <button
                onClick={() => {
                  if (!selectedSubject || (!apiQuestions.length && !quizLoading)) {
                    setStep(2);
                  } else if (currentQIdx === 0) {
                    if (tutor?.subjects?.length > 1) {
                      setSelectedSubject('');
                      setApiQuestions([]);
                    } else {
                      setStep(2);
                    }
                  } else {
                    setCurrentQIdx(i => i - 1);
                  }
                }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4 transition"
              >
                <ChevronLeft size={15} />
                {currentQIdx > 0 ? `Question ${currentQIdx}` : 'Back'}
              </button>

              {/* Quiz header */}
              <div className="flex items-start gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-blue-700" />
                </div>
                <div>
                  <h2 className="font-extrabold text-gray-900">Quick Subject Quiz</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Answer questions so your tutor knows where to focus. Your score is <strong>only visible to the tutor</strong>.
                  </p>
                </div>
              </div>

              {/* Subject picker — shown when tutor has multiple subjects and none selected yet */}
              {!selectedSubject && tutor?.subjects?.length > 1 ? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700">Which subject do you need help with?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {tutor.subjects.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSubject(s)}
                        className="px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800 transition text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 text-center">You'll be quizzed on your chosen subject.</p>
                </div>
              ) : quizLoading ? (
                <div className="text-center py-10">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Loading {selectedSubject} quiz questions…</p>
                </div>
              ) : apiQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen size={32} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">No quiz questions for {selectedSubject}</p>
                  <p className="text-xs text-gray-400 mt-1">This tutor hasn't set up questions for this subject yet.</p>
                  <button onClick={() => setStep(4)}
                    className="mt-4 text-sm text-green-700 font-semibold hover:underline">
                    Continue to booking →
                  </button>
                </div>
              ) : (
                <>
                  {/* Progress bar */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span>Question {currentQIdx + 1} of {apiQuestions.length}</span>
                    <span>{Object.keys(answers).length} answered</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQIdx + (answers[apiQuestions[currentQIdx]?._id] !== undefined ? 1 : 0)) / apiQuestions.length) * 100}%` }}
                    />
                  </div>

                  {/* Current question */}
                  {(() => {
                    const q = apiQuestions[currentQIdx];
                    return (
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
                          <span className="w-6 h-6 bg-blue-600 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center shrink-0">
                            {currentQIdx + 1}
                          </span>
                          {q.topic && (
                            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                              {q.topic}
                            </span>
                          )}
                          <span className="ml-auto text-[11px] text-gray-400">{q.subject}</span>
                        </div>
                        <div className="px-4 pt-3 pb-2">
                          <p className="text-sm font-semibold text-gray-900 leading-relaxed">{q.question}</p>
                        </div>
                        <div className="px-4 pb-4 space-y-2">
                          {q.options.map((opt, oi) => {
                            const chosen = answers[q._id] === oi;
                            return (
                              <button
                                key={oi}
                                type="button"
                                onClick={() => setAnswers(prev => ({ ...prev, [q._id]: oi }))}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-sm text-left transition ${
                                  chosen
                                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                                }`}
                              >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 transition ${
                                  chosen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {OPTION_LABELS[oi]}
                                </span>
                                <span className="leading-snug">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Navigation */}
                  <div className="flex gap-3 mt-5">
                    {currentQIdx > 0 && (
                      <button
                        type="button"
                        onClick={() => setCurrentQIdx(i => i - 1)}
                        className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition flex items-center justify-center gap-1"
                      >
                        <ChevronLeft size={15} /> Previous
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (currentQIdx < apiQuestions.length - 1) {
                          setCurrentQIdx(i => i + 1);
                        } else {
                          const qa = apiQuestions.map(q => ({
                            questionId:  q._id,
                            chosenIndex: answers[q._id],
                          }));
                          setQuizAnswers(qa);
                          setStep(4);
                        }
                      }}
                      disabled={answers[apiQuestions[currentQIdx]?._id] === undefined}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                        currentQIdx < apiQuestions.length - 1
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-green-700 text-white hover:bg-green-800'
                      }`}
                    >
                      {currentQIdx < apiQuestions.length - 1
                        ? <>Next <ChevronRight size={15} /></>
                        : 'Complete Quiz →'
                      }
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-400 mt-2">
                    Your answers are sent only to your tutor — you won't see a score.
                  </p>
                </>
              )}
            </div>
          )}

          {/* ── STEP 4: Confirm & Pay ────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <button type="button" onClick={() => setStep(apiQuestions.length > 0 ? 3 : 2)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition">
                <ChevronLeft size={15} /> Back
              </button>

              {/* Quiz submitted notice */}
              {quizAnswers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
                  <BookOpen size={14} className="text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700">
                    <strong>Quiz submitted!</strong> Your tutor will review your answers before the session to prepare for your specific needs.
                  </p>
                </div>
              )}

              {/* Session summary */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={14} className="text-green-700" />
                  <span className="text-xs font-semibold text-green-800">
                    {new Date(selectedDate + 'T12:00:00Z').toDateString()} &nbsp;·&nbsp; {selectedSlot?.studentTime || selectedSlot?.tutorTime}
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-0.5 ml-5">
                  {sessionMins}-min <strong>first session</strong> with {tutorName}
                </p>
              </div>

              {/* User card */}
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

              {/* Pricing */}
              {hourlyRate > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Regular price ({sessionMins} min)</span>
                    <span className="text-gray-400 line-through">₦{fullSessionPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-amber-700 font-semibold">
                      <Tag size={12} /> {discountPct}% first-session discount
                    </span>
                    <span className="text-amber-700 font-semibold">−₦{(fullSessionPrice - discountedAmount).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-amber-200 pt-1.5 flex items-center justify-between">
                    <span className="font-bold text-gray-900">You pay today</span>
                    <span className="font-extrabold text-green-700 text-lg">₦{discountedAmount.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-start gap-2">
                  <Zap size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700">
                    This is a <strong>discounted first session</strong>. Afterwards you'll be invited to subscribe for regular weekly classes.
                  </p>
                </div>
              )}

              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any extra notes for the tutor — topics, level, exam date, etc. (optional)"
                rows={3}
                className={`${inp} resize-none`}
              />

              <button
                type="button"
                onClick={handlePayAndBook}
                disabled={submitting}
                className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking…</>
                  : hourlyRate > 0
                    ? `Pay ₦${discountedAmount.toLocaleString()} & Confirm Session`
                    : 'Confirm Session'}
              </button>

              <p className="text-center text-xs text-gray-400">
                {discountPct}% off for your first session · Subscribe for regular classes afterwards
              </p>
            </div>
          )}

          {/* ── STEP 5: Success ──────────────────────────────────────────── */}
          {step === 5 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">Session Booked!</h2>
                <p className="text-sm text-gray-500">
                  A confirmation has been sent to <strong>{user.email}</strong>.
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{tutorName} will confirm your session shortly.</p>
              </div>

              {quizAnswers.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={15} className="text-blue-700" />
                    <span className="text-sm font-bold text-blue-800">Quiz results sent to tutor</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    {tutorName} will review your {quizSubject ? `${quizSubject} ` : ''}quiz answers before your session so they can tailor the lesson to your needs.
                  </p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={15} className="text-green-700" />
                  <span className="text-sm font-bold text-green-800">Want regular sessions?</span>
                </div>
                <p className="text-xs text-green-700 mb-3">
                  After your first session, subscribe for weekly classes with {tutorName} — pick your schedule and pay monthly.
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
