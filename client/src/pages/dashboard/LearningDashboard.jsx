import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  BookOpen, ClipboardList, MessageSquare, TrendingUp, LogOut,
  Menu, Plus, Trash2, Send, CheckCircle, GraduationCap,
  FileText, Star, CalendarCheck, LayoutDashboard, ChevronLeft,
  Users, ArrowRight, Radio, Video, Upload, Clock, Download,
  PenLine, FolderOpen, X,
} from 'lucide-react';
import LiveWhiteboard from '../../components/LiveWhiteboard';
import { ClassCountdown, TodayScheduleBanner } from '../../components/ClassSchedule';

// ── helpers ──────────────────────────────────────────────────────────────────
function pct(n) { return n == null ? '—' : `${n}%`; }
function fmt(d) { return d ? new Date(d).toLocaleDateString() : '—'; }

// ── tab definitions ──────────────────────────────────────────────────────────
const STUDENT_TABS = [
  { id: 'overview',   label: 'Overview',        icon: LayoutDashboard },
  { id: 'liveclass',  label: 'Live Class',      icon: Radio           },
  { id: 'notes',      label: 'Notes',           icon: BookOpen        },
  { id: 'quizzes',    label: 'Practice Quizzes',icon: ClipboardList   },
  { id: 'chat',       label: 'Chat with Tutor', icon: MessageSquare   },
  { id: 'progress',   label: 'My Progress',     icon: TrendingUp      },
];

const TUTOR_TABS = [
  { id: 'overview',   label: 'Overview',        icon: LayoutDashboard },
  { id: 'liveclass',  label: 'Live Class',      icon: Radio           },
  { id: 'notes',      label: 'Upload Notes',    icon: BookOpen        },
  { id: 'quizzes',    label: 'Create Quizzes',  icon: ClipboardList   },
  { id: 'chat',       label: 'Chat',            icon: MessageSquare   },
  { id: 'progress',   label: 'Student Progress',icon: TrendingUp      },
  { id: 'reports',    label: 'Write Reports',   icon: FileText        },
];

const PARENT_TABS = [
  { id: 'overview',  label: 'Overview',        icon: LayoutDashboard },
  { id: 'progress',  label: "Child's Progress",icon: TrendingUp      },
  { id: 'reports',   label: 'Reports',         icon: FileText        },
  { id: 'notes',     label: 'Notes',           icon: BookOpen        },
  { id: 'quizzes',   label: 'Quizzes',         icon: ClipboardList   },
];

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT PICKER (tutor only)
// ─────────────────────────────────────────────────────────────────────────────
function BulkNoteForm({ studentIds, studentNames, onDone }) {
  const [form, setForm] = useState({ title: '', subject: '', body: '' });
  const [saving, setSaving] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (!form.title) return toast.error('Title required');
    setSaving(true);
    try {
      await api.post('/learning/notes', { ...form, studentIds });
      toast.success(`Note sent to ${studentIds.length} student${studentIds.length > 1 ? 's' : ''}`);
      onDone();
    } catch { toast.error('Failed to send note'); }
    finally { setSaving(false); }
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Send Note</h3>
          <p className="text-xs text-gray-400 mt-0.5">To: {studentNames.join(', ')}</p>
        </div>
        <button onClick={onDone} className="text-xs text-gray-400 hover:text-gray-600 mt-1">Cancel</button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="input" placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <input className="input" placeholder="Subject (optional)" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
        </div>
        <textarea className="input min-h-[90px]" placeholder="Write your note…" value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} />
        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Sending…' : `Send to ${studentIds.length} Student${studentIds.length > 1 ? 's' : ''}`}</button>
      </form>
    </div>
  );
}

