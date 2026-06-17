import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, CheckCircle, ArrowRight, ArrowLeft,
  BookOpen, Clock, Calendar, Zap, Star, Globe2,
} from 'lucide-react';
import Logo from '../components/Logo';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SUBJECTS = [
  'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Government', 'Geography', 'Literature in English',
  'Agricultural Science', 'Computer Science', 'Further Mathematics',
  'French', 'Commerce', 'Accounting', 'Civic Education',
  'Technical Drawing', 'Basic Science', 'Basic Technology', 'Social Studies',
  'IELTS Preparation', 'TOEFL Preparation',
];

const LEARNING_GOALS = [
  { value: 'WAEC Preparation',   label: 'WAEC Preparation',    icon: '📝', bg: 'bg-green-50',   border: 'border-green-500',  text: 'text-green-800',  sub: 'West African Senior School Certificate' },
  { value: 'JAMB / UTME',        label: 'JAMB / UTME',         icon: '🎯', bg: 'bg-blue-50',    border: 'border-blue-500',   text: 'text-blue-800',   sub: 'Unified Tertiary Matriculation Exam' },
  { value: 'NECO Preparation',   label: 'NECO Preparation',    icon: '📖', bg: 'bg-purple-50',  border: 'border-purple-500', text: 'text-purple-800', sub: 'National Examinations Council' },
  { value: 'School Homework',    label: 'School Homework Help', icon: '📚', bg: 'bg-orange-50',  border: 'border-orange-500', text: 'text-orange-800', sub: 'Daily assignments & classwork' },
  { value: 'GCSE / IGCSE',       label: 'GCSE / IGCSE',        icon: '🏫', bg: 'bg-red-50',     border: 'border-red-500',    text: 'text-red-800',    sub: 'British curriculum exams' },
  { value: 'A-Level',            label: 'A-Level',             icon: '🎓', bg: 'bg-indigo-50',  border: 'border-indigo-500', text: 'text-indigo-800', sub: 'Advanced Level qualifications' },
  { value: 'SAT / ACT Prep',     label: 'SAT / ACT Prep',      icon: '🌍', bg: 'bg-teal-50',    border: 'border-teal-500',   text: 'text-teal-800',   sub: 'US college entrance tests' },
  { value: 'Common Entrance',    label: 'Common Entrance',     icon: '✏️', bg: 'bg-yellow-50',  border: 'border-yellow-500', text: 'text-yellow-800', sub: 'Junior secondary school entry' },
  { value: 'University Courses', label: 'University Courses',  icon: '🏛️', bg: 'bg-pink-50',   border: 'border-pink-500',   text: 'text-pink-800',   sub: '100 Level to Final Year' },
  { value: 'IELTS / TOEFL',      label: 'IELTS / TOEFL',       icon: '🗺️', bg: 'bg-cyan-50',   border: 'border-cyan-500',   text: 'text-cyan-800',   sub: 'English proficiency tests' },
];

const CLASS_LEVELS = [
  { value: 'Primary 1-3',    label: 'Primary 1 – 3',    sub: 'Ages 6 – 9' },
  { value: 'Primary 4-6',    label: 'Primary 4 – 6',    sub: 'Ages 9 – 12' },
  { value: 'JSS 1',          label: 'JSS 1',             sub: 'Junior Secondary 1' },
  { value: 'JSS 2',          label: 'JSS 2',             sub: 'Junior Secondary 2' },
  { value: 'JSS 3',          label: 'JSS 3',             sub: 'Junior Secondary 3' },
  { value: 'SS 1',           label: 'SS 1',              sub: 'Senior Secondary 1' },
  { value: 'SS 2',           label: 'SS 2',              sub: 'Senior Secondary 2' },
  { value: 'SS 3',           label: 'SS 3 / Final Year', sub: 'Senior Secondary 3' },
  { value: 'University',     label: 'University',        sub: '100 Level – Final Year' },
  { value: 'Post-Graduate',  label: 'Post-Graduate',     sub: 'Masters / PhD' },
  { value: 'Adult Learning', label: 'Adult Learning',    sub: 'Professional / Casual' },
];

const SCHEDULE_OPTIONS = [
  { value: 'Weekday Mornings',   label: 'Weekday Mornings',    sub: '7am – 12pm',         icon: Clock },
  { value: 'Weekday Afternoons', label: 'Weekday Afternoons',  sub: '12pm – 5pm',         icon: Clock },
  { value: 'Weekday Evenings',   label: 'Weekday Evenings',    sub: '5pm – 9pm',          icon: Clock },
  { value: 'Weekend Mornings',   label: 'Weekend Mornings',    sub: '7am – 12pm',         icon: Calendar },
  { value: 'Weekend Afternoons', label: 'Weekend Afternoons',  sub: '12pm – 5pm',         icon: Calendar },
  { value: 'Weekend Evenings',   label: 'Weekend Evenings',    sub: '5pm – 9pm',          icon: Calendar },
  { value: 'Flexible',           label: 'Flexible / Any Time', sub: "I'm available anytime", icon: Zap },
];

