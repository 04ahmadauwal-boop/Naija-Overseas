import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  FolderOpen,
  CalendarCheck,
  FileText,
  School,
  Settings,
  Menu,
  X,
  GraduationCap,
  LogOut,
  Video,
  Phone,
  CheckCircle2,
  Clock,
  Circle,
  ChevronRight,
  BookOpen,
  Plus,
  ExternalLink,
  Upload,
  User,
  Globe,
  MapPin,
  Star,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------------------------
const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'applications', label: 'My Applications', icon: FolderOpen },
  { id: 'consultations', label: 'Consultations', icon: CalendarCheck },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'universities', label: 'Universities', icon: School },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const BOTTOM_TABS = [
  { id: 'overview', label: 'Home', icon: LayoutDashboard },
  { id: 'applications', label: 'Apps', icon: FolderOpen },
  { id: 'documents', label: 'Docs', icon: FileText },
  { id: 'consultations', label: 'Book', icon: CalendarCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Country → ISO flag code map
const COUNTRY_FLAG_MAP = {
  'United Kingdom': 'gb',
  UK: 'gb',
  Canada: 'ca',
  'United States': 'us',
  USA: 'us',
  Australia: 'au',
  Germany: 'de',
  Ireland: 'ie',
  Netherlands: 'nl',
  'New Zealand': 'nz',
};

const DESTINATION_COUNTRIES = [
  'United Kingdom',
  'Canada',
  'United States',
  'Australia',
  'Germany',
  'Ireland',
  'Netherlands',
  'New Zealand',
];

const INTAKE_OPTIONS = [
  'Sep 2025', 'Jan 2026', 'May 2026', 'Sep 2026', 'Jan 2027',
];

const TIMESLOT_OPTIONS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

const QUALIFICATION_OPTIONS = [
  'WAEC / SSCE', 'OND / NCE', 'HND', "Bachelor's Degree",
  "Master's Degree", 'PhD',
];

const STATIC_DOCS = [
  { name: 'WAEC/NECO Certificate', required: true },
  { name: 'University Transcript', required: true },
  { name: 'IELTS Score Report', required: true },
  { name: 'Personal Statement', required: true },
  { name: 'Reference Letter 1', required: true },
  { name: 'Reference Letter 2', required: true },
  { name: 'International Passport', required: true },
  { name: 'Bank Statement', required: false },
];

const MOCK_UNIVERSITIES = [
  {
    id: 1,
    name: 'University College London',
    code: 'gb',
    country: 'United Kingdom',
    rank: '#8 World',
    programs: ['Computer Science', 'Data Science', 'AI & ML'],
    tuition: '£28,000 / yr',
  },
  {
    id: 2,
    name: 'University of Toronto',
    code: 'ca',
    country: 'Canada',
    rank: '#21 World',
    programs: ['Data Science', 'Engineering', 'Business'],
    tuition: 'CA$45,000 / yr',
  },
  {
    id: 3,
    name: 'University of Michigan',
    code: 'us',
    country: 'United States',
    rank: '#23 World',
    programs: ['Software Eng.', 'CS', 'Information Science'],
    tuition: '$52,000 / yr',
  },
  {
    id: 4,
    name: 'University of Melbourne',
    code: 'au',
    country: 'Australia',
    rank: '#33 World',
    programs: ['Computer Science', 'Engineering', 'IT'],
    tuition: 'A$42,000 / yr',
  },
  {
    id: 5,
    name: 'TU Delft',
    code: 'nl',
    country: 'Netherlands',
    rank: '#47 World',
    programs: ['Engineering', 'Computer Science', 'Applied Physics'],
    tuition: '€18,000 / yr',
  },
  {
    id: 6,
    name: 'University of Edinburgh',
    code: 'gb',
    country: 'United Kingdom',
    rank: '#27 World',
    programs: ['Informatics', 'AI', 'Data Science'],
    tuition: '£24,000 / yr',
  },
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------
function StatusBadge({ status }) {
  const map = {
    submitted: 'bg-blue-100 text-blue-700',
    'in-review': 'bg-yellow-100 text-yellow-700',
    'documents-requested': 'bg-orange-100 text-orange-700',
    admitted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    uploaded: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    'not-started': 'bg-gray-100 text-gray-500',
    upcoming: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-100 text-red-600',
  };
  const labels = {
    submitted: 'Submitted',
    'in-review': 'In Review',
    'documents-requested': 'Docs Requested',
    admitted: 'Admitted',
    rejected: 'Rejected',
    uploaded: 'Uploaded',
    pending: 'Pending',
    'not-started': 'Not Started',
    upcoming: 'Upcoming',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {labels[status] || status}
    </span>
  );
}

function FlagImg({ code, size = 20 }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={code}
      className="rounded-sm object-cover shrink-0"
      style={{ width: size, height: Math.round(size * 0.67) }}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
}

function flagCode(destinationCountry) {
  return COUNTRY_FLAG_MAP[destinationCountry] || 'ng';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Derive progress steps from the most recent application's status
function deriveProgressSteps(applications) {
  const ORDER = ['submitted', 'in-review', 'documents-requested', 'admitted'];
  const latest = applications[0];
  const currentStatus = latest?.status || null;

  const steps = [
    { label: 'Profile Submitted', key: 'submitted' },
    { label: 'Documents Uploaded', key: 'documents-requested' },
    { label: 'University Review', key: 'in-review' },
    { label: 'Offer Received', key: 'admitted' },
  ];

  // Map application statuses to step progression
  const statusProgressMap = {
    submitted: 0,
    'in-review': 2,
    'documents-requested': 1,
    admitted: 3,
    rejected: 3,
  };

  const currentStep = currentStatus !== null ? (statusProgressMap[currentStatus] ?? 0) : -1;

  return steps.map((step, i) => ({
    ...step,
    done: i < currentStep,
    active: i === currentStep,
  }));
}

// ---------------------------------------------------------------------------
// APPLY NOW MODAL
// ---------------------------------------------------------------------------
function ApplyModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    destinationCountry: 'United Kingdom',
    university: '',
    program: '',
    intake: 'Sep 2025',
    phone: '',
    currentQualification: "Bachelor's Degree",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.university.trim() || !form.program.trim()) {
      toast.error('Please fill in university and program');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/study-abroad', {
        fullName: user?.name || '',
        email: user?.email || '',
        phone: form.phone,
        destinationCountry: form.destinationCountry,
        university: form.university,
        program: form.program,
        intake: form.intake,
        currentQualification: form.currentQualification,
      });
      toast.success('Application submitted successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900">Apply to a University</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Destination Country
            </label>
            <select
              name="destinationCountry"
              value={form.destinationCountry}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
            >
              {DESTINATION_COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              University Name
            </label>
            <input
              type="text"
              name="university"
              value={form.university}
              onChange={handleChange}
              required
              placeholder="e.g. University of Leeds"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Program / Course
            </label>
            <input
              type="text"
              name="program"
              value={form.program}
              onChange={handleChange}
              required
              placeholder="e.g. MSc Computer Science"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Intake
              </label>
              <select
                name="intake"
                value={form.intake}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
              >
                {INTAKE_OPTIONS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Qualification
              </label>
              <select
                name="currentQualification"
                value={form.currentQualification}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
              >
                {QUALIFICATION_OPTIONS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+234 800 000 0000"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          {/* Pre-filled read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Name (from profile)
              </label>
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Email (from profile)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TAB COMPONENTS
// ---------------------------------------------------------------------------

function OverviewTab({ user, applications, consultations, loading, setActiveTab }) {
  const activeApps = applications.filter(
    (a) => !['admitted', 'rejected'].includes(a.status)
  ).length;

  const upcomingConsults = consultations.filter((c) => ['pending', 'confirmed', 'upcoming'].includes(c.status));
  const upcoming = upcomingConsults[0] || null;

  // Documents pending: count how many STATIC_DOCS are not "uploaded"
  // Since we have no real doc upload status, we show action-required count based on applications
  const docsActionRequired = applications.filter((a) => a.status === 'documents-requested').length;

  const progressSteps = deriveProgressSteps(applications);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-green-800 via-green-700 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-black/10 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <span>Study Abroad Journey</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-extrabold leading-snug">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-green-200 text-sm mt-1">
            Your international education journey is underway. Keep pushing!
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        <button
          onClick={() => setActiveTab('applications')}
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
            <FolderOpen size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {loading ? '…' : activeApps}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Active Applications</div>
        </button>

        <button
          onClick={() => setActiveTab('consultations')}
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
            <CalendarCheck size={18} className="text-green-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {loading ? '…' : upcomingConsults.length}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Upcoming Consults</div>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center mb-3">
            <AlertCircle size={18} className="text-orange-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {loading ? '…' : docsActionRequired}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Docs Action Required</div>
        </button>
      </div>

      {/* Applications Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">My Applications</h2>
          <button
            onClick={() => setActiveTab('applications')}
            className="text-xs text-green-700 font-semibold hover:underline flex items-center gap-1"
          >
            View all <ChevronRight size={13} />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="px-5 py-6 text-center text-sm text-gray-400">Loading…</div>
          ) : applications.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-gray-400">No applications yet</div>
          ) : (
            applications.slice(0, 3).map((app) => (
              <div key={app._id} className="flex items-center gap-3 px-5 py-3.5">
                <FlagImg code={flagCode(app.destinationCountry)} size={22} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{app.university}</p>
                  <p className="text-xs text-gray-400 truncate">{app.program} · {app.intake}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom row: Upcoming Consultation + Progress Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Upcoming Consultation */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CalendarCheck size={15} className="text-green-700" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">Upcoming Consultation</h2>
          </div>
          {loading ? (
            <div className="text-center py-6 text-sm text-gray-400">Loading…</div>
          ) : upcoming ? (
            <div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-gray-900">{upcoming.notes || 'Consultation session'}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                    <Clock size={12} className="text-gray-400" />
                    {formatDate(upcoming.date)}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                    <Video size={12} className="text-gray-400" />
                    {upcoming.timeSlot}
                  </span>
                </div>
              </div>
              {upcoming?.callLink ? (
                <a href={upcoming.callLink} target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition">
                  <Video size={14} /> Join Call
                </a>
              ) : (
                <span className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 py-2.5 rounded-xl text-sm font-semibold cursor-default">
                  <Video size={14} /> Awaiting Link
                </span>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <CalendarCheck size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No upcoming consultations</p>
              <button
                onClick={() => setActiveTab('consultations')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full hover:bg-green-100 transition"
              >
                <Plus size={12} /> Book a session
              </button>
            </div>
          )}
        </div>

        {/* Application Progress Stepper */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={15} className="text-purple-700" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">Application Progress</h2>
          </div>
          {loading ? (
            <div className="text-center py-6 text-sm text-gray-400">Loading…</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-6">
              <Circle size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Submit an application to track progress</p>
            </div>
          ) : (
            <div className="space-y-0">
              {progressSteps.map((step, i) => (
                <div key={step.label} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        step.done
                          ? 'bg-green-600 border-green-600'
                          : step.active
                          ? 'bg-white border-green-500 ring-4 ring-green-100'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      {step.done ? (
                        <CheckCircle2 size={14} className="text-white" />
                      ) : step.active ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      ) : (
                        <Circle size={12} className="text-gray-300" />
                      )}
                    </div>
                    {i < progressSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-7 mt-0.5 ${step.done ? 'bg-green-400' : 'bg-gray-100'}`}
                      />
                    )}
                  </div>
                  <div className="pt-1 pb-5">
                    <p
                      className={`text-sm font-semibold leading-tight ${
                        step.done ? 'text-gray-900' : step.active ? 'text-green-700' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.active && (
                      <p className="text-xs text-green-600 mt-0.5 font-medium">In progress</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplicationsTab({ user, applications, loading, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [showApplyModal, setShowApplyModal] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'in-review', label: 'In Review' },
    { value: 'documents-requested', label: 'Docs Requested' },
    { value: 'admitted', label: 'Admitted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const filtered =
    filter === 'all'
      ? applications
      : applications.filter((a) => a.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">My Applications</h2>
        <button
          onClick={() => setShowApplyModal(true)}
          className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition"
        >
          <Plus size={14} /> Apply Now
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === opt.value
                ? 'bg-green-700 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading your applications…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <FolderOpen size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-4">
            {filter === 'all' ? "You haven't applied anywhere yet" : 'No applications match this filter'}
          </p>
          <button
            onClick={() => setShowApplyModal(true)}
            className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition"
          >
            <Plus size={14} /> Apply Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-5">University / Program</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Intake</div>
            <div className="col-span-2">Submitted</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.map((app) => (
              <div
                key={app._id}
                className="px-5 py-4 flex flex-col sm:grid sm:grid-cols-12 sm:items-center gap-2 sm:gap-3 hover:bg-gray-50 transition-colors"
              >
                {/* University */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <FlagImg code={flagCode(app.destinationCountry)} size={24} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{app.university}</p>
                    <p className="text-xs text-gray-400 truncate">{app.program}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 flex sm:block items-center gap-2">
                  <span className="sm:hidden text-xs text-gray-400">Status:</span>
                  <StatusBadge status={app.status} />
                </div>

                {/* Intake */}
                <div className="col-span-2 flex items-center gap-2">
                  <span className="sm:hidden text-xs text-gray-400">Intake:</span>
                  <span className="text-sm text-gray-600">{app.intake}</span>
                </div>

                {/* Submitted */}
                <div className="col-span-2 flex items-center gap-2">
                  <span className="sm:hidden text-xs text-gray-400">Submitted:</span>
                  <span className="text-sm text-gray-400">{formatDate(app.createdAt)}</span>
                </div>

                {/* Action */}
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => toast('Application detail view coming soon', { icon: '📋' })}
                    className="text-green-700 hover:text-green-800 text-xs font-semibold flex items-center gap-1 hover:underline"
                  >
                    Details <ExternalLink size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showApplyModal && (
        <ApplyModal
          user={user}
          onClose={() => setShowApplyModal(false)}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}

function ConsultationsTab({ user, consultations, loading, onRefresh }) {
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookForm, setBookForm] = useState({
    date: '',
    timeSlot: '10:00 AM',
    notes: '',
  });
  const [booking, setBooking] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Separate upcoming vs past/cancelled
  const upcoming = consultations.filter(
    (c) => c.status === 'upcoming' || c.status === 'confirmed'
  );
  const past = consultations.filter(
    (c) => c.status !== 'upcoming' && c.status !== 'confirmed'
  );

  const handleBookChange = (e) => setBookForm({ ...bookForm, [e.target.name]: e.target.value });

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.date) {
      toast.error('Please select a date');
      return;
    }
    setBooking(true);
    try {
      await api.post('/bookings', {
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        service: 'study-abroad-consultation',
        date: bookForm.date,
        timeSlot: bookForm.timeSlot,
        notes: bookForm.notes,
      });
      toast.success('Consultation booked successfully!');
      setShowBookForm(false);
      setBookForm({ date: '', timeSlot: '10:00 AM', notes: '' });
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to book consultation');
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id) => {
    // Optimistic UI
    setCancellingId(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Consultations</h2>
        <button
          onClick={() => setShowBookForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition self-start sm:self-auto"
        >
          <Plus size={14} /> {showBookForm ? 'Close Form' : 'Book New Consultation'}
        </button>
      </div>

      {/* Book Consultation Form */}
      {showBookForm && (
        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4">Book a Consultation</h3>
          <form onSubmit={handleBookSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={bookForm.date}
                  onChange={handleBookChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Time Slot
                </label>
                <select
                  name="timeSlot"
                  value={bookForm.timeSlot}
                  onChange={handleBookChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
                >
                  {TIMESLOT_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t} WAT</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Notes / Topic (optional)
              </label>
              <textarea
                name="notes"
                value={bookForm.notes}
                onChange={handleBookChange}
                rows={3}
                placeholder="e.g. I want help shortlisting UK universities for MSc programs"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowBookForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={booking}
                className="flex-1 bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {booking ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking…</>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading consultations…</p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Upcoming</h3>
            {upcoming.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                <CalendarCheck size={32} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No upcoming consultations scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white rounded-2xl border-l-4 border-green-500 shadow-sm p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={c.status} />
                          <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <Video size={11} /> Video
                          </span>
                        </div>
                        <p className="font-bold text-gray-900">{c.notes || 'Study Abroad Consultation'}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Clock size={11} className="text-gray-400" />
                            {formatDate(c.date)}
                          </span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-600">{c.timeSlot} WAT</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {c.callLink ? (
                          <a
                            href={c.callLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-800 transition"
                          >
                            <Video size={14} /> Join Call
                          </a>
                        ) : (
                          <span className="flex items-center gap-2 bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-sm font-semibold cursor-default">
                            <Video size={14} /> Awaiting Link
                          </span>
                        )}
                        <button
                          onClick={() => handleCancel(c._id)}
                          disabled={cancellingId === c._id}
                          className="text-xs text-red-500 font-semibold border border-red-200 px-3 py-2 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                        >
                          {cancellingId === c._id ? 'Cancelling…' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Past Sessions</h3>
              <div className="space-y-3">
                {past.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 opacity-80"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={c.status} />
                          <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                            <Video size={11} /> Video
                          </span>
                        </div>
                        <p className="font-semibold text-gray-700">{c.notes || 'Study Abroad Consultation'}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock size={11} className="text-gray-400" />
                            {formatDate(c.date)}
                          </span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-500">{c.timeSlot} WAT</span>
                        </div>
                      </div>
                      <button
                        onClick={() => toast('Session notes coming soon', { icon: '📝' })}
                        className="text-xs text-gray-400 font-semibold border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition self-start sm:self-auto"
                      >
                        View Notes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT (Abuja)','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

const RELATIONSHIPS = ['Father','Mother','Sibling','Spouse','Uncle','Aunt','Friend','Guardian','Other'];

function BioDataSection({ userProfile, onRefresh }) {
  const p = userProfile || {};
  const [form, setForm] = useState({
    name: p.name || '',
    phone: p.phone || '',
    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
    gender: p.gender || '',
    stateOfOrigin: p.stateOfOrigin || '',
    lga: p.lga || '',
    address: p.address || '',
    nextOfKinName: p.nextOfKin?.name || '',
    nextOfKinRelationship: p.nextOfKin?.relationship || '',
    nextOfKinPhone: p.nextOfKin?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const f = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/me/profile', {
        name: form.name,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        stateOfOrigin: form.stateOfOrigin,
        lga: form.lga,
        address: form.address,
        nextOfKin: {
          name: form.nextOfKinName,
          relationship: form.nextOfKinRelationship,
          phone: form.nextOfKinPhone,
        },
      });
      toast.success('Bio data saved');
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save bio data');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Personal Bio Data</h3>
          <p className="text-xs text-gray-400 mt-0.5">Required for your study abroad applications</p>
        </div>
        {p.name && p.dateOfBirth && p.stateOfOrigin && p.nextOfKin?.name ? (
          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">Complete</span>
        ) : (
          <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">Incomplete</span>
        )}
      </div>
      <form onSubmit={handleSave} className="p-5 space-y-5">
        {/* Personal Info */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Personal Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input name="name" value={form.name} onChange={f} className={inputClass} placeholder="e.g. Emeka Obi" />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input name="phone" value={form.phone} onChange={f} className={inputClass} placeholder="+234 800 000 0000" />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={f} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={form.gender} onChange={f} className={inputClass}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>State of Origin</label>
              <select name="stateOfOrigin" value={form.stateOfOrigin} onChange={f} className={inputClass}>
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>LGA</label>
              <input name="lga" value={form.lga} onChange={f} className={inputClass} placeholder="Local Government Area" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Home Address</label>
              <input name="address" value={form.address} onChange={f} className={inputClass} placeholder="Full residential address" />
            </div>
          </div>
        </div>

        {/* Next of Kin */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Next of Kin</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input name="nextOfKinName" value={form.nextOfKinName} onChange={f} className={inputClass} placeholder="e.g. Ngozi Obi" />
            </div>
            <div>
              <label className={labelClass}>Relationship</label>
              <select name="nextOfKinRelationship" value={form.nextOfKinRelationship} onChange={f} className={inputClass}>
                <option value="">Select</option>
                {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <input name="nextOfKinPhone" value={form.nextOfKinPhone} onChange={f} className={inputClass} placeholder="+234 800 000 0000" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-800 transition disabled:opacity-60">
          {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : <><User size={14} /> Save Bio Data</>}
        </button>
      </form>
    </div>
  );
}

function DocumentsTab({ applications, uploadedDocs, userProfile, onRefresh }) {
  const [uploading, setUploading] = useState(null);
  const inputRefs = {};

  const hasDocsRequested = applications.some((a) => a.status === 'documents-requested');
  const ACTION_REQUIRED_DOCS = ['University Transcript', 'IELTS Score Report', 'Personal Statement', 'Reference Letter 1', 'Reference Letter 2', 'Bank Statement'];

  const docs = STATIC_DOCS.map((doc) => {
    const uploaded = uploadedDocs.find((u) => u.name === doc.name);
    const isActionRequired = hasDocsRequested && ACTION_REQUIRED_DOCS.includes(doc.name);
    return {
      ...doc,
      status: uploaded ? 'uploaded' : isActionRequired ? 'pending' : 'not-started',
      actionRequired: isActionRequired && !uploaded,
      fileUrl: uploaded?.fileUrl || null,
      uploadedAt: uploaded?.uploadedAt || null,
      publicId: uploaded?.publicId || null,
    };
  });

  const uploadedCount = docs.filter((d) => d.status === 'uploaded').length;
  const total = docs.length;
  const pct = Math.round((uploadedCount / total) * 100);

  const handleUpload = async (docName, file) => {
    if (!file) return;
    const MAX = 10 * 1024 * 1024;
    if (file.size > MAX) { toast.error('File too large — max 10 MB'); return; }
    setUploading(docName);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('name', docName);
      await api.post('/users/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`${docName} uploaded`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = async (doc) => {
    if (!confirm(`Remove "${doc.name}"?`)) return;
    try {
      await api.delete(`/users/documents/${encodeURIComponent(doc.publicId)}`);
      toast.success('Document removed');
      onRefresh();
    } catch {
      toast.error('Failed to remove document');
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Bio Data &amp; Documents</h2>

      {hasDocsRequested && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-orange-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-orange-800">Action Required</p>
            <p className="text-xs text-orange-700 mt-0.5">
              One or more of your applications require additional documents. Please upload the highlighted items below.
            </p>
          </div>
        </div>
      )}

      {/* Bio Data */}
      <BioDataSection userProfile={userProfile} onRefresh={onRefresh} />

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Document Completion</p>
          <span className="text-sm font-bold text-green-700">{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-linear-to-r from-green-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{uploadedCount} of {total} documents uploaded</p>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-bold text-gray-900 text-sm">Required Documents Checklist</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {docs.map((doc) => {
            const isUploading = uploading === doc.name;
            if (!inputRefs[doc.name]) inputRefs[doc.name] = { current: null };
            return (
              <div key={doc.name} className={`flex items-center gap-4 px-5 py-4 ${doc.actionRequired ? 'bg-orange-50/60' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  doc.status === 'uploaded' ? 'bg-green-100' : doc.actionRequired ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  {doc.status === 'uploaded' ? (
                    <CheckCircle2 size={15} className="text-green-600" />
                  ) : doc.actionRequired ? (
                    <AlertCircle size={15} className="text-orange-600" />
                  ) : (
                    <Circle size={15} className="text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                    {doc.required && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">Required</span>
                    )}
                    {doc.actionRequired && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">Action Required</span>
                    )}
                  </div>
                  {doc.uploadedAt && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {doc.status === 'uploaded' ? (
                    <>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline">
                        <ExternalLink size={11} /> View
                      </a>
                      <button onClick={() => inputRefs[doc.name].current?.click()}
                        className="flex items-center gap-1 text-xs text-green-700 font-semibold hover:underline">
                        <Upload size={11} /> Replace
                      </button>
                      <button onClick={() => handleRemove(doc)}
                        className="text-[11px] text-red-400 hover:text-red-600 font-semibold">✕</button>
                    </>
                  ) : (
                    <button
                      disabled={isUploading}
                      onClick={() => inputRefs[doc.name].current?.click()}
                      className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                        doc.actionRequired
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-green-700 text-white hover:bg-green-800'
                      } disabled:opacity-50`}>
                      {isUploading ? (
                        <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Uploading…</span>
                      ) : (
                        <><Upload size={11} /> Upload</>
                      )}
                    </button>
                  )}
                  <input
                    type="file"
                    ref={(el) => { inputRefs[doc.name].current = el; }}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(doc.name, f); e.target.value = ''; }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">Accepted formats: PDF, DOC, DOCX, JPG, PNG · Max 10 MB per file</p>
    </div>
  );
}

function UniversitiesTab() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Saved Universities</h2>
        <Link
          to="/study-abroad"
          className="inline-flex items-center gap-2 text-green-700 border border-green-200 bg-green-50 px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-100 transition self-start sm:self-auto"
        >
          <Globe size={14} /> Explore More
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_UNIVERSITIES.map((uni) => (
          <div
            key={uni.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <FlagImg code={uni.code} size={26} />
              <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                <Star size={10} fill="currentColor" /> {uni.rank}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm leading-snug mb-0.5">{uni.name}</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
              <MapPin size={10} /> {uni.country}
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {uni.programs.map((p) => (
                <span key={p} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  {p}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <span className="text-xs font-semibold text-gray-700">{uni.tuition}</span>
              <button
                onClick={() => toast('University detail page coming soon', { icon: '🎓' })}
                className="text-xs text-green-700 font-semibold hover:underline flex items-center gap-1"
              >
                View <ExternalLink size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ user }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    nationality: 'Nigerian',
    qualification: "Bachelor's Degree",
    goalCountry: 'United Kingdom',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900)); // Replace with PUT /api/users/:id when ready
    toast.success('Profile updated successfully!');
    setSaving(false);
  };

  const countries = [
    'United Kingdom', 'United States', 'Canada', 'Australia',
    'Germany', 'Netherlands', 'Ireland', 'New Zealand',
  ];
  const qualifications = [
    'WAEC / SSCE', 'OND / NCE', 'HND', "Bachelor's Degree",
    "Master's Degree", 'PhD',
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Profile Settings</h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-50">
          <div className="w-14 h-14 bg-green-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shrink-0">
            {(user?.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900">{user?.name || 'Student'}</p>
            <p className="text-sm text-gray-400">{user?.email || ''}</p>
            <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
              Student Account
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="e.g. Emeka Obi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="+234 800 000 0000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Nationality
              </label>
              <input
                type="text"
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="e.g. Nigerian"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Current Qualification
              </label>
              <select
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
              >
                {qualifications.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Goal Country
              </label>
              <select
                value={form.goalCountry}
                onChange={(e) => setForm({ ...form, goalCountry: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
              >
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition disabled:opacity-60"
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : (
                <><User size={14} /> Save Changes</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Real data state
  const [applications, setApplications] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingConsults, setLoadingConsults] = useState(true);

  const loading = loadingApps || loadingConsults;

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const { data } = await api.get('/study-abroad/my');
      setApplications(data.applications || []);
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchConsultations = async () => {
    setLoadingConsults(true);
    try {
      const { data } = await api.get('/bookings/my?service=study-abroad-consultation');
      setConsultations(data.bookings || []);
    } catch (err) {
      toast.error('Failed to load consultations');
    } finally {
      setLoadingConsults(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get('/users/me');
      setUploadedDocs(data.user?.documents || []);
      setUserProfile(data.user || null);
    } catch {
      // silently ignore — documents just show as not uploaded
    }
  };

  const refreshAll = () => {
    fetchApplications();
    fetchConsultations();
    fetchDocuments();
  };

  useEffect(() => {
    fetchApplications();
    fetchConsultations();
    fetchDocuments();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleTabChange = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            user={user}
            applications={applications}
            consultations={consultations}
            loading={loading}
            setActiveTab={setActiveTab}
          />
        );
      case 'applications':
        return (
          <ApplicationsTab
            user={user}
            applications={applications}
            loading={loadingApps}
            onRefresh={fetchApplications}
          />
        );
      case 'consultations':
        return (
          <ConsultationsTab
            user={user}
            consultations={consultations}
            loading={loadingConsults}
            onRefresh={fetchConsultations}
          />
        );
      case 'documents':
        return <DocumentsTab applications={applications} uploadedDocs={uploadedDocs} userProfile={userProfile} onRefresh={fetchDocuments} />;
      case 'universities':
        return <UniversitiesTab />;
      case 'settings':
        return <SettingsTab user={user} />;
      default:
        return (
          <OverviewTab
            user={user}
            applications={applications}
            consultations={consultations}
            loading={loading}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  const SidebarContent = () => (
    <aside className="w-64 bg-gray-950 text-white min-h-full flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shrink-0">
            <BookOpen size={17} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-sm leading-tight">My Dashboard</p>
            <p className="text-gray-400 text-xs truncate max-w-30">
              {user?.name || 'Student'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-0.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
              activeTab === id
                ? 'bg-green-700 text-white shadow-lg shadow-green-900/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <Icon size={16} />
            {label}
            {activeTab === id && (
              <div className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full" />
            )}
          </button>
        ))}

        <div className="pt-4 mt-4 border-t border-gray-800">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
          >
            <ExternalLink size={16} /> Back to Site
          </Link>
        </div>
      </nav>

      {/* Bottom profile */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-900 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(user?.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium">Logged in as</p>
            <p className="text-sm text-white font-semibold truncate">
              {user?.name?.split(' ')[0] || 'Student'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-400 transition p-1 rounded-lg hover:bg-gray-800"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30">
        <SidebarContent />
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-64 flex flex-col h-full animate-[slideIn_0.2s_ease-out]">
            <SidebarContent />
          </div>
          {/* Close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">

        {/* Mobile Top Bar */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
          >
            <Menu size={21} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-700 rounded-lg flex items-center justify-center">
              <BookOpen size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">My Dashboard</span>
          </div>
          <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {(user?.name || 'S').charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Desktop Page Header */}
        <div className="hidden lg:flex bg-white border-b border-gray-100 px-8 py-5 items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              {TABS.find((t) => t.id === activeTab)?.label || 'Overview'}
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              {activeTab === 'overview' && `Welcome back, ${user?.name?.split(' ')[0] || 'Student'}`}
              {activeTab === 'applications' && 'Track and manage your university applications'}
              {activeTab === 'consultations' && 'Manage your sessions with our counsellors'}
              {activeTab === 'documents' && 'Upload and track your application documents'}
              {activeTab === 'universities' && 'Your bookmarked universities'}
              {activeTab === 'settings' && 'Update your profile information'}
            </p>
          </div>
          {activeTab === 'consultations' && (
            <button
              onClick={() => {
                // scroll the tab's own "Book New Consultation" button is inside the tab
                // Just switch to the tab (already active), nothing extra needed
                toast('Use the "Book New Consultation" button in the tab', { icon: '📅' });
              }}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition"
            >
              <Plus size={15} /> Book Consultation
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {renderContent()}
        </div>
      </div>

      {/* MOBILE BOTTOM TAB BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex">
        {BOTTOM_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-3 px-1 transition-colors ${
              activeTab === id ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 1.8} />
            <span className={`text-[10px] font-semibold ${activeTab === id ? 'text-green-700' : 'text-gray-400'}`}>
              {label}
            </span>
            {activeTab === id && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-green-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