function BulkQuizForm({ studentIds, studentNames, onDone }) {
  const [form, setForm] = useState({ title: '', subject: '', dueDate: '', questions: [{ q: '', options: ['', '', '', ''], answer: 0 }] });
  const [saving, setSaving] = useState(false);

  function addQ() { setForm(p => ({ ...p, questions: [...p.questions, { q: '', options: ['', '', '', ''], answer: 0 }] })); }
  function updateQ(qi, field, value) {
    setForm(p => {
      const qs = [...p.questions];
      if (field === 'q' || field === 'answer') qs[qi] = { ...qs[qi], [field]: field === 'answer' ? Number(value) : value };
      else { const opts = [...qs[qi].options]; opts[Number(field)] = value; qs[qi] = { ...qs[qi], options: opts }; }
      return { ...p, questions: qs };
    });
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.title || form.questions.some(q => !q.q)) return toast.error('Fill in all questions');
    setSaving(true);
    try {
      await api.post('/learning/quizzes', { ...form, studentIds });
      toast.success(`Quiz sent to ${studentIds.length} student${studentIds.length > 1 ? 's' : ''}`);
      onDone();
    } catch { toast.error('Failed to send quiz'); }
    finally { setSaving(false); }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Send Quiz</h3>
          <p className="text-xs text-gray-400 mt-0.5">To: {studentNames.join(', ')}</p>
        </div>
        <button onClick={onDone} className="text-xs text-gray-400 hover:text-gray-600 mt-1">Cancel</button>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="input" placeholder="Quiz title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <input className="input" placeholder="Subject (optional)" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
        </div>
        <input type="date" className="input w-auto" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
        <div className="space-y-3">
          {form.questions.map((q, qi) => (
            <div key={qi} className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Question {qi + 1}</p>
              <input className="input" placeholder="Question text *" value={q.q} onChange={e => updateQ(qi, 'q', e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <input key={oi} className="input text-sm" placeholder={`Option ${oi + 1}`} value={opt} onChange={e => updateQ(qi, oi, e.target.value)} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Correct:</span>
                <select className="input w-auto text-sm" value={q.answer} onChange={e => updateQ(qi, 'answer', e.target.value)}>
                  {q.options.map((_, oi) => <option key={oi} value={oi}>Option {oi + 1}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={addQ} className="flex items-center gap-1.5 text-sm px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
            <Plus size={14} /> Add Question
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Sending…' : `Send to ${studentIds.length} Student${studentIds.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </div>
  );
}

function StudentPicker({ onSelect }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(null); // 'note' | 'quiz' | null

  useEffect(() => {
    api.get('/learning/my-students')
      .then(r => setStudents(r.data))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  function toggleCheck(id) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setChecked(prev => prev.size === students.length ? new Set() : new Set(students.map(s => s._id)));
  }

  const selectedStudents = students.filter(s => checked.has(s._id));
  const selectedIds   = selectedStudents.map(s => s._id);
  const selectedNames = selectedStudents.map(s => s.name);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Students</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Open a student's full dashboard, or select multiple to send the same note / quiz to all of them.
          </p>
        </div>
        {students.length > 0 && (
          <button onClick={toggleAll}
            className="text-sm font-medium text-green-700 hover:underline shrink-0">
            {checked.size === students.length ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {checked.size > 0 && !bulkMode && (
        <div className="bg-green-700 text-white rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold flex-1">
            {checked.size} student{checked.size > 1 ? 's' : ''} selected
          </span>
          <button onClick={() => setBulkMode('note')}
            className="flex items-center gap-1.5 bg-white text-green-800 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-green-50 transition">
            <BookOpen size={14} /> Send Note
          </button>
          <button onClick={() => setBulkMode('quiz')}
            className="flex items-center gap-1.5 bg-white text-green-800 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-green-50 transition">
            <ClipboardList size={14} /> Send Quiz
          </button>
          <button onClick={() => setChecked(new Set())}
            className="text-green-200 hover:text-white text-sm underline">
            Clear
          </button>
        </div>
      )}

      {/* Bulk forms */}
      {bulkMode === 'note' && (
        <BulkNoteForm studentIds={selectedIds} studentNames={selectedNames}
          onDone={() => { setBulkMode(null); setChecked(new Set()); }} />
      )}
      {bulkMode === 'quiz' && (
        <BulkQuizForm studentIds={selectedIds} studentNames={selectedNames}
          onDone={() => { setBulkMode(null); setChecked(new Set()); }} />
      )}

      {students.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <Users size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="font-semibold text-gray-500">No students yet</p>
          <p className="text-xs text-gray-400 mt-1">Students appear here once they book a session with you</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(s => {
            const isChecked = checked.has(s._id);
            return (
              <div key={s._id}
                className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${isChecked ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-100 hover:shadow-md'}`}>
                <div className="flex items-start gap-3 mb-4">
                  {/* Checkbox */}
                  <button onClick={() => toggleCheck(s._id)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${isChecked ? 'bg-green-600 border-green-600' : 'border-gray-300 hover:border-green-400'}`}>
                    {isChecked && <CheckCircle size={12} className="text-white" />}
                  </button>
                  <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0">
                    {s.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  </div>
                </div>
                <button onClick={() => onSelect(s)}
                  className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-xl py-2.5 transition">
                  Open Dashboard <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTES TAB
// ─────────────────────────────────────────────────────────────────────────────
function NotesTab({ role, studentId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', subject: '', body: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const url = studentId ? `/learning/notes?student=${studentId}` : '/learning/notes';
    api.get(url)
      .then(r => {
        const filtered = studentId
          ? r.data.filter(n => !n.student || String(n.student?._id || n.student) === String(studentId))
          : r.data;
        setNotes(filtered);
      })
      .catch(() => toast.error('Failed to load notes'))
      .finally(() => setLoading(false));
  }, [studentId]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title) return toast.error('Title required');
    setCreating(true);
    try {
      const payload = { ...form, student: studentId || null };
      const { data } = await api.post('/learning/notes', payload);
      setNotes(prev => [data, ...prev]);
      setForm({ title: '', subject: '', body: '' });
      toast.success('Note uploaded');
    } catch { toast.error('Failed to upload note'); }
    finally { setCreating(false); }
  }

  async function handleDelete(id) {
    await api.delete(`/learning/notes/${id}`);
    setNotes(prev => prev.filter(n => n._id !== id));
    toast.success('Deleted');
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {role === 'tutor' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Plus size={16}/>Upload New Note</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input" placeholder="Title *" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <input className="input" placeholder="Subject (optional)" value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <textarea className="input min-h-[100px]" placeholder="Write your note here…" value={form.body}
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))} />
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Saving…' : 'Upload Note'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {notes.length === 0 && <Empty text="No notes yet" />}
        {notes.map(note => (
          <div key={note._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-800">{note.title}</p>
                {note.subject && <p className="text-xs text-green-700 font-medium mt-0.5">{note.subject}</p>}
                {note.tutor && <p className="text-xs text-gray-400 mt-0.5">By {note.tutor.name}</p>}
              </div>
              {role === 'tutor' && (
                <button onClick={() => handleDelete(note._id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition shrink-0">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            {note.body && <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap leading-relaxed">{note.body}</p>}
            <p className="text-xs text-gray-300 mt-3">{fmt(note.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIZZES TAB
// ─────────────────────────────────────────────────────────────────────────────
function QuizzesTab({ role, studentId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '', subject: '', dueDate: '',
    questions: [{ q: '', options: ['', '', '', ''], answer: 0 }],
  });
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState({});

  useEffect(() => {
    api.get('/learning/quizzes')
      .then(r => {
        const filtered = studentId
          ? r.data.filter(q => !q.student || String(q.student?._id || q.student) === String(studentId))
          : r.data;
        setQuizzes(filtered);
      })
      .catch(() => toast.error('Failed to load quizzes'))
      .finally(() => setLoading(false));
  }, [studentId]);

  function addQuestion() {
    setForm(p => ({ ...p, questions: [...p.questions, { q: '', options: ['', '', '', ''], answer: 0 }] }));
  }

  function updateQuestion(qi, field, value) {
    setForm(p => {
      const qs = [...p.questions];
      if (field === 'q' || field === 'answer') {
        qs[qi] = { ...qs[qi], [field]: field === 'answer' ? Number(value) : value };
      } else {
        const opts = [...qs[qi].options];
        opts[Number(field)] = value;
        qs[qi] = { ...qs[qi], options: opts };
      }
      return { ...p, questions: qs };
    });
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title || form.questions.some(q => !q.q)) return toast.error('Fill in all questions');
    setCreating(true);
    try {
      const { data } = await api.post('/learning/quizzes', { ...form, student: studentId || null });
      setQuizzes(prev => [data, ...prev]);
      setForm({ title: '', subject: '', dueDate: '', questions: [{ q: '', options: ['', '', '', ''], answer: 0 }] });
      toast.success('Quiz created');
    } catch { toast.error('Failed to create quiz'); }
    finally { setCreating(false); }
  }

  async function handleDelete(id) {
    await api.delete(`/learning/quizzes/${id}`);
    setQuizzes(prev => prev.filter(q => q._id !== id));
    toast.success('Deleted');
  }

  async function loadAttempts(quizId) {
    const { data } = await api.get(`/learning/quizzes/${quizId}/attempts`);
    setAttempts(prev => ({ ...prev, [quizId]: data }));
  }

  async function submitQuiz() {
    const { data } = await api.post(`/learning/quizzes/${activeQuiz._id}/submit`, { answers });
    setResult(data);
  }

  if (loading) return <Spinner />;

  if (activeQuiz && !result) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">{activeQuiz.title}</h3>
          <button onClick={() => setActiveQuiz(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
        </div>
        {activeQuiz.questions.map((q, i) => (
          <div key={i} className="space-y-2">
            <p className="font-medium text-gray-700 text-sm">{i + 1}. {q.q}</p>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => (
                <label key={oi} className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition ${answers[i] === oi ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name={`q${i}`} checked={answers[i] === oi}
                    onChange={() => setAnswers(prev => { const a = [...prev]; a[i] = oi; return a; })}
                    className="accent-green-600" />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button onClick={submitQuiz}
          disabled={answers.filter(a => a != null).length < activeQuiz.questions.length}
          className="btn-primary w-full">Submit Quiz</button>
      </div>
    );
  }

  if (result) {
    const pf = result.score >= 50;
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center space-y-4">
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${pf ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {result.score}%
        </div>
        <h3 className="font-bold text-gray-800 text-lg">{pf ? 'Well done!' : 'Keep practising!'}</h3>
        <p className="text-gray-500 text-sm">{result.correct} / {result.total} correct</p>
        <button onClick={() => { setActiveQuiz(null); setResult(null); setAnswers([]); }} className="btn-primary">
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {role === 'tutor' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Plus size={16}/>Create New Quiz</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="input" placeholder="Quiz title *" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <input className="input" placeholder="Subject (optional)" value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <input type="date" className="input w-auto" value={form.dueDate}
              onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />

            <div className="space-y-4">
              {form.questions.map((q, qi) => (
                <div key={qi} className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Question {qi + 1}</p>
                  <input className="input" placeholder="Question text *" value={q.q}
                    onChange={e => updateQuestion(qi, 'q', e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <input key={oi} className="input text-sm" placeholder={`Option ${oi + 1}`} value={opt}
                        onChange={e => updateQuestion(qi, oi, e.target.value)} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Correct answer:</span>
                    <select className="input w-auto text-sm" value={q.answer}
                      onChange={e => updateQuestion(qi, 'answer', e.target.value)}>
                      {q.options.map((_, oi) => <option key={oi} value={oi}>Option {oi + 1}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={addQuestion}
                className="flex items-center gap-1.5 text-sm px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
                <Plus size={14} /> Add Question
              </button>
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Creating…' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {quizzes.length === 0 && <Empty text="No quizzes yet" />}
        {quizzes.map(quiz => (
          <div key={quiz._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-800">{quiz.title}</p>
                {quiz.subject && <p className="text-xs text-green-700 font-medium mt-0.5">{quiz.subject}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{quiz.questions?.length || 0} questions</p>
                {quiz.dueDate && <p className="text-xs text-orange-500 mt-0.5">Due {fmt(quiz.dueDate)}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {role === 'student' && (
                  <button onClick={() => { setActiveQuiz(quiz); setAnswers([]); }} className="btn-primary text-xs px-3 py-1.5">
                    Take Quiz
                  </button>
                )}
                {role === 'tutor' && (
                  <>
                    <button onClick={() => loadAttempts(quiz._id)}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                      Results
                    </button>
                    <button onClick={() => handleDelete(quiz._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
            {attempts[quiz._id] && (
              <div className="mt-4 border-t border-gray-50 pt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">Student Results</p>
                {attempts[quiz._id].length === 0
                  ? <p className="text-xs text-gray-400">No attempts yet</p>
                  : attempts[quiz._id].map(a => (
                    <div key={a._id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-700">{a.student?.name}</span>
                      <span className={`text-xs font-bold ${a.score >= 50 ? 'text-green-600' : 'text-red-500'}`}>{a.score}%</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHAT TAB
// ─────────────────────────────────────────────────────────────────────────────
function ChatTab({ role, userId, fixedContact }) {
  const [contacts, setContacts] = useState([]);
  const [active, setActive] = useState(fixedContact || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [mobilePage, setMobilePage] = useState('list'); // 'list' | 'chat'
  const bottomRef = useRef(null);

  useEffect(() => {
    if (fixedContact) {
      setActive(fixedContact);
    } else {
      api.get('/learning/chat-contacts').then(r => setContacts(r.data)).catch(() => {});
    }
  }, [fixedContact]);

  useEffect(() => {
    if (!active) return;
    api.get(`/learning/chat/${active._id}`).then(r => setMessages(r.data)).catch(() => {});
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim() || !active) return;
    try {
      const { data } = await api.post(`/learning/chat/${active._id}`, { text: text.trim() });
      setMessages(prev => [...prev, data]);
      setText('');
    } catch { toast.error('Failed to send'); }
  }

  function selectContact(c) {
    setActive(c);
    setMobilePage('chat');
  }

  const chatPanel = (
    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden" style={{ minHeight: 420 }}>
      {!active ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-8 text-center">
          Select a contact to start chatting
        </div>
      ) : (
        <>
          <div className="px-4 py-3.5 border-b border-gray-100 flex items-center gap-2.5">
            {!fixedContact && (
              <button
                className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-800 transition shrink-0"
                onClick={() => setMobilePage('list')}
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {active.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="font-semibold text-gray-800 text-sm">{active.name}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map(m => {
              const mine = String(m.sender?._id || m.sender) === String(userId);
              return (
                <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    mine ? 'bg-green-700 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="px-3 py-3 border-t border-gray-100 flex gap-2">
            <input
              className="flex-1 bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-300 transition"
              placeholder="Type a message…"
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button type="submit" disabled={!text.trim()}
              className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-white hover:bg-green-800 transition disabled:opacity-40 shrink-0">
              <Send size={15} />
            </button>
          </form>
        </>
      )}
    </div>
  );

  if (fixedContact) return chatPanel;

  return (
    <div className="flex flex-col md:flex-row gap-4" style={{ minHeight: 480 }}>
      {/* Contact list — full width on mobile, fixed sidebar on desktop */}
      <div className={`
        ${mobilePage === 'chat' ? 'hidden md:flex' : 'flex'}
        flex-col md:w-52 md:shrink-0
        bg-white rounded-2xl border border-gray-100 shadow-sm overflow-y-auto
      `}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 pt-4 pb-2">
          {role === 'tutor' ? 'Students' : 'Tutors'}
        </p>
        {contacts.length === 0 && (
          <p className="text-xs text-gray-400 px-4 pb-4">No conversations yet</p>
        )}
        {contacts.map(c => (
          <button key={c._id} onClick={() => selectContact(c)}
            className={`w-full text-left px-4 py-3 flex items-center gap-2.5 hover:bg-gray-50 transition ${active?._id === c._id ? 'bg-green-50' : ''}`}>
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {c.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 truncate">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Chat panel — hidden on mobile until contact selected */}
      <div className={`${mobilePage === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col`}>
        {chatPanel}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS TAB
// ─────────────────────────────────────────────────────────────────────────────
function ProgressTab({ role, userId, studentId }) {
  const targetId = studentId || userId;
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/learning/stats/${targetId}`),
      api.get('/learning/reports'),
    ]).then(([s, r]) => {
      setStats(s.data);
      const filtered = studentId
        ? r.data.filter(rep => String(rep.student?._id || rep.student) === String(studentId))
        : r.data;
      setReports(filtered);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [targetId, studentId]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Star}          label="Avg Quiz Score"    value={pct(stats.avgScore)}        color="green"  />
          <StatCard icon={ClipboardList} label="Quizzes Taken"     value={stats.quizzesAttempted}     color="blue"   />
          <StatCard icon={BookOpen}      label="Notes Available"   value={stats.notesCount}           color="purple" />
          <StatCard icon={CalendarCheck} label="Sessions Present"  value={
            stats.attendance.total ? `${stats.attendance.present}/${stats.attendance.total}` : '—'
          } color="orange" />
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Progress Reports</h3>
        {reports.length === 0 && <Empty text="No reports yet" />}
        {reports.map(r => (
          <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-800">{r.period}{r.subject ? ` — ${r.subject}` : ''}</p>
                {role === 'tutor' && r.student && <p className="text-xs text-gray-400">Student: {r.student.name}</p>}
                {r.tutor && <p className="text-xs text-gray-400">Tutor: {r.tutor.name}</p>}
              </div>
              {r.avgScore != null && (
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${r.avgScore >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {r.avgScore}%
                </span>
              )}
            </div>
            {r.summary && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{r.summary}</p>}
            {r.attendance && (
              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span>Present: <strong>{r.attendance.present}</strong></span>
                <span>Absent: <strong>{r.attendance.absent}</strong></span>
                <span>Total: <strong>{r.attendance.total}</strong></span>
              </div>
            )}
            {r.strengths?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Strengths</p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                  {r.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {r.improvements?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-orange-600 mb-1">Areas to improve</p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                  {r.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS TAB (tutor only)
// ─────────────────────────────────────────────────────────────────────────────
function ReportsTab({ studentId, studentName }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    subject: '', period: '', summary: '',
    avgScore: '', present: '', absent: '', total: '',
    strengths: '', improvements: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/learning/reports')
      .then(r => setReports(r.data.filter(rep => String(rep.student?._id || rep.student) === String(studentId))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.period) return toast.error('Period required');
    setCreating(true);
    try {
      const payload = {
        student: studentId,
        subject: form.subject || undefined,
        period: form.period,
        summary: form.summary || undefined,
        avgScore: form.avgScore ? Number(form.avgScore) : undefined,
        attendance: (form.present || form.absent || form.total) ? {
          present: Number(form.present) || 0,
          absent:  Number(form.absent)  || 0,
          total:   Number(form.total)   || 0,
        } : undefined,
        strengths:    form.strengths    ? form.strengths.split('\n').filter(Boolean)    : undefined,
        improvements: form.improvements ? form.improvements.split('\n').filter(Boolean) : undefined,
      };
      const { data } = await api.post('/learning/reports', payload);
      setReports(prev => [data, ...prev]);
      setForm({ subject: '', period: '', summary: '', avgScore: '', present: '', absent: '', total: '', strengths: '', improvements: '' });
      toast.success('Report saved');
    } catch { toast.error('Failed to save report'); }
    finally { setCreating(false); }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Plus size={16}/>Write Progress Report
        </h3>
        <p className="text-xs text-gray-400 mb-4">For: <strong>{studentName}</strong></p>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Period (e.g. May 2026) *" value={form.period}
              onChange={e => setForm(p => ({ ...p, period: e.target.value }))} />
            <input className="input" placeholder="Subject (optional)" value={form.subject}
              onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
          </div>
          <input className="input" type="number" min="0" max="100" placeholder="Average score %" value={form.avgScore}
            onChange={e => setForm(p => ({ ...p, avgScore: e.target.value }))} />
          <div className="grid grid-cols-3 gap-3">
            <input className="input" type="number" placeholder="Sessions present" value={form.present}
              onChange={e => setForm(p => ({ ...p, present: e.target.value }))} />
            <input className="input" type="number" placeholder="Sessions absent" value={form.absent}
              onChange={e => setForm(p => ({ ...p, absent: e.target.value }))} />
            <input className="input" type="number" placeholder="Total sessions" value={form.total}
              onChange={e => setForm(p => ({ ...p, total: e.target.value }))} />
          </div>
          <textarea className="input min-h-[80px]" placeholder="Summary / overall comments" value={form.summary}
            onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} />
          <textarea className="input min-h-[60px]" placeholder="Strengths (one per line)" value={form.strengths}
            onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))} />
          <textarea className="input min-h-[60px]" placeholder="Areas to improve (one per line)" value={form.improvements}
            onChange={e => setForm(p => ({ ...p, improvements: e.target.value }))} />
          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? 'Saving…' : 'Save Report'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Previous Reports for {studentName}</h3>
        {reports.length === 0 && <Empty text="No reports written yet" />}
        {reports.map(r => (
          <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-3">
            <div className="flex items-start justify-between">
              <p className="font-semibold text-gray-800">{r.period}{r.subject ? ` — ${r.subject}` : ''}</p>
              {r.avgScore != null && (
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${r.avgScore >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {r.avgScore}%
                </span>
              )}
            </div>
            {r.summary && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{r.summary}</p>}
            {r.attendance && (
              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span>Present: <strong>{r.attendance.present}</strong></span>
                <span>Absent: <strong>{r.attendance.absent}</strong></span>
                <span>Total: <strong>{r.attendance.total}</strong></span>
              </div>
            )}
            {r.strengths?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-green-700 mb-1">Strengths</p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">{r.strengths.map((s,i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {r.improvements?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-orange-600 mb-1">Areas to improve</p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">{r.improvements.map((s,i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB
// ─────────────────────────────────────────────────────────────────────────────
function OverviewTab({ role, userId, studentId, studentName, setTab }) {
  const targetId = studentId || userId;
  const [stats, setStats] = useState(null);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    api.get('/learning/notes').then(r => {
      const filtered = studentId
        ? r.data.filter(n => !n.student || String(n.student?._id || n.student) === String(studentId))
        : r.data;
      setNotes(filtered.slice(0, 3));
    }).catch(() => {});
    api.get('/learning/quizzes').then(r => {
      const filtered = studentId
        ? r.data.filter(q => !q.student || String(q.student?._id || q.student) === String(studentId))
        : r.data;
      setQuizzes(filtered.slice(0, 3));
    }).catch(() => {});
    if (targetId) {
      api.get(`/learning/stats/${targetId}`).then(r => setStats(r.data)).catch(() => {});
    }
  }, [targetId, studentId]);

  return (
    <div className="space-y-6">
      {studentName && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-green-900">{studentName}</p>
            <p className="text-xs text-green-600">Viewing this student's learning dashboard</p>
          </div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Star}          label="Avg Quiz Score"   value={pct(stats.avgScore)}    color="green"  />
          <StatCard icon={ClipboardList} label="Quizzes Taken"    value={stats.quizzesAttempted} color="blue"   />
          <StatCard icon={BookOpen}      label="Notes"            value={stats.notesCount}       color="purple" />
          <StatCard icon={CalendarCheck} label="Attendance"       value={
            stats.attendance.total ? `${stats.attendance.present}/${stats.attendance.total}` : '—'
          } color="orange" />
        </div>
      )}

      {role === 'tutor' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TUTOR_TABS.filter(t => t.id !== 'overview').map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left flex items-center gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={16} className="text-green-700" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Recent Notes</p>
          {notes.length === 0 ? <p className="text-xs text-gray-400">No notes yet</p> : notes.map(n => (
            <div key={n._id} className="py-2 border-b border-gray-50 last:border-0">
              <p className="text-sm font-medium text-gray-700">{n.title}</p>
              {n.subject && <p className="text-xs text-green-600">{n.subject}</p>}
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-3">Recent Quizzes</p>
          {quizzes.length === 0 ? <p className="text-xs text-gray-400">No quizzes yet</p> : quizzes.map(q => (
            <div key={q._id} className="py-2 border-b border-gray-50 last:border-0">
              <p className="text-sm font-medium text-gray-700">{q.title}</p>
              <p className="text-xs text-gray-400">{q.questions?.length || 0} questions</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE CLASS TAB
// ─────────────────────────────────────────────────────────────────────────────

// Extract roomId from a callLink (supports /learning?session= and legacy /classroom/)
function extractRoomId(callLink) {
  if (!callLink) return null;
  const s = callLink.match(/[?&]session=([^&]+)/);
  if (s) return s[1];
  const c = callLink.match(/\/classroom\/([^?#]+)/);
  if (c) return c[1];
  return null;
}

// ── Shared Files Panel ───────────────────────────────────────────────────────
function LiveFilesPanel({ roomId, role }) {
  const [files, setFiles]       = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    api.get(`/classroom/${roomId}`)
      .then(({ data }) => setFiles(data.room?.sharedFiles || []))
      .catch(() => {});
  }, [roomId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post(`/classroom/${roomId}/files`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFiles(data.room?.sharedFiles || []);
      toast.success('File shared with the class');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const extIcon = (name = '') => {
    const ext = name.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['doc','docx'].includes(ext)) return '📝';
    if (['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼️';
    if (['mp4','mov','avi'].includes(ext)) return '🎬';
    return '📁';
  };

  return (
    <div className="flex flex-col h-full">
      {role === 'tutor' && (
        <div className="shrink-0 pb-3 border-b border-gray-100">
          <input type="file" ref={fileRef} className="hidden" onChange={handleUpload} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition text-sm">
            <Upload size={14} /> {uploading ? 'Uploading…' : 'Share File with Class'}
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto space-y-2 pt-3">
        {files.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No files shared yet</p>
        ) : (
          files.map((f, i) => (
            <a key={i} href={f.fileUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-xl transition group">
              <span className="text-xl shrink-0">{extIcon(f.name)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                <p className="text-xs text-gray-400">{f.uploadedBy}</p>
              </div>
              <Download size={14} className="text-gray-300 group-hover:text-green-600 shrink-0" />
            </a>
          ))
        )}
      </div>
    </div>
  );
}

// ── Homework Panel ───────────────────────────────────────────────────────────
function LiveHomeworkPanel({ roomId, role, userId }) {
  const [homeworks, setHomeworks]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [creating, setCreating]     = useState(false);
  const [form, setForm]             = useState({ title: '', description: '', dueDate: '' });

  const load = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/homework?roomId=${roomId}`);
      setHomeworks(data.homeworks || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [roomId]);

  useEffect(() => { load(); }, [load]);

  const createHw = async (e) => {
    e.preventDefault();
    if (!form.title) return toast.error('Title required');
    setCreating(true);
    try {
      await api.post('/homework', { ...form, roomId });
      setForm({ title: '', description: '', dueDate: '' });
      toast.success('Homework assigned');
      load();
    } catch { toast.error('Failed to assign homework'); }
    finally { setCreating(false); }
  };

  const submitHw = async (hwId, text) => {
    try {
      await api.patch(`/homework/${hwId}/submit`, { submission: { text } });
      toast.success('Submitted!');
      load();
    } catch { toast.error('Submit failed'); }
  };

  const gradeHw = async (hwId, score, feedback) => {
    try {
      await api.patch(`/homework/${hwId}/grade`, { grade: { score, feedback } });
      toast.success('Graded');
      load();
    } catch { toast.error('Grade failed'); }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-green-200 border-t-green-700 rounded-full animate-spin" /></div>;

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {role === 'tutor' && (
        <form onSubmit={createHw} className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-2 shrink-0">
          <p className="text-xs font-bold text-green-800 mb-1">Assign Homework</p>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 resize-none"
            placeholder="Instructions (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
            value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
          <button type="submit" disabled={creating}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition">
            {creating ? 'Assigning…' : 'Assign'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {homeworks.length === 0 && <p className="text-center text-sm text-gray-400 py-6">No homework yet</p>}
        {homeworks.map(hw => (
          <HwCard key={hw._id} hw={hw} role={role} userId={userId} onSubmit={submitHw} onGrade={gradeHw} />
        ))}
      </div>
    </div>
  );
}

function HwCard({ hw, role, onSubmit, onGrade }) {
  const [submitting, setSubmitting] = useState(false);
  const [grading, setGrading]       = useState(false);
  const [text, setText]             = useState('');
  const [score, setScore]           = useState('');
  const [feedback, setFeedback]     = useState('');

  const statusColor = {
    assigned:  'bg-blue-100 text-blue-700',
    submitted: 'bg-amber-100 text-amber-700',
    graded:    'bg-green-100 text-green-700',
  }[hw.status] || 'bg-gray-100 text-gray-500';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-gray-900">{hw.title}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}>{hw.status}</span>
      </div>
      {hw.description && <p className="text-xs text-gray-500">{hw.description}</p>}
      {hw.dueDate && (
        <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> Due {new Date(hw.dueDate).toLocaleDateString()}</p>
      )}

      {/* Student: submit */}
      {role === 'student' && hw.status === 'assigned' && (
        <div className="space-y-1 pt-1">
          <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-green-400 resize-none"
            placeholder="Your answer…" value={text} onChange={e => setText(e.target.value)} />
          <button disabled={submitting || !text} onClick={async () => { setSubmitting(true); await onSubmit(hw._id, text); setSubmitting(false); }}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-1.5 rounded-lg text-xs transition">
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      )}

      {/* Submission display */}
      {hw.submission?.text && (
        <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600">
          <p className="font-semibold text-gray-700 mb-0.5">Student answer:</p>
          <p>{hw.submission.text}</p>
        </div>
      )}

      {/* Tutor: grade */}
      {role === 'tutor' && hw.status === 'submitted' && (
        <div className="space-y-1 pt-1">
          <input type="number" min={0} max={100} placeholder="Score /100"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-green-400"
            value={score} onChange={e => setScore(e.target.value)} />
          <input placeholder="Feedback (optional)"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-green-400"
            value={feedback} onChange={e => setFeedback(e.target.value)} />
          <button disabled={grading || !score} onClick={async () => { setGrading(true); await onGrade(hw._id, Number(score), feedback); setGrading(false); }}
            className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white font-semibold py-1.5 rounded-lg text-xs transition">
            {grading ? 'Grading…' : 'Submit Grade'}
          </button>
        </div>
      )}

      {/* Grade display */}
      {hw.grade?.score != null && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-2.5 text-xs">
          <p className="font-bold text-green-800">Grade: {hw.grade.score}/100</p>
          {hw.grade.feedback && <p className="text-green-700 mt-0.5">{hw.grade.feedback}</p>}
        </div>
      )}
    </div>
  );
}

// ── Live Session View ────────────────────────────────────────────────────────
function LiveSessionView({ session, role, roomId, onLeave }) {
  const [panel, setPanel] = useState('board');

  const subject    = session.notes?.match(/Subject: ([^|]+)/)?.[1]?.trim()
    || session.notes?.slice(0, 50) || 'Live Class';
  const tutorName  = session.notes?.match(/Tutor: ([^|]+)/)?.[1]?.trim();
  const studentName = session.user?.name || session.name || 'Student';
  const counterpart = role === 'student' ? tutorName : studentName;

  // Jitsi room — unique per booking, sanitized
  const jitsiRoom = `NaijaOverseas-${roomId.replace(/[^a-zA-Z0-9]/g, '-')}`;
  const jitsiUrl  = `https://meet.jit.si/${jitsiRoom}`;

  const panels = [
    { id: 'board',    label: 'Whiteboard', Icon: PenLine    },
    { id: 'files',    label: 'Files',      Icon: FolderOpen },
    { id: 'homework', label: 'Homework',   Icon: BookOpen   },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* Session header */}
      <div className="flex items-center gap-3 bg-gray-900 rounded-2xl px-5 py-3.5 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse shrink-0" />
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{subject}</p>
            {counterpart && (
              <p className="text-gray-400 text-xs truncate">
                {role === 'student' ? 'Tutor' : 'Student'}: {counterpart} · {session.timeSlot}
              </p>
            )}
          </div>
        </div>
        <ClassCountdown date={session.date} timeSlot={session.timeSlot} />
        <button onClick={onLeave}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition shrink-0">
          <X size={12} /> Leave
        </button>
      </div>

      {/* Main area: video + side panel */}
      <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">

        {/* Jitsi video embed */}
        <div className="xl:flex-1 min-w-0">
          <div className="relative bg-gray-950 rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={jitsiUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="absolute inset-0 w-full h-full border-0"
              title="Live Class Video"
            />
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            Powered by Jitsi Meet · Room: {jitsiRoom}
          </p>
        </div>

        {/* Tools side panel */}
        <div className="xl:w-80 flex flex-col min-h-0">
          {/* Panel tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1 shrink-0 mb-3">
            {panels.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setPanel(id)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition ${
                  panel === id ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          {/* Panel content — fixed height */}
          <div className="flex-1 min-h-0 rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm"
               style={{ height: '420px' }}>
            {panel === 'board' && (
              <LiveWhiteboard roomId={roomId} isTutor={role === 'tutor'} />
            )}
            {panel === 'files' && (
              <div className="p-4 h-full overflow-y-auto">
                <LiveFilesPanel roomId={roomId} role={role} />
              </div>
            )}
            {panel === 'homework' && (
              <div className="p-4 h-full overflow-y-auto">
                <LiveHomeworkPanel roomId={roomId} role={role} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Schedule View (no active session) ───────────────────────────────────────
function SessionScheduleView({ sessions, role, onEnterSession }) {
  const upcoming = sessions
    .filter(s => s.status === 'confirmed')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Today banner */}
      <TodayScheduleBanner sessions={sessions} role={role} />

      {/* Upcoming list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">Upcoming Sessions</h3>
        </div>
        {upcoming.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Radio size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No upcoming sessions confirmed</p>
            <p className="text-xs text-gray-400 mt-1">Sessions appear here once your tutor confirms them</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {upcoming.map(s => {
              const subject = s.notes?.match(/Subject: ([^|]+)/)?.[1]?.trim()
                || s.notes?.slice(0, 40) || 'Tutoring Session';
              const tutorName = s.notes?.match(/Tutor: ([^|]+)/)?.[1]?.trim();
              const studentName = s.user?.name || s.name || 'Student';
              const counterpart = role === 'student' ? tutorName : studentName;
              const roomId = extractRoomId(s.callLink);

              return (
                <div key={s._id} className="px-5 py-4 flex items-center gap-4">
                  {/* Date block */}
                  <div className="shrink-0 text-center bg-gray-50 rounded-xl px-3 py-2 min-w-[64px]">
                    <p className="text-[9px] font-bold text-gray-400 uppercase">
                      {new Date(s.date).toLocaleDateString('en-GB', { month: 'short' })}
                    </p>
                    <p className="text-xl font-extrabold text-gray-900 leading-tight">
                      {new Date(s.date).getDate()}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{subject}</p>
                    {counterpart && (
                      <p className="text-xs text-gray-500 truncate">
                        {role === 'student' ? 'with' : 'Student:'} {counterpart}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} /> {s.timeSlot}
                      </span>
                      <ClassCountdown date={s.date} timeSlot={s.timeSlot} />
                    </div>
                  </div>

                  {/* Enter button */}
                  {roomId && (
                    <button onClick={() => onEnterSession(s, roomId)}
                      className="shrink-0 flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs font-bold px-3 py-2 rounded-xl transition">
                      <Video size={12} /> Enter
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="bg-linear-to-br from-green-700 to-emerald-700 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Radio size={22} className="text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">How Live Classes Work</h3>
            <ul className="text-green-100 text-sm mt-2 space-y-1">
              <li>• Book a session with your tutor from the dashboard</li>
              <li>• Once confirmed, your class appears here</li>
              <li>• Enter up to 10 minutes before your scheduled time</li>
              <li>• Video · Whiteboard · Files · Homework — all in one place</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main LiveClassTab ────────────────────────────────────────────────────────
function LiveClassTab({ role, userId }) {
  const [searchParams] = useSearchParams();
  const sessionParam   = searchParams.get('session');

  const [sessions,      setSessions]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [activeRoomId,  setActiveRoomId]  = useState(null);

  useEffect(() => {
    const endpoint = role === 'tutor'
      ? '/tutors/me/bookings'
      : '/bookings/my?service=tutoring-session';

    api.get(endpoint)
      .then(({ data }) => {
        const all = (data.bookings || []).filter(b => b.status === 'confirmed');
        setSessions(all);
        // Auto-enter session if ?session= param is present in URL
        if (sessionParam) {
          const match = all.find(b => extractRoomId(b.callLink) === sessionParam);
          if (match) {
            setActiveSession(match);
            setActiveRoomId(sessionParam);
          } else {
            // Session param given but no matching booking — treat as ad-hoc room
            setActiveRoomId(sessionParam);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [role, sessionParam]);

  const enterSession = (session, roomId) => {
    setActiveSession(session);
    setActiveRoomId(roomId);
  };

  const leaveSession = () => {
    setActiveSession(null);
    setActiveRoomId(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
    </div>
  );

  if (activeRoomId) {
    return (
      <LiveSessionView
        session={activeSession || { date: new Date().toISOString(), timeSlot: '', notes: 'Ad-hoc Session', name: '' }}
        role={role}
        roomId={activeRoomId}
        onLeave={leaveSession}
      />
    );
  }

  return (
    <SessionScheduleView
      sessions={sessions}
      role={role}
      onEnterSession={enterSession}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI helpers
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    green:  'bg-green-50 text-green-700',
    blue:   'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon size={17} />
      </div>
      <p className="text-xl font-bold text-gray-900">{value ?? '—'}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function LearningDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null); // tutor only

  const [searchParams] = useSearchParams();

  const role = user?.role || 'student';
  const userId = user?._id || user?.id;

  const tabs = role === 'tutor' ? TUTOR_TABS : role === 'parent' ? PARENT_TABS : STUDENT_TABS;

  const isTutorWithStudent = role === 'tutor' && selectedStudent;

  // Auto-switch to Live Class tab when ?session= param is in the URL
  useEffect(() => {
    if (searchParams.get('session')) setTab('liveclass');
  }, [searchParams]);

  function handleLogout() { logout(); navigate('/'); }

  function renderTab() {
    const sid = selectedStudent?._id;
    const sname = selectedStudent?.name;
    switch (tab) {
      case 'overview':   return <OverviewTab role={role} userId={userId} studentId={sid} studentName={sname} setTab={setTab} />;
      case 'liveclass':  return <LiveClassTab role={role} userId={userId} />;
      case 'notes':      return <NotesTab role={role} studentId={sid} />;
      case 'quizzes':    return <QuizzesTab role={role} studentId={sid} />;
      case 'chat':       return <ChatTab role={role} userId={userId} fixedContact={isTutorWithStudent ? selectedStudent : undefined} />;
      case 'progress':   return <ProgressTab role={role} userId={userId} studentId={sid} />;
      case 'reports':    return isTutorWithStudent ? <ReportsTab studentId={sid} studentName={sname} /> : null;
      default:           return null;
    }
  }

  const dashLink = role === 'tutor' ? '/dashboard/tutor'
    : role === 'parent' ? '/dashboard/parent'
    : '/dashboard/student';

  const pageTitle = tab === 'overview' && isTutorWithStudent
    ? `${selectedStudent.name}'s Overview`
    : tabs.find(t => t.id === tab)?.label || 'Learning Hub';

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-xl flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Learning Hub</p>
              <p className="text-xs text-gray-400 capitalize">{role} portal</p>
            </div>
          </div>
        </div>

        {/* Student badge (tutor) */}
        {isTutorWithStudent && (
          <div className="mx-3 mt-3 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <div className="w-7 h-7 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {selectedStudent.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-green-900 truncate">{selectedStudent.name}</p>
              <p className="text-[10px] text-green-600">Selected student</p>
            </div>
            <button onClick={() => { setSelectedStudent(null); setTab('overview'); }}
              className="text-green-400 hover:text-green-700 transition shrink-0">
              <ChevronLeft size={14} />
            </button>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-1">
          {/* Tutor: show student picker option when no student is selected */}
          {/* Live Class is always accessible — no student selection needed */}
          <button onClick={() => { setTab('liveclass'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              tab === 'liveclass' ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}>
            <Radio size={16} className="shrink-0" />
            Live Class
            {tab !== 'liveclass' && <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
          </button>

          {role === 'tutor' && !selectedStudent && (
            <div className="px-4 py-3 text-xs text-gray-400 italic">
              Select a student below to unlock other tabs
            </div>
          )}

          {(isTutorWithStudent || role !== 'tutor') && tabs.filter(t => t.id !== 'liveclass').map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                tab === id ? 'bg-green-700 text-white shadow-lg shadow-green-900/20' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon size={16} className="shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button onClick={() => navigate(dashLink)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition font-medium">
            <LayoutDashboard size={15} /> Back to Dashboard
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition font-medium">
            <LogOut size={15} /> Log out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center gap-4">
          <button className="lg:hidden text-gray-600 hover:text-gray-900" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          {/* Back to student list (tutor with student selected) */}
          {isTutorWithStudent && (
            <button onClick={() => { setSelectedStudent(null); setTab('overview'); }}
              className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition font-medium">
              <ChevronLeft size={16} /> All Students
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 text-base truncate">{pageTitle}</h1>
            <p className="text-xs text-gray-400 capitalize">{user?.name} · {role}</p>
          </div>
          <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto">
          {/* Tutor: show student picker when no student selected */}
          {role === 'tutor' && !selectedStudent
            ? <StudentPicker onSelect={s => { setSelectedStudent(s); setTab('overview'); }} />
            : renderTab()
          }
        </main>
      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          background: white;
        }
        .input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px #bbf7d0; }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          background: #15803d;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.625rem 1.25rem;
          border-radius: 0.75rem;
          transition: background 0.15s;
          cursor: pointer;
        }
        .btn-primary:hover { background: #166534; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
