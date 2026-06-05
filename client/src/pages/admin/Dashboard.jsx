import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, School, CalendarCheck, Globe,
  FileText, MessageSquare, ExternalLink, GraduationCap,
  TrendingUp, Clock, Plus, Users, Menu, X, LogOut, Video, Star, Megaphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/schools', icon: School, label: 'Schools' },
  { to: '/admin/tutors', icon: GraduationCap, label: 'Tutors' },
  { to: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/admin/applications', icon: Globe, label: 'Study Abroad' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/blog', icon: FileText, label: 'Blog Posts' },
  { to: '/admin/videos', icon: Video, label: 'Videos' },
  { to: '/admin/reviews', icon: Star, label: 'Reviews' },
  { to: '/admin/banner', icon: Megaphone, label: 'Home Banner' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
];

function AdminNavLinks({ isActive, onLogout }) {
  return (
    <>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(to, exact)
                ? 'bg-green-700 text-white shadow-lg shadow-green-900/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}>
            <Icon size={17} />
            {label}
            {isActive(to, exact) && <div className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full" />}
          </Link>
        ))}
        <div className="pt-4 mt-4 border-t border-gray-800">
          <Link to="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
            <ExternalLink size={17} /> View Site
          </Link>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-800 space-y-2">
        <div className="bg-gray-900 rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-0.5 font-medium">Logged in as</p>
          <p className="text-sm text-white font-semibold">Administrator</p>
        </div>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all">
          <LogOut size={17} /> Log out
        </button>
      </div>
    </>
  );
}

export function AdminNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to, exact) =>
    exact ? pathname === to : pathname.startsWith(to);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-gray-950 border-b border-gray-800 flex items-center gap-3 px-4">
        <button onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-gray-300 hover:text-white transition">
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 bg-green-700 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap size={14} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">Admin Panel</span>
        </div>
        <Link to="/" className="text-xs text-gray-400 hover:text-white transition font-medium">
          ← Site
        </Link>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-gray-950 text-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-700 rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-xs leading-tight">Naija &amp; Overseas</p>
                  <p className="text-gray-500 text-[10px]">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition">
                <X size={16} />
              </button>
            </div>
            <AdminNavLinks isActive={isActive} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-gray-950 text-white min-h-screen flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-green-700 rounded-xl flex items-center justify-center shrink-0">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm leading-tight">Naija &amp; Overseas</p>
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
        </div>
        <AdminNavLinks isActive={isActive} onLogout={handleLogout} />
      </aside>
    </>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, link }) {
  const colorStyles = {
    green: { bg: 'bg-green-100', text: 'text-green-700', badge: 'bg-green-50 text-green-600' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', badge: 'bg-blue-50 text-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', badge: 'bg-purple-50 text-purple-600' },
    red: { bg: 'bg-red-100', text: 'text-red-700', badge: 'bg-red-50 text-red-600' },
  };
  const s = colorStyles[color];

  return (
    <Link to={link}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all block group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg} ${s.text}`}>
          <Icon size={20} />
        </div>
        <TrendingUp size={14} className="text-gray-300 group-hover:text-green-400 transition" />
      </div>
      <div className="text-3xl font-extrabold text-gray-900 mb-0.5">{value || '—'}</div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      <div className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>{sub}</div>
    </Link>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [schools, bookings, applications, messages, users, tutors] = await Promise.all([
          api.get('/schools/admin/all'),
          api.get('/bookings'),
          api.get('/study-abroad'),
          api.get('/contact'),
          api.get('/users'),
          api.get('/tutors/admin/all'),
        ]);
        setStats({
          totalSchools: schools.data.schools.length,
          pendingSchools: schools.data.schools.filter((s) => s.status === 'pending').length,
          approvedSchools: schools.data.schools.filter((s) => s.status === 'approved').length,
          totalBookings: bookings.data.bookings.length,
          pendingBookings: bookings.data.bookings.filter((b) => b.status === 'pending').length,
          totalApplications: applications.data.applications.length,
          unreadMessages: messages.data.messages.filter((m) => !m.isRead).length,
          totalUsers: users.data.total,
          totalTutors: tutors.data.tutors.length,
          pendingTutors: tutors.data.tutors.filter((t) => !t.isActive).length,
          activeTutors: tutors.data.tutors.filter((t) => t.isActive).length,
        });
      } catch {
        setStats({});
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = stats ? [
    { label: 'Total Schools', value: stats.totalSchools, sub: `${stats.pendingSchools} awaiting review`, icon: School, color: 'green', link: '/admin/schools' },
    { label: 'Approved & Live', value: stats.approvedSchools, sub: 'visible on platform', icon: School, color: 'emerald', link: '/admin/schools' },
    { label: 'Tutors', value: stats.totalTutors, sub: `${stats.pendingTutors} pending approval`, icon: GraduationCap, color: 'purple', link: '/admin/tutors' },
    { label: 'Bookings', value: stats.totalBookings, sub: `${stats.pendingBookings} pending`, icon: CalendarCheck, color: 'blue', link: '/admin/bookings' },
    { label: 'Study Abroad Apps', value: stats.totalApplications, sub: 'total submissions', icon: Globe, color: 'purple', link: '/admin/applications' },
    { label: 'Unread Messages', value: stats.unreadMessages, sub: 'require response', icon: MessageSquare, color: 'red', link: '/admin/messages' },
    { label: 'Registered Users', value: stats.totalUsers, sub: 'students, parents & owners', icon: Users, color: 'blue', link: '/admin/users' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
              <p className="text-gray-400 text-sm mt-0.5">Welcome back, Administrator</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/admin/schools"
                className="flex items-center gap-2 bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition">
                <Plus size={15} /> Review Schools
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-8">

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-36 skeleton-shimmer border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {cards.map((card) => <StatCard key={card.label} {...card} />)}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Review Pending Schools', to: '/admin/schools', icon: School, color: 'text-green-700 bg-green-50 hover:bg-green-100' },
                { label: 'Approve Tutors', to: '/admin/tutors', icon: GraduationCap, color: 'text-purple-700 bg-purple-50 hover:bg-purple-100' },
                { label: 'View All Bookings', to: '/admin/bookings', icon: CalendarCheck, color: 'text-blue-700 bg-blue-50 hover:bg-blue-100' },
                { label: 'Study Abroad Apps', to: '/admin/applications', icon: Globe, color: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100' },
                { label: 'Write Blog Post', to: '/admin/blog', icon: FileText, color: 'text-orange-700 bg-orange-50 hover:bg-orange-100' },
              ].map(({ label, to, icon: Icon, color }) => (
                <Link key={to} to={to}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-semibold text-center transition ${color}`}>
                  <Icon size={20} />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Recent Activity</h2>
              <Clock size={16} className="text-gray-300" />
            </div>
            <div className="space-y-3">
              {[
                { action: 'New school listing submitted', time: 'Just now', type: 'school' },
                { action: 'Study abroad application received', time: '2 hours ago', type: 'app' },
                { action: 'New message from contact form', time: '5 hours ago', type: 'msg' },
              ].map(({ action, time, type }, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    type === 'school' ? 'bg-green-100' : type === 'app' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {type === 'school' ? <School size={14} className="text-green-700" /> :
                     type === 'app' ? <Globe size={14} className="text-purple-700" /> :
                     <MessageSquare size={14} className="text-blue-700" />}
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{action}</p>
                  <span className="text-xs text-gray-400">{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