const LANGUAGES = ['English', 'Yoruba', 'Hausa', 'Igbo', 'Pidgin', 'French', 'Arabic', 'Swahili'];

const TEACHING_STYLES = [
  { value: 'patient',      label: 'Patient & Supportive', icon: '🤝', desc: 'Goes at my pace, explains things gently until I understand' },
  { value: 'structured',   label: 'Structured Lessons',   icon: '📋', desc: 'Clear lesson plans, organised notes, defined learning path' },
  { value: 'interactive',  label: 'Interactive & Fun',    icon: '🎯', desc: 'Engaging explanations, real examples, keeps me motivated' },
  { value: 'exam-focused', label: 'Exam-Focused',         icon: '🏆', desc: 'Drills past questions, time management, exam technique' },
];

const STEPS = [
  { label: 'Subjects',     desc: 'What do you need help with?' },
  { label: 'Goal',         desc: 'What are you preparing for?' },
  { label: 'Level',        desc: 'What class or level are you in?' },
  { label: 'Schedule',     desc: 'When are you available?' },
  { label: 'Preferences',  desc: 'Language & learning style' },
];

export default function StudentOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [goal, setGoal] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [saving, setSaving] = useState(false);
  const [matching, setMatching] = useState(false);

  const toggleSubject = (s) =>
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const toggleSchedule = (s) =>
    setSchedule(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const canNext = () => {
    if (step === 0) return subjects.length > 0;
    if (step === 1) return goal !== '';
    if (step === 2) return classLevel !== '';
    if (step === 3) return schedule.length > 0;
    if (step === 4) return true; // optional step
    return false;
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me/profile', {
        subjects,
        tutoringGoal: goal,
        classLevel,
        preferredSchedule: schedule,
        preferredLanguage: preferredLanguage || undefined,
        learningStyle: learningStyle || undefined,
        onboardingComplete: true,
      });
      setMatching(true);
      setTimeout(() => {
        const params = new URLSearchParams();
        if (subjects[0]) params.set('subject', subjects[0]);
        navigate(`/find-tutoring?${params.toString()}`);
      }, 2200);
    } catch {
      toast.error('Could not save preferences. Continuing anyway...');
      setTimeout(() => navigate('/find-tutoring'), 1000);
    } finally {
      setSaving(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  if (matching) {
    return (
      <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 border-4 border-green-400 border-t-white rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-extrabold text-white mb-2">Finding your perfect tutors…</h2>
        <p className="text-green-300 text-sm max-w-xs">
          Matching you with verified tutors who teach{' '}
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
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <button onClick={() => navigate('/find-tutoring')}
          className="text-xs text-gray-400 hover:text-gray-600 transition">
          Skip for now →
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-1 mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-1 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                  i < step ? 'bg-green-600 text-white' :
                  i === step ? 'bg-green-700 text-white ring-2 ring-green-200' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            Step {step + 1} of {STEPS.length} — <span className="font-semibold text-gray-600">{STEPS[step].label}</span>
            {step === 4 && <span className="ml-2 text-green-600 font-semibold">(Optional)</span>}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Step headers */}
        <div className="mb-6">
          {step === 0 && (<>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Hi {firstName}, what subjects do you need help with?</h1>
            <p className="text-gray-500 text-sm">Pick as many as you like — you can always update later.</p>
          </>)}
          {step === 1 && (<>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">What are you preparing for?</h1>
            <p className="text-gray-500 text-sm">This helps us match you with the right specialist.</p>
          </>)}
          {step === 2 && (<>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">What class or level are you in?</h1>
            <p className="text-gray-500 text-sm">Your tutor will tailor lessons to your exact level.</p>
          </>)}
          {step === 3 && (<>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">When are you available for lessons?</h1>
            <p className="text-gray-500 text-sm">Select all the times that work for you.</p>
          </>)}
          {step === 4 && (<>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Two last things — optional but helpful</h1>
            <p className="text-gray-500 text-sm">These improve your match score. Skip anytime and update later.</p>
          </>)}
        </div>

        {/* Step 1: Subjects */}
        {step === 0 && (
          <div>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(s => {
                const active = subjects.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleSubject(s)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition ${
                      active
                        ? 'bg-green-700 border-green-700 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700'
                    }`}>
                    {active && <span className="mr-1">✓</span>}{s}
                  </button>
                );
              })}
            </div>
            {subjects.length > 0 && (
              <p className="mt-4 text-sm text-green-700 font-semibold">
                {subjects.length} subject{subjects.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}

        {/* Step 2: Learning Goal */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LEARNING_GOALS.map(({ value, label, icon, bg, border, text, sub }) => {
              const active = goal === value;
              return (
                <button key={value} type="button" onClick={() => setGoal(value)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition ${
                    active ? `${bg} ${border}` : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}>
                  <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold leading-tight ${active ? text : 'text-gray-800'}`}>{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                  {active && <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3: Class Level */}
        {step === 2 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CLASS_LEVELS.map(({ value, label, sub }) => {
              const active = classLevel === value;
              return (
                <button key={value} type="button" onClick={() => setClassLevel(value)}
                  className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-2 text-left transition ${
                    active ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 hover:border-green-300'
                  }`}>
                  {active && <CheckCircle size={14} className="text-green-600 self-end mb-1" />}
                  <p className={`text-sm font-bold leading-tight ${active ? 'text-green-800' : 'text-gray-800'}`}>{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 4: Schedule */}
        {step === 3 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SCHEDULE_OPTIONS.map(({ value, label, sub, icon: Icon }) => {
                const active = schedule.includes(value);
                return (
                  <button key={value} type="button" onClick={() => toggleSchedule(value)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition ${
                      active ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 hover:border-green-300'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${active ? 'text-green-800' : 'text-gray-800'}`}>{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                    {active && <CheckCircle size={16} className="text-green-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Profile summary card */}
            {(subjects.length > 0 || goal || classLevel) && (
              <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your profile so far</p>
                <div className="space-y-2">
                  {subjects.length > 0 && (
                    <div className="flex items-start gap-2">
                      <BookOpen size={13} className="text-green-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-600"><span className="font-semibold">Subjects:</span> {subjects.join(', ')}</p>
                    </div>
                  )}
                  {goal && (
                    <div className="flex items-start gap-2">
                      <Star size={13} className="text-green-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-600"><span className="font-semibold">Goal:</span> {goal}</p>
                    </div>
                  )}
                  {classLevel && (
                    <div className="flex items-start gap-2">
                      <GraduationCap size={13} className="text-green-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-600"><span className="font-semibold">Level:</span> {classLevel}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 5: Language + Learning Style (optional) */}
        {step === 4 && (
          <div className="space-y-8">

            {/* Language preference */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe2 size={16} className="text-green-600" />
                <p className="text-sm font-bold text-gray-800">Preferred language of instruction</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(lang => {
                  const active = preferredLanguage === lang;
                  return (
                    <button key={lang} type="button"
                      onClick={() => setPreferredLanguage(active ? '' : lang)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition ${
                        active
                          ? 'bg-green-700 border-green-700 text-white'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700'
                      }`}>
                      {active && '✓ '}{lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Learning style */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star size={16} className="text-green-600" />
                <p className="text-sm font-bold text-gray-800">What type of tutor suits you best?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEACHING_STYLES.map(({ value, label, icon, desc }) => {
                  const active = learningStyle === value;
                  return (
                    <button key={value} type="button"
                      onClick={() => setLearningStyle(active ? '' : value)}
                      className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition ${
                        active ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 hover:border-green-300'
                      }`}>
                      <span className="text-2xl shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${active ? 'text-green-800' : 'text-gray-800'}`}>{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{desc}</p>
                      </div>
                      {active && <CheckCircle size={15} className="text-green-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Matching factors info */}
            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
              <p className="text-xs font-bold text-green-800 mb-2">How we match you</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  ['Subject expertise', subjects.length > 0 ? '✓' : '—'],
                  ['Your class level', classLevel ? '✓' : '—'],
                  ['Schedule overlap', schedule.length > 0 ? '✓' : '—'],
                  ['Language match', preferredLanguage ? '✓' : '—'],
                  ['Teaching style', learningStyle ? '✓' : '—'],
                  ['Location/Country', '✓'],
                ].map(([factor, status]) => (
                  <div key={factor} className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold ${status === '✓' ? 'text-green-600' : 'text-gray-400'}`}>{status}</span>
                    <span className="text-xs text-gray-600">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t border-gray-100 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300">
              <ArrowLeft size={15} /> Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex items-center gap-2 bg-green-700 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-800 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed ml-auto">
              Continue <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={handleFinish} disabled={saving}
              className="flex items-center gap-2 bg-green-700 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-800 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed ml-auto">
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
              ) : (
                <>Find My Tutors <ArrowRight size={15} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
