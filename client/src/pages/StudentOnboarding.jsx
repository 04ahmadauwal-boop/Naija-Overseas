import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, GraduationCap, BookOpen, MessageSquare,
  FlaskConical, Calculator, Clock, Calendar, Zap,
  CheckCircle,
} from 'lucide-react';
import Logo from '../components/Logo';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Data ─────────────────────────────────────────────────────────────────────

const GOALS = [
  { value: 'WAEC / NECO Preparation', label: 'WAEC / NECO Preparation', sub: 'West African & National Certificate exams', Icon: BookOpen },
  { value: 'JAMB / UTME',             label: 'JAMB / UTME',             sub: 'Unified Tertiary Matriculation Exam',       Icon: Calculator },
  { value: 'GCSE / A-Level',          label: 'GCSE / A-Level',          sub: 'British curriculum qualifications',         Icon: GraduationCap },
  { value: 'University Courses',      label: 'University Courses',      sub: '100 Level to Final Year support',           Icon: Globe },
  { value: 'IELTS / TOEFL / SAT',     label: 'IELTS / TOEFL / SAT',    sub: 'Language & college entrance tests',         Icon: FlaskConical },
  { value: 'School Homework Help',    label: 'School Homework Help',    sub: 'Daily assignments & classwork',             Icon: MessageSquare },
];

const SUBJECTS = [
  'Mathematics', 'Further Mathematics', 'English Language', 'Physics',
  'Chemistry', 'Biology', 'Economics', 'Government', 'Geography',
  'Literature in English', 'Agricultural Science', 'Computer Science',
  'French', 'Commerce', 'Accounting', 'Civic Education',
  'Basic Science', 'Basic Technology', 'Social Studies',
  'IELTS Preparation', 'TOEFL Preparation', 'SAT Prep',
];

const CLASS_LEVELS = [
  { value: 'Primary 1-3',    label: 'Primary 1–3',       sub: 'Ages 6–9' },
  { value: 'Primary 4-6',    label: 'Primary 4–6',       sub: 'Ages 9–12' },
  { value: 'JSS 1',          label: 'JSS 1',             sub: 'Junior Secondary 1' },
  { value: 'JSS 2',          label: 'JSS 2',             sub: 'Junior Secondary 2' },
  { value: 'JSS 3',          label: 'JSS 3',             sub: 'Junior Secondary 3' },
  { value: 'SS 1',           label: 'SS 1',              sub: 'Senior Secondary 1' },
  { value: 'SS 2',           label: 'SS 2',              sub: 'Senior Secondary 2' },
  { value: 'SS 3',           label: 'SS 3 / Final Year', sub: 'Senior Secondary 3' },
  { value: 'University',     label: 'University',        sub: '100L – Final Year' },
  { value: 'Post-Graduate',  label: 'Post-Graduate',     sub: 'Masters / PhD' },
  { value: 'Adult Learning', label: 'Adult Learning',    sub: 'Professional / Casual' },
];

const SCHEDULE_OPTIONS = [
  { value: 'Weekday Mornings',   label: 'Weekday Mornings',    sub: '7 am – 12 pm',          Icon: Clock },
  { value: 'Weekday Afternoons', label: 'Weekday Afternoons',  sub: '12 pm – 5 pm',          Icon: Clock },
  { value: 'Weekday Evenings',   label: 'Weekday Evenings',    sub: '5 pm – 9 pm',           Icon: Clock },
  { value: 'Weekend Mornings',   label: 'Weekend Mornings',    sub: '7 am – 12 pm',          Icon: Calendar },
  { value: 'Weekend Afternoons', label: 'Weekend Afternoons',  sub: '12 pm – 5 pm',          Icon: Calendar },
  { value: 'Weekend Evenings',   label: 'Weekend Evenings',    sub: '5 pm – 9 pm',           Icon: Calendar },
  { value: 'Flexible',           label: 'Flexible / Any Time', sub: 'I\'m available anytime', Icon: Zap },
];

const TOTAL_STEPS = 4;

// ── Shared UI ─────────────────────────────────────────────────────────────────

function ProgressDots({ step }) {
  return (
    <div className="flex items-center justify-center gap-2 py-5">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) =>
        i === step ? (
          <div key={i} className="w-8 h-2 rounded-full bg-green-700" />
        ) : i < step ? (
          <div key={i} className="w-2 h-2 rounded-full bg-green-600" />
        ) : (
          <div key={i} className="w-2 h-2 rounded-full bg-gray-200" />
        )
      )}
    </div>
  );
}

