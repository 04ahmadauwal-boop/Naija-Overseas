import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, School, Edit3, Trophy, Image, BarChart2,
  Menu, X, Eye, MessageCircle, Star, Plus, Trash2, Save,
  ExternalLink, CheckCircle, Clock, AlertCircle, ChevronRight,
  GraduationCap, MapPin, Phone, Mail, DollarSign,
  Camera, TrendingUp, Users, Activity, BookOpen, LogOut, Upload,
  CalendarCheck, XCircle, Video, Play,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

// ─── Constants ───────────────────────────────────────────────────────────────

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara',
];

const CURRICULUM_OPTIONS = ['WAEC', 'NECO', 'IGCSE', 'IB', 'Cambridge'];

const FACILITIES_OPTIONS = [
  'Library', 'Science Lab', 'Sports Field', 'ICT Lab', 'Swimming Pool',
  'Boarding House', 'Music Room', 'Art Studio', 'Medical Center', 'Bus Service',
];

const ACHIEVEMENT_CATEGORIES = [
  'Academic Excellence', 'Sports', 'Arts', 'Industry Recognition', 'Rankings',
];

const CATEGORY_COLORS = {
  'Academic Excellence': 'bg-blue-100 text-blue-700',
  'Sports': 'bg-green-100 text-green-700',
  'Arts': 'bg-purple-100 text-purple-700',
  'Industry Recognition': 'bg-orange-100 text-orange-700',
  'Rankings': 'bg-teal-100 text-teal-700',
};

const TABS = [
  { id: 'overview',     label: 'Overview',        icon: LayoutDashboard },
  { id: 'school',       label: 'My School',        icon: School          },
  { id: 'edit',         label: 'Edit Listing',     icon: Edit3           },
  { id: 'achievements', label: 'Achievements',     icon: Trophy          },
  { id: 'reports',      label: 'Exam Results',     icon: BookOpen        },
  { id: 'gallery',      label: 'Gallery',          icon: Image           },
  { id: 'videos',       label: 'Videos',           icon: Video           },
  { id: 'analytics',    label: 'Analytics',        icon: BarChart2       },
  { id: 'visits',       label: 'Visit Requests',   icon: CalendarCheck   },
  { id: 'reviews',      label: 'Reviews',          icon: Star            },
];

const JAMB_SUBJECTS = ['Use of English', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Government', 'Literature', 'History', 'Geography',
  'Commerce', 'Accounting', 'Agricultural Science', 'CRS / IRS', 'Further Maths'];

const WAEC_GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

const WAEC_SUBJECTS = ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Government', 'Literature in English', 'History', 'Geography',
  'Commerce', 'Financial Accounting', 'Agricultural Science', 'CRS', 'IRS',
  'Further Mathematics', 'Technical Drawing', 'Food & Nutrition', 'Visual Art'];

const WEEKLY_DATA = [
  { day: 'Mon', views: 28 },
  { day: 'Tue', views: 42 },
  { day: 'Wed', views: 35 },
  { day: 'Thu', views: 60 },
  { day: 'Fri', views: 55 },
  { day: 'Sat', views: 38 },
  { day: 'Sun', views: 22 },
];

