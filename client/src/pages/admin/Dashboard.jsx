import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, School, CalendarCheck, Globe,
  FileText, MessageSquare, ExternalLink, GraduationCap,
  Plus, Users, Menu, X, LogOut, Video, Star,
  Megaphone, Ticket, DollarSign, CalendarClock,
  AlertCircle, CheckCircle2, ArrowRight, Activity,
  Zap, Bell, ChevronRight, BookOpen, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

/* ─── NAV ITEMS ────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: '/admin',                    icon: LayoutDashboard, label: 'Dashboard',       exact: true },
  { to: '/admin/schools',            icon: School,          label: 'Schools' },
  { to: '/admin/tutors',             icon: GraduationCap,   label: 'Tutors' },
  { to: '/admin/bookings',           icon: CalendarCheck,   label: 'Bookings' },
  { to: '/admin/applications',       icon: Globe,           label: 'Study Abroad' },
  { to: '/admin/consultation-slots', icon: CalendarClock,   label: 'Consult Slots' },
  { to: '/admin/users',              icon: Users,           label: 'Users' },
  { to: '/admin/blog',               icon: FileText,        label: 'Blog Posts' },
  { to: '/admin/videos',             icon: Video,           label: 'Videos' },
  { to: '/admin/reviews',            icon: Star,            label: 'Reviews' },
  { to: '/admin/banner',             icon: Megaphone,       label: 'Home Banner' },
  { to: '/admin/coupons',            icon: Ticket,          label: 'Coupons' },
  { to: '/admin/payroll',            icon: DollarSign,      label: 'Tutor Payroll' },
  { to: '/admin/messages',           icon: MessageSquare,   label: 'Messages' },
];

/* ─── SIDEBAR ──────────────────────────────────────────────────── */
function AdminNavLinks({ isActive, onLogout }) {
  return (
    <>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(to, exact)
                ? 'bg-green-700 text-white shadow-sm shadow-green-900/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}>
            <Icon size={16} className="shrink-0" />
            {label}
            {isActive(to, exact) && (
              <div className="ml-auto w-1.5 h-1.5 bg-green-300 rounded-full" />
            )}
          </Link>
        ))}

        <div className="pt-3 mt-3 border-t border-white/10">
          <Link to="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <ExternalLink size={16} /> View Live Site
          </Link>
        </div>
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <div className="px-3 py-2.5 rounded-xl bg-white/5">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Signed in as</p>
          <p className="text-sm text-white font-bold">Administrator</p>
          <p className="text-[10px] text-gray-500 mt-0.5">softsavvynaija@gmail.com</p>
        </div>
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all">
          <LogOut size={16} /> Sign out
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

  const isActive = (to, exact) => exact ? pathname === to : pathname.startsWith(to);
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-gray-950 border-b border-white/10 flex items-center gap-3 px-4">
        <button onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition">
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap size={13} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">N&O Admin</span>
        </div>
        <Link to="/" className="text-xs text-gray-400 hover:text-white transition font-medium">← Site</Link>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-gray-950 text-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
                  <GraduationCap size={15} className="text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-white text-xs leading-tight">Education N&amp;O</p>
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition">
                <X size={15} />
              </button>
            </div>
            <AdminNavLinks isActive={isActive} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-gray-950 text-white min-h-screen flex-col shrink-0 border-r border-white/5">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-green-900/50">
              <GraduationCap size={17} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-white text-sm leading-tight">Education N&amp;O</p>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
        </div>
        <AdminNavLinks isActive={isActive} onLogout={handleLogout} />
      </aside>
    </>
  );
}

