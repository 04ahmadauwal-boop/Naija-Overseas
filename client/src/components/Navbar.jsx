import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFadeIn, useSlideIn } from '../hooks/useGsapAnimations';
import {
  Menu, X, GraduationCap, ChevronRight, ChevronDown, LayoutDashboard,
  BookOpen, Info, Mail, LogOut, User, Search, Users, BarChart3
} from 'lucide-react';
import SuggestSchoolModal from './SuggestSchoolModal';
import Logo from './Logo';

const EDUCATION_ITEMS = [
  { to: '/find-tutoring',  label: 'Find Tutoring',  icon: Users        },
  { to: '/become-a-tutor', label: 'Become a Tutor', icon: GraduationCap },
];

const STUDY_ABROAD_COUNTRIES = [
  { slug: 'united-kingdom', code: 'gb', label: 'United Kingdom' },
  { slug: 'canada',         code: 'ca', label: 'Canada'         },
  { slug: 'united-states',  code: 'us', label: 'United States'  },
  { slug: 'australia',      code: 'au', label: 'Australia'       },
  { slug: 'germany',        code: 'de', label: 'Germany'         },
  { slug: 'ireland',        code: 'ie', label: 'Ireland'         },
  { slug: 'netherlands',    code: 'nl', label: 'Netherlands'     },
  { slug: 'new-zealand',    code: 'nz', label: 'New Zealand'     },
];

const NAV_ITEMS = [
  { to: '/compare',         label: 'Compare Schools', icon: BarChart3, end: false },
  { to: '/list-your-school',label: 'Add your school', icon: BookOpen,  end: false },
];

const MORE_ITEMS = [
  { to: '/blog',    label: 'Blog',    icon: BookOpen },
  { to: '/about',   label: 'About',   icon: Info     },
  { to: '/contact', label: 'Contact', icon: Mail     },
];

function getDashboardLink(role) {
  if (role === 'admin') return '/admin';
  if (role === 'student') return '/dashboard/student';
  if (role === 'parent') return '/dashboard/parent';
  if (role === 'school-owner') return '/dashboard/school-owner';
  if (role === 'tutor') return '/dashboard/tutor';
  return '/';
}