const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white transition';

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className = '' }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const styles = {
    approved: 'bg-green-100 text-green-700 border border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border border-red-200',
  };
  const labels = { approved: 'Live', pending: 'Under Review', rejected: 'Rejected' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'approved' ? 'bg-green-500' : status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`} />
      {labels[status] || status}
    </span>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function timeAgo(date) {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1} minute${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

function deriveRecentActivity(school) {
  if (!school) return [];
  const items = [];

  if (school.createdAt) {
    items.push({
      icon: School,
      color: 'bg-green-100 text-green-700',
      text: `${school.name} was submitted for listing on the platform`,
      time: timeAgo(school.createdAt),
      ts: new Date(school.createdAt).getTime(),
    });
  }

  if (school.status === 'approved' && school.updatedAt) {
    items.push({
      icon: CheckCircle,
      color: 'bg-emerald-100 text-emerald-700',
      text: `Your listing for ${school.name} was approved and is now live`,
      time: timeAgo(school.updatedAt),
      ts: new Date(school.updatedAt).getTime(),
    });
  }

  if (school.achievements?.length > 0) {
    const latest = [...school.achievements].sort((a, b) => (b.year || 0) - (a.year || 0))[0];
    items.push({
      icon: Trophy,
      color: 'bg-yellow-100 text-yellow-700',
      text: `Achievement added: "${latest.title}" (${latest.year || 'N/A'})`,
      time: latest.year ? `Year ${latest.year}` : 'Recently',
      ts: latest.year ? new Date(String(latest.year), 0).getTime() : Date.now() - 86400000,
    });
  }

  if (school.images?.length > 0) {
    items.push({
      icon: Camera,
      color: 'bg-purple-100 text-purple-700',
      text: `${school.images.length} photo${school.images.length !== 1 ? 's' : ''} in your school gallery`,
      time: 'Gallery',
      ts: Date.now() - 3600000,
    });
  }

  if (school.profileViews > 0) {
    items.push({
      icon: Eye,
      color: 'bg-blue-100 text-blue-700',
      text: `Your profile has been viewed ${school.profileViews} time${school.profileViews !== 1 ? 's' : ''} in total`,
      time: 'All time',
      ts: Date.now() - 7200000,
    });
  }

  if (school.enquiryCount > 0) {
    items.push({
      icon: MessageCircle,
      color: 'bg-indigo-100 text-indigo-700',
      text: `${school.enquiryCount} parent enquir${school.enquiryCount !== 1 ? 'ies' : 'y'} received on your listing`,
      time: 'All time',
      ts: Date.now() - 10800000,
    });
  }

  return items.sort((a, b) => b.ts - a.ts).slice(0, 5);
}

function OverviewTab({ school, setActiveTab }) {
  const achievements = school?.achievements || [];
  const recentActivity = deriveRecentActivity(school);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {!school ? (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <School size={20} className="text-blue-700" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-blue-900 text-sm">You haven't listed a school yet</p>
            <p className="text-blue-700 text-xs mt-0.5">Add your school to reach thousands of parents and students on our platform.</p>
          </div>
          <Link to="/list-your-school"
            className="inline-flex items-center gap-2 bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition whitespace-nowrap">
            <Plus size={15} /> List Your School
          </Link>
        </div>
      ) : school.status === 'pending' ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={20} className="text-yellow-700" />
          </div>
          <div>
            <p className="font-bold text-yellow-900 text-sm">Your listing is under review</p>
            <p className="text-yellow-700 text-xs mt-0.5">Our team is reviewing <strong>{school.name}</strong>. It will go live within 24–48 hours.</p>
          </div>
        </div>
      ) : school.status === 'approved' ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle size={20} className="text-green-700" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-green-900 text-sm">Your school is <span className="text-green-600">Live</span> on the platform!</p>
            <p className="text-green-700 text-xs mt-0.5"><strong>{school.name}</strong> is visible to parents and students.</p>
          </div>
          <Link to={`/schools/${school.slug}`} target="_blank"
            className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-800 transition whitespace-nowrap">
            <ExternalLink size={14} /> View Listing
          </Link>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle size={20} className="text-red-700" />
          </div>
          <div>
            <p className="font-bold text-red-900 text-sm">Your listing was not approved</p>
            <p className="text-red-700 text-xs mt-0.5">Please review and update your listing, then resubmit for approval.</p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Profile Views', value: String(school?.profileViews || 0), sub: 'All time', icon: Eye, color: 'bg-blue-100 text-blue-700' },
          { label: 'Enquiries', value: String(school?.enquiryCount || 0), sub: 'All time', icon: MessageCircle, color: 'bg-green-100 text-green-700' },
          { label: 'Total Achievements', value: String(achievements.length), sub: 'Listed awards', icon: Trophy, color: 'bg-yellow-100 text-yellow-700' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <TrendingUp size={13} className="text-gray-300" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-0.5">{value}</div>
            <div className="text-sm font-semibold text-gray-700">{label}</div>
            <div className="text-xs text-gray-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Edit Listing', tab: 'edit', icon: Edit3, color: 'text-blue-700 bg-blue-50 hover:bg-blue-100' },
            { label: 'Add Achievement', tab: 'achievements', icon: Trophy, color: 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100' },
            { label: 'Upload Photo', tab: 'gallery', icon: Camera, color: 'text-purple-700 bg-purple-50 hover:bg-purple-100' },
            { label: 'Visit Requests', tab: 'visits', icon: CalendarCheck, color: 'text-teal-700 bg-teal-50 hover:bg-teal-100' },
          ].map(({ label, tab, icon: Icon, color }) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-semibold text-center transition cursor-pointer ${color}`}>
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
        {school?.status === 'approved' && school?.slug && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Link to={`/schools/${school.slug}`} target="_blank"
              className="flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-900 transition">
              <ExternalLink size={14} /> View Live Listing on Platform
              <ChevronRight size={14} className="ml-auto" />
            </Link>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Recent Activity</h2>
          <Clock size={15} className="text-gray-300" />
        </div>
        <div className="space-y-1">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No activity yet. List your school to get started.</p>
          ) : recentActivity.map(({ icon: Icon, color, text, time }, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={14} />
              </div>
              <p className="text-sm text-gray-700 flex-1 leading-snug">{text}</p>
              <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── My School Tab ────────────────────────────────────────────────────────────

function MySchoolTab({ school, setActiveTab }) {
  if (!school) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <School size={28} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No School Listed Yet</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">You haven't added a school to the platform. List your school to connect with thousands of parents.</p>
        <Link to="/list-your-school"
          className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-green-800 transition">
          <Plus size={15} /> Add Your School Now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* School Header */}
        <div className="bg-linear-to-r from-gray-900 to-gray-800 px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                <GraduationCap size={26} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">{school.name}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full capitalize">{school.type}</span>
                  <span className="bg-white/20 text-white text-xs font-medium px-2.5 py-1 rounded-full capitalize">{school.level}</span>
                  <StatusBadge status={school.status} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* School Details */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin size={15} className="text-gray-400 shrink-0" />
              <span>{[school.city, school.state].filter(Boolean).join(', ') || 'Location not set'}</span>
            </div>
            {school.contact?.phone && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={15} className="text-gray-400 shrink-0" />
                <span>{school.contact.phone}</span>
              </div>
            )}
            {school.contact?.email && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={15} className="text-gray-400 shrink-0" />
                <span>{school.contact.email}</span>
              </div>
            )}
            {school.fees?.tuition && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <DollarSign size={15} className="text-gray-400 shrink-0" />
                <span>₦{Number(school.fees.tuition).toLocaleString()} / year</span>
              </div>
            )}
          </div>

          {school.curriculum?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Curriculum</p>
              <div className="flex flex-wrap gap-2">
                {school.curriculum.map((c) => (
                  <span key={c} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium px-3 py-1 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}

          {school.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About</p>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{school.description}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={() => setActiveTab('edit')}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-green-700 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-green-800 transition">
              <Edit3 size={15} /> Edit Listing
            </button>
            {school.status === 'approved' && school.slug && (
              <Link to={`/schools/${school.slug}`} target="_blank"
                className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition">
                <ExternalLink size={15} /> View on Platform
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Listing Tab ─────────────────────────────────────────────────────────

function EditListingTab({ school, onSaved }) {
  const [form, setForm] = useState({
    name: school?.name || '',
    type: school?.type || 'private',
    level: school?.level || 'secondary',
    state: school?.state || '',
    city: school?.city || '',
    address: school?.address || '',
    curriculum: school?.curriculum || [],
    fees: { tuition: school?.fees?.tuition || '', boarding: school?.fees?.boarding || '' },
    description: school?.description || '',
    contact: { phone: school?.contact?.phone || '', email: school?.contact?.email || '', website: school?.contact?.website || '' },
    facilities: school?.facilities || [],
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key, val) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));

  const handleSave = async () => {
    if (!school?._id) { toast.error('No school found to update'); return; }
    setSaving(true);
    try {
      await api.put(`/schools/${school._id}`, form);
      toast.success('School details updated successfully!');
      if (onSaved) onSaved(form);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({ icon: Icon, color, title, subtitle }) => (
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
    </div>
  );

  if (!school) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-500">Please add a school listing first before editing.</p>
        <Link to="/list-your-school" className="inline-flex items-center gap-2 mt-4 bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-800 transition">
          <Plus size={15} /> Add School
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Section A: Basic Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SectionHeader icon={School} color="bg-green-100 text-green-700" title="Section A — Basic Info" subtitle="School identity and location" />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} placeholder="e.g. Kings College Lagos" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inp}>
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="federal">Federal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Level</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={inp}>
                <option value="secondary">Secondary</option>
                <option value="primary">Primary</option>
                <option value="both">Both (Primary + Secondary)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inp}>
                <option value="">Select state</option>
                {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">City / Area</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inp} placeholder="e.g. Lagos Island" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inp} placeholder="Street address of the school" />
          </div>
        </div>
      </div>

      {/* Section B: Academic */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SectionHeader icon={BookOpen} color="bg-blue-100 text-blue-700" title="Section B — Academic" subtitle="Curriculum and qualifications offered" />
        <label className="block text-sm font-semibold text-gray-700 mb-3">Curriculum Offered</label>
        <div className="flex flex-wrap gap-2">
          {CURRICULUM_OPTIONS.map((c) => (
            <button key={c} type="button" onClick={() => toggle('curriculum', c)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                form.curriculum.includes(c)
                  ? 'bg-green-700 text-white border-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
              }`}>
              {form.curriculum.includes(c) && <span className="mr-1">✓</span>}{c}
            </button>
          ))}
        </div>
      </div>

      {/* Section C: Fees */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SectionHeader icon={DollarSign} color="bg-yellow-100 text-yellow-700" title="Section C — Fees" subtitle="Annual tuition and boarding costs" />
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
            <label className="block text-sm font-semibold text-green-800 mb-1.5">Annual Tuition (₦)</label>
            <input type="number" value={form.fees.tuition}
              onChange={(e) => setForm({ ...form, fees: { ...form.fees, tuition: e.target.value } })}
              className="w-full bg-white border border-green-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 500000" />
            <p className="text-xs text-green-600 mt-1">Per academic year</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <label className="block text-sm font-semibold text-blue-800 mb-1.5">Boarding Fee (₦)</label>
            <input type="number" value={form.fees.boarding}
              onChange={(e) => setForm({ ...form, fees: { ...form.fees, boarding: e.target.value } })}
              className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0 if day school" />
            <p className="text-xs text-blue-600 mt-1">Leave blank for day school</p>
          </div>
        </div>
      </div>

      {/* Section D: Description & Contact */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SectionHeader icon={Phone} color="bg-purple-100 text-purple-700" title="Section D — Description & Contact" subtitle="About the school and how parents can reach you" />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inp + ' resize-none'} rows={4}
              placeholder="Tell parents what makes your school special — history, culture, achievements..." />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/500 characters</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Phone</label>
              <input value={form.contact.phone}
                onChange={(e) => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })}
                className={inp} placeholder="+234 800 000 0000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Email</label>
              <input type="email" value={form.contact.email}
                onChange={(e) => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })}
                className={inp} placeholder="info@school.edu.ng" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">School Website</label>
            <input value={form.contact.website}
              onChange={(e) => setForm({ ...form, contact: { ...form.contact, website: e.target.value } })}
              className={inp} placeholder="https://yourschool.edu.ng" />
          </div>
        </div>
      </div>

      {/* Section E: Facilities */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <SectionHeader icon={Activity} color="bg-teal-100 text-teal-700" title="Section E — Facilities" subtitle="Infrastructure and amenities available" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FACILITIES_OPTIONS.map((fac) => (
            <button key={fac} type="button" onClick={() => toggle('facilities', fac)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition text-left ${
                form.facilities.includes(fac)
                  ? 'bg-green-50 border-green-500 text-green-800 font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
              }`}>
              <span className="truncate flex-1">{fac}</span>
              {form.facilities.includes(fac) && <CheckCircle size={13} className="text-green-600 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pb-2">
        <button onClick={handleSave} disabled={saving}
          className="inline-flex items-center gap-2 bg-green-700 text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-green-800 transition disabled:opacity-60">
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : (
            <><Save size={16} /> Save Changes</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Achievements Tab ─────────────────────────────────────────────────────────

function AchievementsTab({ school }) {
  const [achievements, setAchievements] = useState(school?.achievements || []);
  const [form, setForm] = useState({ title: '', category: 'Academic Excellence', year: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const persistAchievements = async (updated) => {
    if (!school?._id) { toast.error('No school found'); return; }
    setSaving(true);
    try {
      await api.put(`/schools/${school._id}`, { achievements: updated });
      toast.success('Achievements saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save achievements');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!form.title.trim() || !form.year.trim()) {
      toast.error('Title and year are required');
      return;
    }
    const newAch = { ...form, id: Date.now().toString() };
    const updated = [newAch, ...achievements];
    setAchievements(updated);
    setForm({ title: '', category: 'Academic Excellence', year: '', description: '' });
    setShowForm(false);
    await persistAchievements(updated);
  };

  const handleDelete = async (id) => {
    const updated = achievements.filter((a) => a.id !== id);
    setAchievements(updated);
    await persistAchievements(updated);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Achievements</h2>
          <p className="text-sm text-gray-500 mt-0.5">{achievements.length} achievement{achievements.length !== 1 ? 's' : ''} listed</p>
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-800 transition">
          <Plus size={15} /> Add Achievement
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4">New Achievement</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inp} placeholder="e.g. WAEC Best School Award 2024" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inp}>
                  {ACHIEVEMENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year</label>
                <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className={inp} placeholder="e.g. 2024" maxLength={4} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inp + ' resize-none'} rows={2}
                placeholder="Brief description of this achievement" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)}
                className="text-sm font-medium text-gray-600 px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleAdd} disabled={saving}
                className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-800 transition disabled:opacity-60">
                {saving
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  : <><Plus size={14} /> Add Achievement</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievements List */}
      {achievements.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Trophy size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No achievements yet. Add your school's awards and recognitions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((ach) => (
            <div key={ach.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[ach.category] || 'bg-gray-100 text-gray-600'}`}>
                    {ach.category}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">{ach.year}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{ach.title}</h3>
                {ach.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{ach.description}</p>}
              </div>
              <button onClick={() => handleDelete(ach.id)} disabled={saving}
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center shrink-0 transition disabled:opacity-50">
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Exam Results Tab ─────────────────────────────────────────────────────────

const BLANK_JAMB = {
  studentName: '', photo: '', year: new Date().getFullYear().toString(),
  subjects: [
    { subject: 'Use of English',  score: '' },
    { subject: 'Mathematics',     score: '' },
    { subject: '',                score: '' },
    { subject: '',                score: '' },
  ],
};

const BLANK_WAEC = {
  studentName: '', photo: '', year: new Date().getFullYear().toString(),
  grades: [
    { subject: 'English Language', grade: 'A1' },
    { subject: 'Mathematics',      grade: 'A1' },
    { subject: '',                 grade: 'A1' },
  ],
};

function ExamResultsTab({ school }) {
  const [subTab, setSubTab] = useState('jamb');
  // JAMB state
  const [jambReports, setJambReports] = useState(school?.jambReports || []);
  const [jambForm, setJambForm] = useState(BLANK_JAMB);
  const [showJambForm, setShowJambForm] = useState(false);
  const [savingJamb, setSavingJamb] = useState(false);
  const [uploadingJamb, setUploadingJamb] = useState(false);
  const jambPhotoRef = useRef(null);
  // WAEC state
  const [waecReports, setWaecReports] = useState(school?.waecReports || []);
  const [waecForm, setWaecForm] = useState(BLANK_WAEC);
  const [showWaecForm, setShowWaecForm] = useState(false);
  const [savingWaec, setSavingWaec] = useState(false);
  const [uploadingWaec, setUploadingWaec] = useState(false);
  const waecPhotoRef = useRef(null);

  const uploadPhoto = async (file, onSuccess, setUploading) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large — max 10 MB'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post('/schools/upload-image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess(data.imageUrl);
      toast.success('Photo uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const persistJamb = async (updated) => {
    if (!school?._id) return;
    setSavingJamb(true);
    try {
      await api.put(`/schools/${school._id}`, { jambReports: updated });
      toast.success('JAMB results saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSavingJamb(false); }
  };

  const persistWaec = async (updated) => {
    if (!school?._id) return;
    setSavingWaec(true);
    try {
      await api.put(`/schools/${school._id}`, { waecReports: updated });
      toast.success('WAEC results saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSavingWaec(false); }
  };

  const addJambReport = async () => {
    if (!jambForm.studentName.trim()) { toast.error('Enter student name'); return; }
    const total = jambForm.subjects.reduce((s, x) => s + (Number(x.score) || 0), 0);
    const entry = { ...jambForm, id: Date.now().toString(), total,
      subjects: jambForm.subjects.filter(s => s.subject.trim()).map(s => ({ subject: s.subject, score: Number(s.score) || 0 })) };
    const updated = [...jambReports, entry];
    setJambReports(updated);
    setJambForm(BLANK_JAMB);
    setShowJambForm(false);
    await persistJamb(updated);
  };

  const deleteJamb = async (id) => {
    const updated = jambReports.filter(r => r.id !== id);
    setJambReports(updated);
    await persistJamb(updated);
  };

  const addWaecReport = async () => {
    if (!waecForm.studentName.trim()) { toast.error('Enter student name'); return; }
    const entry = { ...waecForm, id: Date.now().toString(),
      grades: waecForm.grades.filter(g => g.subject.trim()) };
    const updated = [...waecReports, entry];
    setWaecReports(updated);
    setWaecForm(BLANK_WAEC);
    setShowWaecForm(false);
    await persistWaec(updated);
  };

  const deleteWaec = async (id) => {
    const updated = waecReports.filter(r => r.id !== id);
    setWaecReports(updated);
    await persistWaec(updated);
  };

  const jambTotal = (form) => form.subjects.reduce((s, x) => s + (Number(x.score) || 0), 0);

  return (
    <div className="space-y-5">
      {/* Sub-tab switcher */}
      <div className="flex items-center gap-2">
        <button onClick={() => setSubTab('jamb')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
            subTab === 'jamb' ? 'bg-blue-700 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          JAMB Results ({jambReports.length})
        </button>
        <button onClick={() => setSubTab('waec')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
            subTab === 'waec' ? 'bg-green-700 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          WAEC Results ({waecReports.length})
        </button>
      </div>

      {/* ── JAMB Tab ── */}
      {subTab === 'jamb' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">JAMB Top Scorers</h2>
              <p className="text-sm text-gray-500 mt-0.5">Add up to 5 top JAMB students — shown as cards on your school page</p>
            </div>
            {jambReports.length < 5 && (
              <button onClick={() => setShowJambForm(v => !v)}
                className="inline-flex items-center gap-2 bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-800 transition">
                <Plus size={14} /> Add Student
              </button>
            )}
          </div>

          {/* JAMB add form */}
          {showJambForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h3 className="font-bold text-gray-900">New JAMB Entry</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student Name</label>
                  <input value={jambForm.studentName} onChange={e => setJambForm({ ...jambForm, studentName: e.target.value })}
                    className={inp} placeholder="e.g. Nadia Oyinkansola Raji" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year</label>
                  <input value={jambForm.year} onChange={e => setJambForm({ ...jambForm, year: e.target.value })}
                    className={inp} placeholder="e.g. 2025" maxLength={4} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student Photo</label>
                <div className="flex items-start gap-3">
                  {/* Preview */}
                  <div className="w-16 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0 overflow-hidden bg-gray-50">
                    {jambForm.photo
                      ? <img src={jambForm.photo} alt="" className="w-full h-full object-cover" />
                      : <Camera size={18} className="text-gray-300" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* File upload button */}
                    <input ref={jambPhotoRef} type="file" accept="image/*" className="hidden"
                      onChange={e => uploadPhoto(e.target.files[0], (url) => setJambForm(f => ({ ...f, photo: url })), setUploadingJamb)} />
                    <button type="button" onClick={() => jambPhotoRef.current?.click()} disabled={uploadingJamb}
                      className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-100 transition disabled:opacity-60">
                      <Upload size={14} />
                      {uploadingJamb ? 'Uploading…' : 'Upload from device'}
                    </button>
                    {/* Or paste URL */}
                    <input value={jambForm.photo} onChange={e => setJambForm({ ...jambForm, photo: e.target.value })}
                      className={inp} placeholder="or paste image URL…" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Subjects & Scores (4 subjects)</label>
                  <span className="text-sm font-bold text-blue-700">Total: {jambTotal(jambForm)}</span>
                </div>
                <div className="space-y-3">
                  {jambForm.subjects.map((s, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2">
                      <select value={s.subject}
                        onChange={e => { const ss = [...jambForm.subjects]; ss[i] = { ...ss[i], subject: e.target.value }; setJambForm({ ...jambForm, subjects: ss }); }}
                        className={inp + ' flex-1'}>
                        <option value="">— Select Subject —</option>
                        {JAMB_SUBJECTS.map(sub => <option key={sub}>{sub}</option>)}
                      </select>
                      <div className="flex items-center gap-2">
                        <input type="number" min="0" max="100" value={s.score}
                          onChange={e => { const ss = [...jambForm.subjects]; ss[i] = { ...ss[i], score: e.target.value }; setJambForm({ ...jambForm, subjects: ss }); }}
                          className={inp + ' w-full sm:w-24 text-center'} placeholder="Score" />
                        <span className="text-xs text-gray-400 shrink-0 sm:hidden">/ 100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowJambForm(false); setJambForm(BLANK_JAMB); }}
                  className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={addJambReport} disabled={savingJamb}
                  className="flex-1 bg-blue-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-800 transition disabled:opacity-60">
                  {savingJamb ? 'Saving…' : 'Save Entry'}
                </button>
              </div>
            </div>
          )}

          {/* JAMB list */}
          {jambReports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <BookOpen size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No JAMB results added yet.</p>
              <p className="text-gray-400 text-xs mt-1">Add your top scorers — they appear as beautiful cards on your school page.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jambReports.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                  {r.photo ? (
                    <img src={r.photo} alt={r.studentName} className="w-14 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-14 h-16 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <GraduationCap size={24} className="text-blue-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{r.studentName}</p>
                    <p className="text-xs text-gray-400">{r.year} JAMB</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {r.subjects?.map(s => (
                        <span key={s.subject} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                          {s.subject.split(' ').map(w => w[0]).join('')}: {s.score}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-3xl font-black text-blue-700">{r.total}</p>
                    <p className="text-xs text-gray-400">Total</p>
                    <button onClick={() => deleteJamb(r.id)} className="mt-2 w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── WAEC Tab ── */}
      {subTab === 'waec' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">WAEC Outstanding Results</h2>
              <p className="text-sm text-gray-500 mt-0.5">Add up to 5 top WAEC students — shown on your school page</p>
            </div>
            {waecReports.length < 5 && (
              <button onClick={() => setShowWaecForm(v => !v)}
                className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-800 transition">
                <Plus size={14} /> Add Student
              </button>
            )}
          </div>

          {/* WAEC add form */}
          {showWaecForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h3 className="font-bold text-gray-900">New WAEC Entry</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student Name</label>
                  <input value={waecForm.studentName} onChange={e => setWaecForm({ ...waecForm, studentName: e.target.value })}
                    className={inp} placeholder="e.g. John Adebayo Okafor" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year</label>
                  <input value={waecForm.year} onChange={e => setWaecForm({ ...waecForm, year: e.target.value })}
                    className={inp} placeholder="e.g. 2025" maxLength={4} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student Photo</label>
                <div className="flex items-start gap-3">
                  {/* Preview */}
                  <div className="w-16 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center shrink-0 overflow-hidden bg-gray-50">
                    {waecForm.photo
                      ? <img src={waecForm.photo} alt="" className="w-full h-full object-cover" />
                      : <Camera size={18} className="text-gray-300" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* File upload button */}
                    <input ref={waecPhotoRef} type="file" accept="image/*" className="hidden"
                      onChange={e => uploadPhoto(e.target.files[0], (url) => setWaecForm(f => ({ ...f, photo: url })), setUploadingWaec)} />
                    <button type="button" onClick={() => waecPhotoRef.current?.click()} disabled={uploadingWaec}
                      className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-100 transition disabled:opacity-60">
                      <Upload size={14} />
                      {uploadingWaec ? 'Uploading…' : 'Upload from device'}
                    </button>
                    {/* Or paste URL */}
                    <input value={waecForm.photo} onChange={e => setWaecForm({ ...waecForm, photo: e.target.value })}
                      className={inp} placeholder="or paste image URL…" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Subjects & Grades</label>
                  <button onClick={() => setWaecForm({ ...waecForm, grades: [...waecForm.grades, { subject: '', grade: 'A1' }] })}
                    className="text-xs text-green-700 font-bold hover:underline flex items-center gap-1">
                    <Plus size={12} /> Add Subject
                  </button>
                </div>
                <div className="space-y-3">
                  {waecForm.grades.map((g, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-2">
                      <select value={g.subject}
                        onChange={e => { const gs = [...waecForm.grades]; gs[i] = { ...gs[i], subject: e.target.value }; setWaecForm({ ...waecForm, grades: gs }); }}
                        className={inp + ' flex-1'}>
                        <option value="">— Select Subject —</option>
                        {WAEC_SUBJECTS.map(sub => <option key={sub}>{sub}</option>)}
                      </select>
                      <div className="flex gap-2 items-center">
                        <select value={g.grade}
                          onChange={e => { const gs = [...waecForm.grades]; gs[i] = { ...gs[i], grade: e.target.value }; setWaecForm({ ...waecForm, grades: gs }); }}
                          className={inp + ' flex-1 sm:w-24 sm:flex-none'}>
                          {WAEC_GRADES.map(gr => <option key={gr}>{gr}</option>)}
                        </select>
                        {waecForm.grades.length > 1 && (
                          <button onClick={() => { const gs = waecForm.grades.filter((_, j) => j !== i); setWaecForm({ ...waecForm, grades: gs }); }}
                            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition shrink-0">
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowWaecForm(false); setWaecForm(BLANK_WAEC); }}
                  className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={addWaecReport} disabled={savingWaec}
                  className="flex-1 bg-green-700 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-800 transition disabled:opacity-60">
                  {savingWaec ? 'Saving…' : 'Save Entry'}
                </button>
              </div>
            </div>
          )}

          {/* WAEC list */}
          {waecReports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <BookOpen size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No WAEC results added yet.</p>
              <p className="text-gray-400 text-xs mt-1">Add your outstanding students — they appear as cards on your school page.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waecReports.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
                  {r.photo ? (
                    <img src={r.photo} alt={r.studentName} className="w-14 h-16 rounded-xl object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-14 h-16 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <GraduationCap size={24} className="text-green-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{r.studentName}</p>
                    <p className="text-xs text-gray-400">{r.year} WAEC · {r.grades?.length} subjects</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {r.grades?.map(g => (
                        <span key={g.subject} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          g.grade === 'A1' ? 'bg-green-100 text-green-700' :
                          g.grade?.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                          g.grade?.startsWith('C') ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {g.subject.split(' ').slice(0, 2).join(' ')}: {g.grade}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => deleteWaec(r.id)} className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition shrink-0">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

function GalleryTab({ school }) {
  const [images, setImages] = useState(school?.images || []);
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const persistImages = async (updated) => {
    if (!school?._id) { toast.error('No school found'); return; }
    setSaving(true);
    try {
      await api.put(`/schools/${school._id}`, { images: updated });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save gallery');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { toast.error('Please enter an image URL'); return; }
    if (images.includes(trimmed)) { toast.error('Image already added'); return; }
    const updated = [...images, trimmed];
    setImages(updated);
    setUrlInput('');
    await persistImages(updated);
    toast.success('Image added');
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File too large — max 10 MB'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const { data } = await api.post(`/schools/${school._id}/gallery/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages(data.images);
      toast.success('Photo uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url) => {
    const updated = images.filter((img) => img !== url);
    setImages(updated);
    try {
      await api.delete(`/schools/${school._id}/gallery`, { data: { imageUrl: url } });
    } catch {
      await persistImages(updated);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gallery</h2>
          <p className="text-sm text-gray-500 mt-0.5">{images.length} photo{images.length !== 1 ? 's' : ''}</p>
        </div>
        {(saving || uploading) && (
          <div className="inline-flex items-center gap-2 text-sm text-gray-500">
            <span className="w-3.5 h-3.5 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin" />
            {uploading ? 'Uploading...' : 'Saving...'}
          </div>
        )}
      </div>

      {/* Add Photo — two methods */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-bold text-gray-900">Add Photo</p>

        {/* Upload from device */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Upload from Device</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !school?._id}
            className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-800 transition disabled:opacity-60">
            {uploading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
            ) : (
              <><Camera size={15} /> Choose Photo</>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ''; }}
          />
          <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, WEBP · Max 10 MB</p>
        </div>

        {/* Or paste URL */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Or Paste URL</p>
          <div className="flex gap-3">
            <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
              className={inp + ' flex-1'} placeholder="https://example.com/school-photo.jpg" />
            <button onClick={handleAddUrl} disabled={saving}
              className="inline-flex items-center gap-2 bg-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-gray-900 transition whitespace-nowrap disabled:opacity-60">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {images.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Camera size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">No photos yet</p>
          <p className="text-gray-400 text-xs">Upload photos of your school to attract more parents</p>
          <div className="grid grid-cols-3 gap-3 mt-6 max-w-xs mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-xl skeleton-shimmer" />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((url, i) => (
            <div key={i} className="relative group rounded-2xl overflow-hidden bg-gray-100 aspect-video">
              <img src={url} alt={`School photo ${i + 1}`}
                className="w-full h-full object-cover transition group-hover:scale-105"
                onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                <button onClick={() => handleDelete(url)} disabled={saving}
                  className="opacity-0 group-hover:opacity-100 transition w-9 h-9 bg-red-500 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50">
                  <Trash2 size={15} className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Video Tab ────────────────────────────────────────────────────────────────

function VideoTab({ school }) {
  const [campusStory, setCampusStory] = useState(school?.campusStory || '');
  const [campusStoryInput, setCampusStoryInput] = useState(school?.campusStory || '');
  const [savingStory, setSavingStory] = useState(false);

  const [videos, setVideos] = useState(school?.videos || []);
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);

  const getYoutubeId = (url) => {
    const m = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return m?.[1];
  };
  const getThumb = (url) => {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  };

  const saveCampusStory = async () => {
    if (!school?._id) return;
    setSavingStory(true);
    try {
      await api.put(`/schools/${school._id}`, { campusStory: campusStoryInput.trim() });
      setCampusStory(campusStoryInput.trim());
      toast.success('Campus Story saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save Campus Story');
    } finally {
      setSavingStory(false);
    }
  };

  const removeCampusStory = async () => {
    if (!school?._id) return;
    setSavingStory(true);
    try {
      await api.put(`/schools/${school._id}`, { campusStory: '' });
      setCampusStory('');
      setCampusStoryInput('');
      toast.success('Campus Story removed');
    } catch {
      toast.error('Failed to remove');
    } finally {
      setSavingStory(false);
    }
  };

  const persistVideos = async (updated) => {
    if (!school?._id) { toast.error('No school found'); return; }
    setSaving(true);
    try {
      await api.put(`/schools/${school._id}`, { videos: updated });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save videos');
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { toast.error('Please enter a video URL'); return; }
    if (videos.includes(trimmed)) { toast.error('Video already added'); return; }
    const updated = [...videos, trimmed];
    setVideos(updated);
    setUrlInput('');
    await persistVideos(updated);
    toast.success('Video added');
  };

  const handleDelete = async (url) => {
    const updated = videos.filter((v) => v !== url);
    setVideos(updated);
    await persistVideos(updated);
    toast.success('Video removed');
  };

  const storyThumb = campusStory ? getThumb(campusStory) : null;

  return (
    <div className="space-y-6">

      {/* ── Campus Story ── */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">Campus Story</h2>
        <p className="text-sm text-gray-500 mb-4">
          A single featured video shown on the Campus Stories button on your school profile hero. Upload a short tour, welcome message, or highlights reel.
        </p>

        {/* Current story preview */}
        {campusStory && (
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video max-w-sm mb-4 group">
            {storyThumb ? (
              <img src={storyThumb} alt="Campus Story" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video size={32} className="text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center">
                <Play size={20} className="text-white fill-white ml-0.5" />
              </div>
            </div>
            <div className="absolute top-2 left-3">
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Campus Story</span>
            </div>
            <button onClick={removeCampusStory} disabled={savingStory}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition disabled:opacity-50">
              <X size={14} className="text-white" />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <p className="text-sm font-semibold text-gray-700">{campusStory ? 'Update' : 'Set'} Campus Story URL</p>
          <div className="flex gap-3">
            <input
              value={campusStoryInput}
              onChange={(e) => setCampusStoryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveCampusStory()}
              className={inp + ' flex-1'}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <button onClick={saveCampusStory} disabled={savingStory || !campusStoryInput.trim()}
              className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-green-800 transition whitespace-nowrap disabled:opacity-50">
              {savingStory ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>
          <p className="text-xs text-gray-400">Paste a YouTube video link. This video appears exclusively on the Campus Stories button on your profile.</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* ── General Videos ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">School Videos</h2>
            <p className="text-sm text-gray-500 mt-0.5">{videos.length} video{videos.length !== 1 ? 's' : ''} · shown in the Videos section of your profile</p>
          </div>
          {saving && (
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <span className="w-3.5 h-3.5 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin" />
              Saving...
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <p className="text-sm font-bold text-gray-900">Add Video</p>
          <p className="text-xs text-gray-500">Paste a YouTube link. These appear in the Videos section on your school profile page.</p>
          <div className="flex gap-3">
            <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className={inp + ' flex-1'} placeholder="https://www.youtube.com/watch?v=..." />
            <button onClick={handleAdd} disabled={saving}
              className="inline-flex items-center gap-2 bg-gray-800 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-gray-900 transition whitespace-nowrap disabled:opacity-60">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center mt-4">
            <Video size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-1">No videos yet</p>
            <p className="text-gray-400 text-xs">Add YouTube videos to showcase your school to parents</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {videos.map((url, i) => {
              const thumb = getThumb(url);
              return (
                <div key={i} className="relative group rounded-2xl overflow-hidden bg-gray-900 aspect-video">
                  {thumb ? (
                    <img src={thumb} alt={`Video ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video size={32} className="text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <Play size={20} className="text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center">
                    <button onClick={() => handleDelete(url)} disabled={saving}
                      className="opacity-0 group-hover:opacity-100 transition w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50">
                      <Trash2 size={16} className="text-white" />
                    </button>
                  </div>
                  <p className="absolute bottom-2 left-3 right-3 text-white/70 text-xs truncate">{url}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab({ school }) {
  const totalViews = school?.profileViews || 0;
  const totalEnquiries = school?.enquiryCount || 0;
  const conversionRate = totalViews > 0 ? ((totalEnquiries / totalViews) * 100).toFixed(1) + '%' : '—';
  const maxViews = Math.max(...WEEKLY_DATA.map((d) => d.views), 1);

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: String(totalViews), icon: Eye, color: 'bg-blue-100 text-blue-700', sub: 'All time' },
          { label: 'Achievements', value: String(school?.achievements?.length || 0), icon: TrendingUp, color: 'bg-green-100 text-green-700', sub: 'Listed awards' },
          { label: 'Enquiries', value: String(totalEnquiries), icon: MessageCircle, color: 'bg-purple-100 text-purple-700', sub: 'All time' },
          { label: 'Conversion Rate', value: conversionRate, icon: Users, color: 'bg-yellow-100 text-yellow-700', sub: 'Views to enquiries' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{value}</div>
            <div className="text-sm font-semibold text-gray-700 mt-0.5">{label}</div>
            <div className="text-xs text-gray-400 mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-gray-900">Weekly Profile Views</h3>
            <p className="text-xs text-gray-400 mt-0.5">Last 7 days</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-3 h-3 bg-green-500 rounded-sm inline-block" />
            Views
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {WEEKLY_DATA.map(({ day, views }) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">{views}</span>
              <div className="w-full relative">
                <div
                  className="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-600"
                  style={{ height: `${(views / maxViews) * 100}px` }}
                />
              </div>
              <span className="text-xs text-gray-400">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Note */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <BarChart2 size={18} className="text-blue-700" />
        </div>
        <div>
          <p className="font-semibold text-blue-900 text-sm">Detailed Analytics Coming Soon</p>
          <p className="text-blue-700 text-xs mt-1 leading-relaxed">
            We're building advanced analytics including demographics, traffic sources, enquiry breakdown, and monthly trends. This will be available in the next platform update.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Visit Requests Tab ───────────────────────────────────────────────────────

function VisitStatusBadge({ status }) {
  const map = {
    confirmed: { cls: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Confirmed' },
    pending:   { cls: 'bg-yellow-100 text-yellow-700', icon: Clock,        label: 'Pending'   },
    cancelled: { cls: 'bg-red-100 text-red-700',    icon: XCircle,      label: 'Declined'  },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>
      <Icon size={11} />
      {s.label}
    </span>
  );
}

function VisitRequestsTab() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/school')
      .then(({ data }) => setVisits(data.bookings || []))
      .catch(() => setVisits([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
    try {
      const { data } = await api.patch(`/bookings/${id}/school-action`, { action });
      setVisits((prev) => prev.map((v) => v._id === id ? { ...v, ...data.booking } : v));
      toast.success(action === 'confirm' ? 'Visit confirmed! Parent notified.' : 'Visit declined.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Action failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 skeleton-shimmer h-28" />
        ))}
      </div>
    );
  }

  const pending = visits.filter((v) => v.status === 'pending').length;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">Visit Requests</h2>
          <p className="text-xs text-gray-400 mt-0.5">Parents requesting school visits</p>
        </div>
        {pending > 0 && (
          <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full">
            {pending} pending
          </span>
        )}
      </div>

      {visits.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <CalendarCheck size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-700 mb-1">No visit requests yet</p>
          <p className="text-sm text-gray-400">When parents request visits to your school, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => (
            <div
              key={visit._id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition ${
                visit.status === 'cancelled' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Users size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">
                      {visit.name || visit.user?.name || 'Parent'}
                    </p>
                    <VisitStatusBadge status={visit.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {visit.email || visit.user?.email}
                    {visit.phone && ` · ${visit.phone}`}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <CalendarCheck size={11} className="text-gray-400" />
                      {new Date(visit.date).toDateString()}
                    </span>
                    {visit.timeSlot && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={11} className="text-gray-400" />
                        {visit.timeSlot}
                      </span>
                    )}
                  </div>
                  {visit.notes && (
                    <p className="text-xs text-gray-400 mt-1.5 italic">"{visit.notes}"</p>
                  )}
                  {visit.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAction(visit._id, 'confirm')}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-green-700 text-white px-4 py-1.5 rounded-lg hover:bg-green-800 transition"
                      >
                        <CheckCircle size={13} /> Confirm Visit
                      </button>
                      <button
                        onClick={() => handleAction(visit._id, 'decline')}
                        className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-100 px-4 py-1.5 rounded-lg hover:bg-red-100 transition"
                      >
                        <XCircle size={13} /> Decline
                      </button>
                    </div>
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

// ─── Owner Reviews Tab ────────────────────────────────────────────────────────

function OwnerReviewsTab({ school }) {
  const [reviews, setReviews] = useState([]);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async (pg = 1) => {
    if (!school?._id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/reviews/school/${school._id}`, { params: { page: pg, limit: 10 } });
      setReviews(data.reviews);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(1); }, [school?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!school) return (
    <div className="text-center py-16 text-gray-400">
      <Star size={36} className="mx-auto mb-3 opacity-30" />
      <p className="font-semibold text-gray-500">No school listing found.</p>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reviews for {school.name}</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {school.rating > 0
            ? `${school.rating?.toFixed(1)} avg rating · ${school.reviewCount} review${school.reviewCount !== 1 ? 's' : ''}`
            : 'No reviews yet'}
        </p>
      </div>

      {/* Rating overview */}
      {school.rating > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6 flex items-center gap-5">
          <div className="text-center shrink-0">
            <p className="text-5xl font-extrabold text-yellow-600">{school.rating?.toFixed(1)}</p>
            <div className="flex gap-0.5 justify-center my-1.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={14}
                  className={s <= Math.round(school.rating||0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-200'} />
              ))}
            </div>
            <p className="text-xs text-yellow-700 font-medium">{school.reviewCount} review{school.reviewCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="text-sm text-yellow-800 max-w-xs">
            <p className="font-semibold mb-1">Your school&apos;s rating</p>
            <p className="text-yellow-700 text-xs leading-relaxed">
              Reviews are submitted by parents and students on your school profile page. Respond to feedback by keeping your listing accurate and up to date.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-14 text-gray-400">
          <Star size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-500">No reviews yet</p>
          <p className="text-xs mt-1">Reviews will appear here once parents and students submit them.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {r.isAnonymous ? '?' : (r.user?.name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">
                        {r.isAnonymous ? 'Anonymous' : (r.user?.name || 'User')}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
                          {r.category}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-0.5 my-1.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={12}
                          className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                      ))}
                    </div>
                    {r.title && <p className="font-semibold text-gray-800 text-sm mb-1">{r.title}</p>}
                    <p className="text-gray-600 text-sm leading-relaxed">{r.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button disabled={page === 1} onClick={() => fetchReviews(page - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition">
                <ChevronRight size={14} className="rotate-180" />
              </button>
              <span className="text-sm text-gray-500 leading-9">Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => fetchReviews(page + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition">
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function SchoolOwnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        // GET /api/schools/my returns only schools owned by the logged-in user
        const { data } = await api.get('/schools/my');
        const schools = data.schools || [];
        // Take the first school — an owner typically has one listing
        setSchool(schools[0] || null);
      } catch {
        setSchool(null);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchSchool();
    else setLoading(false);
  }, [user]);

  // Close sidebar on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sidebarOpen]);

  const activeTabMeta = TABS.find((t) => t.id === activeTab);

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-white text-sm leading-tight">Naija &amp; Overseas</p>
            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">School Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
              activeTab === id
                ? 'bg-green-700 text-white shadow-lg shadow-green-900/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}>
            <Icon size={17} />
            {label}
            {activeTab === id && <span className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full" />}
          </button>
        ))}

        <div className="pt-4 mt-4 border-t border-gray-800">
          <Link to="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
            <ExternalLink size={17} /> View Site
          </Link>
        </div>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <div className="bg-gray-900 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-0.5 font-medium">Logged in as</p>
          <p className="text-sm text-white font-semibold truncate">{user?.name || user?.email || 'School Owner'}</p>
          {user?.email && <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>}
        </div>
        <button onClick={() => { logout(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all">
          <LogOut size={17} /> Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Desktop Sidebar ──────────────────────────────────────── */}
      <aside className="hidden lg:flex w-64 bg-gray-950 text-white min-h-screen flex-col shrink-0 fixed left-0 top-0 h-full z-30">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <aside ref={sidebarRef}
            className="absolute left-0 top-0 h-full w-72 bg-gray-950 text-white flex flex-col shadow-2xl transform transition-transform">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-700 rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <p className="font-extrabold text-white text-sm">School Portal</p>
              </div>
              <button onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition">
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === id
                      ? 'bg-green-700 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}>
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-800 space-y-2">
              <div className="bg-gray-900 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">Logged in as</p>
                <p className="text-sm text-white font-semibold truncate">{user?.name || user?.email || 'School Owner'}</p>
              </div>
              <button onClick={() => { logout(); navigate('/'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all">
                <LogOut size={17} /> Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen">

        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3.5 flex items-center gap-3 shadow-sm">
          <button onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 bg-green-700 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">School Portal</span>
          </div>
          {school && <StatusBadge status={school.status} />}
        </div>

        {/* Desktop Page Header */}
        <div className="hidden lg:flex bg-white border-b border-gray-100 px-8 py-5 items-center justify-between">
          <div className="flex items-center gap-3">
            {activeTabMeta && <activeTabMeta.icon size={20} className="text-gray-400" />}
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">{activeTabMeta?.label}</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Welcome back, <span className="font-medium text-gray-600">{user?.name || 'School Owner'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {school && <StatusBadge status={school.status} />}
            {school?.status === 'approved' && school?.slug && (
              <Link to={`/schools/${school.slug}`} target="_blank"
                className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition">
                <ExternalLink size={14} /> View Live
              </Link>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-x-hidden">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab school={school} setActiveTab={setActiveTab} />}
              {activeTab === 'school' && <MySchoolTab school={school} setActiveTab={setActiveTab} />}
              {activeTab === 'edit' && <EditListingTab school={school} onSaved={(updated) => setSchool((s) => ({ ...s, ...updated }))} />}
              {activeTab === 'achievements' && <AchievementsTab school={school} />}
              {activeTab === 'reports' && <ExamResultsTab school={school} />}
              {activeTab === 'gallery' && <GalleryTab school={school} />}
              {activeTab === 'videos' && <VideoTab school={school} />}
              {activeTab === 'analytics' && <AnalyticsTab school={school} />}
              {activeTab === 'visits' && <VisitRequestsTab />}
              {activeTab === 'reviews' && <OwnerReviewsTab school={school} />}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile Bottom Tab Bar ────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20 shadow-lg">
        <div className="flex">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                activeTab === id ? 'text-green-700' : 'text-gray-400 hover:text-gray-600'
              }`}>
              <Icon size={19} strokeWidth={activeTab === id ? 2.5 : 1.8} />
              <span className="truncate w-full text-center px-0.5">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
