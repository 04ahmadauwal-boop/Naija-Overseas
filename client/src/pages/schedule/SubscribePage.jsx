import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { GraduationCap, Star, Zap, CheckCircle, ChevronLeft, Globe } from 'lucide-react';

const DAYS_LABEL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const inp = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';

// Build time options from tutor availability weeklySlots for a given day index
function timesForDay(weeklySlots, dayIndex, sessionDuration) {
  const entry = weeklySlots?.find(s => s.day === dayIndex);
  if (!entry) return [];
  const times = [];
  const [sh, sm] = entry.startTime.split(':').map(Number);
  const [eh, em] = entry.endTime.split(':').map(Number);
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  const dur = sessionDuration || 60;
  while (cur + dur <= end) {
    const hh = String(Math.floor(cur / 60)).padStart(2, '0');
    const mm = String(cur % 60).padStart(2, '0');
    times.push(`${hh}:${mm}`);
    cur += dur;
  }
  return times;
}

export default function SubscribePage() {
  const { tutorId } = useParams();
  const navigate = useNavigate();

  const [tutor,  setTutor]  = useState(null);
  const [avail,  setAvail]  = useState(null);
  const [step,   setStep]   = useState(1); // 1 frequency · 2 slots · 3 payment · 4 success

  // Step 1
  const [timesPerWeek, setTimesPerWeek] = useState(1);

  // Step 2 — one slot picker per session-per-week
  // slots: [{ day: Number, time: String }]
  const [slots, setSlots] = useState([{ day: 1, time: '' }]);

  // Step 3
  const [paying, setPaying] = useState(false);
  const [bookings, setBookings] = useState([]);

  const studentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    api.get(`/tutors/${tutorId}`)
      .then(({ data }) => setTutor(data.tutor || data.profile))
      .catch(() => {});
    api.get(`/schedule/availability/${tutorId}`)
      .then(({ data }) => setAvail(data.availability))
      .catch(() => {});
  }, [tutorId]);

  // Sync slots array length to timesPerWeek
  useEffect(() => {
    setSlots(prev => {
      const next = [...prev];
      while (next.length < timesPerWeek) next.push({ day: 1, time: '' });
      return next.slice(0, timesPerWeek);
    });
  }, [timesPerWeek]);

  const tutorName    = tutor?.displayName || tutor?.name || 'Tutor';
  const sessionDur   = avail?.sessionDuration || 60;
  const monthlyRate  = tutor?.hourlyRateNaira
    ? Math.round(tutor.hourlyRateNaira * (sessionDur / 60) * timesPerWeek * 4)
    : 0;

  // Available days (days that have a weeklySlot entry)
  const availableDays = (avail?.weeklySlots || []).map(s => s.day);

  function updateSlot(i, field, value) {
    setSlots(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: field === 'day' ? Number(value) : value };
      if (field === 'day') next[i].time = ''; // reset time when day changes
      return next;
    });
  }

  function slotsValid() {
    return slots.every(s => s.time !== '');
  }

  function initPaystack() {
    if (!slotsValid()) { toast.error('Please pick a time for every slot'); return; }
    if (!monthlyRate) { toast.error('Tutor rate not set'); return; }
    setPaying(true);

    api.post('/subscriptions/init-payment', {
      tutorId,
      timesPerWeek,
      preferredSlots: slots,
      monthlyRate,
    })
      .then(({ data }) => {
        const handler = window.PaystackPop?.setup({
          key:       import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email:     '', // filled server-side via metadata
          amount:    monthlyRate * 100,
          ref:       data.reference,
          currency:  'NGN',
          onSuccess: (tx) => activateSubscription(tx.reference),
          onCancel:  () => { setPaying(false); toast.error('Payment cancelled'); },
        });
        if (handler) {
          handler.openIframe();
        } else {
          // Fallback: redirect to Paystack hosted page
          window.location.href = data.authorization_url;
        }
      })
      .catch(err => {
        toast.error(err?.response?.data?.message || 'Could not initiate payment');
        setPaying(false);
      });
  }

  async function activateSubscription(reference) {
    try {
      const { data } = await api.post('/subscriptions/activate', { reference });
      setBookings(data.bookings || []);
      setStep(4);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Activation failed');
    } finally {
      setPaying(false);
    }
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
        </div>

        {/* Step progress */}
        {step < 4 && (
          <div className="flex items-center gap-2 px-1">
            {[
              { n: 1, label: 'Frequency' },
              { n: 2, label: 'Schedule' },
              { n: 3, label: 'Payment' },
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

          {/* ── Step 1: Frequency ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-bold text-gray-900">How often per week?</h2>
                <p className="text-xs text-gray-500 mt-0.5">Choose how many sessions you'd like each week.</p>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    onClick={() => setTimesPerWeek(n)}
                    className={`py-4 rounded-2xl text-center transition border ${
                      timesPerWeek === n
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-green-400 hover:bg-green-50'
                    }`}
                  >
                    <div className="text-xl font-extrabold">{n}×</div>
                    <div className="text-[10px] mt-0.5 font-medium">per week</div>
                  </button>
                ))}
              </div>

              {/* Monthly price preview */}
              {monthlyRate > 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-700 font-medium">Monthly total</p>
                      <p className="text-2xl font-extrabold text-green-800">
                        ₦{monthlyRate.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right text-xs text-green-600">
                      <p>{timesPerWeek}× / week</p>
                      <p>~{timesPerWeek * 4} sessions</p>
                      <p>{sessionDur} min each</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500 text-center">
                  Rate not set — contact the tutor directly.
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Globe size={11} /> Your timezone: <strong>{studentTz}</strong>
              </div>

              <button
                onClick={() => { if (monthlyRate > 0) setStep(2); else toast.error('Tutor rate not configured'); }}
                className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-800 transition"
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 2: Preferred slots ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition">
                <ChevronLeft size={15} /> Back
              </button>

              <div>
                <h2 className="font-bold text-gray-900">Pick your preferred slots</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose a day + time for each of your {timesPerWeek} weekly session{timesPerWeek > 1 ? 's' : ''}.
                  These repeat every week for the month.
                </p>
              </div>

              {slots.map((slot, i) => {
                const timesAvail = timesForDay(avail?.weeklySlots, slot.day, sessionDur);
                return (
                  <div key={i} className="border border-gray-200 rounded-2xl p-3 space-y-2.5">
                    <p className="text-xs font-bold text-gray-700">Session {i + 1}</p>

                    <div>
                      <p className="text-[11px] text-gray-500 mb-1.5">Day</p>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_LABEL.map((label, dayIdx) => {
                          const isAvail = availableDays.includes(dayIdx);
                          return (
                            <button key={dayIdx} type="button" disabled={!isAvail}
                              onClick={() => updateSlot(i, 'day', dayIdx)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                slot.day === dayIdx && isAvail
                                  ? 'bg-green-700 text-white border-green-700'
                                  : isAvail
                                    ? 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50'
                                    : 'text-gray-300 border-gray-100 cursor-default'
                              }`}
                            >
                              {label.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-500 mb-1.5">Time <span className="text-gray-400">(tutor timezone)</span></p>
                      {timesAvail.length === 0 ? (
                        <p className="text-xs text-gray-400">No times available for this day</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {timesAvail.map(t => (
                            <button key={t} type="button"
                              onClick={() => updateSlot(i, 'time', t)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                slot.time === t
                                  ? 'bg-green-700 text-white border-green-700'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => { if (slotsValid()) setStep(3); else toast.error('Please pick a time for every session'); }}
                className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-800 transition"
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {/* ── Step 3: Payment summary ──────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition">
                <ChevronLeft size={15} /> Back
              </button>

              <div>
                <h2 className="font-bold text-gray-900">Subscription Summary</h2>
                <p className="text-xs text-gray-500 mt-0.5">Review your plan before paying.</p>
              </div>

              <div className="border border-gray-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tutor</span>
                  <span className="font-semibold text-gray-900">{tutorName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sessions per week</span>
                  <span className="font-semibold text-gray-900">{timesPerWeek}×</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Session duration</span>
                  <span className="font-semibold text-gray-900">{sessionDur} min</span>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1.5">
                  {slots.map((s, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-gray-400">Slot {i + 1}</span>
                      <span className="font-medium text-gray-700">
                        {DAYS_LABEL[s.day]}s at {s.time}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">Monthly Total</span>
                  <span className="text-2xl font-extrabold text-green-700">₦{monthlyRate.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                Payment is for one month (~{timesPerWeek * 4} sessions). Sessions are auto-booked upon payment confirmation.
              </div>

              <button
                onClick={initPaystack}
                disabled={paying}
                className="w-full bg-green-700 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-green-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Pay ₦{monthlyRate.toLocaleString()} — Activate Subscription
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-gray-400">Secured by Paystack · 256-bit SSL</p>
            </div>
          )}

          {/* ── Step 4: Success ──────────────────────────────────────────── */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-1">You're Subscribed!</h2>
                <p className="text-sm text-gray-500">
                  Your monthly subscription with <strong>{tutorName}</strong> is now active.
                </p>
              </div>

              {bookings.length > 0 && (
                <div className="border border-green-200 rounded-2xl p-4 text-left space-y-2">
                  <p className="text-xs font-bold text-green-800">Sessions booked ({bookings.length} total)</p>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {[...bookings]
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map((b, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-600">
                          <span>{new Date(b.date).toDateString()}</span>
                          <span className="font-medium">{b.timeSlot}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('/dashboard/student')}
                  className="w-full bg-green-700 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-800 transition"
                >
                  Go to My Dashboard
                </button>
                <a href="/" className="text-xs text-gray-400 hover:underline">Back to Home</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