function getDashboardLabel(role) {
  if (role === 'admin') return 'Admin Panel';
  if (role === 'student') return 'My Dashboard';
  if (role === 'parent') return 'My Dashboard';
  if (role === 'school-owner') return 'School Dashboard';
  if (role === 'tutor') return 'Tutor Dashboard';
  return 'Dashboard';
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);
  const [studyAbroadOpen, setStudyAbroadOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const educationRef = useRef(null);
  const studyAbroadRef = useRef(null);
  const moreRef = useRef(null);

  // GSAP animations
  const headerRef = useFadeIn(0.6, 0);
  const logoRef = useSlideIn('right', 0.6, 0);
  const navRef = useSlideIn('down', 0.8, 0.1);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <header ref={headerRef} className={`bg-white sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg border-b border-gray-100' : 'border-b border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-17">

            {/* Logo */}
            <Link ref={logoRef} to="/">
              <Logo />
            </Link>

            {/* Desktop Nav */}
            <nav ref={navRef} className="hidden lg:flex items-center gap-0.5">

              {/* Education Naija dropdown */}
              <div
                ref={educationRef}
                className="relative"
                onMouseEnter={() => setEducationOpen(true)}
                onMouseLeave={() => setEducationOpen(false)}
              >
                <NavLink to="/" end
                  className={({ isActive }) =>
                    `flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive || educationOpen ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  Education Naija
                  <ChevronDown size={13} className={`transition-transform duration-200 ${educationOpen ? 'rotate-180' : ''}`} />
                </NavLink>
                <div className={`absolute left-0 top-full pt-1.5 z-50 transition-all duration-200 ${
                  educationOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
                }`}>
                  <div className="w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                    {EDUCATION_ITEMS.map(({ to, label, icon: Icon }) => (
                      <NavLink key={to} to={to}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                            isActive ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`
                        }
                      >
                        <Icon size={14} className="opacity-60 shrink-0" />
                        {label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              {/* Study Abroad dropdown */}
              <div
                ref={studyAbroadRef}
                className="relative"
                onMouseEnter={() => setStudyAbroadOpen(true)}
                onMouseLeave={() => setStudyAbroadOpen(false)}
              >
                <NavLink to="/study-abroad"
                  className={({ isActive }) =>
                    `flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive || studyAbroadOpen ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  Study Abroad
                  <ChevronDown size={13} className={`transition-transform duration-200 ${studyAbroadOpen ? 'rotate-180' : ''}`} />
                </NavLink>
                <div className={`absolute left-0 top-full pt-1.5 z-50 transition-all duration-200 ${
                  studyAbroadOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
                }`}>
                  <div className="w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                    {STUDY_ABROAD_COUNTRIES.map(({ slug, code, label }) => (
                      <NavLink key={slug} to={`/study-abroad/${slug}`}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                            isActive ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`
                        }
                      >
                        <img src={`https://flagcdn.com/w20/${code}.png`} alt={label} className="w-5 h-3.5 object-cover rounded-sm shrink-0" />
                        {label}
                      </NavLink>
                    ))}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <NavLink to="/study-abroad"
                        className={({ isActive }) =>
                          `flex items-center px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                            isActive ? 'text-green-700 bg-green-50' : 'text-green-700 hover:bg-green-50'
                          }`
                        }
                      >
                        All Destinations →
                      </NavLink>
                    </div>
                  </div>
                </div>
              </div>

              {NAV_ITEMS.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }>
                  {label}
                </NavLink>
              ))}

              {/* More dropdown */}
              <div
                ref={moreRef}
                className="relative"
                onMouseEnter={() => setMoreOpen(true)}
                onMouseLeave={() => setMoreOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    moreOpen ? 'text-gray-900 bg-gray-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  More
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown panel */}
                <div
                  className={`absolute left-0 top-full pt-1.5 z-50 transition-all duration-200 ${
                    moreOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'
                  }`}
                >
                  <div className="w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1">
                    {MORE_ITEMS.map(({ to, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                            isActive ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`
                        }
                      >
                        <Icon size={14} className="opacity-60 shrink-0" />
                        {label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => setShowSuggest(true)}
                className="flex items-center gap-1.5 ml-1 px-3 py-2 rounded-lg text-[13px] font-medium text-green-700 bg-green-50 hover:bg-green-100 transition">
                <Search size={13} /> Suggest a School
              </button>
            </nav>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {user ? (
                <>
                  <Link to={getDashboardLink(user.role)}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-green-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                    <LayoutDashboard size={14} /> {getDashboardLabel(user.role)}
                  </Link>
                  <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                    <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {userInitial}
                    </div>
                    <button onClick={handleLogout}
                      className="text-[13px] border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition font-medium">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className="text-[13px] font-medium text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition">
                    Log in
                  </Link>
                  <Link to="/register"
                    className="text-[13px] font-semibold bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition">
                    Get started →
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu">
              <span className={`absolute transition-all duration-300 ${menuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
                <X size={22} />
              </span>
              <span className={`absolute transition-all duration-300 ${menuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
                <Menu size={22} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>

      {/* Mobile Slide-down Panel */}
      <div className={`lg:hidden fixed left-0 right-0 top-16 z-40 transition-all duration-300 ease-in-out ${
        menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="mx-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

          {/* User strip (if logged in) */}
          {user && (
            <div className="flex items-center gap-3 px-5 py-4 bg-linear-to-r from-green-700 to-green-600">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-extrabold text-base shrink-0">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight truncate">{user.name}</p>
                <p className="text-green-200 text-xs capitalize">{user.role?.replace('-', ' ')}</p>
              </div>
              <Link to={getDashboardLink(user.role)}
                className="flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/30 shrink-0">
                <LayoutDashboard size={12} /> Dashboard
              </Link>
            </div>
          )}

          {/* Nav links */}
          <nav className="p-3 space-y-0.5">
            {[...EDUCATION_ITEMS, ...NAV_ITEMS, ...MORE_ITEMS].map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'text-green-700 bg-green-50'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }>
                <Icon size={17} className="shrink-0 opacity-60" />
                <span className="flex-1">{label}</span>
                <ChevronRight size={14} className="text-gray-300" />
              </NavLink>
            ))}

            {/* Study Abroad countries */}
            <div className="pt-1">
              <p className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Study Abroad</p>
              {STUDY_ABROAD_COUNTRIES.map(({ slug, code, label }) => (
                <NavLink key={slug} to={`/study-abroad/${slug}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }>
                  <img src={`https://flagcdn.com/w20/${code}.png`} alt={label} className="w-5 h-3.5 object-cover rounded-sm shrink-0" />
                  <span className="flex-1">{label}</span>
                  <ChevronRight size={14} className="text-gray-300" />
                </NavLink>
              ))}
            </div>

            <button onClick={() => { setMenuOpen(false); setShowSuggest(true); }}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition">
              <Search size={17} className="shrink-0" />
              <span className="flex-1">Find a School</span>
              <ChevronRight size={14} className="text-green-400" />
            </button>
          </nav>

          {/* Auth footer */}
          <div className="px-3 pb-3 border-t border-gray-100 pt-2">
            {user ? (
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition">
                <LogOut size={17} />
                Log out
              </button>
            ) : (
              <div className="space-y-2 pt-1">
                <Link to="/login"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-green-300 hover:text-green-700 transition">
                  <User size={16} /> Log in
                </Link>
                <Link to="/register"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3.5 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition shadow-lg shadow-green-900/20">
                  Create Free Account →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggest a School Modal */}
      {showSuggest && <SuggestSchoolModal onClose={() => setShowSuggest(false)} />}
    </>
  );
}
