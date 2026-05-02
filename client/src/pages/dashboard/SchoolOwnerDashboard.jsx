import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, School, Edit3, Trophy, Image, BarChart2,
  Menu, X, Eye, MessageCircle, Star, Plus, Trash2, Save,
  ExternalLink, CheckCircle, Clock, AlertCircle, ChevronRight,
  GraduationCap, MapPin, Phone, Mail, Globe, DollarSign,
  Camera, TrendingUp, Users, Activity, BookOpen
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

const MOCK_ACHIEVEMENTS = [
  { id: '1', title: 'WAEC Best School Award 2024', category: 'Academic Excellence', year: '2024', description: '1st in Lagos State WAEC Results' },
  { id: '2', title: 'Best Private Secondary School', category: 'Industry Recognition', year: '2023', description: 'Education Excellence Awards, Southwest Nigeria' },
  { id: '3', title: 'National Science Olympiad Winner', category: 'Academic Excellence', year: '2024', description: '3 students in national top 10' },
];

const CATEGORY_COLORS = {
  'Academic Excellence': 'bg-blue-100 text-blue-700',
  'Sports': 'bg-green-100 text-green-700',
  'Arts': 'bg-purple-100 text-purple-700',
  'Industry Recognition': 'bg-orange-100 text-orange-700',
  'Rankings': 'bg-teal-100 text-teal-700',
};

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'school', label: 'My School', icon: School },
  { id: 'edit', label: 'Edit Listing', icon: Edit3 },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

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
  return <div className={`bg-gray-200 animate-pulse rounded-xl ${className}`} />;
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

