import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, GraduationCap } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    ['/', 'Compare Schools', true],
    ['/study-abroad', 'Study Abroad', false],
    ['/list-your-school', 'List Your School', false],
    ['/blog', 'Blog', false],
    ['/about', 'About', false],
    ['/contact', 'Contact', false],
  ];

  return (
    <header className={`bg-white sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={18} />
            </div>
            <span className="font-bold text-gray-900 text-[17px] tracking-tight">
              Naija<span className="text-green-600">&</span>Overseas
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(([to, label, end]) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-medium text-gray-600 hover:text-green-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                    Dashboard
                  </Link>
                )}
                <span className="text-sm text-gray-500 px-2">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={handleLogout} className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition font-medium">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                  Log in
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition">
                  Get started →
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pb-5 pt-3">
          <nav className="flex flex-col gap-0.5 mb-4">
            {navItems.map(([to, label, end]) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
            {user ? (
              <>
                {user.role === 'admin' && <Link to="/admin" className="text-sm font-medium text-green-700 px-3 py-2">Admin Dashboard</Link>}
                <button onClick={handleLogout} className="text-left text-sm text-gray-600 px-3 py-2">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 px-3 py-2.5 rounded-lg hover:bg-gray-50">Log in</Link>
                <Link to="/register" className="text-sm font-semibold bg-green-700 text-white px-4 py-2.5 rounded-lg text-center hover:bg-green-800">
                  Get started →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