function GoalCard({ label, sub, Icon, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition text-left ${
        active
          ? 'border-green-600 bg-green-50'
          : 'border-gray-100 bg-white hover:border-green-300 hover:bg-green-50/40'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition ${
        active ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-500'
      }`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold leading-tight ${active ? 'text-green-900' : 'text-gray-900'}`}>{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      {active && <CheckCircle size={16} className="text-green-600 shrink-0" />}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function StudentOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step,     setStep]     = useState(0);
  const [goal,     setGoal]     = useState('');
  const [subjects, setSubjects] = useState([]);
  const [level,    setLevel]    = useState('');
  const [schedule, setSchedule] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [matching, setMatching] = useState(false);

  const toggleSubject = s => setSubjects(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const toggleSchedule = s => setSchedule(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const canContinue = () => {
    if (step === 0) return goal !== '';
    if (step === 1) return subjects.length > 0 && level !== '';
    if (step === 2) return schedule.length > 0;
    return true;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me/profile', {
        tutoringGoal:       goal,
        subjects,
        classLevel:         level,
        preferredSchedule:  schedule,
        onboardingComplete: true,
      });
      setMatching(true);
      setTimeout(() => {
        const params = new URLSearchParams();
        if (subjects[0]) params.set('subject', subjects[0]);
        navigate(`/find-tutoring?${params.toString()}`);
      }, 2000);
    } catch {
      toast.error('Could not save preferences. Continuing anyway…');
      setTimeout(() => navigate('/find-tutoring'), 1000);
    } finally {
      setSaving(false);
    }
  };

  // ── Matching animation ──────────────────────────────────────────────────────
  if (matching) {
    return (
      <div className="min-h-screen bg-green-800 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-14 h-14 border-4 border-green-600 border-t-white rounded-full animate-spin mb-6" />
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">Finding your perfect tutors…</h2>
        <p className="text-green-200 text-sm max-w-xs">
          Matching you with verified tutors for{' '}
          <strong className="text-white">{subjects.slice(0, 2).join(' & ')}</strong>
          {subjects.length > 2 ? ` and ${subjects.length - 2} more` : ''}.
        </p>
        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4">

      {/* Logo */}
      <div className="pt-5 sm:pt-7"><Logo size="sm" /></div>

      {/* Progress */}
      <ProgressDots step={step} />

      {/* Content */}
      <div className="w-full max-w-sm sm:max-w-md flex-1 flex flex-col pb-10">

        {/* ── Step 0: Goal ────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">What are you looking for?</h1>
              <p className="text-sm text-gray-400 mt-1">Select the option that best describes your goal.</p>
            </div>
            <div className="space-y-3">
              {GOALS.map(({ value, label, sub, Icon }) => (
                <GoalCard key={value} label={label} sub={sub} Icon={Icon}
                  active={goal === value} onClick={() => setGoal(value)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Subjects + Level ─────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">Tell us more</h1>
              <p className="text-sm text-gray-400 mt-1">Pick your subjects and current level.</p>
            </div>

            {/* Summary badge */}
            <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex justify-between text-sm">
              <span className="text-green-700 font-medium">Goal</span>
              <span className="font-bold text-green-900">{goal}</span>
            </div>

            {/* Subjects */}
            <div>
              <p className="text-xs font-bold text-gray-600 mb-2">
                Subjects <span className="text-gray-400 font-normal">(select all that apply)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map(s => {
                  const active = subjects.includes(s);
                  return (
                    <button key={s} type="button" onClick={() => toggleSubject(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition ${
                        active
                          ? 'bg-green-700 border-green-700 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
                      }`}>
                      {active && '✓ '}{s}
                    </button>
                  );
                })}
              </div>
              {subjects.length > 0 && (
                <p className="mt-2 text-xs text-green-700 font-semibold">{subjects.length} selected</p>
              )}
            </div>

            {/* Class level */}
            <div>
              <p className="text-xs font-bold text-gray-600 mb-2">Current Level</p>
              <div className="grid grid-cols-2 gap-2">
                {CLASS_LEVELS.map(({ value, label, sub }) => {
                  const active = level === value;
                  return (
                    <button key={value} type="button" onClick={() => setLevel(value)}
                      className={`flex flex-col items-start px-3 py-3 rounded-2xl border-2 transition text-left ${
                        active
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-100 bg-white hover:border-green-300'
                      }`}>
                      <p className={`text-xs font-bold leading-tight ${active ? 'text-green-900' : 'text-gray-800'}`}>{label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Schedule ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">When are you available?</h1>
              <p className="text-sm text-gray-400 mt-1">Select all the times that work for you.</p>
            </div>
            <div className="space-y-2.5">
              {SCHEDULE_OPTIONS.map(({ value, label, sub, Icon }) => {
                const active = schedule.includes(value);
                return (
                  <button key={value} type="button" onClick={() => toggleSchedule(value)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition text-left ${
                      active
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-100 bg-white hover:border-green-300 hover:bg-green-50/40'
                    }`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                      active ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${active ? 'text-green-900' : 'text-gray-900'}`}>{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                    {active && <CheckCircle size={15} className="text-green-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 3: Summary ──────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">You're all set!</h1>
              <p className="text-sm text-gray-400 mt-1">Here's a summary before we find your tutors.</p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-2xl divide-y divide-green-100 overflow-hidden">
              {[
                { label: 'Goal',      value: goal },
                { label: 'Subjects',  value: subjects.slice(0, 3).join(', ') + (subjects.length > 3 ? ` +${subjects.length - 3} more` : '') },
                { label: 'Level',     value: level },
                { label: 'Schedule',  value: schedule.length > 2 ? `${schedule.slice(0, 2).join(', ')} +${schedule.length - 2} more` : schedule.join(', ') },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-3 px-4 py-3">
                  <span className="text-sm text-green-700 shrink-0">{label}</span>
                  <span className="text-sm font-bold text-green-900 text-right">{value || '—'}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center">
              We'll use these to match you with the best verified tutors.
            </p>
          </div>
        )}

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <div className="mt-6 space-y-3">
          {step < TOTAL_STEPS - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canContinue()}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-30 transition active:scale-[.98]">
              Continue
            </button>
          ) : (
            <button onClick={handleFinish} disabled={saving}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-50 transition active:scale-[.98] flex items-center justify-center gap-2">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Finding tutors…</>
                : 'Find My Tutors →'}
            </button>
          )}

          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="w-full text-center text-sm text-gray-400 hover:text-green-700 transition py-1">
              Go back
            </button>
          ) : (
            <button onClick={() => navigate('/find-tutoring')}
              className="w-full text-center text-sm text-gray-400 hover:text-green-700 transition py-1">
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