/* ─── HELPERS ──────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const SERVICE_LABELS = {
  'school-visit': 'School Visit',
  'study-abroad-consultation': 'Consultation',
  'tutoring-session': 'Tutoring',
};

const BOOKING_STATUS = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50  text-blue-700  border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50   text-red-700   border-red-200',
};

const APP_STATUS = {
  submitted:            'bg-gray-100   text-gray-600',
  'in-review':          'bg-amber-50   text-amber-700',
  'documents-requested':'bg-indigo-50  text-indigo-700',
  admitted:             'bg-green-50   text-green-700',
  rejected:             'bg-red-50     text-red-700',
};

/* ─── KPI CARD ─────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon: Icon, iconBg, iconFg, badge, badgeFg, alert, to }) {
  return (
    <Link to={to}
      className={`rounded-2xl p-5 border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all block group ${
        alert ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'
      }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={18} className={iconFg} />
        </div>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeFg}`}>
            {badge}
          </span>
        )}
      </div>
      <div className={`text-3xl font-extrabold mb-0.5 ${alert ? 'text-red-700' : 'text-gray-900'}`}>
        {value ?? '—'}
      </div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </Link>
  );
}

/* ─── DASHBOARD ────────────────────────────────────────────────── */
export function Dashboard() {
  const [stats,          setStats]         = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentApps,     setRecentApps]    = useState([]);
  const [loading,        setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [schools, bookings, applications, messages, users, tutors, blog] = await Promise.all([
          api.get('/schools/admin/all'),
          api.get('/bookings'),
          api.get('/study-abroad'),
          api.get('/contact'),
          api.get('/users'),
          api.get('/tutors/admin/all'),
          api.get('/blog/admin/all'),
        ]);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const bList = bookings.data.bookings ?? [];
        const aList = applications.data.applications ?? [];
        const sList = schools.data.schools ?? [];
        const tList = tutors.data.tutors ?? [];
        const pList = blog.data.posts ?? [];

        setStats({
          totalSchools:    sList.length,
          pendingSchools:  sList.filter(s => s.status === 'pending').length,
          approvedSchools: sList.filter(s => s.status === 'approved').length,

          totalTutors:   tList.length,
          activeTutors:  tList.filter(t => t.isActive).length,
          pendingTutors: tList.filter(t => !t.isActive).length,

          totalUsers: users.data.total ?? 0,

          totalBookings:     bList.length,
          pendingBookings:   bList.filter(b => b.status === 'pending').length,
          confirmedBookings: bList.filter(b => b.status === 'confirmed').length,
          completedBookings: bList.filter(b => b.status === 'completed').length,
          todayBookings:     bList.filter(b => new Date(b.createdAt) >= todayStart).length,

          totalApplications:   aList.length,
          pendingApplications: aList.filter(a => a.status === 'submitted' || a.status === 'in-review').length,
          todayApps:           aList.filter(a => new Date(a.createdAt) >= todayStart).length,

          unreadMessages: (messages.data.messages ?? []).filter(m => !m.isRead).length,

          totalBlogPosts:  pList.length,
          publishedPosts:  pList.filter(p => p.isPublished).length,
        });

        setRecentBookings(bList.slice(0, 6));
        setRecentApps(aList.slice(0, 5));
      } catch {
        setStats({});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Greeting */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  /* Attention items */
  const attentionItems = stats
    ? [
        stats.pendingSchools  > 0 && { label: `${stats.pendingSchools} school${stats.pendingSchools > 1 ? 's' : ''} need review`, to: '/admin/schools',  icon: School,        color: 'bg-amber-50 text-amber-700 border border-amber-200' },
        stats.pendingTutors   > 0 && { label: `${stats.pendingTutors} tutor${stats.pendingTutors > 1 ? 's' : ''} awaiting approval`, to: '/admin/tutors', icon: GraduationCap, color: 'bg-purple-50 text-purple-700 border border-purple-200' },
        stats.unreadMessages  > 0 && { label: `${stats.unreadMessages} unread message${stats.unreadMessages > 1 ? 's' : ''}`, to: '/admin/messages',         icon: MessageSquare, color: 'bg-red-50 text-red-700 border border-red-200' },
        stats.pendingBookings > 0 && { label: `${stats.pendingBookings} booking${stats.pendingBookings > 1 ? 's' : ''} pending`,  to: '/admin/bookings',       icon: CalendarCheck, color: 'bg-blue-50 text-blue-700 border border-blue-200' },
      ].filter(Boolean)
    : [];

  const kpiCards = stats
    ? [
        {
          label: 'Total Schools', value: stats.totalSchools,
          sub: `${stats.approvedSchools} live on platform`,
          icon: School, iconBg: 'bg-green-100', iconFg: 'text-green-700',
          badge: stats.pendingSchools > 0 ? `${stats.pendingSchools} pending` : null,
          badgeFg: 'bg-amber-100 text-amber-700',
          to: '/admin/schools',
        },
        {
          label: 'Registered Users', value: stats.totalUsers,
          sub: 'Students, parents & owners',
          icon: Users, iconBg: 'bg-blue-100', iconFg: 'text-blue-700',
          to: '/admin/users',
        },
        {
          label: 'Tutors', value: stats.totalTutors,
          sub: `${stats.activeTutors} active`,
          icon: GraduationCap, iconBg: 'bg-purple-100', iconFg: 'text-purple-700',
          badge: stats.pendingTutors > 0 ? `${stats.pendingTutors} pending` : null,
          badgeFg: 'bg-purple-100 text-purple-700',
          to: '/admin/tutors',
        },
        {
          label: 'Bookings', value: stats.totalBookings,
          sub: `${stats.pendingBookings} pending confirmation`,
          icon: CalendarCheck, iconBg: 'bg-teal-100', iconFg: 'text-teal-700',
          badge: stats.todayBookings > 0 ? `+${stats.todayBookings} today` : null,
          badgeFg: 'bg-teal-50 text-teal-700',
          to: '/admin/bookings',
        },
        {
          label: 'Study Abroad Apps', value: stats.totalApplications,
          sub: `${stats.pendingApplications} under review`,
          icon: Globe, iconBg: 'bg-indigo-100', iconFg: 'text-indigo-700',
          badge: stats.todayApps > 0 ? `+${stats.todayApps} today` : null,
          badgeFg: 'bg-indigo-50 text-indigo-700',
          to: '/admin/applications',
        },
        {
          label: 'Unread Messages', value: stats.unreadMessages,
          sub: 'From contact form',
          icon: MessageSquare,
          iconBg: stats.unreadMessages > 0 ? 'bg-red-100' : 'bg-gray-100',
          iconFg: stats.unreadMessages > 0 ? 'text-red-600' : 'text-gray-400',
          badge: stats.unreadMessages > 0 ? 'urgent' : null,
          badgeFg: 'bg-red-100 text-red-700',
          alert: stats.unreadMessages > 0,
          to: '/admin/messages',
        },
        {
          label: 'Blog Posts', value: stats.totalBlogPosts,
          sub: `${stats.publishedPosts} published`,
          icon: FileText, iconBg: 'bg-orange-100', iconFg: 'text-orange-700',
          to: '/admin/blog',
        },
        {
          label: 'Completed Sessions', value: stats.completedBookings,
          sub: `${stats.confirmedBookings} confirmed upcoming`,
          icon: CheckCircle2, iconBg: 'bg-emerald-100', iconFg: 'text-emerald-700',
          to: '/admin/bookings',
        },
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-[#f5f6fa]">
      <AdminNav />

      <div className="flex-1 overflow-x-hidden pt-14 lg:pt-0 flex flex-col">

        {/* ── PAGE HEADER ─────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-100 px-5 md:px-8 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-gray-400 font-medium">{dateLabel}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                {greeting}, Administrator 👋
              </h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Here's what's happening on your platform today.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {stats?.unreadMessages > 0 && (
                <Link to="/admin/messages"
                  className="relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                  <Bell size={17} />
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {stats.unreadMessages > 9 ? '9+' : stats.unreadMessages}
                  </span>
                </Link>
              )}
              <Link to="/admin/schools"
                className="hidden sm:flex items-center gap-1.5 bg-green-700 text-white px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition shadow-sm">
                <Plus size={14} /> Add School
              </Link>
              <Link to="/admin/blog"
                className="hidden sm:flex items-center gap-1.5 bg-gray-900 text-white px-3.5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black transition">
                <FileText size={14} /> New Post
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-6 space-y-5">

          {/* ── ATTENTION BANNER ─────────────────────────────── */}
          {!loading && attentionItems.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                <span className="text-sm font-bold text-amber-800">Needs Your Attention</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attentionItems.map(({ label, to, color, icon: Icon }) => (
                  <Link key={to} to={to}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-75 ${color}`}>
                    <Icon size={11} /> {label}
                    <ArrowRight size={10} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── KPI GRID ─────────────────────────────────────── */}
          {loading ? (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-[110px] animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {kpiCards.map(card => <KpiCard key={card.label} {...card} />)}
            </div>
          )}

          {/* ── RECENT BOOKINGS + QUICK ACTIONS ──────────────── */}
          <div className="grid lg:grid-cols-3 gap-5">

            {/* Recent Bookings */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-gray-400" />
                  <h2 className="font-bold text-gray-900 text-sm">Recent Bookings</h2>
                </div>
                <Link to="/admin/bookings"
                  className="text-xs font-semibold text-green-700 hover:text-green-800 flex items-center gap-0.5">
                  View all <ChevronRight size={12} />
                </Link>
              </div>

              {loading ? (
                <div className="p-5 space-y-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                  <CalendarCheck size={30} className="mb-2 opacity-40" />
                  <p className="text-sm">No bookings yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50 flex-1">
                  {recentBookings.map(b => (
                    <div key={b._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/70 transition">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 shrink-0">
                        {(b.name?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{b.name}</p>
                        <p className="text-[11px] text-gray-400">
                          {SERVICE_LABELS[b.service] || b.service}
                          {b.date && ` · ${new Date(b.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-400 hidden sm:block shrink-0">{timeAgo(b.createdAt)}</span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize border shrink-0 ${BOOKING_STATUS[b.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
                <Zap size={15} className="text-gray-400" />
                <h2 className="font-bold text-gray-900 text-sm">Quick Actions</h2>
              </div>
              <div className="p-3 space-y-1 flex-1">
                {[
                  { label: 'Review Schools',     desc: 'Approve or reject submissions', to: '/admin/schools',      icon: School,        color: 'bg-green-100  text-green-700'  },
                  { label: 'Manage Tutors',      desc: 'Approve tutor profiles',        to: '/admin/tutors',       icon: GraduationCap, color: 'bg-purple-100 text-purple-700' },
                  { label: 'Study Abroad Apps',  desc: 'Review applications',           to: '/admin/applications', icon: Globe,         color: 'bg-indigo-100 text-indigo-700' },
                  { label: 'Manage Bookings',    desc: 'Confirm & track sessions',      to: '/admin/bookings',     icon: CalendarCheck, color: 'bg-teal-100   text-teal-700'   },
                  { label: 'Write Blog Post',    desc: 'Publish a new article',         to: '/admin/blog',         icon: FileText,      color: 'bg-orange-100 text-orange-700' },
                  { label: 'Manage Coupons',     desc: 'Create discount codes',         to: '/admin/coupons',      icon: Ticket,        color: 'bg-pink-100   text-pink-700'   },
                  { label: 'Tutor Payroll',      desc: 'Review payment records',        to: '/admin/payroll',      icon: DollarSign,    color: 'bg-emerald-100 text-emerald-700' },
                ].map(({ label, desc, to, icon: Icon, color }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-none">{label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
                    </div>
                    <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 transition shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── RECENT STUDY ABROAD APPLICATIONS ─────────────── */}
          {!loading && recentApps.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <Globe size={15} className="text-gray-400" />
                  <h2 className="font-bold text-gray-900 text-sm">Recent Study Abroad Applications</h2>
                </div>
                <Link to="/admin/applications"
                  className="text-xs font-semibold text-green-700 hover:text-green-800 flex items-center gap-0.5">
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {recentApps.map(app => (
                  <div key={app._id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/70 transition">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                      {(app.fullName?.[0] || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{app.fullName}</p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {app.destinationCountry}
                        {app.program && ` · ${app.program}`}
                        {app.university && ` · ${app.university}`}
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-400 hidden sm:block shrink-0">{timeAgo(app.createdAt)}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize shrink-0 ${APP_STATUS[app.status] || 'bg-gray-100 text-gray-600'}`}>
                      {app.status?.replace('-', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PLATFORM OVERVIEW ─────────────────────────────── */}
          {!loading && stats && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-gray-400" />
                <h2 className="font-bold text-gray-900 text-sm">Platform Overview</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Approved Schools', value: stats.approvedSchools, color: 'text-green-700' },
                  { label: 'Active Tutors',    value: stats.activeTutors,    color: 'text-purple-700' },
                  { label: 'Confirmed Bookings',value: stats.confirmedBookings, color: 'text-blue-700' },
                  { label: 'Completed Sessions',value: stats.completedBookings, color: 'text-teal-700' },
                  { label: 'Published Posts',   value: stats.publishedPosts,  color: 'text-orange-700' },
                  { label: 'Total Apps',        value: stats.totalApplications, color: 'text-indigo-700' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className={`text-2xl font-extrabold ${color}`}>{value ?? 0}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 leading-tight">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