function OverviewTab({ school, setActiveTab }) {
  const achievements = school?.achievements ?? MOCK_ACHIEVEMENTS;

  const recentActivity = [
    { icon: MessageCircle, color: 'bg-blue-100 text-blue-700', text: 'New enquiry from a parent in Lagos', time: '2 hours ago' },
    { icon: Eye, color: 'bg-purple-100 text-purple-700', text: 'Your profile was viewed 12 times today', time: '5 hours ago' },
    { icon: Star, color: 'bg-yellow-100 text-yellow-700', text: 'New review submitted on your listing', time: 'Yesterday' },
  ];

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
            <Plus size={15} /> Add Your School
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
          { label: 'Profile Views', value: '234', sub: 'All time', icon: Eye, color: 'bg-blue-100 text-blue-700' },
          { label: 'Enquiries This Month', value: '18', sub: 'May 2026', icon: MessageCircle, color: 'bg-green-100 text-green-700' },
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
            { label: 'View Analytics', tab: 'analytics', icon: BarChart2, color: 'text-green-700 bg-green-50 hover:bg-green-100' },
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
          {recentActivity.map(({ icon: Icon, color, text, time }, i) => (
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
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8">
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
    name: school?.name ?? '',
    type: school?.type ?? 'private',
    level: school?.level ?? 'secondary',
    state: school?.state ?? '',
    city: school?.city ?? '',
    address: school?.address ?? '',
    curriculum: school?.curriculum ?? [],
    fees: { tuition: school?.fees?.tuition ?? '', boarding: school?.fees?.boarding ?? '' },
    description: school?.description ?? '',
    contact: { phone: school?.contact?.phone ?? '', email: school?.contact?.email ?? '', website: school?.contact?.website ?? '' },
    facilities: school?.facilities ?? [],
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
  const [achievements, setAchievements] = useState(
    school?.achievements?.length ? school.achievements : MOCK_ACHIEVEMENTS
  );
  const [form, setForm] = useState({ title: '', category: 'Academic Excellence', year: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!form.title.trim() || !form.year.trim()) {
      toast.error('Title and year are required');
      return;
    }
    const newAch = { ...form, id: Date.now().toString() };
    setAchievements((prev) => [newAch, ...prev]);
    setForm({ title: '', category: 'Academic Excellence', year: '', description: '' });
    setShowForm(false);
    toast.success('Achievement added');
  };

  const handleDelete = (id) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
    toast.success('Achievement removed');
  };

  const handleSave = async () => {
    if (!school?._id) { toast.error('No school found'); return; }
    setSaving(true);
    try {
      await api.put(`/schools/${school._id}`, { achievements });
      toast.success('Achievements saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save achievements');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Achievements</h2>
          <p className="text-sm text-gray-500 mt-0.5">{achievements.length} achievement{achievements.length !== 1 ? 's' : ''} listed</p>
        </div>
        <div className="flex items-center gap-3">
          {school?._id && (
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition disabled:opacity-60">
              {saving ? <span className="w-3.5 h-3.5 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin" /> : <Save size={14} />}
              Save
            </button>
          )}
          <button onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-800 transition">
            <Plus size={15} /> Add Achievement
          </button>
        </div>
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
              <button onClick={handleAdd}
                className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-800 transition">
                <Plus size={14} /> Add Achievement
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
              <button onClick={() => handleDelete(ach.id)}
                className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center shrink-0 transition">
                <Trash2 size={14} className="text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

function GalleryTab({ school }) {
  const [images, setImages] = useState(school?.images ?? []);
  const [urlInput, setUrlInput] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { toast.error('Please enter an image URL'); return; }
    if (images.includes(trimmed)) { toast.error('Image already added'); return; }
    setImages((prev) => [...prev, trimmed]);
    setUrlInput('');
    toast.success('Image added');
  };

  const handleDelete = (url) => {
    setImages((prev) => prev.filter((img) => img !== url));
    toast.success('Image removed');
  };

  const handleSave = async () => {
    if (!school?._id) { toast.error('No school found'); return; }
    setSaving(true);
    try {
      await api.put(`/schools/${school._id}`, { images });
      toast.success('Gallery saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save gallery');
    } finally {
      setSaving(false);
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
        {school?._id && (
          <button onClick={handleSave} disabled={saving}
            className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-green-800 transition disabled:opacity-60">
            {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
            Save Gallery
          </button>
        )}
      </div>

      {/* Add Photo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm font-bold text-gray-900 mb-3">Add Photo</p>
        <div className="flex gap-3">
          <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className={inp + ' flex-1'} placeholder="Paste image URL (e.g. https://...)" />
          <button onClick={handleAdd}
            className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-5 py-3 rounded-xl hover:bg-green-800 transition whitespace-nowrap">
            <Plus size={14} /> Add
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Paste a direct image URL. Recommended size: 1200×800px.</p>
      </div>

      {/* Image Grid */}
      {images.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Camera size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">No photos yet</p>
          <p className="text-gray-400 text-xs">Add photos of your school to attract more parents</p>
          <div className="grid grid-cols-3 gap-3 mt-6 max-w-xs mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
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
                <button onClick={() => handleDelete(url)}
                  className="opacity-0 group-hover:opacity-100 transition w-9 h-9 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
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

// ─── Analytics Tab ────────────────────────────────────────────────────────────

function AnalyticsTab() {
  const maxViews = Math.max(...WEEKLY_DATA.map((d) => d.views));

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: '234', icon: Eye, color: 'bg-blue-100 text-blue-700', sub: 'All time' },
          { label: 'This Month', value: '45', icon: TrendingUp, color: 'bg-green-100 text-green-700', sub: 'May 2026' },
          { label: 'Enquiries', value: '18', icon: MessageCircle, color: 'bg-purple-100 text-purple-700', sub: 'This month' },
          { label: 'Conversion Rate', value: '7.7%', icon: Users, color: 'bg-yellow-100 text-yellow-700', sub: 'Views to enquiries' },
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function SchoolOwnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        const { data } = await api.get('/schools/admin/all');
        const schools = data.schools ?? data ?? [];
        const found = schools.find(
          (s) => s.owner?._id === user?._id || s.owner === user?._id
        );
        setSchool(found ?? null);
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
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-900 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-0.5 font-medium">Logged in as</p>
          <p className="text-sm text-white font-semibold truncate">{user?.name || user?.email || 'School Owner'}</p>
          {user?.email && <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>}
        </div>
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
            <div className="p-4 border-t border-gray-800">
              <div className="bg-gray-900 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">Logged in as</p>
                <p className="text-sm text-white font-semibold truncate">{user?.name || user?.email || 'School Owner'}</p>
              </div>
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
              {activeTab === 'gallery' && <GalleryTab school={school} />}
              {activeTab === 'analytics' && <AnalyticsTab />}
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
