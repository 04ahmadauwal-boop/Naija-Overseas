import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Search, Heart, BarChart3, CalendarCheck,
  Users, Menu, X, BookOpen, MapPin, Trash2, Plus, ChevronDown,
  GraduationCap, Bell, LogOut, CheckCircle, Clock, XCircle,
  SlidersHorizontal, Pencil, Tag, AlertCircle, ArrowRight, Settings, ClipboardList,
} from 'lucide-react';
import ChangePasswordSection from '../../components/ChangePasswordSection';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers',
  'Sokoto','Taraba','Yobe','Zamfara',
];

const SCHOOL_TYPES = ['Government', 'Private', 'Federal', 'International', 'Mission'];
const CURRICULA = ['WAEC', 'NECO', 'IB', 'Cambridge', 'Montessori', 'American'];

const MOCK_SAVED = [
  { _id: '1', name: 'Greenfield International School', state: 'Lagos', city: 'Lekki', type: 'private', fees: { tuition: 1800000 }, curriculum: 'WAEC' },
  { _id: '2', name: 'Kings College', state: 'Lagos', city: 'Lagos Island', type: 'federal', fees: { tuition: 50000 }, curriculum: 'WAEC' },
];


const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'find', label: 'Find Schools', icon: Search },
  { id: 'saved', label: 'Saved Schools', icon: Heart },
  { id: 'compare', label: 'Compare', icon: BarChart3 },
  { id: 'visits', label: 'School Visits', icon: CalendarCheck },
  { id: 'admissions', label: 'Applications', icon: ClipboardList },
  { id: 'children', label: 'My Children', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function formatFee(amount) {
  if (!amount) return 'Contact School';
  return `₦${Number(amount).toLocaleString()}`;
}

function TypeBadge({ type }) {
  const map = {
    private: 'bg-purple-100 text-purple-700',
    federal: 'bg-blue-100 text-blue-700',
    government: 'bg-green-100 text-green-700',
    international: 'bg-yellow-100 text-yellow-700',
    mission: 'bg-orange-100 text-orange-700',
  };
  const cls = map[type?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${cls}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    confirmed: { cls: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Confirmed' },
    pending: { cls: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
    cancelled: { cls: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
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

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="h-36 skeleton-shimmer rounded-xl mb-3" />
      <div className="h-4 skeleton-shimmer rounded w-3/4 mb-2" />
      <div className="h-3 skeleton-shimmer rounded w-1/2 mb-3" />
      <div className="h-8 skeleton-shimmer rounded-xl" />
    </div>
  );
}

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Saved schools
  const [savedSchools, setSavedSchools] = useState(() => {
    try {
      const stored = localStorage.getItem('savedSchools');
      return stored ? JSON.parse(stored) : MOCK_SAVED;
    } catch {
      return MOCK_SAVED;
    }
  });

  // School notes
  const [schoolNotes, setSchoolNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('schoolNotes') || '{}');
    } catch {
      return {};
    }
  });

  // Find Schools state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCurriculum, setFilterCurriculum] = useState('');
  const [schoolResults, setSchoolResults] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolsFetched, setSchoolsFetched] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  // School visits
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(false);

  // My children
  const [children, setChildren] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('myChildren') || '[]');
    } catch {
      return [];
    }
  });
  const [showAddChild, setShowAddChild] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [childForm, setChildForm] = useState({ name: '', age: '', grade: '', preferences: '' });

  // Quick search (overview)
  const [quickState, setQuickState] = useState('');
  const [quickType, setQuickType] = useState('');

  // Persist saved schools
  useEffect(() => {
    localStorage.setItem('savedSchools', JSON.stringify(savedSchools));
  }, [savedSchools]);

  // Persist school notes
  useEffect(() => {
    localStorage.setItem('schoolNotes', JSON.stringify(schoolNotes));
  }, [schoolNotes]);

  // Persist children
  useEffect(() => {
    localStorage.setItem('myChildren', JSON.stringify(children));
  }, [children]);

  // Fetch visits
  const fetchVisits = useCallback(async () => {
    setVisitsLoading(true);
    try {
      const { data } = await api.get('/bookings/my', { params: { service: 'school-visit' } });
      setVisits(data.bookings || []);
    } catch {
      setVisits([]);
    } finally {
      setVisitsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'visits') return;
    fetchVisits();
  }, [activeTab, fetchVisits]);

  // Fetch schools (Find Schools tab)
  const fetchSchools = useCallback(async () => {
    setSchoolsLoading(true);
    setSchoolsFetched(false);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (filterState) params.state = filterState;
      if (filterType) params.type = filterType.toLowerCase();
      if (filterCurriculum) params.curriculum = filterCurriculum;
      const { data } = await api.get('/schools', { params });
      setSchoolResults(data.schools || []);
    } catch {
      setSchoolResults([]);
      toast.error('Failed to load schools. Please try again.');
    } finally {
      setSchoolsLoading(false);
      setSchoolsFetched(true);
    }
  }, [searchQuery, filterState, filterType, filterCurriculum]);

  useEffect(() => {
    if (activeTab === 'find') {
      fetchSchools();
    }
  }, [activeTab, fetchSchools]);

  const toggleSaveSchool = (school) => {
    const exists = savedSchools.find((s) => s._id === school._id);
    if (exists) {
      setSavedSchools((prev) => prev.filter((s) => s._id !== school._id));
      toast('Removed from saved schools');
    } else {
      setSavedSchools((prev) => [...prev, school]);
      toast.success('School saved!');
    }
  };

  const isSaved = (id) => savedSchools.some((s) => s._id === id);

  const toggleCompare = (school) => {
    const exists = selectedForCompare.find((s) => s._id === school._id);
    if (exists) {
      setSelectedForCompare((prev) => prev.filter((s) => s._id !== school._id));
    } else {
      if (selectedForCompare.length >= 3) {
        toast.error('You can compare up to 3 schools at a time');
        return;
      }
      setSelectedForCompare((prev) => [...prev, school]);
      toast.success('Added to comparison');
    }
  };

  const isSelectedForCompare = (id) => selectedForCompare.some((s) => s._id === id);

  const handleCompareNavigate = () => {
    if (selectedForCompare.length < 2) {
      toast.error('Please select at least 2 schools to compare');
      return;
    }
    navigate('/compare', { state: { schools: selectedForCompare } });
  };

  const handleCancelVisit = async (visitId) => {
    try {
      await api.patch(`/bookings/${visitId}/cancel`);
      setVisits((prev) => prev.map((v) => v._id === visitId ? { ...v, status: 'cancelled' } : v));
      toast.success('Visit cancelled');
    } catch {
      toast.error('Failed to cancel visit. Please try again.');
    }
  };

  const handleSaveChild = () => {
    if (!childForm.name.trim()) {
      toast.error('Please enter child name');
      return;
    }
    if (editingChild !== null) {
      setChildren((prev) => prev.map((c, i) => i === editingChild ? { ...childForm } : c));
      toast.success('Child updated');
    } else {
      setChildren((prev) => [...prev, { ...childForm }]);
      toast.success('Child added');
    }
    setChildForm({ name: '', age: '', grade: '', preferences: '' });
    setShowAddChild(false);
    setEditingChild(null);
  };

  const handleEditChild = (idx) => {
    setChildForm({ ...children[idx] });
    setEditingChild(idx);
    setShowAddChild(true);
  };

  const handleDeleteChild = (idx) => {
    setChildren((prev) => prev.filter((_, i) => i !== idx));
    toast('Child removed');
  };

  const handleQuickSearch = () => {
    const params = new URLSearchParams();
    if (quickState) params.set('state', quickState);
    if (quickType) params.set('type', quickType.toLowerCase());
    navigate(`/?${params.toString()}`);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const firstName = user?.name?.split(' ')[0] || 'Parent';

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-gray-950 text-white min-h-screen flex-col shrink-0 fixed left-0 top-0 bottom-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm leading-tight">Education Naija &amp; Overseas</p>
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Parent Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
              <Icon size={17} />
              {label}
              {activeTab === id && (
                <div className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="bg-gray-900 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-0.5 font-medium">Logged in as</p>
            <p className="text-sm text-white font-semibold truncate">{user?.name || 'Parent'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Slide-in Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-gray-950 text-white z-50 flex flex-col transition-transform duration-300 lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-700 rounded-xl flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm leading-tight">Education Naija &amp; Overseas</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">Parent Dashboard</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === id
                  ? 'bg-green-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Mobile Top Bar */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
            >
              <Menu size={20} />
            </button>
            <span className="font-bold text-gray-900 text-sm">
              {TABS.find((t) => t.id === activeTab)?.label || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {firstName[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden lg:flex bg-white border-b border-gray-100 px-8 py-4 items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              {TABS.find((t) => t.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">Education Naija &amp; Overseas — Parent Portal</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <div className="w-7 h-7 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                {firstName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-gray-400">Parent</p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-10">
          {activeTab === 'overview' && (
            <OverviewTab
              firstName={firstName}
              savedSchools={savedSchools}
              visits={visits}
              quickState={quickState}
              setQuickState={setQuickState}
              quickType={quickType}
              setQuickType={setQuickType}
              handleQuickSearch={handleQuickSearch}
              onRemoveSaved={(id) => setSavedSchools((prev) => prev.filter((s) => s._id !== id))}
              onNavigate={handleTabChange}
            />
          )}
          {activeTab === 'find' && (
            <FindSchoolsTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterState={filterState}
              setFilterState={setFilterState}
              filterType={filterType}
              setFilterType={setFilterType}
              filterCurriculum={filterCurriculum}
              setFilterCurriculum={setFilterCurriculum}
              schools={schoolResults}
              loading={schoolsLoading}
              fetched={schoolsFetched}
              isSaved={isSaved}
              toggleSaveSchool={toggleSaveSchool}
              isSelectedForCompare={isSelectedForCompare}
              toggleCompare={toggleCompare}
              selectedForCompare={selectedForCompare}
              handleCompareNavigate={handleCompareNavigate}
              fetchSchools={fetchSchools}
            />
          )}
          {activeTab === 'saved' && (
            <SavedSchoolsTab
              savedSchools={savedSchools}
              setSavedSchools={setSavedSchools}
              schoolNotes={schoolNotes}
              setSchoolNotes={setSchoolNotes}
              onNavigate={handleTabChange}
              selectedForCompare={selectedForCompare}
              toggleCompare={toggleCompare}
            />
          )}
          {activeTab === 'compare' && (
            <CompareTab
              selectedForCompare={selectedForCompare}
              setSelectedForCompare={setSelectedForCompare}
              handleCompareNavigate={handleCompareNavigate}
              onNavigate={handleTabChange}
            />
          )}
          {activeTab === 'visits' && (
            <VisitsTab
              visits={visits}
              loading={visitsLoading}
              onCancel={handleCancelVisit}
              user={user}
              onBookingCreated={fetchVisits}
              savedSchools={savedSchools}
            />
          )}
          {activeTab === 'admissions' && <ParentAdmissionsTab />}
          {activeTab === 'children' && (
            <ChildrenTab
              children={children}
              showAddChild={showAddChild}
              setShowAddChild={setShowAddChild}
              childForm={childForm}
              setChildForm={setChildForm}
              editingChild={editingChild}
              setEditingChild={setEditingChild}
              handleSaveChild={handleSaveChild}
              handleEditChild={handleEditChild}
              handleDeleteChild={handleDeleteChild}
            />
          )}
          {activeTab === 'settings' && (
            <div className="space-y-5 max-w-2xl">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Settings</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-green-700 flex items-center justify-center text-white font-extrabold text-lg">
                    {(user?.name || 'P').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Parent Account</span>
                  </div>
                </div>
              </div>
              <ChangePasswordSection />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20 flex">
        {TABS.slice(0, 5).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition ${
              activeTab === id ? 'text-green-700' : 'text-gray-400'
            }`}
          >
            <Icon size={19} />
            <span className="text-[9px] font-medium leading-tight">{label.split(' ')[0]}</span>
          </button>
        ))}
        <button
          onClick={() => handleTabChange('children')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1 transition ${
            activeTab === 'children' ? 'text-green-700' : 'text-gray-400'
          }`}
        >
          <Users size={19} />
          <span className="text-[9px] font-medium leading-tight">Children</span>
        </button>
      </nav>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({
  firstName, savedSchools, visits, quickState, setQuickState,
  quickType, setQuickType, handleQuickSearch, onRemoveSaved, onNavigate,
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-green-700 to-green-600 rounded-2xl p-6 text-white">
        <p className="text-green-200 text-sm mb-1">Welcome back</p>
        <h2 className="text-2xl font-extrabold mb-1">Hello, {firstName}!</h2>
        <p className="text-green-100 text-sm">Find the perfect school for your child.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3 lg:gap-5">
        {[
          { label: 'Saved Schools', value: savedSchools.length, icon: Heart, color: 'bg-pink-100 text-pink-700', tab: 'saved' },
          { label: 'Upcoming Visits', value: visits.filter((v) => v.status !== 'cancelled').length, icon: CalendarCheck, color: 'bg-blue-100 text-blue-700', tab: 'visits' },
          { label: 'Schools Compared', value: 3, icon: BarChart3, color: 'bg-purple-100 text-purple-700', tab: 'compare' },
        ].map(({ label, value, icon: Icon, color, tab }) => (
          <button
            key={label}
            onClick={() => onNavigate(tab)}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">{value}</div>
            <div className="text-xs font-medium text-gray-500 mt-0.5 leading-tight">{label}</div>
          </button>
        ))}
      </div>

      {/* Saved Schools Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Saved Schools</h3>
          <button onClick={() => onNavigate('saved')} className="text-xs text-green-700 font-semibold flex items-center gap-1 hover:underline">
            View all <ArrowRight size={12} />
          </button>
        </div>
        {savedSchools.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <Heart size={28} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No saved schools yet</p>
            <button onClick={() => onNavigate('find')} className="mt-2 text-xs text-green-700 font-semibold hover:underline">
              Start searching
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {savedSchools.slice(0, 3).map((school) => (
              <div key={school._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{school.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                      <MapPin size={10} /> {school.city ? `${school.city}, ` : ''}{school.state}
                    </span>
                    <TypeBadge type={school.type} />
                    <span className="text-[11px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                      {formatFee(school.fees?.tuition)}/yr
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveSaved(school._id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 transition shrink-0"
                  title="Remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Visits */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Upcoming Visits</h3>
          <button onClick={() => onNavigate('visits')} className="text-xs text-green-700 font-semibold flex items-center gap-1 hover:underline">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-3">
          {visits.filter((v) => v.status !== 'cancelled').slice(0, 2).map((visit) => (
            <div key={visit._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <CalendarCheck size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{visit.name || visit.notes || 'School Visit'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{visit.date} · {visit.timeSlot || visit.time}</p>
              </div>
              <StatusBadge status={visit.status} />
            </div>
          ))}
          {visits.filter((v) => v.status !== 'cancelled').length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">No upcoming visits</p>
          )}
        </div>
      </div>

      {/* Quick Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Quick School Search</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={quickState}
              onChange={(e) => setQuickState(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8"
            >
              <option value="">All States</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="relative flex-1">
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={quickType}
              onChange={(e) => setQuickType(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8"
            >
              <option value="">All Types</option>
              {SCHOOL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button
            onClick={handleQuickSearch}
            className="flex items-center justify-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition whitespace-nowrap"
          >
            <Search size={15} /> Search Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Find Schools Tab ─────────────────────────────────────────────────────────
function FindSchoolsTab({
  searchQuery, setSearchQuery, filterState, setFilterState,
  filterType, setFilterType, filterCurriculum, setFilterCurriculum,
  schools, loading, fetched, isSaved, toggleSaveSchool,
  isSelectedForCompare, toggleCompare, selectedForCompare,
  handleCompareNavigate, fetchSchools,
}) {
  return (
    <div className="space-y-5">
      {/* Search + Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-5">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={16} className="text-green-700" />
          <h3 className="font-bold text-gray-900 text-sm">Search & Filter Schools</h3>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchSchools()}
              placeholder="Search schools by name..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: filterState, setter: setFilterState, placeholder: 'State', options: NIGERIAN_STATES },
              { value: filterType, setter: setFilterType, placeholder: 'Type', options: SCHOOL_TYPES },
              { value: filterCurriculum, setter: setFilterCurriculum, placeholder: 'Curriculum', options: CURRICULA },
            ].map(({ value, setter, placeholder, options }) => (
              <div key={placeholder} className="relative">
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 pr-6"
                >
                  <option value="">All {placeholder}s</option>
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={fetchSchools}
            className="w-full bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition flex items-center justify-center gap-2"
          >
            <Search size={15} /> Search Schools
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : fetched && schools.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <BookOpen size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-700 mb-1">No schools found</p>
          <p className="text-sm text-gray-400">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school) => (
            <FindSchoolCard
              key={school._id}
              school={school}
              isSaved={isSaved(school._id)}
              toggleSaveSchool={toggleSaveSchool}
              isCompareSelected={isSelectedForCompare(school._id)}
              toggleCompare={toggleCompare}
            />
          ))}
        </div>
      )}

      {/* Compare Sticky Button */}
      {selectedForCompare.length >= 2 && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={handleCompareNavigate}
            className="flex items-center gap-2 bg-green-700 text-white px-6 py-3 rounded-full shadow-2xl font-semibold text-sm hover:bg-green-800 transition"
          >
            <BarChart3 size={16} />
            Compare {selectedForCompare.length} Schools
          </button>
        </div>
      )}
    </div>
  );
}

function FindSchoolCard({ school, isSaved, toggleSaveSchool, isCompareSelected, toggleCompare }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all ${
      isCompareSelected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
    }`}>
      <div className="relative h-36 bg-linear-to-br from-green-50 to-green-100 flex items-center justify-center overflow-hidden">
        {school.images?.[0] ? (
          <img src={school.images[0]} alt={school.name} className="w-full h-full object-cover" />
        ) : (
          <BookOpen size={32} className="text-green-300" />
        )}
        <button
          onClick={() => toggleSaveSchool(school)}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow transition ${
            isSaved ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
          }`}
          title={isSaved ? 'Remove from saved' : 'Save school'}
        >
          <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        {isCompareSelected && (
          <div className="absolute top-2.5 left-2.5 bg-green-600 text-white rounded-full p-0.5">
            <CheckCircle size={15} />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-snug">{school.name}</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin size={11} />
          <span>{school.city ? `${school.city}, ` : ''}{school.state}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <TypeBadge type={school.type} />
          {school.level && (
            <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">{school.level}</span>
          )}
        </div>
        <div className="text-xs text-gray-500 border-t border-gray-100 pt-2">
          <span className="font-semibold text-gray-700">{formatFee(school.fees?.tuition)}</span>
          <span className="text-gray-400"> / year</span>
        </div>
        <button
          onClick={() => toggleCompare(school)}
          className={`mt-auto w-full text-xs py-2 rounded-xl font-semibold transition border ${
            isCompareSelected
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300'
          }`}
        >
          {isCompareSelected ? '✓ Selected for Compare' : 'Add to Compare'}
        </button>
      </div>
    </div>
  );
}

// ─── Saved Schools Tab ────────────────────────────────────────────────────────
function SavedSchoolsTab({ savedSchools, setSavedSchools, schoolNotes, setSchoolNotes, onNavigate, selectedForCompare, toggleCompare }) {
  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Saved Schools ({savedSchools.length})</h2>
        <button
          onClick={() => onNavigate('find')}
          className="flex items-center gap-1.5 text-sm bg-green-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-800 transition"
        >
          <Search size={14} /> Find More
        </button>
      </div>

      {savedSchools.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <BookOpen size={44} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-700 mb-1">No saved schools yet</p>
          <p className="text-sm text-gray-400 mb-4">Save schools from the Find Schools tab to compare them later.</p>
          <button
            onClick={() => onNavigate('find')}
            className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition"
          >
            <Search size={15} /> Start Searching
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedSchools.map((school) => (
            <SavedSchoolCard
              key={school._id}
              school={school}
              note={schoolNotes[school._id] || ''}
              onNoteChange={(val) => setSchoolNotes((prev) => ({ ...prev, [school._id]: val }))}
              onRemove={() => setSavedSchools((prev) => prev.filter((s) => s._id !== school._id))}
              isCompareSelected={selectedForCompare.some((s) => s._id === school._id)}
              toggleCompare={toggleCompare}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SavedSchoolCard({ school, note, onNoteChange, onRemove, isCompareSelected, toggleCompare }) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition ${
      isCompareSelected ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-100'
    }`}>
      <div className="p-4 flex gap-3">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
          <BookOpen size={20} className="text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{school.name}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <MapPin size={10} />
            <span>{school.city ? `${school.city}, ` : ''}{school.state}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <TypeBadge type={school.type} />
            <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
              {formatFee(school.fees?.tuition)}/yr
            </span>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 flex flex-col gap-3">
        <button
          onClick={() => setShowNote((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition font-medium"
        >
          <Pencil size={12} />
          {showNote ? 'Hide notes' : note ? 'View / edit notes' : 'Add private notes'}
        </button>
        {showNote && (
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Write private notes about this school..."
            rows={3}
            className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        )}
        <div className="flex gap-2">
          <button
            onClick={() => toggleCompare(school)}
            className={`flex-1 text-xs py-2 rounded-xl font-semibold transition border ${
              isCompareSelected
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300'
            }`}
          >
            {isCompareSelected ? '✓ In Compare' : 'Compare'}
          </button>
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition border border-red-100"
          >
            <Trash2 size={13} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Compare Tab ──────────────────────────────────────────────────────────────
function CompareTab({ selectedForCompare, setSelectedForCompare, handleCompareNavigate, onNavigate }) {
  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">Compare Schools ({selectedForCompare.length}/3)</h2>
        {selectedForCompare.length >= 2 && (
          <button
            onClick={handleCompareNavigate}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-800 transition"
          >
            <BarChart3 size={15} /> Compare Now
          </button>
        )}
      </div>

      {selectedForCompare.length < 2 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <AlertCircle size={40} className="mx-auto mb-3 text-amber-400" />
          <p className="font-semibold text-gray-700 mb-1">Select at least 2 schools</p>
          <p className="text-sm text-gray-400 mb-4">
            Go to Find Schools or Saved Schools and click "Add to Compare" on the schools you want to compare.
          </p>
          <button
            onClick={() => onNavigate('find')}
            className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition"
          >
            <Search size={15} /> Find Schools
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {selectedForCompare.map((school) => (
            <div key={school._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen size={18} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{school.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400 flex items-center gap-0.5">
                    <MapPin size={10} /> {school.city ? `${school.city}, ` : ''}{school.state}
                  </span>
                  <TypeBadge type={school.type} />
                </div>
              </div>
              <button
                onClick={() => setSelectedForCompare((prev) => prev.filter((s) => s._id !== school._id))}
                className="p-1.5 text-gray-300 hover:text-red-500 transition"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {selectedForCompare.length < 3 && (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center">
              <Plus size={20} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">Add one more school to compare (optional)</p>
              <button
                onClick={() => onNavigate('find')}
                className="mt-2 text-xs text-green-700 font-semibold hover:underline"
              >
                Go to Find Schools
              </button>
            </div>
          )}

          <button
            onClick={handleCompareNavigate}
            className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-3 rounded-2xl font-bold text-sm hover:bg-green-800 transition shadow-sm"
          >
            <BarChart3 size={17} /> View Full Comparison
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Visits Tab ───────────────────────────────────────────────────────────────
const EMPTY_BOOKING_FORM = { schoolName: '', date: '', timeSlot: '', notes: '' };

function VisitsTab({ visits, loading, onCancel, user, onBookingCreated, savedSchools = [] }) {
  const [form, setForm] = useState(EMPTY_BOOKING_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);

  const handleSelectSavedSchool = (school) => {
    if (selectedSchoolId === school._id) {
      setSelectedSchoolId(null);
      setForm((p) => ({ ...p, schoolName: '' }));
    } else {
      setSelectedSchoolId(school._id);
      setForm((p) => ({ ...p, schoolName: school.name }));
    }
  };

  const handleBookVisit = async (e) => {
    e.preventDefault();
    if (!form.schoolName.trim()) { toast.error('Please enter a school name'); return; }
    if (!form.date) { toast.error('Please select a preferred date'); return; }
    if (!form.timeSlot) { toast.error('Please select a time slot'); return; }
    setSubmitting(true);
    try {
      await api.post('/bookings', {
        name: user?.name || '',
        email: user?.email || '',
        service: 'school-visit',
        date: form.date,
        timeSlot: form.timeSlot,
        notes: form.schoolName + (form.notes ? ` — ${form.notes}` : ''),
        ...(selectedSchoolId ? { schoolId: selectedSchoolId } : {}),
      });
      toast.success('Visit booked successfully!');
      setForm(EMPTY_BOOKING_FORM);
      setSelectedSchoolId(null);
      onBookingCreated();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to book visit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">School Visits</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
          {visits.filter((v) => v.status !== 'cancelled').length} active
        </span>
      </div>

      {/* Book a Visit Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Plus size={16} className="text-green-700" />
          <h3 className="font-bold text-gray-900 text-sm">Book a School Visit</h3>
        </div>
        <form onSubmit={handleBookVisit} className="space-y-3">
          {/* Saved school quick-select */}
          {savedSchools.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Quick-select from saved schools</p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-0.5 px-0.5">
                {savedSchools.map((school) => (
                  <button
                    key={school._id}
                    type="button"
                    onClick={() => handleSelectSavedSchool(school)}
                    className={`flex-shrink-0 text-left px-3 py-2 rounded-xl border text-xs font-medium transition ${
                      selectedSchoolId === school._id
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-green-400 hover:bg-green-50'
                    }`}
                  >
                    <div className="font-semibold max-w-[130px] truncate">{school.name}</div>
                    <div className={`text-[10px] mt-0.5 ${selectedSchoolId === school._id ? 'text-green-200' : 'text-gray-400'}`}>
                      {school.city ? `${school.city}, ` : ''}{school.state}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <input
            type="text"
            value={form.schoolName}
            onChange={(e) => { setForm((p) => ({ ...p, schoolName: e.target.value })); setSelectedSchoolId(null); }}
            placeholder="School name *"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="relative">
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={form.timeSlot}
                onChange={(e) => setForm((p) => ({ ...p, timeSlot: e.target.value }))}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-8"
              >
                <option value="">Time slot *</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          </div>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Additional notes (optional)"
            rows={3}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Clock size={15} className="animate-spin" /> Booking...
              </>
            ) : (
              <>
                <CalendarCheck size={15} /> Book Visit
              </>
            )}
          </button>
        </form>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <CalendarCheck size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-700 mb-1">No visits scheduled</p>
          <p className="text-sm text-gray-400">Use the form above to book your first school visit.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => (
            <div key={visit._id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 items-start transition ${
              visit.status === 'cancelled' ? 'opacity-60' : ''
            }`}>
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <CalendarCheck size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{visit.name || visit.notes || 'School Visit'}</p>
                  <StatusBadge status={visit.status} />
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <CalendarCheck size={11} className="text-gray-400" /> {visit.date}
                  </span>
                  {(visit.timeSlot || visit.time) && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock size={11} className="text-gray-400" /> {visit.timeSlot || visit.time}
                    </span>
                  )}
                </div>
                {visit.notes && visit.name && (
                  <p className="text-xs text-gray-400 mt-1 truncate">{visit.notes}</p>
                )}
                {visit.status !== 'cancelled' && (
                  <button
                    onClick={() => onCancel(visit._id)}
                    className="mt-3 flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium transition"
                  >
                    <XCircle size={13} /> Cancel Visit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Parent Admissions Tab ────────────────────────────────────────────────────
const APP_STATUS_STYLES = {
  pending:      { bg: 'bg-gray-100', text: 'text-gray-600',    label: 'Pending'      },
  under_review: { bg: 'bg-blue-100', text: 'text-blue-700',    label: 'Under Review' },
  admitted:     { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Admitted'  },
  rejected:     { bg: 'bg-red-100',  text: 'text-red-600',     label: 'Rejected'     },
};

function ParentAdmissionsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admission/my')
      .then(({ data }) => setApplications(data.applications || []))
      .catch(() => toast.error('Could not load applications'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-400 text-sm">Loading your applications…</div>;
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">My Admission Applications</h2>

      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <ClipboardList size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No applications yet</p>
          <p className="text-xs text-gray-400 mt-1">When you apply for admission on a school page, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const st = APP_STATUS_STYLES[app.status] || APP_STATUS_STYLES.pending;
            const school = app.school;
            return (
              <div key={app._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* School banner */}
                {school?.images?.[0] && (
                  <div className="h-16 w-full overflow-hidden">
                    <img src={school.images[0]} alt={school.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-extrabold text-gray-900 text-base leading-tight">
                        {app.childFirstName} {app.childLastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Class: <span className="font-semibold text-gray-700">{app.className}</span>
                        {app.session && <> · Session: <span className="font-semibold text-gray-700">{app.session}</span></>}
                      </p>
                      {school && (
                        <p className="text-xs text-gray-400 mt-1">
                          {school.name}{school.state ? `, ${school.state}` : ''}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full ${st.bg} ${st.text}`}>
                      {st.label}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs text-gray-400">
                      Applied {new Date(app.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className="mx-1.5">·</span>
                      Fee: <span className="font-semibold text-gray-700">₦{app.amount?.toLocaleString()}</span>
                    </div>
                    {school?.slug && (
                      <a href={`/schools/${school.slug}`}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition">
                        View School →
                      </a>
                    )}
                  </div>
                  {app.schoolNote && (
                    <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                      <p className="text-xs text-amber-800"><span className="font-bold">School note: </span>{app.schoolNote}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── My Children Tab ──────────────────────────────────────────────────────────
function ChildrenTab({
  children, showAddChild, setShowAddChild, childForm, setChildForm,
  editingChild, setEditingChild, handleSaveChild, handleEditChild, handleDeleteChild,
}) {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">My Children ({children.length})</h2>
        <button
          onClick={() => { setShowAddChild(true); setEditingChild(null); setChildForm({ name: '', age: '', grade: '', preferences: '' }); }}
          className="flex items-center gap-1.5 text-sm bg-green-700 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-800 transition"
        >
          <Plus size={15} /> Add Child
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAddChild && (
        <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4">
            {editingChild !== null ? 'Edit Child' : 'Add Child'}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={childForm.name}
              onChange={(e) => setChildForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Child's full name *"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={childForm.age}
                onChange={(e) => setChildForm((p) => ({ ...p, age: e.target.value }))}
                placeholder="Age"
                min={2}
                max={20}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <input
                type="text"
                value={childForm.grade}
                onChange={(e) => setChildForm((p) => ({ ...p, grade: e.target.value }))}
                placeholder="Current Grade (e.g. JSS 1)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <textarea
              value={childForm.preferences}
              onChange={(e) => setChildForm((p) => ({ ...p, preferences: e.target.value }))}
              placeholder="School preferences (e.g. boarding, STEM focus, Lagos, budget range...)"
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveChild}
              className="flex-1 bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition"
            >
              {editingChild !== null ? 'Save Changes' : 'Add Child'}
            </button>
            <button
              onClick={() => { setShowAddChild(false); setEditingChild(null); }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {children.length === 0 && !showAddChild ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <Users size={40} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-700 mb-1">No children added yet</p>
          <p className="text-sm text-gray-400 mb-4">Add your children's profiles to track their school preferences.</p>
          <button
            onClick={() => setShowAddChild(true)}
            className="inline-flex items-center gap-2 bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition"
          >
            <Plus size={15} /> Add Child
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((child, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center shrink-0 text-green-700 font-bold text-base">
                  {child.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 text-sm">{child.name}</p>
                    {child.age && (
                      <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        Age {child.age}
                      </span>
                    )}
                    {child.grade && (
                      <span className="text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                        {child.grade}
                      </span>
                    )}
                  </div>
                  {child.preferences && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {child.preferences.split(',').map((pref, i) => pref.trim() && (
                        <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          <Tag size={9} /> {pref.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEditChild(idx)}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteChild(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
